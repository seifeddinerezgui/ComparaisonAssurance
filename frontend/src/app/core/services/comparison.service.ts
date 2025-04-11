import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ComparisonResult } from '../models/comparison.model';

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private comparisonUrl = '/comparison';
  
  constructor(private apiService: ApiService) { }
  
  runComparison(projectId: number): Observable<ComparisonResult[]> {
    return this.apiService.post<ComparisonResult[]>(`${this.comparisonUrl}/run`, { project_id: projectId });
  }
  
  getComparisonResults(projectId: number): Observable<ComparisonResult[]> {
    return this.apiService.get<ComparisonResult[]>(`${this.comparisonUrl}/project/${projectId}`);
  }
  
  deleteComparisonResults(projectId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.comparisonUrl}/project/${projectId}`);
  }
}
