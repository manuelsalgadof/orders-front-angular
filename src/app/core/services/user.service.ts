import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, UserListItem, UserResponse } from '../models/user.models';
import { PagedResult } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/api/Users`;

  constructor(private http: HttpClient) {}

  create(body: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.base, body);
  }

  getPaged(page: number, pageSize: number): Observable<PagedResult<UserListItem>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<UserListItem>>(this.base, { params });
  }

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.base}/${id}`);
  }

  update(id: number, body: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
