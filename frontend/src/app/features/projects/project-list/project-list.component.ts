import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { LeadService } from '../../../core/services/lead.service';
import { Project, ProjectCreate } from '../../../core/models/project.model';
import { Lead } from '../../../core/models/lead.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  displayCreateDialog = false;
  projectForm: FormGroup;
  submitting = false;
  leads: Lead[] = [];
  leadsLoading = false;
  filterLeadId: number | null = null;

  loanTypeOptions = [
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Consumer', value: 'consumer' },
    { label: 'Business', value: 'business' },
    { label: 'Other', value: 'other' }
  ];

  constructor(
    private projectService: ProjectService,
    private leadService: LeadService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.createProjectForm();
    
    // Check router state for create project request
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    
    if (state?.createProject) {
      this.filterLeadId = state.leadId;
      setTimeout(() => {
        this.showCreateDialog(state.leadId);
      }, 500);
    }
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadLeads();
  }

  createProjectForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      lead_id: [null, [Validators.required]],
      loan_amount: [null, [Validators.required, Validators.min(1)]],
      loan_duration: [null, [Validators.required, Validators.min(1)]],
      loan_type: ['', [Validators.required]],
      loan_rate: [null],
      guarantees_required: [{}],
      options: [{}]
    });
  }

  loadProjects(): void {
    this.loading = true;
    const params: any = {};
    
    if (this.filterLeadId) {
      params.lead_id = this.filterLeadId;
    }
    
    this.projectService.getProjects(params).subscribe(
      data => {
        this.projects = data;
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects'
        });
        this.loading = false;
      }
    );
  }

  loadLeads(): void {
    this.leadsLoading = true;
    this.leadService.getLeads().subscribe(
      data => {
        this.leads = data;
        this.leadsLoading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load leads'
        });
        this.leadsLoading = false;
      }
    );
  }

  showCreateDialog(leadId: number | null = null): void {
    this.projectForm.reset({
      name: '',
      description: '',
      lead_id: leadId,
      loan_amount: null,
      loan_duration: null,
      loan_type: '',
      loan_rate: null,
      guarantees_required: {},
      options: {}
    });
    this.displayCreateDialog = true;
  }

  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  deleteProject(project: Project): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete project "${project.name}"?`,
      accept: () => {
        this.projectService.deleteProject(project.id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Project deleted successfully'
            });
            this.loadProjects();
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete project'
            });
          }
        );
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const projectData: ProjectCreate = this.projectForm.value;

    this.projectService.createProject(projectData).subscribe(
      newProject => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project created successfully'
        });
        this.displayCreateDialog = false;
        this.submitting = false;
        this.loadProjects();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create project'
        });
        this.submitting = false;
      }
    );
  }

  filterByLead(event: any): void {
    this.filterLeadId = event.value;
    this.loadProjects();
  }

  clearLeadFilter(): void {
    this.filterLeadId = null;
    this.loadProjects();
  }

  findLeadName(leadId: number): string {
    const lead = this.leads.find(l => l.id === leadId);
    return lead ? `${lead.first_name} ${lead.last_name}` : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'created':
        return 'status-created';
      case 'compared':
        return 'status-compared';
      case 'exported':
        return 'status-exported';
      default:
        return 'status-default';
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.projectForm.controls; }
}
