export interface User {
  id: number;
  email: string;
  first_name?: string; // Optional properties have ? 
  last_name?: string;
  is_active: boolean;
  is_admin: boolean;
  is_hubspot_user: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserLogin {
  username: string; // Using username as it's expected by the FastAPI OAuth2PasswordRequestForm
  password: string;
}

export interface UserRegistration {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}