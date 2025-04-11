import os
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/cac")
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    CORS_ORIGINS: list[AnyHttpUrl] = ["http://localhost:5000"]
    
    # Hubspot settings
    HUBSPOT_CLIENT_ID: str = os.getenv("HUBSPOT_CLIENT_ID", "")
    HUBSPOT_CLIENT_SECRET: str = os.getenv("HUBSPOT_CLIENT_SECRET", "")
    HUBSPOT_REDIRECT_URI: str = os.getenv("HUBSPOT_REDIRECT_URI", "http://localhost:5000/auth/hubspot-callback")
    HUBSPOT_SCOPE: str = "contacts crm.objects.contacts.read"
    
    # UTWIN settings
    UTWIN_WSDL_URL: str = os.getenv("UTWIN_WSDL_URL", "https://api.utwin.fr/getrate-ws/GetTarif?wsdl")
    UTWIN_USERNAME: str = os.getenv("UTWIN_USERNAME", "")
    UTWIN_PASSWORD: str = os.getenv("UTWIN_PASSWORD", "")
    UTWIN_PRODUCT_CODES: list[str] = [
        "GARANTIE_DECES",
        "GARANTIE_PTIA",
        "GARANTIE_IPT",
        "GARANTIE_IPP",
        "GARANTIE_ITT",
        "GARANTIE_PE",
        "GARANTIE_MNO_DOS",
        "GARANTIE_MNO_PSY"
    ]

    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }


settings = Settings()
