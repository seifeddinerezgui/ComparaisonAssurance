export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_hubspot_user: boolean;
  created_at: string;
  updated_at: string | null;
}
