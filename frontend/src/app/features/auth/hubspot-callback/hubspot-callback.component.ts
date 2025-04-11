import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-hubspot-callback',
  templateUrl: './hubspot-callback.component.html',
  providers: [MessageService]
})
export class HubspotCallbackComponent implements OnInit {
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Get the code from the URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      
      if (code) {
        // Exchange code for token
        this.authService.hubspotCallback(code).subscribe(
          () => {
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          },
          error => {
            this.loading = false;
            this.error = true;
            this.errorMessage = error.error?.detail || 'Error authenticating with HubSpot';
            
            this.messageService.add({
              severity: 'error',
              summary: 'Authentication Failed',
              detail: this.errorMessage
            });
            
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3000);
          }
        );
      } else {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'No authorization code provided';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Authentication Failed',
          detail: this.errorMessage
        });
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      }
    });
  }
}
