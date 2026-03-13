import {NativeModules, Platform} from 'react-native';

// Set this for physical-device testing if auto-detection cannot resolve your laptop IP.
const DEV_API_HOST_OVERRIDE = '172.16.3.71';
function normalizeHost(rawHost: string): string {
  const trimmed = rawHost.trim();
  if (!trimmed) {
    return '';
  }
  // Handles values like "192.168.1.12:8081" and "[::1]:8081".
  return trimmed.replace(/^\[?([^\]]+)\]?(?::\d+)?$/, '$1');
}

function getMetroHost(): string | null {
  const serverHost = NativeModules?.PlatformConstants?.ServerHost as
    | string
    | undefined;
  const normalizedServerHost = normalizeHost(serverHost ?? '');
  if (normalizedServerHost) {
    return normalizedServerHost;
  }

  const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) {
    return null;
  }

  const match = scriptURL.match(/^[^:]+:\/\/([^/:]+)(?::\d+)?/);
  const normalizedScriptHost = normalizeHost(match?.[1] ?? '');
  return normalizedScriptHost || null;
}

function resolveBaseUrl(): string {
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const overrideHost = normalizeHost(DEV_API_HOST_OVERRIDE);
  const host = __DEV__
    ? overrideHost || getMetroHost() || fallbackHost
    : fallbackHost;
  return `http://${host}:4000/api/v1`;
}

export const BASE_URL = resolveBaseUrl();

export const API_ENDPOINTS = {
  auth: {
    requestOtp: '/auth/request-otp',
    verifyOtp: '/auth/verify-otp',
    fcmToken: '/auth/fcm-token',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    updateName: '/users/profile',
    nearbyRestaurants: '/users/restaurants/nearby',
    restaurantMenu: (restaurantId: string) => `/users/restaurants/${restaurantId}/menu`,
    orders: '/users/orders',
    orderById: (orderId: string) => `/users/orders/${orderId}`,
    completeOrder: (orderId: string) => `/users/orders/${orderId}/complete`,
    rateOrder: (orderId: string) => `/users/orders/${orderId}/rating`,
    notifications: '/users/notifications',
    markAllNotificationsRead: '/users/notifications/mark-all-read',
    clearNotifications: '/users/notifications/clear',
  },
  restaurant: {
    dashboard: '/restaurant/dashboard',
    profile: '/restaurant/profile',
    menu: '/restaurant/menu',
    findMenuItemByName: '/restaurant/menu/find-by-name',
    upsertMenuItem: '/restaurant/menu/upsert',
    orders: '/restaurant/orders',
    completeOrder: (orderId: string) => `/restaurant/orders/${orderId}/complete`,
  },
  admin: {
    overview: '/admin/overview',
    users: '/admin/users',
    userStatus: (userId: string) => `/admin/users/${userId}/status`,
    restaurants: '/admin/restaurants',
    restaurantById: (restaurantId: string) => `/admin/restaurants/${restaurantId}`,
    restaurantStatus: (restaurantId: string) =>
      `/admin/restaurants/${restaurantId}/status`,
    orders: '/admin/orders',
  },
} as const;

export function toApiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
