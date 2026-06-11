import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersComponent } from './users.component';
import { UserService } from '../../core/services/user.service';
import { UserListItem } from '../../core/models/user.models';

const emptyPaged = { page: 1, pageSize: 10, totalRecords: 0, totalPages: 0, items: [] };

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;

  const mockUserService = {
    getPaged: jasmine.createSpy('getPaged').and.returnValue(of(emptyPaged)),
    create: jasmine.createSpy('create'),
    delete: jasmine.createSpy('delete')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    mockUserService.getPaged.calls.reset();
    mockUserService.getPaged.and.returnValue(of(emptyPaged));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows access denied on 403', () => {
    mockUserService.getPaged.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403 }))
    );
    component.loadPage(1);
    expect(component.loadError).toBe('Acceso denegado. Se requiere rol Admin.');
  });

  it('shows controlled message on delete 409', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const user: UserListItem = { id: 1, name: 'Test', email: 'test@test.com', role: 'Admin', status: 'Active', createdAt: '' };
    mockUserService.delete.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 409,
        error: { message: 'No se puede eliminar este usuario.' }
      }))
    );
    component.confirmDelete(user);
    expect(component.deleteError).toContain('No se puede eliminar este usuario.');
  });
});
