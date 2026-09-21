const BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('cardia_x_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {}

    if (response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('cardia_x_token');
      localStorage.removeItem('cardia_x_user');
    }

    throw new ApiError(errorMsg, response.status, errorData);
  }

  return response.json();
}

