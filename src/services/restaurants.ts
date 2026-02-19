import type {Restaurant} from '../types';

const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Spice Route Kitchen',
    cuisine: 'Indian',
    distanceKm: 1.4,
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
      {
        id: 'f7',
        name: 'Chicken Kathi Roll',
        actualPrice: 14.25,
        discountedPrice: 12.4,
        description: 'Spiced chicken, onion salad, and mint mayo.',
        imageUrl:
          'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f8',
        name: 'Dal Makhani Combo',
        actualPrice: 13.1,
        discountedPrice: 11.85,
        description: 'Creamy black lentils with jeera rice and salad.',
        imageUrl:
          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f9',
        name: 'Masala Lemon Soda',
        actualPrice: 3.5,
        discountedPrice: 2.9,
        description: 'Refreshing lemon soda with roasted spice salt.',
        imageUrl:
          'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'r2',
    name: 'Green Fork Cafe',
    cuisine: 'Healthy',
    distanceKm: 2.1,
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
      {
        id: 'f10',
        name: 'Greek Yogurt Bowl',
        actualPrice: 10.5,
        discountedPrice: 9.25,
        description: 'Greek yogurt with berries, chia, and granola.',
        imageUrl:
          'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f11',
        name: 'Avocado Toast Duo',
        actualPrice: 11.9,
        discountedPrice: 10.4,
        description: 'Sourdough toast topped with smashed avocado.',
        imageUrl:
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f12',
        name: 'Cold Brew Latte',
        actualPrice: 5.75,
        discountedPrice: 4.95,
        description: 'Smooth cold brew with creamy milk foam.',
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'r3',
    name: 'Urban Slice',
    cuisine: 'Italian',
    distanceKm: 0.9,
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
      {
        id: 'f13',
        name: 'Farmhouse Pizza',
        actualPrice: 18.5,
        discountedPrice: 16.2,
        description: 'Loaded with bell pepper, olives, and sweet corn.',
        imageUrl:
          'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f14',
        name: 'Garlic Breadsticks',
        actualPrice: 8.25,
        discountedPrice: 6.9,
        description: 'Toasted breadsticks with garlic herb butter.',
        imageUrl:
          'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=900&q=80&auto=format&fit=crop',
      },
      {
        id: 'f15',
        name: 'Tiramisu Cup',
        actualPrice: 7.5,
        discountedPrice: 6.35,
        description: 'Classic coffee-soaked layered mascarpone dessert.',
        imageUrl:
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80&auto=format&fit=crop',
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
