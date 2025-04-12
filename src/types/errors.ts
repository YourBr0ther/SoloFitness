export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface NetworkError {
  message: string;
  status: number;
}

export interface AuthError {
  code: string;
  message: string;
  status: number;
} 