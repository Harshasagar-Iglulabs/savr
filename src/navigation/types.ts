export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: undefined;
  Profile: undefined;
  Restaurants:
    | {
        tab?: 'explore' | 'orders';
        openLocationPicker?: boolean;
      }
    | undefined;
  Notifications: undefined;
  Foods: {restaurantId: string};
  Cart: undefined;
  RestaurantHome: undefined;
  RestaurantDashboard: undefined;
  RestaurantProfile: undefined;
  RestaurantAddFood: undefined;
  RestaurantMenu: undefined;
  AdminRestaurants: undefined;
  AdminAddRestaurant: undefined;
  AdminEditRestaurant: {
    restaurant: {
      id: string;
      storeName: string;
      ownerName: string;
      phone: string;
      email: string;
      address: string;
      cuisine: string;
      latitude: number;
      longitude: number;
      openTimeEpoch: number;
      closeTimeEpoch: number;
      imageUrl?: string | null;
      status?: string;
    };
  };
};
