import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models/lead.model';

@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  providers: [MessageService, ConfirmationService]
})
export class LeadListComponent implements OnInit {
  leads: Lead[] = [];
  loading = true;
  searchTerm = '';
  
  constructor(
    private leadService: LeadService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading = true;
    this.leadService.getLeads({ search: this.searchTerm || undefined }).subscribe(
      data => {
        this.leads = data;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load leads'
        });
        this.loading = false;
      }
    );
  }

  onSearch(): void {
    this.loadLeads();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadLeads();
  }

  viewLead(lead: Lead): void {
    this.router.navigate(['/leads', lead.id]);
  }

  editLead(lead: Lead): void {
    this.router.navigate(['/leads/edit', lead.id]);
  }

  createLead(): void {
    this.router.navigate(['/leads/new']);
  }

  deleteLead(lead: Lead): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${lead.first_name} ${lead.last_name}?`,
      accept: () => {
        this.leadService.deleteLead(lead.id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Lead deleted successfully'
            });
            this.loadLeads();
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete lead'
            });
          }
        );
      }
    });
  }

  syncToHubspot(lead: Lead): void {
    this.leadService.syncLeadToHubspot(lead.id).subscribe(
      updatedLead => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lead synced to HubSpot successfully'
        });
        // Update the lead in the list
        const index = this.leads.findIndex(l => l.id === lead.id);
        if (index !== -1) {
          this.leads[index] = updatedLead;
        }
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to sync lead to HubSpot'
        });
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'contacted':
        return 'status-contacted';
      case 'qualified':
        return 'status-qualified';
      case 'converted':
        return 'status-converted';
      default:
        return 'status-default';
    }
  }
}
