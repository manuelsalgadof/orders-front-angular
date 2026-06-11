import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let http: HttpClient;

  const mockAuth = {
    getToken: jasmine.createSpy('getToken').and.returnValue(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    mockAuth.getToken.calls.reset();
  });

  afterEach(() => httpMock.verify());

  it('adds Authorization Bearer header when token present', () => {
    mockAuth.getToken.and.returnValue('test-token-abc');
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-abc');
    req.flush({});
  });

  it('does not add Authorization header when no token', () => {
    mockAuth.getToken.and.returnValue(null);
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
