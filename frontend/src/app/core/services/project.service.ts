import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectCreate, ProjectUpdate, ComparisonRequest, ComparisonResult } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;
  private comparisonUrl = `${environment.apiUrl}/comparison`;

  constructor(private http: HttpClient) { }

  // Project CRUD operations
  getAllProjects(leadId?: number, status?: string): Observable<Project[]> {
    let url = this.apiUrl;
    const params: any = {};
    
    if (leadId) {
      params.lead_id = leadId;
    }
    
    if (status) {
      params.status = status;
    }
    
    return this.http.get<Project[]>(url, { params });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  getProjectsByLead(leadId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/lead/${leadId}`);
  }

  createProject(project: ProjectCreate): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: ProjectUpdate): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Comparison operations
  runComparison(projectId: number): Observable<ComparisonResult[]> {
    const request: ComparisonRequest = { project_id: projectId };
    return this.http.post<ComparisonResult[]>(`${this.comparisonUrl}/run`, request);
  }

  getComparisonResults(projectId: number): Observable<ComparisonResult[]> {
    return this.http.get<ComparisonResult[]>(`${this.comparisonUrl}/results/${projectId}`);
  }

  deleteComparisonResults(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.comparisonUrl}/results/${projectId}`);
  }
}