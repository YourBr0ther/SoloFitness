import { ApiError } from '@/types/errors';
import { ApiResponse } from '@/types/api';

export abstract class ApiService {
  protected baseUrl: string;
  private authToken: string | null = null;
  private requestTimeout = 10000; // 10 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load auth token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code || errorCode;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 401) {
        this.setAuthToken(null);
        errorCode = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        errorCode = 'FORBIDDEN';
      } else if (response.status === 404) {
        errorCode = 'NOT_FOUND';
      } else if (response.status === 429) {
        errorCode = 'RATE_LIMITED';
      }

      throw new ApiError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw error;
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount < this.maxRetries && 
          error instanceof ApiError && 
          (error.status === 429 || error.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }
} 