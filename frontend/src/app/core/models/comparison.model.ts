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
  coverage_details: Record<string, any> | null;
  raw_response: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface ComparisonRequest {
  project_id: number;
}
