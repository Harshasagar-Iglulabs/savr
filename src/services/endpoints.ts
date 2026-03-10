export const BASE_URL = 'http://localhost:4000/api/v1';

export const API_ENDPOINTS = {
  auth: {
    requestOtp: '/auth/request-otp',
    verifyOtp: '/auth/verify-otp',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
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
    restaurantStatus: (restaurantId: string) =>
      `/admin/restaurants/${restaurantId}/status`,
    orders: '/admin/orders',
  },
} as const;

export function toApiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
