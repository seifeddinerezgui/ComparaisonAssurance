import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser().subscribe();
    }
  }

  login(email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return this.http.post<{access_token: string, token_type: string}>(`${this.apiUrl}/login`, formData).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isAuthenticatedSubject.next(true);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  getHubspotAuthUrl(): Observable<{auth_url: string}> {
    return this.http.get<{auth_url: string}>(`${this.apiUrl}/hubspot/auth-url`);
  }

  hubspotCallback(code: string): Observable<{access_token: string, token_type: string}> {
    return this.http.post<{access_token: string, token_type: string}>(`${this.apiUrl}/hubspot/callback`, { code }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isAuthenticatedSubject.next(true);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        this.logout();
        return of(null as any);
      })
    );
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }
    
    // In a real app, you might want to check token expiration
    // For now, we just check if the token exists
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
