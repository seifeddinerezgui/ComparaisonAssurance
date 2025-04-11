import logging
from typing import Any, Dict, List, Optional
from zeep import Client, Settings
from zeep.helpers import serialize_object
from zeep.cache import SqliteCache
from zeep.transports import Transport
from zeep.plugins import HistoryPlugin
from requests.auth import HTTPBasicAuth
import json

from app.config import settings
from app.integrations.utwin.models import (
    MetaDonnee,
    ProjetWSModel,
    EmprunteurWSModel,
    PretWSModel,
    PalierModel,
    OptionsWSModel
)

logger = logging.getLogger(__name__)


class UTWINClient:
    """
    Client for interacting with the UTWIN SOAP API
    """
    
    def __init__(self):
        # Cache settings for SOAP client
        cache = SqliteCache(path='/tmp/zeep-utwin.cache', timeout=60 * 60 * 24)
        
        # History plugin to log requests/responses
        history = HistoryPlugin()
        
        # Create transport with auth and cache
        transport = Transport(
            cache=cache,
            timeout=30,
            operation_timeout=30
        )
        
        # Client settings
        client_settings = Settings(
            strict=False,
            xml_huge_tree=True,
            raw_response=False
        )
        
        # Initialize SOAP client
        self.client = Client(
            settings.UTWIN_WSDL_URL,
            transport=transport,
            plugins=[history],
            settings=client_settings
        )
        
        # Store auth info
        self.username = settings.UTWIN_USERNAME
        self.password = settings.UTWIN_PASSWORD
        
        # Store history for debugging
        self.history = history
    
    def _create_meta_data(self) -> Dict[str, Any]:
        """
        Create meta data for UTWIN API call
        """
        meta = self.client.get_type('ns0:MetaDonnee')()
        meta.Login = self.username
        meta.Password = self.password
        return meta
    
    def _create_emprunteur(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create emprunteur data for UTWIN API call
        """
        emprunteur = self.client.get_type('ns0:EmprunteurWSModel')()
        emprunteur.IdCiviliteCombien = 1 if lead_data.get('gender') == 'male' else 2
        emprunteur.Nom = lead_data.get('last_name', '')
        emprunteur.Prenom = lead_data.get('first_name', '')
        emprunteur.DateNaissance = lead_data.get('date_of_birth', None)
        emprunteur.StatutProfessionnel = lead_data.get('professional_status', 1)  # Default to 1 (Salarié)
        emprunteur.CSP = lead_data.get('csp', 1)  # Default to 1 (Default CSP)
        emprunteur.EstFumeur = lead_data.get('is_smoker', False)
        emprunteur.Sport = lead_data.get('sport', '')
        return emprunteur
    
    def _create_loan_data(self, loan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create loan data for UTWIN API call
        """
        pret = self.client.get_type('ns0:PretWSModel')()
        pret.TypePret = loan_data.get('loan_type', 1)  # Default to 1 (Amortissable)
        pret.MontantPret = loan_data.get('loan_amount', 0)
        pret.DureePret = loan_data.get('loan_duration', 0)
        pret.TauxInteret = loan_data.get('loan_rate', 0)
        pret.TypeTauxInteret = loan_data.get('loan_rate_type', 1)  # Default to 1 (Fixe)
        return pret
    
    def _create_palier(self, palier_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create palier data for UTWIN API call
        """
        palier = self.client.get_type('ns0:PalierModel')()
        palier.TauxCouverture = palier_data.get('coverage_rate', 100)
        palier.DureePalier = palier_data.get('duration', 0)
        return palier
    
    def _create_options(self, options_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create options data for UTWIN API call
        """
        options = self.client.get_type('ns0:OptionsWSModel')()
        options.CodeOption = options_data.get('option_code', '')
        options.EstSouscrite = options_data.get('is_subscribed', False)
        return options
    
    def _create_projet(
        self, 
        code_produit: str, 
        emprunteur: Dict[str, Any],
        pret: Dict[str, Any],
        paliers: List[Dict[str, Any]],
        options: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create projet data for UTWIN API call
        """
        projet = self.client.get_type('ns0:ProjetWSModel')()
        projet.CodeProduit = code_produit
        projet.EmprunteurWSModel = emprunteur
        projet.PretWSModel = pret
        projet.Paliers = paliers
        projet.OptionsWSModel = options
        return projet
    
    def get_tarif(
        self, 
        code_produit: str,
        lead_data: Dict[str, Any],
        loan_data: Dict[str, Any],
        paliers_data: List[Dict[str, Any]],
        options_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Call the GetTarif method of UTWIN API
        """
        try:
            # Create request data
            meta_data = self._create_meta_data()
            emprunteur = self._create_emprunteur(lead_data)
            pret = self._create_loan_data(loan_data)
            
            paliers = []
            for palier_data in paliers_data:
                palier = self._create_palier(palier_data)
                paliers.append(palier)
            
            options = []
            for option_data in options_data:
                option = self._create_options(option_data)
                options.append(option)
            
            projet = self._create_projet(code_produit, emprunteur, pret, paliers, options)
            
            # Call the GetTarif method
            result = self.client.service.GetTarif(meta_data, projet)
            
            # Convert response to a dictionary
            result_dict = serialize_object(result)
            
            # Log the response
            logger.info(f"UTWIN GetTarif response for {code_produit}: {json.dumps(result_dict, default=str)}")
            
            return result_dict
        
        except Exception as e:
            logger.error(f"Error calling UTWIN GetTarif: {str(e)}")
            raise
