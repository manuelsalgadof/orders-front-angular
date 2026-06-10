import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderRequest, OrderResponse, OrderListItem, PagedResult } from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/api/Orders`;

  constructor(private http: HttpClient) {}

  create(body: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.base, body);
  }

  getPaged(page: number, pageSize: number): Observable<PagedResult<OrderListItem>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<OrderListItem>>(this.base, { params });
  }
}
