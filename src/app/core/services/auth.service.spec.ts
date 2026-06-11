import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

function makeToken(claims: { role: string; exp: number }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '1',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'test@test.com',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': claims.role,
    exp: claims.exp,
    nbf: Math.floor(Date.now() / 1000) - 10,
    iss: 'OrdersApi',
    aud: 'OrdersApiUsers'
  }));
  return `${header}.${payload}.fakesig`;
}

function futureExp(): number { return Math.floor(Date.now() / 1000) + 3600; }
function pastExp(): number { return Math.floor(Date.now() / 1000) - 3600; }

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated is false with no token', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('isAdmin is false with no token', () => {
    expect(service.isAdmin()).toBeFalse();
  });

  it('login stores token and sets isAuthenticated true', () => {
    const token = makeToken({ role: 'User', exp: futureExp() });
    service.login('user@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    expect(service.getToken()).toBe(token);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('isAuthenticated is false with expired token', () => {
    const token = makeToken({ role: 'User', exp: pastExp() });
    service.login('user@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('isAdmin is true when role is Admin', () => {
    const token = makeToken({ role: 'Admin', exp: futureExp() });
    service.login('admin@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    expect(service.isAdmin()).toBeTrue();
  });

  it('isAdmin is false when role is not Admin', () => {
    const token = makeToken({ role: 'User', exp: futureExp() });
    service.login('user@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    expect(service.isAdmin()).toBeFalse();
  });

  it('logout clears token and isAuthenticated becomes false', () => {
    const token = makeToken({ role: 'User', exp: futureExp() });
    service.login('user@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('malformed JWT (invalid base64 payload) returns unauthenticated', () => {
    service['_token'].set('xxx.!!!.zzz');
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
  });

  it('token with missing required claims returns unauthenticated (type guard)', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ sub: 'user', exp: futureExp() }));
    service['_token'].set(`${header}.${payload}.sig`);
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
  });

  it('does not use localStorage or sessionStorage', () => {
    spyOn(localStorage, 'setItem');
    spyOn(sessionStorage, 'setItem');
    const token = makeToken({ role: 'User', exp: futureExp() });
    service.login('user@test.com', 'password123').subscribe();
    httpMock.expectOne(r => r.url.includes('/api/Auth/Generartoken')).flush({ token });
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
  });
});
