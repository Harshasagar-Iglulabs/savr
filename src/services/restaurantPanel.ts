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
  imageUrl?: string;
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
    imageUrl: item.imageUrl,
    availableFrom: item.availableFrom,
    quantity: item.quantity,
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
