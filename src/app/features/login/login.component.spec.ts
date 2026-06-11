import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;

  const mockAuth = {
    login: jasmine.createSpy('login')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    mockAuth.login.calls.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('invalid form does not call auth service', () => {
    component.form.setValue({ email: '', password: '' });
    component.submit();
    expect(mockAuth.login).not.toHaveBeenCalled();
  });

  it('shows credential error on 401', fakeAsync(() => {
    mockAuth.login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );
    component.form.setValue({ email: 'a@b.com', password: 'password123' });
    component.submit();
    tick();
    expect(component.error).toBe('Credenciales inválidas.');
  }));

  it('shows server error on non-401 error', fakeAsync(() => {
    mockAuth.login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    component.form.setValue({ email: 'a@b.com', password: 'password123' });
    component.submit();
    tick();
    expect(component.error).toBe('Error al conectar con el servidor.');
  }));

  it('navigates to /orders on successful login', fakeAsync(() => {
    mockAuth.login.and.returnValue(of({ token: 'mock-token' }));
    spyOn(router, 'navigate');
    component.form.setValue({ email: 'a@b.com', password: 'password123' });
    component.submit();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  }));
});
