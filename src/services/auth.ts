import type {AuthSession, UserRole} from '../types';
import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const atobFn = (globalThis as {atob?: (data: string) => string}).atob;
  if (typeof atobFn !== 'function') {
    throw new Error('Base64 decoding unavailable');
  }
  return atobFn(padded);
}

function getRoleFromToken(token: string): UserRole {
  if (!token) {
    return 'user';
  }

  const tokenLower = token.toLowerCase();
  if (tokenLower.includes('restaurant')) {
    return 'restaurant';
  }
  if (tokenLower.includes('user')) {
    return 'user';
  }

  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(decodeBase64Url(parts[1])) as {
        role?: string;
        type?: string;
      };
      const roleValue = (payload.role ?? payload.type ?? '').toLowerCase();
      if (roleValue === 'restaurant') {
        return 'restaurant';
      }
    } catch {
      return 'user';
    }
  }

  return 'user';
}

let latestDevOtp = '';

export async function requestOtp(
  phone: string,
  token: string,
): Promise<AuthSession> {
  const role = getRoleFromToken(token);
  const payload = await apiRequest<{
    requestId: string;
    otpExpiresAtEpoch: number;
    devOtp?: string;
  }>(API_ENDPOINTS.auth.requestOtp, {
    method: 'POST',
    body: JSON.stringify({phone, role}),
  });

  latestDevOtp = payload.devOtp ?? '';

  return {
    token: '',
    role,
    phone,
    otp: latestDevOtp,
    requestId: payload.requestId,
  };
}

export async function autoFillOtp(): Promise<string> {
  return latestDevOtp;
}

export async function confirmOtpWithBackend(
  role: UserRole,
  phone: string,
  inputOtp: string,
  requestId: string,
): Promise<{isValid: boolean; role: UserRole; token: string}> {
  if (!phone.trim()) {
    return {isValid: false, role: 'user', token: ''};
  }
  const data = await apiRequest<{
    token: string;
    role: UserRole;
    phone: string;
    user: {
      id: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      restaurantId: string | null;
    };
  }>(API_ENDPOINTS.auth.verifyOtp, {
    method: 'POST',
    body: JSON.stringify({
      phone,
      role,
      requestId,
      otp: inputOtp.trim(),
    }),
  });

  return {isValid: true, role: data.role, token: data.token};
}
