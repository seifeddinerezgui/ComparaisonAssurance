import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeadService } from '../../../../core/services/lead.service';
import { Lead } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-lead-list',
  templateUrl: './lead-list.component.html',
  styleUrls: ['./lead-list.component.css']
})
export class LeadListComponent implements OnInit {
  leads: Lead[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private leadService: LeadService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.leadService.getAllLeads().subscribe(
      leads => {
        this.leads = leads;
        this.loading = false;
      },
      error => {
        this.errorMessage = 'Failed to load leads. Please try again later.';
        this.loading = false;
      }
    );
  }

  createNewLead(): void {
    // Will be implemented in a future update
    console.log('Create new lead clicked');
  }
}