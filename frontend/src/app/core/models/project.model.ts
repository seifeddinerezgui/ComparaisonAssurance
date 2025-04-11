export interface Project {
  id: number;
  name: string;
  description?: string;
  lead_id: number;
  loan_amount: number;
  loan_duration: number;
  loan_type: string;
  loan_rate?: number;
  guarantees_required?: Record<string, any>;
  options?: Record<string, any>;
  status: string;
  created_by_user_id: number;
  created_at: string;
  updated_at?: string;
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

export interface ComparisonResult {
  id: number;
  project_id: number;
  insurer: string;
  product_code: string;
  product_name: string;
  monthly_premium: number;
  annual_premium: number;
  total_premium: number;
  coverage_percentage: number;
  coverage_details?: Record<string, any>;
  raw_response?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface ComparisonRequest {
  project_id: number;
}