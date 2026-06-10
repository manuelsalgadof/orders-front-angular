import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { OrdersComponent } from './features/orders/orders.component';
import { JobsComponent } from './features/jobs/jobs.component';
import { UsersComponent } from './features/users/users.component';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'orders' }
];
