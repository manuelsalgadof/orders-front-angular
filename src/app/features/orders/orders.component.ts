import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../../core/services/order.service';
import { OrderListItem } from '../../core/models/order.models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  orders: OrderListItem[] = [];
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

  form = this.fb.group({
    customerId: [null as number | null, [Validators.required, Validators.min(1)]],
    externalReference: ['', [Validators.required, Validators.maxLength(100)]],
    items: this.fb.array([this.newItem()])
  });

  get itemsArray(): FormArray { return this.form.controls.items; }

  newItem() {
    return this.fb.group({
      product: ['', [Validators.required, Validators.maxLength(150)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [null as number | null, [Validators.required, Validators.min(0.01)]]
    });
  }

  addItem(): void { this.itemsArray.push(this.newItem()); }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) this.itemsArray.removeAt(index);
  }

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.loading = true;
    this.loadError = null;
    this.orderService.getPaged(page, this.pageSize).subscribe({
      next: (res) => {
        this.orders = res.items;
        this.totalPages = res.totalPages;
        this.totalRecords = res.totalRecords;
        this.currentPage = res.page;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Error al cargar pedidos.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.createLoading = true;
    this.createError = null;
    const value = this.form.getRawValue();
    this.orderService.create({
      customerId: value.customerId!,
      externalReference: value.externalReference!,
      items: value.items.map(i => ({
        product: i.product!,
        quantity: i.quantity!,
        price: i.price!
      }))
    }).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccess = true;
        this.showCreateForm = false;
        this.resetForm();
        this.loadPage(1);
        setTimeout(() => (this.createSuccess = false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.createLoading = false;
        this.createError =
          err.status === 409 ? 'ExternalReference ya existe.' :
          err.status === 400 ? (err.error?.message ?? 'Datos inválidos.') :
          'Error al crear pedido.';
      }
    });
  }

  private resetForm(): void {
    this.form.reset({ customerId: null, externalReference: '' });
    this.itemsArray.clear();
    this.itemsArray.push(this.newItem());
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
