import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead, LeadCreate, LeadUpdate, LeadSyncRequest } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) { }

  // Lead CRUD operations
  getAllLeads(status?: string, source?: string): Observable<Lead[]> {
    let params: any = {};
    
    if (status) {
      params.status = status;
    }
    
    if (source) {
      params.source = source;
    }
    
    return this.http.get<Lead[]>(this.apiUrl, { params });
  }

  getLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  createLead(lead: LeadCreate): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }

  updateLead(id: number, lead: LeadUpdate): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/${id}`, lead);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // HubSpot integration
  syncLeadWithHubSpot(leadId: number): Observable<Lead> {
    const request: LeadSyncRequest = { lead_id: leadId };
    return this.http.post<Lead>(`${this.apiUrl}/sync-hubspot`, request);
  }

  // Search leads
  searchLeads(query: string): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.apiUrl}/search`, { params: { q: query } });
  }
}