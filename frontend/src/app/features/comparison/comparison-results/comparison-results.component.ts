import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ProjectService } from '../../../core/services/project.service';
import { ComparisonService } from '../../../core/services/comparison.service';
import { Project } from '../../../core/models/project.model';
import { ComparisonResult } from '../../../core/models/comparison.model';

@Component({
  selector: 'app-comparison-results',
  templateUrl: './comparison-results.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ComparisonResultsComponent implements OnInit {
  projectId: number;
  project: Project | null = null;
  comparisonResults: ComparisonResult[] = [];
  loading = true;
  deletingResults = false;
  
  // Chart data
  chartData: any;
  chartOptions: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private comparisonService: ComparisonService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId')) || 0;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.projectService.getProject(this.projectId).subscribe(
      project => {
        this.project = project;
        this.comparisonResults = project.comparison_results;
        this.loading = false;
        this.prepareChartData();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load project data'
        });
        this.loading = false;
      }
    );
  }

  prepareChartData(): void {
    if (!this.comparisonResults.length) return;
    
    const productLabels = this.comparisonResults.map(result => result.product_name);
    const monthlyPremiums = this.comparisonResults.map(result => result.monthly_premium);
    const annualPremiums = this.comparisonResults.map(result => result.annual_premium);
    const totalPremiums = this.comparisonResults.map(result => result.total_premium);
    
    // Prepare chart data
    this.chartData = {
      labels: productLabels,
      datasets: [
        {
          type: 'bar',
          label: 'Monthly Premium (€)',
          backgroundColor: '#42A5F5',
          data: monthlyPremiums
        },
        {
          type: 'bar',
          label: 'Annual Premium (€)',
          backgroundColor: '#66BB6A',
          data: annualPremiums
        },
        {
          type: 'bar',
          label: 'Total Premium (€)',
          backgroundColor: '#FFA726',
          data: totalPremiums
        }
      ]
    };
    
    // Chart options
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          stacked: false,
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          stacked: false,
          title: {
            display: true,
            text: 'Premium (€)'
          }
        }
      }
    };
  }

  newComparison(): void {
    this.router.navigate(['/comparison/new', this.projectId]);
  }

  deleteResults(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete all comparison results?',
      accept: () => {
        this.deletingResults = true;
        this.comparisonService.deleteComparisonResults(this.projectId).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Comparison results deleted successfully'
            });
            this.deletingResults = false;
            this.router.navigate(['/projects', this.projectId]);
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete comparison results'
            });
            this.deletingResults = false;
          }
        );
      }
    });
  }

  backToProject(): void {
    this.router.navigate(['/projects', this.projectId]);
  }

  // Format number for display with thousands separator
  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(value);
  }
}
