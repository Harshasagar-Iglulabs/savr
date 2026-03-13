import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

export type AdminCreateRestaurantInput = {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cuisine: string;
  openTimeEpoch: number;
  closeTimeEpoch: number;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  loginPhone?: string;
};

export type AdminUpdateRestaurantInput = Partial<
  Omit<AdminCreateRestaurantInput, 'loginPhone'>
>;

export type AdminRestaurant = {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cuisine: string;
  openTimeEpoch: number;
  closeTimeEpoch: number;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  status?: string;
};

export type AdminRestaurantsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminRestaurantsListResponse = {
  items: AdminRestaurant[];
  pagination: AdminRestaurantsPagination;
};

type RestaurantRaw = Record<string, unknown>;

function normalizeRestaurant(entry: RestaurantRaw): AdminRestaurant {
  const location =
    entry.location && typeof entry.location === 'object'
      ? (entry.location as Record<string, unknown>)
      : {};

  return {
    id:
      (typeof entry.id === 'string' && entry.id) ||
      (typeof entry._id === 'string' && entry._id) ||
      '',
    storeName:
      (typeof entry.storeName === 'string' && entry.storeName) ||
      (typeof entry.name === 'string' && entry.name) ||
      'Restaurant',
    ownerName: (typeof entry.ownerName === 'string' && entry.ownerName) || '',
    phone: (typeof entry.phone === 'string' && entry.phone) || '',
    email: (typeof entry.email === 'string' && entry.email) || '',
    address: (typeof entry.address === 'string' && entry.address) || '',
    cuisine: (typeof entry.cuisine === 'string' && entry.cuisine) || '',
    openTimeEpoch: Number(entry.openTimeEpoch ?? entry.openTime ?? 0),
    closeTimeEpoch: Number(entry.closeTimeEpoch ?? entry.closeTime ?? 0),
    latitude: Number(
      entry.latitude ?? entry.lat ?? location.latitude ?? location.lat ?? 0,
    ),
    longitude: Number(
      entry.longitude ?? entry.lng ?? location.longitude ?? location.lng ?? 0,
    ),
    imageUrl:
      typeof entry.imageUrl === 'string'
        ? entry.imageUrl
        : entry.imageUrl === null
        ? null
        : undefined,
    status: typeof entry.status === 'string' ? entry.status : undefined,
  };
}

function sanitizeUpdatePayload(
  payload: AdminUpdateRestaurantInput,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  const fields: Array<keyof AdminUpdateRestaurantInput> = [
    'storeName',
    'ownerName',
    'phone',
    'email',
    'address',
    'cuisine',
    'openTimeEpoch',
    'closeTimeEpoch',
    'latitude',
    'longitude',
    'imageUrl',
  ];

  for (const field of fields) {
    const value = payload[field];
    if (value !== undefined) {
      output[field] = value;
    }
  }

  return output;
}

export async function createRestaurantByAdmin(
  payload: AdminCreateRestaurantInput,
  token: string,
): Promise<{
  restaurant?: Record<string, unknown>;
  restaurantUser?: {
    id: string;
    phone: string;
    role: 'restaurant';
    restaurantId: string;
  };
}> {
  return apiRequest(API_ENDPOINTS.admin.restaurants, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export async function fetchRestaurantsByAdmin(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  },
): Promise<AdminRestaurantsListResponse> {
  const query = new URLSearchParams();
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 20));
  if (params?.search?.trim()) {
    query.set('search', params.search.trim());
  }

  const data = await apiRequest<{
    items?: unknown[];
    pagination?: Partial<AdminRestaurantsPagination>;
  }>(
    `${API_ENDPOINTS.admin.restaurants}?${query.toString()}`,
    {method: 'GET'},
    token,
  );

  const items = Array.isArray(data?.items)
    ? data.items
        .filter(entry => entry && typeof entry === 'object')
        .map(entry => normalizeRestaurant(entry as RestaurantRaw))
        .filter(entry => entry.id)
    : [];

  return {
    items,
    pagination: {
      page: Number(data?.pagination?.page ?? params?.page ?? 1),
      limit: Number(data?.pagination?.limit ?? params?.limit ?? 20),
      total: Number(data?.pagination?.total ?? items.length),
      totalPages: Number(data?.pagination?.totalPages ?? 1),
    },
  };
}

export async function updateRestaurantByAdmin(
  restaurantId: string,
  payload: AdminUpdateRestaurantInput,
  token: string,
): Promise<AdminRestaurant> {
  const data = await apiRequest<Record<string, unknown>>(
    API_ENDPOINTS.admin.restaurantById(restaurantId),
    {
      method: 'PATCH',
      body: JSON.stringify(sanitizeUpdatePayload(payload)),
    },
    token,
  );

  return normalizeRestaurant(data);
}

export async function deleteRestaurantByAdmin(
  restaurantId: string,
  token: string,
): Promise<{id: string}> {
  return apiRequest<{id: string}>(
    API_ENDPOINTS.admin.restaurantById(restaurantId),
    {method: 'DELETE'},
    token,
  );
}
