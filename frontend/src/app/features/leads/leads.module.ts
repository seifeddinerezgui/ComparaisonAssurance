import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// We'll create placeholder components for now
import { LeadListComponent } from './components/lead-list/lead-list.component';

const routes: Routes = [
  {
    path: '',
    component: LeadListComponent
  }
];

@NgModule({
  declarations: [
    LeadListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LeadsModule { }