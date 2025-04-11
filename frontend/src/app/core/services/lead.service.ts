import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lead } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private leadUrl = '/leads';
  
  constructor(private apiService: ApiService) { }
  
  getLeads(params: any = {}): Observable<Lead[]> {
    return this.apiService.get<Lead[]>(this.leadUrl, params);
  }
  
  getLead(id: number): Observable<Lead> {
    return this.apiService.get<Lead>(`${this.leadUrl}/${id}`);
  }
  
  createLead(lead: Partial<Lead>): Observable<Lead> {
    return this.apiService.post<Lead>(this.leadUrl, lead);
  }
  
  updateLead(id: number, lead: Partial<Lead>): Observable<Lead> {
    return this.apiService.put<Lead>(`${this.leadUrl}/${id}`, lead);
  }
  
  deleteLead(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.leadUrl}/${id}`);
  }
  
  syncLeadToHubspot(id: number): Observable<Lead> {
    return this.apiService.post<Lead>(`${this.leadUrl}/${id}/sync-to-hubspot`);
  }
}
