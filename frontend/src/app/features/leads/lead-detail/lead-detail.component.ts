import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { LeadService } from '../../../core/services/lead.service';
import { ProjectService } from '../../../core/services/project.service';
import { Lead } from '../../../core/models/lead.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  providers: [MessageService, ConfirmationService]
})
export class LeadDetailComponent implements OnInit {
  lead: Lead | null = null;
  projects: Project[] = [];
  loading = true;
  projectsLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private projectService: ProjectService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadLead();
  }

  loadLead(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.loading = true;
    this.leadService.getLead(id).subscribe(
      lead => {
        this.lead = lead;
        this.loading = false;
        this.loadProjects();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load lead details'
        });
        this.loading = false;
      }
    );
  }

  loadProjects(): void {
    if (!this.lead) return;
    
    this.projectsLoading = true;
    this.projectService.getProjectsByLead(this.lead.id).subscribe(
      projects => {
        this.projects = projects;
        this.projectsLoading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects'
        });
        this.projectsLoading = false;
      }
    );
  }

  editLead(): void {
    if (!this.lead) return;
    this.router.navigate(['/leads/edit', this.lead.id]);
  }

  deleteLead(): void {
    if (!this.lead) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.lead.first_name} ${this.lead.last_name}?`,
      accept: () => {
        this.leadService.deleteLead(this.lead!.id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Lead deleted successfully'
            });
            setTimeout(() => {
              this.router.navigate(['/leads']);
            }, 1500);
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

  syncToHubspot(): void {
    if (!this.lead) return;
    
    this.leadService.syncLeadToHubspot(this.lead.id).subscribe(
      updatedLead => {
        this.lead = updatedLead;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lead synced to HubSpot successfully'
        });
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

  createProject(): void {
    if (!this.lead) return;
    
    this.router.navigate(['/projects'], { 
      state: { 
        createProject: true,
        leadId: this.lead.id 
      } 
    });
  }

  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
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
