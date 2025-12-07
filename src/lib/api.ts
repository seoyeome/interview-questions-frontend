const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const getBackendUrl = () => DEFAULT_BACKEND_URL;

export const buildApiUrl = (path: string) => {
  return `${DEFAULT_BACKEND_URL}${normalizePath(path)}`;
};

// API 응답 타입
interface ApiResponse<T = unknown> {
  data?: T;
  token?: string;
  message?: string;
  [key: string]: unknown;
}

// API Client
class ApiClient {
  private baseUrl = '/api/v1';

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${normalizePath(endpoint)}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      credentials: 'include', // 쿠키 전송을 위해 필요
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API 요청에 실패했습니다');
    }

    return data;
  }

  async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
