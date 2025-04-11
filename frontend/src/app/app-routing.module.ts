import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/auth/auth.guard';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';
import { HubspotCallbackComponent } from './features/auth/hubspot-callback/hubspot-callback.component';

// Lead Components
import { LeadListComponent } from './features/leads/lead-list/lead-list.component';
import { LeadDetailComponent } from './features/leads/lead-detail/lead-detail.component';
import { LeadFormComponent } from './features/leads/lead-form/lead-form.component';

// Project Components
import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { ProjectDetailComponent } from './features/projects/project-detail/project-detail.component';

// Comparison Components
import { ComparisonFormComponent } from './features/comparison/comparison-form/comparison-form.component';
import { ComparisonResultsComponent } from './features/comparison/comparison-results/comparison-results.component';

const routes: Routes = [
  // Auth Routes
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'hubspot-callback', component: HubspotCallbackComponent }
    ]
  },
  
  // Lead Routes
  { 
    path: 'leads', 
    canActivate: [AuthGuard],
    children: [
      { path: '', component: LeadListComponent },
      { path: 'new', component: LeadFormComponent },
      { path: 'edit/:id', component: LeadFormComponent },
      { path: ':id', component: LeadDetailComponent }
    ]
  },
  
  // Project Routes
  {
    path: 'projects',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectListComponent },
      { path: ':id', component: ProjectDetailComponent }
    ]
  },
  
  // Comparison Routes
  {
    path: 'comparison',
    canActivate: [AuthGuard],
    children: [
      { path: 'new/:projectId', component: ComparisonFormComponent },
      { path: 'results/:projectId', component: ComparisonResultsComponent }
    ]
  },
  
  // Default Routes
  { path: '', redirectTo: '/leads', pathMatch: 'full' },
  { path: '**', redirectTo: '/leads' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
