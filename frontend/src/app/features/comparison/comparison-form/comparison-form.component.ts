import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ProjectService } from '../../../core/services/project.service';
import { ComparisonService } from '../../../core/services/comparison.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-comparison-form',
  templateUrl: './comparison-form.component.html',
  providers: [MessageService]
})
export class ComparisonFormComponent implements OnInit {
  projectId: number;
  project: Project | null = null;
  loading = true;
  submitting = false;
  comparisonForm: FormGroup;
  
  utwinProductOptions = [
    { label: 'Death Coverage', value: 'GARANTIE_DECES' },
    { label: 'Total and Irreversible Loss of Autonomy', value: 'GARANTIE_PTIA' },
    { label: 'Total Permanent Disability', value: 'GARANTIE_IPT' },
    { label: 'Partial Permanent Disability', value: 'GARANTIE_IPP' },
    { label: 'Temporary Total Incapacity', value: 'GARANTIE_ITT' },
    { label: 'Job Loss', value: 'GARANTIE_PE' },
    { label: 'Back Pain Non-Standard Condition', value: 'GARANTIE_MNO_DOS' },
    { label: 'Psychological Disorders Non-Standard Condition', value: 'GARANTIE_MNO_PSY' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private comparisonService: ComparisonService,
    private messageService: MessageService
  ) {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId')) || 0;
    this.comparisonForm = this.createComparisonForm();
  }

  ngOnInit(): void {
    this.loadProject();
  }

  createComparisonForm(): FormGroup {
    return this.fb.group({
      guarantees: this.fb.array([]),
      coverage_rate: [100, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProject(this.projectId).subscribe(
      project => {
        this.project = project;
        this.loading = false;
        this.initializeForm();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load project details'
        });
        this.loading = false;
      }
    );
  }

  initializeForm(): void {
    // Reset the guarantees array
    this.guaranteesArray.clear();
    
    // Add checkboxes for each UTWIN product
    this.utwinProductOptions.forEach(product => {
      const isRequired = this.project?.guarantees_required?.[product.value] || false;
      this.guaranteesArray.push(this.fb.control(isRequired));
    });
  }

  get guaranteesArray(): FormArray {
    return this.comparisonForm.get('guarantees') as FormArray;
  }

  onSubmit(): void {
    if (this.comparisonForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.comparisonForm.controls).forEach(key => {
        const control = this.comparisonForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    // Update project guarantees_required based on form values
    const guaranteesRequired: Record<string, boolean> = {};
    this.utwinProductOptions.forEach((product, index) => {
      guaranteesRequired[product.value] = this.guaranteesArray.value[index];
    });

    // Update project options based on form values
    const options: Record<string, any> = {
      coverage_rate: this.comparisonForm.get('coverage_rate')?.value
    };

    // Save the updated project
    this.submitting = true;
    this.projectService.updateProject(this.projectId, {
      guarantees_required: guaranteesRequired,
      options: options
    }).subscribe(
      updatedProject => {
        // Now run the comparison
        this.runComparison();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update project'
        });
        this.submitting = false;
      }
    );
  }

  runComparison(): void {
    this.comparisonService.runComparison(this.projectId).subscribe(
      results => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Comparison completed successfully'
        });
        this.submitting = false;
        
        // Navigate to the results page
        setTimeout(() => {
          this.router.navigate(['/comparison/results', this.projectId]);
        }, 1000);
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to run comparison'
        });
        this.submitting = false;
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
}
