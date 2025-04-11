import logging
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.projects.models import Project, ComparisonResult
from app.leads.models import Lead
from app.integrations.utwin.client import UTWINClient

logger = logging.getLogger(__name__)


class ComparisonEngine:
    """
    Engine for comparing insurance products from different providers
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.utwin_client = UTWINClient()
    
    def prepare_utwin_lead_data(self, lead: Lead) -> Dict:
        """
        Prepare lead data for UTWIN API call
        """
        gender = "male"  # Default value, should be properly set in a real implementation
        
        lead_data = {
            "gender": gender,
            "last_name": lead.last_name,
            "first_name": lead.first_name,
            "date_of_birth": lead.date_of_birth,
            "professional_status": 1,  # Default value
            "csp": 1,  # Default value
            "is_smoker": False,  # Default value
            "sport": ""  # Default value
        }
        
        return lead_data
    
    def prepare_utwin_loan_data(self, project: Project) -> Dict:
        """
        Prepare loan data for UTWIN API call
        """
        loan_data = {
            "loan_type": 1,  # Default to Amortissable
            "loan_amount": project.loan_amount,
            "loan_duration": project.loan_duration,
            "loan_rate": project.loan_rate or 0,
            "loan_rate_type": 1  # Default to Fixed
        }
        
        return loan_data
    
    def prepare_utwin_paliers_data(self, project: Project) -> List[Dict]:
        """
        Prepare coverage tiers data for UTWIN API call
        """
        # Create a single tier covering the entire duration with 100% coverage
        paliers_data = [
            {
                "coverage_rate": 100,
                "duration": project.loan_duration
            }
        ]
        
        return paliers_data
    
    def prepare_utwin_options_data(self, project: Project) -> List[Dict]:
        """
        Prepare insurance options data for UTWIN API call
        """
        # Get options from project or use defaults
        options = project.options or {}
        
        # Convert options to UTWIN format
        options_data = []
        
        # Add option for each guarantee if required
        guarantees = project.guarantees_required or {}
        
        for guarantee in settings.UTWIN_PRODUCT_CODES:
            is_required = guarantees.get(guarantee, False)
            options_data.append({
                "option_code": guarantee,
                "is_subscribed": is_required
            })
        
        return options_data
    
    def run_comparison(self, project_id: int) -> List[ComparisonResult]:
        """
        Run comparison for a project
        """
        # Get project and associated lead
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project with ID {project_id} not found")
            return []
        
        lead = project.lead
        
        # Delete existing comparison results for this project
        self.db.query(ComparisonResult).filter(
            ComparisonResult.project_id == project_id
        ).delete()
        
        # Prepare data for UTWIN API
        lead_data = self.prepare_utwin_lead_data(lead)
        loan_data = self.prepare_utwin_loan_data(project)
        paliers_data = self.prepare_utwin_paliers_data(project)
        
        comparison_results = []
        
        # Run comparison for each UTWIN product
        for product_code in settings.UTWIN_PRODUCT_CODES:
            # Prepare options with this product as subscribed
            options_data = self.prepare_utwin_options_data(project)
            for option in options_data:
                if option["option_code"] == product_code:
                    option["is_subscribed"] = True
            
            try:
                # Call UTWIN API
                utwin_response = self.utwin_client.get_tarif(
                    code_produit=product_code,
                    lead_data=lead_data,
                    loan_data=loan_data,
                    paliers_data=paliers_data,
                    options_data=options_data
                )
                
                # If there's an error, skip this product
                if utwin_response.get("EstErreur", True):
                    logger.warning(f"Error from UTWIN for product {product_code}: {utwin_response}")
                    continue
                
                # Extract tariff data
                tarif_emprunteurs = utwin_response.get("TarifsEmprunteurs", [])
                if not tarif_emprunteurs:
                    logger.warning(f"No tariff data from UTWIN for product {product_code}")
                    continue
                
                # Get first emprunteur tariff
                tarif = tarif_emprunteurs[0]
                
                # Create comparison result
                result = ComparisonResult(
                    project_id=project.id,
                    insurer="UTWIN",
                    product_code=product_code,
                    product_name=self.get_product_name(product_code),
                    monthly_premium=tarif.get("PrimeMensuelle", 0),
                    annual_premium=tarif.get("PrimeAnnuelle", 0),
                    total_premium=self.calculate_total_premium(tarif),
                    coverage_percentage=100,  # Default value
                    coverage_details={
                        "product_code": product_code,
                        "coverage_type": self.get_product_name(product_code)
                    },
                    raw_response=utwin_response
                )
                
                self.db.add(result)
                comparison_results.append(result)
            
            except Exception as e:
                logger.error(f"Error comparing UTWIN product {product_code}: {str(e)}")
                continue
        
        # Update project status
        project.status = "compared"
        
        # Commit all changes
        self.db.commit()
        
        # Refresh all results to get their IDs
        for result in comparison_results:
            self.db.refresh(result)
        
        return comparison_results
    
    def get_product_name(self, product_code: str) -> str:
        """
        Get a human-readable name for a product code
        """
        product_names = {
            "GARANTIE_DECES": "Death Coverage",
            "GARANTIE_PTIA": "Total and Irreversible Loss of Autonomy",
            "GARANTIE_IPT": "Total Permanent Disability",
            "GARANTIE_IPP": "Partial Permanent Disability",
            "GARANTIE_ITT": "Temporary Total Incapacity",
            "GARANTIE_PE": "Job Loss",
            "GARANTIE_MNO_DOS": "Back Pain Non-Standard Condition",
            "GARANTIE_MNO_PSY": "Psychological Disorders Non-Standard Condition"
        }
        
        return product_names.get(product_code, product_code)
    
    def calculate_total_premium(self, tarif: Dict) -> float:
        """
        Calculate the total premium from the tariff data
        """
        tarif_prets = tarif.get("TarifPrets", [])
        if not tarif_prets:
            return 0
        
        # Get first loan tariff
        tarif_pret = tarif_prets[0]
        
        # Use CoutTotalAssurance if available
        if "CoutTotalAssurance" in tarif_pret:
            return tarif_pret["CoutTotalAssurance"]
        
        # Otherwise, sum up all echeances
        total = 0
        for echeance in tarif_pret.get("TarifEcheances", []):
            total += echeance.get("Montant", 0)
        
        return total
