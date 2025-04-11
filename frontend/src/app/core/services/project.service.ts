import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectUrl = '/projects';
  
  constructor(private apiService: ApiService) { }
  
  getProjects(params: any = {}): Observable<Project[]> {
    return this.apiService.get<Project[]>(this.projectUrl, params);
  }
  
  getProject(id: number): Observable<Project> {
    return this.apiService.get<Project>(`${this.projectUrl}/${id}`);
  }
  
  getProjectsByLead(leadId: number): Observable<Project[]> {
    return this.apiService.get<Project[]>(`${this.projectUrl}/lead/${leadId}`);
  }
  
  createProject(project: Partial<Project>): Observable<Project> {
    return this.apiService.post<Project>(this.projectUrl, project);
  }
  
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.apiService.put<Project>(`${this.projectUrl}/${id}`, project);
  }
  
  deleteProject(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.projectUrl}/${id}`);
  }
}
