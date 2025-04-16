import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from "rxjs";

export interface User {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  role?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
  logout?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    this.loadStoredUserData();
  }

  private loadStoredUserData(): void {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      this.accessToken = storedToken;

      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Error parsing stored user data', e);
        }
      }
    }
  }

  initializeUserData(): void {
    // Only try to get current user if we have a token
    if (this.token) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        },
        error: () => {
          // If getting current user fails, clear any stale data
          this.clearAuthData();
        }
      });
    }
  }

  private clearAuthData(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData, { withCredentials: true })
      .pipe(
        tap(response => {
          this.accessToken = response.accessToken;
          this.currentUserSubject.next(response.user);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }),
        catchError(this.handleError)
      );
  }

  register(registerData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData, { withCredentials: true })
      .pipe(
        tap(response => {
          this.accessToken = response.accessToken;
          this.currentUserSubject.next(response.user);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearAuthData();
        }),
        catchError(error => {
          this.clearAuthData();
          return this.handleError(error);
        })
      );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh-token`, {}, {
      withCredentials: true
    })
      .pipe(
        tap(response => {
          this.accessToken = response.accessToken;
          localStorage.setItem('accessToken', response.accessToken);
        }),
        catchError(this.handleError)
      );
  }

  getCurrentUser(): Observable<{ user: User }> {
    // If we don't have a token, don't make the request
    if (!this.token) {
      return of({ user: null as any }).pipe(
        catchError(this.handleError)
      );
    }

    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/change-password`, {
        oldPassword,
        newPassword
      },
      { withCredentials: true}
    ).pipe(
      catchError(this.handleError)
    );
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
