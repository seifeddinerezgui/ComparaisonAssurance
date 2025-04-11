from dataclasses import dataclass
from datetime import date
from typing import List, Optional


@dataclass
class MetaDonnee:
    """
    Authentication metadata for UTWIN API
    """
    Login: str
    Password: str


@dataclass
class EmprunteurWSModel:
    """
    Borrower information model for UTWIN API
    """
    IdCiviliteCombien: int  # 1 for Mr, 2 for Mrs
    Nom: str
    Prenom: str
    DateNaissance: date
    StatutProfessionnel: int  # 1 for Employee, 2 for Self-employed, etc.
    CSP: int  # Socio-professional category
    EstFumeur: bool
    Sport: Optional[str] = None


@dataclass
class PretWSModel:
    """
    Loan information model for UTWIN API
    """
    TypePret: int  # 1 for Amortizable, 2 for In fine, etc.
    MontantPret: float
    DureePret: int  # Loan duration in months
    TauxInteret: float
    TypeTauxInteret: int  # 1 for Fixed, 2 for Variable


@dataclass
class PalierModel:
    """
    Coverage tier model for UTWIN API
    """
    TauxCouverture: float  # Coverage rate (percentage)
    DureePalier: int  # Duration of the tier in months


@dataclass
class OptionsWSModel:
    """
    Insurance options model for UTWIN API
    """
    CodeOption: str
    EstSouscrite: bool


@dataclass
class ProjetWSModel:
    """
    Project model for UTWIN API
    """
    CodeProduit: str
    EmprunteurWSModel: EmprunteurWSModel
    PretWSModel: PretWSModel
    Paliers: List[PalierModel]
    OptionsWSModel: List[OptionsWSModel]


@dataclass
class TarifEcheanceWsModel:
    """
    Tariff per payment period model for UTWIN API
    """
    Montant: float  # Premium amount
    DateEcheance: date  # Due date


@dataclass
class TarifPretWsModel:
    """
    Loan tariff model for UTWIN API
    """
    TarifEcheances: List[TarifEcheanceWsModel]  # List of premium payments
    CoutTotalAssurance: float  # Total insurance cost
    TauxMoyen: float  # Average rate


@dataclass
class TarifEmprunteurWSModel:
    """
    Borrower tariff model for UTWIN API
    """
    PrimeAnnuelle: float  # Annual premium
    PrimeMensuelle: float  # Monthly premium
    TarifPrets: List[TarifPretWsModel]  # List of loan tariffs


@dataclass
class ErreurValidationWSModel:
    """
    Validation error model from UTWIN API
    """
    Code: str
    Message: str


@dataclass
class TarifWsModel:
    """
    Main tariff response model from UTWIN API
    """
    TarifsEmprunteurs: List[TarifEmprunteurWSModel]
    ErreursValidation: List[ErreurValidationWSModel]
    EstErreur: bool
