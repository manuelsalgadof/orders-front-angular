export interface CreateOrderItemRequest {
  product: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  customerId: number;
  externalReference: string;
  items: CreateOrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  customerId: number;
  externalReference: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface OrderListItem {
  id: number;
  customerId: number;
  customerName: string;
  externalReference: string;
  total: number;
  status: string;
  createdAt: string;
}

