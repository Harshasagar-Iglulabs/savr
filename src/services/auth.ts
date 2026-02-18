import type {AuthSession, UserRole} from '../types';

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

export async function requestOtp(
  phone: string,
  token: string,
): Promise<AuthSession> {
  const otp = '123456';

  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 700);
  });

  return {
    token,
    role: 'user',
    phone,
    otp,
  };
}

export async function autoFillOtp(): Promise<string> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 900);
  });
  return '123456';
}

export async function confirmOtpWithBackend(
  token: string,
  phone: string,
  inputOtp: string,
  expectedOtp: string,
): Promise<{isValid: boolean; role: UserRole}> {
  void phone;

  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 400);
  });

  const isValid = inputOtp.trim() === expectedOtp;
  if (!isValid) {
    return {isValid: false, role: 'user'};
  }

  // Simulates backend returning role after OTP confirmation.
  const role = getRoleFromToken(token) ?? 'user';
  return {isValid: true, role};
}
