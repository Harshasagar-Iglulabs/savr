export type UserRole = 'user' | 'restaurant';

export type AuthSession = {
  token: string;
  role: UserRole;
  phone: string;
  otp: string;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
};

export type LocationState = {
  granted: boolean;
  latitude: number;
  longitude: number;
};

export type FoodItem = {
  id: string;
  name: string;
  actualPrice: number;
  discountedPrice: number;
  description: string;
  imageUrl?: string;
  availableFrom?: number;
  quantity?: number;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  distanceKm: number;
  etaMin: number;
  averageRating: number;
  imageUrl?: string;
  foods: FoodItem[];
};

export type CartItem = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  foodId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type UserOrderStatus = 'placed' | 'preparing' | 'completed';

export type UserOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  status: UserOrderStatus;
  items: CartItem[];
  totalAmount: number;
  orderedAtEpoch: number;
  completedAtEpoch?: number;
  rating?: number;
};

export type UserSearchFilters = {
  maxDistanceKm: number;
  pickupWindowMin: number;
};

export type RestaurantProfile = {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cuisine: string;
  openTimeEpoch: number;
  closeTimeEpoch: number;
};

export type RevenueChannel = {
  label: string;
  amount: number;
  percentage: number;
};

export type OrderStatus = {
  pending: number;
  preparing: number;
  completed: number;
  cancelled: number;
};

export type RestaurantMetrics = {
  todayEarnings: number;
  totalRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  orderStatus: OrderStatus;
  revenueChannels: RevenueChannel[];
};

export type RestaurantMenuItemInput = {
  imageUrl: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  availableFrom: number;
  quantity: number;
};
