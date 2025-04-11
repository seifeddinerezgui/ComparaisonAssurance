from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class UTWINEmprunteurCreate(BaseModel):
    """
    Schema for creating an emprunteur (borrower) for UTWIN API
    """
    gender: str  # 'male' or 'female'
    last_name: str
    first_name: str
    date_of_birth: date
    professional_status: int = 1  # Default to 1 (Salarié)
    csp: int = 1  # Default socio-professional category
    is_smoker: bool = False
    sport: Optional[str] = None


class UTWINLoanCreate(BaseModel):
    """
    Schema for creating a loan for UTWIN API
    """
    loan_type: int = 1  # Default to 1 (Amortissable)
    loan_amount: float
    loan_duration: int  # in months
    loan_rate: float
    loan_rate_type: int = 1  # Default to 1 (Fixe)


class UTWINPalierCreate(BaseModel):
    """
    Schema for creating a coverage tier for UTWIN API
    """
    coverage_rate: float = 100.0  # Default to 100%
    duration: int  # in months


class UTWINOptionCreate(BaseModel):
    """
    Schema for creating an insurance option for UTWIN API
    """
    option_code: str
    is_subscribed: bool = False


class UTWINTarifRequest(BaseModel):
    """
    Schema for UTWIN tariff request
    """
    code_produit: str
    emprunteur: UTWINEmprunteurCreate
    loan: UTWINLoanCreate
    paliers: List[UTWINPalierCreate]
    options: List[UTWINOptionCreate]


class UTWINTarifEcheance(BaseModel):
    """
    Schema for UTWIN tariff payment
    """
    montant: float
    date_echeance: date


class UTWINTarifPret(BaseModel):
    """
    Schema for UTWIN loan tariff
    """
    tarif_echeances: List[UTWINTarifEcheance]
    cout_total_assurance: float
    taux_moyen: float


class UTWINTarifEmprunteur(BaseModel):
    """
    Schema for UTWIN borrower tariff
    """
    prime_annuelle: float
    prime_mensuelle: float
    tarif_prets: List[UTWINTarifPret]


class UTWINErreurValidation(BaseModel):
    """
    Schema for UTWIN validation error
    """
    code: str
    message: str


class UTWINTarifResponse(BaseModel):
    """
    Schema for UTWIN tariff response
    """
    tarifs_emprunteurs: List[UTWINTarifEmprunteur]
    erreurs_validation: List[UTWINErreurValidation]
    est_erreur: bool
