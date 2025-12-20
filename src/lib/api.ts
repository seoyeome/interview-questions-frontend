import { createLogger } from './logger';

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

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
class ApiClient {
  private baseUrl = '/api/v1';
  private logger = createLogger('API Client');

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const url = `${this.baseUrl}${normalizePath(endpoint)}`;
    this.logger.debug('요청 시작', { url, method: options.method || 'GET' });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      credentials: 'include',
    });

    this.logger.debug('응답 받음', { status: response.status });

    const responseText = await response.text();

    let data: any;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      this.logger.error('JSON 파싱 실패', { responseText, error: e });
      throw new Error('서버 응답을 파싱할 수 없습니다');
    }

    if (!response.ok) {
      this.logger.error('API 요청 실패', { status: response.status, message: data.message });
      throw new ApiError(response.status, data.message || 'API 요청에 실패했습니다', data);
    }

    this.logger.debug('요청 성공');
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
