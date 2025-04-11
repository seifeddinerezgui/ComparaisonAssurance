export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  notes: string | null;
  source: string | null;
  status: string;
  hubspot_id: string | null;
  hubspot_sync_status: string | null;
  hubspot_last_sync: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface LeadCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  occupation?: string;
  notes?: string;
  source?: string;
  status?: string;
}

export interface LeadUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  occupation?: string;
  notes?: string;
  source?: string;
  status?: string;
}
