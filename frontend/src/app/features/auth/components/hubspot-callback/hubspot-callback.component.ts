import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-hubspot-callback',
  templateUrl: './hubspot-callback.component.html',
  styleUrls: ['./hubspot-callback.component.css']
})
export class HubspotCallbackComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the authorization code from URL query params
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      
      if (!code) {
        this.error = 'Authorization code not found. Please try again.';
        this.loading = false;
        return;
      }
      
      // Process the HubSpot callback
      this.authService.hubspotCallback(code).subscribe({
        next: () => {
          // Successfully authenticated
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: error => {
          this.error = error.error?.detail || 'Error authenticating with HubSpot. Please try again.';
          this.loading = false;
        }
      });
    });
  }
}