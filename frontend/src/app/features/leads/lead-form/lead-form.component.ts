import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LeadService } from '../../../core/services/lead.service';
import { Lead, LeadCreate, LeadUpdate } from '../../../core/models/lead.model';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  providers: [MessageService]
})
export class LeadFormComponent implements OnInit {
  leadForm: FormGroup;
  isEditMode = false;
  leadId: number | null = null;
  loading = false;
  submitting = false;

  statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Converted', value: 'converted' },
    { label: 'Lost', value: 'lost' }
  ];

  sourceOptions = [
    { label: 'Comparadise', value: 'Comparadise' },
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Phone Call', value: 'Phone Call' },
    { label: 'Email', value: 'Email' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leadService: LeadService,
    private messageService: MessageService
  ) {
    this.leadForm = this.createLeadForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.leadId = Number(id);
      this.loadLead(this.leadId);
    }
  }

  createLeadForm(): FormGroup {
    return this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: [''],
      city: [''],
      postal_code: [''],
      country: [''],
      date_of_birth: [null],
      occupation: [''],
      notes: [''],
      source: [''],
      status: ['new', [Validators.required]]
    });
  }

  loadLead(id: number): void {
    this.loading = true;
    this.leadService.getLead(id).subscribe(
      lead => {
        this.populateForm(lead);
        this.loading = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load lead'
        });
        this.loading = false;
      }
    );
  }

  populateForm(lead: Lead): void {
    // Parse the date of birth if it exists
    let dateOfBirth = null;
    if (lead.date_of_birth) {
      dateOfBirth = new Date(lead.date_of_birth);
    }

    this.leadForm.patchValue({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
      postal_code: lead.postal_code,
      country: lead.country,
      date_of_birth: dateOfBirth,
      occupation: lead.occupation,
      notes: lead.notes,
      source: lead.source,
      status: lead.status
    });
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.leadForm.controls).forEach(key => {
        this.leadForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Format date before sending to API
    const formData = { ...this.leadForm.value };
    if (formData.date_of_birth instanceof Date) {
      formData.date_of_birth = formData.date_of_birth.toISOString().split('T')[0];
    }

    this.submitting = true;

    if (this.isEditMode && this.leadId) {
      // Update existing lead
      this.leadService.updateLead(this.leadId, formData as LeadUpdate).subscribe(
        updatedLead => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Lead updated successfully'
          });
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/leads', this.leadId]);
          }, 1500);
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update lead'
          });
          this.submitting = false;
        }
      );
    } else {
      // Create new lead
      this.leadService.createLead(formData as LeadCreate).subscribe(
        newLead => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Lead created successfully'
          });
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/leads', newLead.id]);
          }, 1500);
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create lead'
          });
          this.submitting = false;
        }
      );
    }
  }

  cancel(): void {
    if (this.isEditMode && this.leadId) {
      this.router.navigate(['/leads', this.leadId]);
    } else {
      this.router.navigate(['/leads']);
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.leadForm.controls; }
}
