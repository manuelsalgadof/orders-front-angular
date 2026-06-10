import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, DecodedToken } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    const payload = this.decodePayload(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  });

  readonly isAdmin = computed(() => {
    const token = this._token();
    if (!token) return false;
    const payload = this.decodePayload(token);
    return payload?.role === 'Admin';
  });

  readonly currentUserEmail = computed(() => {
    const token = this._token();
    if (!token) return null;
    const payload = this.decodePayload(token);
    return payload?.unique_name ?? null;
  });

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, password };
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/Auth/Generartoken`, body)
      .pipe(tap(res => this._token.set(res.token)));
  }

  logout(): void {
    this._token.set(null);
  }

  getToken(): string | null {
    return this._token();
  }

  private decodePayload(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(padded)) as DecodedToken;
    } catch {
      return null;
    }
  }
}
