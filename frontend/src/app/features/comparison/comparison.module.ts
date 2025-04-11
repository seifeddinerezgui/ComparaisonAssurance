import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ComparisonHomeComponent } from './components/comparison-home/comparison-home.component';
import { ComparisonResultsComponent } from './components/comparison-results/comparison-results.component';
import { ResultCardComponent } from './components/result-card/result-card.component';

const routes: Routes = [
  {
    path: '',
    component: ComparisonHomeComponent
  },
  {
    path: 'results/:projectId',
    component: ComparisonResultsComponent
  }
];

@NgModule({
  declarations: [
    ComparisonHomeComponent,
    ComparisonResultsComponent,
    ResultCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ComparisonModule { }