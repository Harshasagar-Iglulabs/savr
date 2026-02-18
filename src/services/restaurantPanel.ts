import type {
  RestaurantMenuItemInput,
  RestaurantMetrics,
  RestaurantProfile,
  FoodItem,
} from '../types';

let profileDb: RestaurantProfile = {
  storeName: 'Savr Signature Kitchen',
  ownerName: 'Aarav Sharma',
  phone: '+91 98765 43210',
  email: 'owner@savr.com',
  address: '12 Green Street, Bengaluru',
  cuisine: 'Multi Cuisine',
  openTimeEpoch: 1739322000000,
  closeTimeEpoch: 1739372400000,
};

let menuDb: FoodItem[] = [
  {
    id: 'm1',
    name: 'Pesto Pasta',
    description: 'Basil pesto, parmesan, and roasted tomatoes.',
    actualPrice: 320,
    discountedPrice: 275,
    imageUrl:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop',
    availableFrom: 1739329200000,
    quantity: 25,
  },
  {
    id: 'm2',
    name: 'Paneer Tikka Wrap',
    description: 'Smoky paneer, mint chutney, and onions.',
    actualPrice: 240,
    discountedPrice: 210,
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop',
    availableFrom: 1739332800000,
    quantity: 40,
  },
];

const metricsDb: RestaurantMetrics = {
  todayEarnings: 18650,
  totalRevenue: 892000,
  weeklyRevenue: 120450,
  monthlyRevenue: 402300,
  averageOrderValue: 412,
  ordersToday: 46,
  orderStatus: {
    pending: 8,
    preparing: 5,
    completed: 31,
    cancelled: 2,
  },
  revenueChannels: [
    {label: 'Dine In', amount: 6200, percentage: 33},
    {label: 'Delivery', amount: 9300, percentage: 50},
    {label: 'Takeaway', amount: 3150, percentage: 17},
  ],
};

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export async function fetchRestaurantProfile(): Promise<RestaurantProfile> {
  await wait(320);
  return {...profileDb};
}

export async function saveRestaurantProfile(
  profile: RestaurantProfile,
): Promise<RestaurantProfile> {
  await wait(450);
  profileDb = {...profile};
  return {...profileDb};
}

export async function fetchRestaurantMetrics(): Promise<RestaurantMetrics> {
  await wait(300);
  return {...metricsDb};
}

export async function fetchRestaurantMenu(): Promise<FoodItem[]> {
  await wait(300);
  return [...menuDb];
}

export async function findMenuItemByName(name: string): Promise<FoodItem | null> {
  await wait(280);
  const found = menuDb.find(item => item.name.toLowerCase() === name.trim().toLowerCase());
  return found ? {...found} : null;
}

export async function upsertRestaurantMenuItem(
  payload: RestaurantMenuItemInput,
): Promise<{item: FoodItem; wasExisting: boolean}> {
  await wait(450);

  const matchIndex = menuDb.findIndex(
    item => item.name.toLowerCase() === payload.name.trim().toLowerCase(),
  );

  const normalized: FoodItem = {
    id: matchIndex >= 0 ? menuDb[matchIndex].id : `m${menuDb.length + 1}`,
    name: payload.name.trim(),
    description: payload.description.trim(),
    actualPrice: payload.actualPrice,
    discountedPrice: payload.discountedPrice,
    imageUrl: payload.imageUrl.trim(),
    availableFrom: payload.availableFrom,
    quantity: payload.quantity,
  };

  if (matchIndex >= 0) {
    menuDb[matchIndex] = normalized;
    return {item: normalized, wasExisting: true};
  }

  menuDb = [normalized, ...menuDb];
  return {item: normalized, wasExisting: false};
}
