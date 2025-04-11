import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserLogin, UserRegistration, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenKey = 'cac_token';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Get current user value without subscribing
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login user
  login(credentials: UserLogin): Observable<AuthResponse> {
    // Convert to form data as required by OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, formData)
      .pipe(
        tap(response => {
          this.storeToken(response.access_token);
          this.loadCurrentUser().subscribe();
        })
      );
  }

  // Register new user
  register(userData: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  // Load the current user's profile
  loadCurrentUser(): Observable<User | null> {
    if (!this.getToken()) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Error loading user profile', error);
          this.logout();
          return of(null);
        })
      );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get token from storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Store token in local storage
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get user from storage
  private getUserFromStorage(): User | null {
    if (!this.getToken()) {
      return null;
    }
    
    try {
      const user = localStorage.getItem('cac_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
      return null;
    }
  }

  // Get HubSpot authorization URL
  getHubSpotAuthUrl(): Observable<{ auth_url: string }> {
    return this.http.get<{ auth_url: string }>(`${this.apiUrl}/hubspot/auth-url`);
  }

  // Handle HubSpot callback
  hubspotCallback(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/hubspot/callback`, { code })
      .pipe(
        tap(response => {
          this.storeToken(response.access_token);
          this.loadCurrentUser().subscribe();
        })
      );
  }
}