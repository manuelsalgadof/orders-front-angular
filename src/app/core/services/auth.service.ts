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
      const raw: unknown = JSON.parse(atob(padded));
      if (!raw || typeof raw !== 'object') return null;
      const t = raw as Record<string, unknown>;
      const mapped: Record<string, unknown> = {
        exp: t['exp'],
        role: t['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        unique_name: t['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        nameid: t['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      };
      return this.isDecodedToken(mapped) ? (mapped as DecodedToken) : null;
    } catch {
      return null;
    }
  }

  private isDecodedToken(value: unknown): value is DecodedToken {
    if (!value || typeof value !== 'object') return false;
    const t = value as Record<string, unknown>;
    return (
      typeof t['exp'] === 'number' &&
      typeof t['role'] === 'string' &&
      typeof t['unique_name'] === 'string' &&
      typeof t['nameid'] === 'string'
    );
  }
}
