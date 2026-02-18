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
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: INITIAL_TOKEN,
  phone: '',
  otpInput: '',
  session: null,
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

    const confirmation = await confirmOtpWithBackend(
      session.token,
      session.phone,
      otpInput,
      session.otp,
    );
    if (!confirmation.isValid) {
      return rejectWithValue('Invalid OTP code.');
    }

    return confirmation.role;
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
    resetToUserLogin(state) {
      state.token = INITIAL_TOKEN;
      state.phone = '';
      state.otpInput = '';
      state.session = null;
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
      })
      .addCase(requestOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unable to request OTP.';
      })
      .addCase(verifyOtpThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action: PayloadAction<UserRole>) => {
        state.loading = false;
        if (state.session) {
          state.session.role = action.payload;
        }
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unable to verify OTP.';
      });
  },
});

export const {setToken, setPhone, setOtpInput, resetToUserLogin} =
  authSlice.actions;

export default authSlice.reducer;
