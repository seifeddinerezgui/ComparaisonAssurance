import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  // Auth Routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Dashboard Routes
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  
  // Lead Routes
  {
    path: 'leads',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/leads/leads.module').then(m => m.LeadsModule)
  },
  
  // Project Routes
  {
    path: 'projects',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule)
  },
  
  // Comparison Routes
  {
    path: 'comparison',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/comparison/comparison.module').then(m => m.ComparisonModule)
  },
  
  // Default Routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
