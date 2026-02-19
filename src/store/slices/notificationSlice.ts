import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {AppNotification} from '../../types';

type NotificationState = {
  items: AppNotification[];
};

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    pushNotification(
      state,
      action: PayloadAction<{
        title: string;
        body: string;
        data?: Record<string, string>;
        receivedAtEpoch?: number;
      }>,
    ) {
      const {
        title,
        body,
        data,
        receivedAtEpoch = Date.now(),
      } = action.payload;

      state.items.unshift({
        id: `n-${receivedAtEpoch}-${Math.random().toString(36).slice(2, 9)}`,
        title: title.trim() || 'Notification',
        body: body.trim() || 'New update available.',
        receivedAtEpoch,
        read: false,
        data,
      });

      state.items = state.items.slice(0, 50);
    },
    markAllNotificationsRead(state) {
      state.items = state.items.map(item => ({...item, read: true}));
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const {
  pushNotification,
  markAllNotificationsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
