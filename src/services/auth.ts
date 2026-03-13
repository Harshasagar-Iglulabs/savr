import type {AuthSession, UserRole} from '../types';
import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';
import {getCurrentFcmToken, subscribeToFcmTokenRefresh} from './pushNotifications';

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
  if (tokenLower.includes('admin')) {
    return 'admin';
  }
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
      if (roleValue === 'admin') {
        return 'admin';
      }
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
    userExists?: boolean;
    shouldUpdateProfile?: boolean;
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
    userExists: payload.userExists,
    shouldUpdateProfile: payload.shouldUpdateProfile,
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
): Promise<{
  isValid: boolean;
  role: UserRole;
  token: string;
  isExistingUser: boolean;
  shouldUpdateProfile: boolean;
}> {
  if (!phone.trim()) {
    return {
      isValid: false,
      role: 'user',
      token: '',
      isExistingUser: false,
      shouldUpdateProfile: false,
    };
  }
  const fcmToken = await getCurrentFcmToken();
  const data = await apiRequest<{
    token: string;
    role?: UserRole;
    phone: string;
    isExistingUser?: boolean;
    shouldUpdateProfile?: boolean;
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
      ...(fcmToken ? {fcmToken} : {}),
    }),
  });

  if (fcmToken && data.token) {
    await sendFcmTokenToBackend(data.token, fcmToken).catch(() => {
      // Login should not fail if FCM sync fails.
    });
  }

  const resolvedRole =
    data.role === 'restaurant' || data.role === 'user' || data.role === 'admin'
      ? data.role
      : data.user?.role === 'restaurant' ||
        data.user?.role === 'user' ||
        data.user?.role === 'admin'
      ? data.user.role
      : role;

  return {
    isValid: true,
    role: resolvedRole,
    token: data.token,
    isExistingUser: data.isExistingUser ?? false,
    shouldUpdateProfile: data.shouldUpdateProfile ?? false,
  };
}

async function sendFcmTokenToBackend(
  authToken: string,
  fcmToken: string,
): Promise<void> {
  if (!authToken.trim() || !fcmToken.trim()) {
    return;
  }

  await apiRequest<Record<string, never>>(
    API_ENDPOINTS.auth.fcmToken,
    {
      method: 'POST',
      body: JSON.stringify({fcmToken}),
    },
    authToken,
  );
}

export async function syncCurrentDeviceFcmToken(authToken: string): Promise<void> {
  if (!authToken.trim()) {
    return;
  }
  const fcmToken = await getCurrentFcmToken();
  if (!fcmToken) {
    return;
  }

  await sendFcmTokenToBackend(authToken, fcmToken);
}

export function subscribeAuthFcmTokenSync(
  getAuthToken: () => string,
): () => void {
  return subscribeToFcmTokenRefresh(nextFcmToken => {
    const authToken = getAuthToken().trim();
    if (!authToken || !nextFcmToken.trim()) {
      return;
    }

    void sendFcmTokenToBackend(authToken, nextFcmToken);
  });
}
