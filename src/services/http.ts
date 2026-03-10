import {toApiUrl} from './endpoints';

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown[];
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function isApiFailure<T>(payload: ApiResponse<T>): payload is ApiFailure {
  return payload.success === false;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token?.trim()) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(toApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error('Invalid server response.');
  }

  if (!response.ok || !payload || isApiFailure(payload)) {
    const message =
      payload && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'Request failed.';
    throw new Error(message);
  }

  return payload.data;
}
