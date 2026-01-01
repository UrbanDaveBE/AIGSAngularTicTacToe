export interface AuthRequest {
  userName: string;
  password: string;
}


export interface AuthResponse {
  userName?: string;
  token?: string;
  userExpiry?: string;
  error?: string;
  error_description?: string;
}
