import type {FoodItem, Restaurant} from '../types';
import {API_ENDPOINTS} from './endpoints';
import {apiRequest} from './http';

type BackendFood = {
  id?: string;
  _id?: string;
  name: string;
  actualPrice: number;
  discountedPrice: number;
  description: string;
  imageUrl?: string;
  availableFrom?: number;
  quantity?: number;
};

type BackendRestaurant = {
  id?: string;
  _id?: string;
  name: string;
  cuisine: string;
  distanceKm: number;
  averageRating: number;
  imageUrl?: string;
  foods: BackendFood[];
};

function normalizeFood(food: BackendFood): FoodItem {
  return {
    id: food.id ?? food._id ?? '',
    name: food.name,
    actualPrice: food.actualPrice,
    discountedPrice: food.discountedPrice,
    description: food.description,
    imageUrl: food.imageUrl,
    availableFrom: food.availableFrom,
    quantity: food.quantity,
  };
}

function normalizeRestaurant(restaurant: BackendRestaurant): Restaurant {
  return {
    id: restaurant.id ?? restaurant._id ?? '',
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    distanceKm: restaurant.distanceKm,
    averageRating: restaurant.averageRating,
    imageUrl: restaurant.imageUrl,
    foods: Array.isArray(restaurant.foods)
      ? restaurant.foods.map(normalizeFood)
      : [],
  };
}

export async function fetchNearbyRestaurants(
  latitude: number,
  longitude: number,
  token: string,
): Promise<Restaurant[]> {
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    maxDistanceKm: '20',
  });

  const data = await apiRequest<BackendRestaurant[]>(
    `${API_ENDPOINTS.users.nearbyRestaurants}?${query.toString()}`,
    {method: 'GET'},
    token,
  );

  return Array.isArray(data) ? data.map(normalizeRestaurant) : [];
}
