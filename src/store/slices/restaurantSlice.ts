import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {
  fetchRestaurantMenu,
  fetchRestaurantMetrics,
  fetchRestaurantProfile,
  findMenuItemByName,
  saveRestaurantProfile,
  upsertRestaurantMenuItem,
} from '../../services/restaurantPanel';
import type {
  FoodItem,
  RestaurantMenuItemInput,
  RestaurantMetrics,
  RestaurantProfile,
} from '../../types';

type RestaurantState = {
  profile: RestaurantProfile | null;
  metrics: RestaurantMetrics | null;
  menu: FoodItem[];
  prefillItem: FoodItem | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  info: string | null;
};

const initialState: RestaurantState = {
  profile: null,
  metrics: null,
  menu: [],
  prefillItem: null,
  loading: false,
  saving: false,
  error: null,
  info: null,
};

export const loadRestaurantDashboardThunk = createAsyncThunk(
  'restaurant/loadDashboard',
  async () => {
    const [profile, metrics, menu] = await Promise.all([
      fetchRestaurantProfile(),
      fetchRestaurantMetrics(),
      fetchRestaurantMenu(),
    ]);

    return {profile, metrics, menu};
  },
);

export const saveRestaurantProfileThunk = createAsyncThunk(
  'restaurant/saveProfile',
  async (payload: RestaurantProfile) => {
    return saveRestaurantProfile(payload);
  },
);

export const prefillMenuItemByNameThunk = createAsyncThunk(
  'restaurant/prefillMenuItem',
  async (name: string) => {
    return findMenuItemByName(name);
  },
);

export const upsertMenuItemThunk = createAsyncThunk(
  'restaurant/upsertMenuItem',
  async (payload: RestaurantMenuItemInput) => {
    return upsertRestaurantMenuItem(payload);
  },
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearRestaurantState(state) {
      state.profile = null;
      state.metrics = null;
      state.menu = [];
      state.prefillItem = null;
      state.loading = false;
      state.saving = false;
      state.error = null;
      state.info = null;
    },
    clearRestaurantInfo(state) {
      state.info = null;
      state.error = null;
    },
    setPrefillItem(state, action: PayloadAction<FoodItem | null>) {
      state.prefillItem = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadRestaurantDashboardThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRestaurantDashboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.metrics = action.payload.metrics;
        state.menu = action.payload.menu;
      })
      .addCase(loadRestaurantDashboardThunk.rejected, state => {
        state.loading = false;
        state.error = 'Unable to load restaurant dashboard.';
      })
      .addCase(saveRestaurantProfileThunk.pending, state => {
        state.saving = true;
        state.error = null;
        state.info = null;
      })
      .addCase(saveRestaurantProfileThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
        state.info = 'Profile updated successfully.';
      })
      .addCase(saveRestaurantProfileThunk.rejected, state => {
        state.saving = false;
        state.error = 'Unable to save restaurant profile.';
      })
      .addCase(prefillMenuItemByNameThunk.pending, state => {
        state.error = null;
        state.info = null;
      })
      .addCase(prefillMenuItemByNameThunk.fulfilled, (state, action) => {
        state.prefillItem = action.payload;
        state.info = action.payload
          ? 'Item found in DB. Fields prefilled.'
          : 'No previous item found with that name.';
      })
      .addCase(prefillMenuItemByNameThunk.rejected, state => {
        state.error = 'Unable to fetch existing item details.';
      })
      .addCase(upsertMenuItemThunk.pending, state => {
        state.saving = true;
        state.error = null;
        state.info = null;
      })
      .addCase(upsertMenuItemThunk.fulfilled, (state, action) => {
        state.saving = false;
        const {item, wasExisting} = action.payload;
        const index = state.menu.findIndex(menuItem => menuItem.id === item.id);
        if (index >= 0) {
          state.menu[index] = item;
        } else {
          state.menu.unshift(item);
        }
        state.info = wasExisting
          ? 'Item already existed. Updated with latest values.'
          : 'New item added to menu.';
      })
      .addCase(upsertMenuItemThunk.rejected, state => {
        state.saving = false;
        state.error = 'Unable to save menu item.';
      });
  },
});

export const {clearRestaurantState, clearRestaurantInfo, setPrefillItem} =
  restaurantSlice.actions;

export default restaurantSlice.reducer;
