export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface DecodedToken {
  nameid: string;
  unique_name: string;
  role: string;
  exp: number;
  nbf: number;
  iss: string;
  aud: string;
}
