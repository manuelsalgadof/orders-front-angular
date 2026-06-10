import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  loading = false;
  error: string | null = null;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.status === 401
          ? 'Credenciales inválidas.'
          : 'Error al conectar con el servidor.';
      }
    });
  }
}
