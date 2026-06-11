import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let router: Router;

  const mockAuth = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
    getToken: jasmine.createSpy('getToken').and.returnValue(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuth }
      ]
    });
    router = TestBed.inject(Router);
    mockAuth.isAuthenticated.calls.reset();
    mockAuth.isAdmin.calls.reset();
  });

  it('returns true when authenticated and Admin', () => {
    mockAuth.isAuthenticated.and.returnValue(true);
    mockAuth.isAdmin.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('redirects to /orders when authenticated but not Admin', () => {
    mockAuth.isAuthenticated.and.returnValue(true);
    mockAuth.isAdmin.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toEqual(router.createUrlTree(['/orders']));
  });

  it('redirects to /login when not authenticated', () => {
    mockAuth.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
