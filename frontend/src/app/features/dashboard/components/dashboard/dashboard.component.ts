import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { LeadService } from '../../../../core/services/lead.service';
import { ProjectService } from '../../../../core/services/project.service';
import { User } from '../../../../core/models/user.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  stats = {
    totalLeads: 0,
    activeProjects: 0,
    completedComparisons: 0,
    pendingComparisons: 0
  };

  constructor(
    private authService: AuthService,
    private leadService: LeadService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    // Subscribe to the current user observable
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    // Use forkJoin to combine multiple API calls
    forkJoin({
      leads: this.leadService.getAllLeads().pipe(catchError(() => of([]))),
      projects: this.projectService.getAllProjects().pipe(catchError(() => of([])))
    }).subscribe(
      data => {
        const { leads, projects } = data;
        
        // Calculate stats
        const completedProjects = projects.filter(p => p.status === 'compared');
        const pendingProjects = projects.filter(p => p.status === 'created');
        
        this.stats = {
          totalLeads: leads.length,
          activeProjects: projects.length,
          completedComparisons: completedProjects.length,
          pendingComparisons: pendingProjects.length
        };
        
        this.loading = false;
      },
      error => {
        console.error('Error loading dashboard data:', error);
        // Show empty stats but don't keep the loading state
        this.loading = false;
      }
    );
  }
}