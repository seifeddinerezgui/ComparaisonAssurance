import { ComparisonResult } from './comparison.model';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  lead_id: number;
  loan_amount: number;
  loan_duration: number;
  loan_type: string;
  loan_rate: number | null;
  guarantees_required: Record<string, any> | null;
  options: Record<string, any> | null;
  status: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string | null;
  comparison_results: ComparisonResult[];
}

export interface ProjectCreate {
  name: string;
  description?: string;
  lead_id: number;
  loan_amount: number;
  loan_duration: number;
  loan_type: string;
  loan_rate?: number;
  guarantees_required?: Record<string, any>;
  options?: Record<string, any>;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  loan_amount?: number;
  loan_duration?: number;
  loan_type?: string;
  loan_rate?: number;
  guarantees_required?: Record<string, any>;
  options?: Record<string, any>;
  status?: string;
}
