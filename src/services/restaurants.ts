import type {Restaurant} from '../types';

const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Spice Route Kitchen',
    cuisine: 'Indian',
    distanceKm: 1.4,
    etaMin: 18,
    averageRating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80&auto=format&fit=crop',
    foods: [
      {
        id: 'f1',
        name: 'Butter Chicken Bowl',
        actualPrice: 16.5,
        discountedPrice: 14.5,
        description: 'Creamy tomato gravy with basmati rice.',
        imageUrl:
          'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f2',
        name: 'Paneer Tikka Wrap',
        actualPrice: 12.75,
        discountedPrice: 11,
        description: 'Smoky paneer, mint chutney, and onions.',
        imageUrl:
          'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'r2',
    name: 'Green Fork Cafe',
    cuisine: 'Healthy',
    distanceKm: 2.1,
    etaMin: 22,
    averageRating: 4.3,
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80&auto=format&fit=crop',
    foods: [
      {
        id: 'f3',
        name: 'Quinoa Harvest Salad',
        actualPrice: 13.5,
        discountedPrice: 12,
        description: 'Seasonal greens, avocado, and citrus dressing.',
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f4',
        name: 'Protein Power Wrap',
        actualPrice: 15,
        discountedPrice: 13.25,
        description: 'Grilled chicken, hummus, and crisp vegetables.',
        imageUrl:
          'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'r3',
    name: 'Urban Slice',
    cuisine: 'Italian',
    distanceKm: 0.9,
    etaMin: 14,
    averageRating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&q=80&auto=format&fit=crop',
    foods: [
      {
        id: 'f5',
        name: 'Margherita Pizza',
        actualPrice: 17.25,
        discountedPrice: 15.5,
        description: 'Fresh mozzarella, basil, and tomato sauce.',
        imageUrl:
          'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f6',
        name: 'Pesto Pasta',
        actualPrice: 16,
        discountedPrice: 13.75,
        description: 'Basil pesto, parmesan, and roasted tomatoes.',
        imageUrl:
          'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
];

export async function fetchNearbyRestaurants(
  latitude: number,
  longitude: number,
  token: string,
): Promise<Restaurant[]> {
  void token;

  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 850);
  });

  const seed = Math.abs(Math.round(latitude * 1000 + longitude * 1000)) % 3;

  return [...RESTAURANTS].sort(
    (a, b) =>
      ((a.id.charCodeAt(1) + seed) % 3) - ((b.id.charCodeAt(1) + seed) % 3),
  );
}
