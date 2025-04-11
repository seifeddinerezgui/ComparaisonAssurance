export interface Lead {
  id: number;
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
  status: string;
  hubspot_id?: string;
  hubspot_sync_status?: string;
  hubspot_last_sync?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at?: string;
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

export interface LeadSyncRequest {
  lead_id: number;
}