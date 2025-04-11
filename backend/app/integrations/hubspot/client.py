import logging
import os
import requests
from typing import Dict, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# HubSpot API base URL
HUBSPOT_API_BASE_URL = "https://api.hubapi.com"


def get_hubspot_auth_url() -> str:
    """
    Get the HubSpot authorization URL for OAuth
    """
    params = {
        "client_id": settings.HUBSPOT_CLIENT_ID,
        "redirect_uri": settings.HUBSPOT_REDIRECT_URI,
        "scope": settings.HUBSPOT_SCOPE
    }
    
    auth_url = f"https://app.hubspot.com/oauth/authorize"
    query_string = "&".join([f"{key}={value}" for key, value in params.items()])
    
    return f"{auth_url}?{query_string}"


def exchange_code_for_token(code: str) -> Optional[Dict]:
    """
    Exchange authorization code for access token
    """
    try:
        token_url = f"{HUBSPOT_API_BASE_URL}/oauth/v1/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": settings.HUBSPOT_CLIENT_ID,
            "client_secret": settings.HUBSPOT_CLIENT_SECRET,
            "redirect_uri": settings.HUBSPOT_REDIRECT_URI,
            "code": code
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        return response.json()
    
    except Exception as e:
        logger.error(f"Error exchanging code for token: {str(e)}")
        return None


def refresh_access_token(refresh_token: str) -> Optional[Dict]:
    """
    Refresh the access token using a refresh token
    """
    try:
        token_url = f"{HUBSPOT_API_BASE_URL}/oauth/v1/token"
        data = {
            "grant_type": "refresh_token",
            "client_id": settings.HUBSPOT_CLIENT_ID,
            "client_secret": settings.HUBSPOT_CLIENT_SECRET,
            "refresh_token": refresh_token
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        return response.json()
    
    except Exception as e:
        logger.error(f"Error refreshing access token: {str(e)}")
        return None


def get_hubspot_user_info(access_token: str) -> Optional[Dict]:
    """
    Get the user information from HubSpot
    """
    try:
        # Note: HubSpot doesn't have a specific endpoint for user info
        # We'll get some basic account info instead
        url = f"{HUBSPOT_API_BASE_URL}/integrations/v1/me"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        account_info = response.json()
        
        # Try to get user email from the account info
        # This is a fallback as we don't have direct user info
        user_info = {
            "id": account_info.get("portalId", ""),
            "email": account_info.get("email", ""),
            "first_name": account_info.get("firstName", ""),
            "last_name": account_info.get("lastName", "")
        }
        
        return user_info
    
    except Exception as e:
        logger.error(f"Error getting HubSpot user info: {str(e)}")
        return None


def create_or_update_contact(access_token: str, contact_data: Dict) -> Optional[Dict]:
    """
    Create or update a contact in HubSpot
    """
    try:
        # Check if contact exists by email
        email = contact_data.get("email")
        if not email:
            logger.error("Email is required to create or update a contact")
            return None
        
        search_url = f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/search"
        search_payload = {
            "filterGroups": [
                {
                    "filters": [
                        {
                            "propertyName": "email",
                            "operator": "EQ",
                            "value": email
                        }
                    ]
                }
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        search_response = requests.post(search_url, headers=headers, json=search_payload)
        search_response.raise_for_status()
        search_results = search_response.json()
        
        # Convert contact data to HubSpot properties format
        properties = {
            "email": email,
            "firstname": contact_data.get("first_name", ""),
            "lastname": contact_data.get("last_name", ""),
            "phone": contact_data.get("phone", ""),
            "address": contact_data.get("address", ""),
            "city": contact_data.get("city", ""),
            "zip": contact_data.get("postal_code", ""),
            "country": contact_data.get("country", ""),
            "date_of_birth": contact_data.get("date_of_birth", ""),
            "job_function": contact_data.get("occupation", "")
        }
        
        # If contact exists, update it
        if search_results.get("total", 0) > 0:
            contact_id = search_results["results"][0]["id"]
            update_url = f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/{contact_id}"
            
            update_payload = {
                "properties": properties
            }
            
            update_response = requests.patch(update_url, headers=headers, json=update_payload)
            update_response.raise_for_status()
            
            return update_response.json()
        
        # If contact doesn't exist, create it
        else:
            create_url = f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts"
            
            create_payload = {
                "properties": properties
            }
            
            create_response = requests.post(create_url, headers=headers, json=create_payload)
            create_response.raise_for_status()
            
            return create_response.json()
    
    except Exception as e:
        logger.error(f"Error creating or updating HubSpot contact: {str(e)}")
        return None
