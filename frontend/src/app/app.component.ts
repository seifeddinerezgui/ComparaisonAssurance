import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'CAC - Comparateur Assurance Client';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Load the current user if a token exists
    if (this.authService.getToken()) {
      this.authService.loadCurrentUser().subscribe();
    }
  }
}