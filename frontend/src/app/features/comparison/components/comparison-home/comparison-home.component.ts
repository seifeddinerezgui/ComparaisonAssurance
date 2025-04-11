import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Project } from '../../../../core/models/project.model';
import { Lead } from '../../../../core/models/lead.model';
import { ProjectService } from '../../../../core/services/project.service';
import { LeadService } from '../../../../core/services/lead.service';

@Component({
  selector: 'app-comparison-home',
  templateUrl: './comparison-home.component.html',
  styleUrls: ['./comparison-home.component.css']
})
export class ComparisonHomeComponent implements OnInit {
  loading = true;
  submitting = false;
  projects: Project[] = [];
  leads: Lead[] = [];
  selectedProject: Project | null = null;
  selectionForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private leadService: LeadService,
    private router: Router
  ) {
    this.selectionForm = this.fb.group({
      projectId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load projects that haven't been compared yet
    this.projectService.getAllProjects(undefined, 'created').subscribe(
      projects => {
        this.projects = projects;
        
        // Now load the leads
        this.leadService.getAllLeads().subscribe(
          leads => {
            this.leads = leads;
            this.loading = false;
          },
          error => {
            this.errorMessage = 'Failed to load leads. Please try again later.';
            this.loading = false;
          }
        );
      },
      error => {
        this.errorMessage = 'Failed to load projects. Please try again later.';
        this.loading = false;
      }
    );
  }

  getLeadName(leadId: number): string {
    const lead = this.leads.find(l => l.id === leadId);
    return lead ? `${lead.first_name} ${lead.last_name}` : 'Unknown Lead';
  }

  onProjectSelect(event: any): void {
    const projectId = parseInt(event.target.value, 10);
    this.selectedProject = this.projects.find(p => p.id === projectId) || null;
  }

  runComparison(): void {
    if (this.selectionForm.invalid) {
      return;
    }

    this.submitting = true;
    const projectId = this.selectionForm.get('projectId')?.value;

    this.projectService.runComparison(projectId).subscribe(
      results => {
        this.submitting = false;
        // Navigate to the results page
        this.router.navigate(['/comparison/results', projectId]);
      },
      error => {
        this.submitting = false;
        this.errorMessage = 'Failed to run comparison. Please try again later.';
      }
    );
  }
}