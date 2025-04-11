import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { LeadService } from '../../../../core/services/lead.service';
import { Project, ComparisonResult } from '../../../../core/models/project.model';
import { Lead } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-comparison-results',
  templateUrl: './comparison-results.component.html',
  styleUrls: ['./comparison-results.component.css']
})
export class ComparisonResultsComponent implements OnInit {
  loading = true;
  project: Project | null = null;
  lead: Lead | null = null;
  results: ComparisonResult[] = [];
  errorMessage = '';
  projectId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private leadService: LeadService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectIdParam = params.get('projectId');
      if (projectIdParam) {
        this.projectId = parseInt(projectIdParam, 10);
        this.loadData(this.projectId);
      } else {
        this.errorMessage = 'Project ID not found';
        this.loading = false;
      }
    });
  }

  loadData(projectId: number): void {
    this.projectService.getProject(projectId).subscribe(
      project => {
        this.project = project;
        
        // Load the lead
        if (project.lead_id) {
          this.leadService.getLead(project.lead_id).subscribe(
            lead => {
              this.lead = lead;
              
              // Load comparison results
              this.projectService.getComparisonResults(projectId).subscribe(
                results => {
                  this.results = results;
                  // Update project status if needed
                  if (results.length > 0 && project.status === 'created') {
                    this.updateProjectStatus(projectId);
                  } else {
                    this.loading = false;
                  }
                },
                error => {
                  this.errorMessage = 'Failed to load comparison results';
                  this.loading = false;
                }
              );
            },
            error => {
              this.errorMessage = 'Failed to load lead details';
              this.loading = false;
            }
          );
        } else {
          this.loading = false;
        }
      },
      error => {
        this.errorMessage = 'Failed to load project details';
        this.loading = false;
      }
    );
  }

  updateProjectStatus(projectId: number): void {
    const update = {
      status: 'compared'
    };
    
    this.projectService.updateProject(projectId, update).subscribe(
      updatedProject => {
        this.project = updatedProject;
        this.loading = false;
      },
      error => {
        // We can still show results even if the status update fails
        this.loading = false;
      }
    );
  }

  runNewComparison(): void {
    this.router.navigate(['/comparison']);
  }

  sortByMonthlyPremium(): void {
    this.results = [...this.results].sort((a, b) => a.monthly_premium - b.monthly_premium);
  }

  sortByAnnualPremium(): void {
    this.results = [...this.results].sort((a, b) => a.annual_premium - b.annual_premium);
  }

  sortByTotalPremium(): void {
    this.results = [...this.results].sort((a, b) => a.total_premium - b.total_premium);
  }

  sortByCoveragePercentage(): void {
    this.results = [...this.results].sort((a, b) => b.coverage_percentage - a.coverage_percentage);
  }
}