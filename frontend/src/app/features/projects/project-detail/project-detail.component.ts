import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { LeadService } from '../../../core/services/lead.service';
import { ComparisonService } from '../../../core/services/comparison.service';
import { Project, ProjectUpdate } from '../../../core/models/project.model';
import { Lead } from '../../../core/models/lead.model';
import { ComparisonResult } from '../../../core/models/comparison.model';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  lead: Lead | null = null;
  loading = true;
  leadLoading = false;
  displayEditDialog = false;
  projectForm: FormGroup;
  submitting = false;
  comparingResults = false;
  hasComparisonResults = false;
  
  loanTypeOptions = [
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Consumer', value: 'consumer' },
    { label: 'Business', value: 'business' },
    { label: 'Other', value: 'other' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private leadService: LeadService,
    private comparisonService: ComparisonService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.createProjectForm();
  }

  ngOnInit(): void {
    this.loadProject();
  }

  createProjectForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      loan_amount: [null, [Validators.required, Validators.min(1)]],
      loan_duration: [null, [Validators.required, Validators.min(1)]],
      loan_type: ['', [Validators.required]],
      loan_rate: [null],
      guarantees_required: [{}],
      options: [{}]
    });
  }

  loadProject(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.loading = true;
    this.projectService.getProject(id).subscribe(
      project => {
        this.project = project;
        this.hasComparisonResults = project.comparison_results.length > 0;
        this.loading = false;
        this.loadLead(project.lead_id);
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load project details'
        });
        this.loading = false;
      }
    );
  }

  loadLead(leadId: number): void {
    this.leadLoading = true;
    this.leadService.getLead(leadId).subscribe(
      lead => {
        this.lead = lead;
        this.leadLoading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load lead details'
        });
        this.leadLoading = false;
      }
    );
  }

  showEditDialog(): void {
    if (!this.project) return;
    
    this.projectForm.reset({
      name: this.project.name,
      description: this.project.description,
      loan_amount: this.project.loan_amount,
      loan_duration: this.project.loan_duration,
      loan_type: this.project.loan_type,
      loan_rate: this.project.loan_rate,
      guarantees_required: this.project.guarantees_required || {},
      options: this.project.options || {}
    });
    
    this.displayEditDialog = true;
  }

  deleteProject(): void {
    if (!this.project) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete project "${this.project.name}"?`,
      accept: () => {
        this.projectService.deleteProject(this.project!.id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Project deleted successfully'
            });
            setTimeout(() => {
              this.router.navigate(['/projects']);
            }, 1500);
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
    if (this.projectForm.invalid || !this.project) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const projectData: ProjectUpdate = this.projectForm.value;

    this.projectService.updateProject(this.project.id, projectData).subscribe(
      updatedProject => {
        this.project = updatedProject;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project updated successfully'
        });
        this.displayEditDialog = false;
        this.submitting = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update project'
        });
        this.submitting = false;
      }
    );
  }

  runComparison(): void {
    if (!this.project) return;
    
    this.comparingResults = true;
    this.comparisonService.runComparison(this.project.id).subscribe(
      results => {
        this.hasComparisonResults = results.length > 0;
        this.project!.comparison_results = results;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Comparison completed successfully'
        });
        this.comparingResults = false;
        
        // Refresh project to get the updated status
        this.loadProject();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to run comparison'
        });
        this.comparingResults = false;
      }
    );
  }

  viewComparisonResults(): void {
    if (!this.project) return;
    this.router.navigate(['/comparison/results', this.project.id]);
  }

  createNewComparison(): void {
    if (!this.project) return;
    this.router.navigate(['/comparison/new', this.project.id]);
  }

  viewLeadDetails(): void {
    if (!this.lead) return;
    this.router.navigate(['/leads', this.lead.id]);
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
