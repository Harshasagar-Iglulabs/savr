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

const REDACTED = '***';

function sanitizeHeaders(headers: Headers): Record<string, string> {
  const output: Record<string, string> = {};
  headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (
      normalized === 'authorization' ||
      normalized === 'cookie' ||
      normalized === 'set-cookie'
    ) {
      output[key] = REDACTED;
      return;
    }
    output[key] = value;
  });
  return output;
}

function parseBodyForLog(body: RequestInit['body']): unknown {
  if (body == null) {
    return null;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return '[FormData]';
  }
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return body.toString();
  }
  return '[Body omitted]';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const requestUrl = toApiUrl(path);
  const requestMethod = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token?.trim()) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const requestStartedAt = Date.now();

  console.log(`[API][Request] ${requestMethod} ${requestUrl}`, {
    headers: sanitizeHeaders(headers),
    body: parseBodyForLog(options.body),
  });

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    console.log(`[API][NetworkError] ${requestMethod} ${requestUrl}`, {
      durationMs: Date.now() - requestStartedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const durationMs = Date.now() - requestStartedAt;
  let payload: ApiResponse<T> | null = null;
  const rawResponse = await response.text();
  try {
    payload = JSON.parse(rawResponse) as ApiResponse<T>;
  } catch {
    console.log(`[API][ResponseParseError] ${requestMethod} ${requestUrl}`, {
      status: response.status,
      ok: response.ok,
      durationMs,
      body: rawResponse,
    });
    throw new Error('Invalid server response.');
  }

  console.log(`[API][Response] ${requestMethod} ${requestUrl}`, {
    status: response.status,
    ok: response.ok,
    durationMs,
    body: payload,
  });

  if (!response.ok || !payload || isApiFailure(payload)) {
    const message =
      payload && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'Request failed.';
    throw new Error(message);
  }

  return payload.data;
}
