import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {fetchNearbyRestaurants} from '../../services/restaurants';
import type {
  CartItem,
  FoodItem,
  Restaurant,
  UserOrder,
  UserProfile,
  UserSearchFilters,
} from '../../types';
import type {RootState} from '../index';

type UserState = {
  profile: UserProfile;
  locationGranted: boolean;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  restaurants: Restaurant[];
  loadingNearby: boolean;
  error: string | null;
  filters: UserSearchFilters;
  cart: CartItem[];
  orders: UserOrder[];
  pendingRatingOrderId: string | null;
};

const initialState: UserState = {
  profile: {
    firstName: '',
    lastName: '',
  },
  locationGranted: false,
  locationLabel: 'Set location',
  latitude: null,
  longitude: null,
  restaurants: [],
  loadingNearby: false,
  error: null,
  filters: {
    maxDistanceKm: 8,
  },
  cart: [],
  orders: [],
  pendingRatingOrderId: null,
};

export const fetchNearbyRestaurantsThunk = createAsyncThunk(
  'user/fetchNearbyRestaurants',
  async (
    {latitude, longitude}: {latitude: number; longitude: number},
    {getState, rejectWithValue},
  ) => {
    const state = getState() as RootState;
    const token = state.auth.session?.token;

    if (!token) {
      return rejectWithValue('Missing authenticated token.');
    }

    return fetchNearbyRestaurants(latitude, longitude, token);
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
    },
    setLocationGranted(state, action: PayloadAction<boolean>) {
      state.locationGranted = action.payload;
    },
    setUserLocation(
      state,
      action: PayloadAction<{label: string; latitude: number; longitude: number}>,
    ) {
      state.locationGranted = true;
      state.locationLabel = action.payload.label;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    setSearchFilters(state, action: PayloadAction<UserSearchFilters>) {
      state.filters = action.payload;
    },
    addFoodToCart(
      state,
      action: PayloadAction<{
        restaurantId: string;
        restaurantName: string;
        food: FoodItem;
      }>,
    ) {
      const {restaurantId, restaurantName, food} = action.payload;
      const cartId = `${restaurantId}-${food.id}`;
      const found = state.cart.find(item => item.id === cartId);

      if (found) {
        found.quantity += 1;
        return;
      }

      state.cart.push({
        id: cartId,
        restaurantId,
        restaurantName,
        foodId: food.id,
        name: food.name,
        unitPrice: food.discountedPrice,
        quantity: 1,
      });
    },
    changeCartItemQuantity(
      state,
      action: PayloadAction<{cartItemId: string; delta: 1 | -1}>,
    ) {
      const {cartItemId, delta} = action.payload;
      const item = state.cart.find(entry => entry.id === cartItemId);
      if (!item) {
        return;
      }

      item.quantity += delta;
      if (item.quantity <= 0) {
        state.cart = state.cart.filter(entry => entry.id !== cartItemId);
      }
    },
    removeCartItem(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },
    placeCartOrder(state) {
      if (!state.cart.length) {
        return;
      }

      const groupedByRestaurant = new Map<string, CartItem[]>();
      for (const item of state.cart) {
        if (!groupedByRestaurant.has(item.restaurantId)) {
          groupedByRestaurant.set(item.restaurantId, []);
        }
        groupedByRestaurant.get(item.restaurantId)?.push(item);
      }

      groupedByRestaurant.forEach((items, restaurantId) => {
        const restaurantName = items[0].restaurantName;
        const totalAmount = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );

        state.orders.unshift({
          id: `o-${Date.now()}-${restaurantId}`,
          restaurantId,
          restaurantName,
          status: 'placed',
          items: items.map(item => ({...item})),
          totalAmount,
          orderedAtEpoch: Date.now(),
        });
      });

      state.cart = [];
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{orderId: string; status: 'completed'}>,
    ) {
      const {orderId, status} = action.payload;
      const order = state.orders.find(entry => entry.id === orderId);
      if (!order) {
        return;
      }

      order.status = status;
      if (status === 'completed') {
        order.completedAtEpoch = Date.now();
        state.pendingRatingOrderId = orderId;
      }
    },
    submitOrderRating(
      state,
      action: PayloadAction<{orderId: string; rating: number}>,
    ) {
      const {orderId, rating} = action.payload;
      const order = state.orders.find(entry => entry.id === orderId);
      if (!order) {
        return;
      }

      order.rating = rating;
      if (state.pendingRatingOrderId === orderId) {
        state.pendingRatingOrderId = null;
      }
    },
    dismissRatingPrompt(state) {
      state.pendingRatingOrderId = null;
    },
    clearUserState(state) {
      state.profile = initialState.profile;
      state.locationGranted = initialState.locationGranted;
      state.locationLabel = initialState.locationLabel;
      state.latitude = initialState.latitude;
      state.longitude = initialState.longitude;
      state.restaurants = initialState.restaurants;
      state.loadingNearby = initialState.loadingNearby;
      state.error = null;
      state.filters = initialState.filters;
      state.cart = [];
      state.orders = [];
      state.pendingRatingOrderId = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNearbyRestaurantsThunk.pending, state => {
        state.loadingNearby = true;
        state.error = null;
      })
      .addCase(fetchNearbyRestaurantsThunk.fulfilled, (state, action) => {
        state.loadingNearby = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchNearbyRestaurantsThunk.rejected, (state, action) => {
        state.loadingNearby = false;
        state.error =
          (action.payload as string) ?? 'Unable to fetch nearby restaurants.';
      });
  },
});

export const {
  setProfile,
  setLocationGranted,
  setUserLocation,
  setSearchFilters,
  addFoodToCart,
  changeCartItemQuantity,
  removeCartItem,
  placeCartOrder,
  updateOrderStatus,
  submitOrderRating,
  dismissRatingPrompt,
  clearUserState,
} = userSlice.actions;

export default userSlice.reducer;
