import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { UserListItem } from '../../core/models/user.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: UserListItem[] = [];
  totalPages = 0;
  totalRecords = 0;
  currentPage = 1;
  readonly pageSize = 10;
  loading = false;
  loadError: string | null = null;

  showCreateForm = false;
  createLoading = false;
  createError: string | null = null;
  createSuccess = false;

  deletingId: number | null = null;
  deleteError: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
  });

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.loading = true;
    this.loadError = null;
    this.userService.getPaged(page, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.items;
        this.totalPages = res.totalPages;
        this.totalRecords = res.totalRecords;
        this.currentPage = res.page;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loadError = err.status === 403
          ? 'Acceso denegado. Se requiere rol Admin.'
          : 'Error al cargar usuarios.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.createLoading = true;
    this.createError = null;
    const value = this.form.getRawValue();
    this.userService.create({
      name: value.name!,
      email: value.email!,
      password: value.password!
    }).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccess = true;
        this.showCreateForm = false;
        this.form.reset();
        this.loadPage(1);
        setTimeout(() => (this.createSuccess = false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.createLoading = false;
        this.createError =
          err.status === 409 ? 'Email ya registrado.' :
          err.status === 400 ? (err.error?.message ?? 'Datos inválidos.') :
          'Error al crear usuario.';
      }
    });
  }

  confirmDelete(user: UserListItem): void {
    if (!confirm(`¿Eliminar usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
    this.deletingId = user.id;
    this.deleteError = null;
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadPage(this.currentPage);
      },
      error: (err: HttpErrorResponse) => {
        this.deletingId = null;
        this.deleteError =
          err.status === 409 ? (err.error?.message ?? 'No se puede eliminar este usuario.') :
          err.status === 404 ? 'Usuario no encontrado.' :
          'Error al eliminar usuario.';
      }
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
