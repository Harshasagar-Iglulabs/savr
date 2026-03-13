import {store} from '../store';
import {pushNotification} from '../store/slices/notificationSlice';
import {displayLocalNotification} from './pushNotifications';

type FcmLikeMessage = {
  messageId?: string;
  sentTime?: number;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, unknown>;
};

export function ingestFcmMessage(message: FcmLikeMessage) {
  const title =
    message.notification?.title ??
    readDataString(message.data, 'title') ??
    'Notification';
  const body =
    message.notification?.body ??
    readDataString(message.data, 'body') ??
    'You have a new update.';
  const normalizedData = normalizeData(message.data);

  store.dispatch(
    pushNotification({
      title,
      body,
      data: normalizedData,
      receivedAtEpoch: message.sentTime ?? Date.now(),
    }),
  );

  void displayLocalNotification(title, body, normalizedData).catch(() => {
    // Keep in-app notification flow working even if system notification fails.
  });
}

function normalizeData(data?: Record<string, unknown>): Record<string, string> | undefined {
  if (!data) {
    return undefined;
  }

  const normalized = Object.entries(data).reduce<Record<string, string>>(
    (result, [key, value]) => {
      if (typeof value === 'string') {
        result[key] = value;
        return result;
      }

      if (value === null || value === undefined) {
        result[key] = '';
        return result;
      }

      result[key] = JSON.stringify(value);
      return result;
    },
    {},
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function readDataString(
  data: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = data?.[key];
  return typeof value === 'string' ? value : undefined;
}
