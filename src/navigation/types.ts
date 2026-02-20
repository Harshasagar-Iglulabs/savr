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
};
