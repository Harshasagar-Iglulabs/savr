import type {
  FoodItem,
  RestaurantMenuItemInput,
  RestaurantMetrics,
  RestaurantProfile,
} from '../types';
import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

type BackendFood = {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  imageUrl?: string | null;
  availableFrom?: number;
  quantity?: number;
};

function normalizeFood(item: BackendFood): FoodItem {
  return {
    id: item.id ?? item._id ?? '',
    name: item.name,
    description: item.description,
    actualPrice: item.actualPrice,
    discountedPrice: item.discountedPrice,
    imageUrl: item.imageUrl ?? undefined,
    availableFrom: item.availableFrom,
    quantity: item.quantity,
  };
}

type BackendRestaurantOrderItem = {
  foodId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

type BackendRestaurantOrder = {
  _id?: string;
  id?: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  status: 'placed' | 'completed';
  items: BackendRestaurantOrderItem[];
  totalAmount: number;
  orderedAtEpoch: number;
  completedAtEpoch?: number | null;
  rating?: number | null;
};

export type RestaurantPanelOrder = {
  id: string;
  customerName: string;
  status: 'placed' | 'completed';
  orderedAtEpoch: number;
  completedAtEpoch?: number;
  totalAmount: number;
  items: Array<{id: string; name: string; quantity: number}>;
};

function normalizeRestaurantOrder(order: BackendRestaurantOrder): RestaurantPanelOrder {
  return {
    id: order.id ?? order._id ?? '',
    // user profile endpoint is not currently used here; keep a neutral label.
    customerName: 'Customer',
    status: order.status,
    orderedAtEpoch: order.orderedAtEpoch,
    completedAtEpoch: order.completedAtEpoch ?? undefined,
    totalAmount: order.totalAmount,
    items: Array.isArray(order.items)
      ? order.items.map(entry => ({
          id: entry.foodId,
          name: entry.name,
          quantity: entry.quantity,
        }))
      : [],
  };
}

export async function fetchRestaurantProfile(
  token: string,
): Promise<RestaurantProfile> {
  return apiRequest<RestaurantProfile>(
    API_ENDPOINTS.restaurant.profile,
    {method: 'GET'},
    token,
  );
}

export async function saveRestaurantProfile(
  profile: RestaurantProfile,
  token: string,
): Promise<RestaurantProfile> {
  return apiRequest<RestaurantProfile>(
    API_ENDPOINTS.restaurant.profile,
    {
      method: 'PATCH',
      body: JSON.stringify(profile),
    },
    token,
  );
}

export async function fetchRestaurantMetrics(
  token: string,
): Promise<RestaurantMetrics> {
  const data = await apiRequest<{
    profile: RestaurantProfile;
    metrics: RestaurantMetrics;
    menu: BackendFood[];
  }>(API_ENDPOINTS.restaurant.dashboard, {method: 'GET'}, token);
  return data.metrics;
}

export async function fetchRestaurantMenu(token: string): Promise<FoodItem[]> {
  const data = await apiRequest<BackendFood[]>(
    API_ENDPOINTS.restaurant.menu,
    {method: 'GET'},
    token,
  );
  return Array.isArray(data) ? data.map(normalizeFood) : [];
}

export async function findMenuItemByName(
  name: string,
  token: string,
): Promise<FoodItem | null> {
  const query = new URLSearchParams({name: name.trim()});
  const data = await apiRequest<BackendFood[]>(
    `${API_ENDPOINTS.restaurant.findMenuItemByName}?${query.toString()}`,
    {method: 'GET'},
    token,
  );

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const exact = data.find(
    item => item.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return normalizeFood(exact ?? data[0]);
}

export async function upsertRestaurantMenuItem(
  payload: RestaurantMenuItemInput,
  token: string,
): Promise<{item: FoodItem; wasExisting: boolean}> {
  const data = await apiRequest<{item: BackendFood; wasExisting: boolean}>(
    API_ENDPOINTS.restaurant.upsertMenuItem,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );

  return {
    item: normalizeFood(data.item),
    wasExisting: data.wasExisting,
  };
}

export async function fetchRestaurantOrders(
  token: string,
  status?: 'placed' | 'completed',
): Promise<RestaurantPanelOrder[]> {
  const query = new URLSearchParams();
  if (status) {
    query.set('status', status);
  }
  const endpoint = query.toString()
    ? `${API_ENDPOINTS.restaurant.orders}?${query.toString()}`
    : API_ENDPOINTS.restaurant.orders;

  const data = await apiRequest<BackendRestaurantOrder[]>(
    endpoint,
    {method: 'GET'},
    token,
  );

  return Array.isArray(data)
    ? data.map(normalizeRestaurantOrder).filter(order => order.id)
    : [];
}

export async function completeRestaurantOrder(
  orderId: string,
  token: string,
): Promise<RestaurantPanelOrder> {
  const data = await apiRequest<BackendRestaurantOrder>(
    API_ENDPOINTS.restaurant.completeOrder(orderId),
    {method: 'PATCH'},
    token,
  );
  return normalizeRestaurantOrder(data);
}
