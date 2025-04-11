import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

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

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe to the current user observable
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loading = false;
      
      // Once we have the user, we could load dashboard data from services
      // For now, we'll just simulate some stats
      this.simulateStats();
    });
  }

  // This method would be replaced with actual API calls in a real implementation
  private simulateStats(): void {
    // In reality, these would come from actual API calls to the backend
    this.stats = {
      totalLeads: 0,
      activeProjects: 0,
      completedComparisons: 0,
      pendingComparisons: 0
    };
  }
}