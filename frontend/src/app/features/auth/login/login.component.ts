import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  hubspotAuthUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Redirect to home if already logged in
    if (this.authService.getToken()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.hubspotAuthUrl = '';
  }

  ngOnInit(): void {
    // Get HubSpot auth URL
    this.authService.getHubspotAuthUrl().subscribe(
      response => {
        this.hubspotAuthUrl = response.auth_url;
      },
      error => {
        console.error('Error getting HubSpot auth URL', error);
      }
    );
  }

  // Convenience getter for form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f.email.value, this.f.password.value)
      .subscribe(
        () => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.error?.detail || 'Invalid username or password'
          });
          this.loading = false;
        }
      );
  }

  loginWithHubspot(): void {
    if (this.hubspotAuthUrl) {
      window.location.href = this.hubspotAuthUrl;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'HubSpot authentication URL not available'
      });
    }
  }
}
