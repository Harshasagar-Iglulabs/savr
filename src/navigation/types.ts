export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: undefined;
  Profile: undefined;
  Restaurants: {tab?: 'explore' | 'orders'} | undefined;
  Foods: {restaurantId: string};
  Cart: undefined;
  RestaurantDashboard: undefined;
  RestaurantProfile: undefined;
  RestaurantAddFood: undefined;
  RestaurantMenu: undefined;
};
