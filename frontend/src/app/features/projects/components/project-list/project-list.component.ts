import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { LeadService } from '../../../../core/services/lead.service';
import { Project } from '../../../../core/models/project.model';
import { Lead } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  leads: Lead[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private leadService: LeadService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.projectService.getAllProjects().subscribe(
      projects => {
        this.projects = projects;
        
        if (projects.length > 0) {
          // Load leads to get their names
          this.leadService.getAllLeads().subscribe(
            leads => {
              this.leads = leads;
              this.loading = false;
            },
            error => {
              this.errorMessage = 'Failed to load leads data.';
              this.loading = false;
            }
          );
        } else {
          this.loading = false;
        }
      },
      error => {
        this.errorMessage = 'Failed to load projects. Please try again later.';
        this.loading = false;
      }
    );
  }

  getLeadName(leadId: number): string {
    const lead = this.leads.find(l => l.id === leadId);
    return lead ? `${lead.first_name} ${lead.last_name}` : 'Unknown';
  }

  createNewProject(): void {
    // Will be implemented in a future update
    console.log('Create new project clicked');
  }

  runComparison(projectId: number): void {
    this.router.navigate(['/comparison/results', projectId]);
  }
}