export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: string;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}
