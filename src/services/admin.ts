import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

export type AdminCreateRestaurantInput = {
  storeName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  openTimeEpoch: number;
  closeTimeEpoch: number;
};

export async function createRestaurantByAdmin(
  payload: AdminCreateRestaurantInput,
  token: string,
): Promise<{id?: string; _id?: string}> {
  return apiRequest<{id?: string; _id?: string}>(
    API_ENDPOINTS.admin.restaurants,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}
