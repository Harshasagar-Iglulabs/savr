import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {confirmOtpWithBackend, requestOtp} from '../../services/auth';
import type {AuthSession, UserRole} from '../../types';
import type {RootState} from '../index';
import {INITIAL_TOKEN} from '../../utils/constants';

type AuthState = {
  token: string;
  phone: string;
  otpInput: string;
  session: AuthSession | null;
  shouldUpdateProfile: boolean;
  isLoggedIn: boolean;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: INITIAL_TOKEN,
  phone: '',
  otpInput: '',
  session: null,
  shouldUpdateProfile: false,
  isLoggedIn: false,
  hydrated: false,
  loading: false,
  error: null,
};

export const requestOtpThunk = createAsyncThunk(
  'auth/requestOtp',
  async (_: void, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    const {phone, token} = state.auth;

    if (!phone.trim()) {
      return rejectWithValue('Phone number is required.');
    }

    return requestOtp(phone, token);
  },
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (_: void, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    const {otpInput, session} = state.auth;

    if (!session) {
      return rejectWithValue('Missing OTP session.');
    }

    let confirmation: {
      isValid: boolean;
      role: UserRole;
      token: string;
      isExistingUser: boolean;
      shouldUpdateProfile: boolean;
    };
    try {
      confirmation = await confirmOtpWithBackend(
        session.role,
        session.phone,
        otpInput,
        session.requestId ?? '',
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unable to verify OTP.',
      );
    }

    if (!confirmation.isValid) {
      return rejectWithValue('Invalid OTP code.');
    }

    return {
      role: confirmation.role,
      token: confirmation.token,
      shouldUpdateProfile: confirmation.shouldUpdateProfile,
      isExistingUser: confirmation.isExistingUser,
    };
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
    setOtpInput(state, action: PayloadAction<string>) {
      state.otpInput = action.payload;
    },
    restoreAuthState(state, action: PayloadAction<Partial<AuthState>>) {
      if (typeof action.payload.token === 'string') {
        state.token = action.payload.token;
      }
      if (typeof action.payload.phone === 'string') {
        state.phone = action.payload.phone;
      }
      if (action.payload.session !== undefined) {
        state.session = action.payload.session ?? null;
      }
      if (typeof action.payload.shouldUpdateProfile === 'boolean') {
        state.shouldUpdateProfile = action.payload.shouldUpdateProfile;
      }
      if (typeof action.payload.isLoggedIn === 'boolean') {
        state.isLoggedIn = action.payload.isLoggedIn;
      }
    },
    setAuthHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    setShouldUpdateProfile(state, action: PayloadAction<boolean>) {
      state.shouldUpdateProfile = action.payload;
      if (state.session) {
        state.session.shouldUpdateProfile = action.payload;
      }
    },
    resetToUserLogin(state) {
      state.token = INITIAL_TOKEN;
      state.phone = '';
      state.otpInput = '';
      state.session = null;
      state.shouldUpdateProfile = false;
      state.isLoggedIn = false;
      state.hydrated = true;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(requestOtpThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.shouldUpdateProfile = action.payload.shouldUpdateProfile ?? false;
        state.isLoggedIn = false;
      })
      .addCase(requestOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unable to request OTP.';
      })
      .addCase(verifyOtpThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyOtpThunk.fulfilled,
        (
          state,
          action: PayloadAction<{
            role: UserRole;
            token: string;
            shouldUpdateProfile: boolean;
            isExistingUser: boolean;
          }>,
        ) => {
        state.loading = false;
        if (state.session) {
          state.session.role = action.payload.role;
          state.session.token = action.payload.token;
          state.session.shouldUpdateProfile = action.payload.shouldUpdateProfile;
          state.isLoggedIn = true;
        }
        state.shouldUpdateProfile = action.payload.shouldUpdateProfile;
        },
      )
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unable to verify OTP.';
      });
  },
});

export const {
  setToken,
  setPhone,
  setOtpInput,
  restoreAuthState,
  setAuthHydrated,
  setShouldUpdateProfile,
  resetToUserLogin,
} = authSlice.actions;

export default authSlice.reducer;
