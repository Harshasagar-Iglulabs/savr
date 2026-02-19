import {store} from '../store';
import {pushNotification} from '../store/slices/notificationSlice';

type FcmLikeMessage = {
  messageId?: string;
  sentTime?: number;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
};

export function ingestFcmMessage(message: FcmLikeMessage) {
  const title = message.notification?.title ?? message.data?.title ?? 'Notification';
  const body = message.notification?.body ?? message.data?.body ?? 'You have a new update.';

  store.dispatch(
    pushNotification({
      title,
      body,
      data: message.data,
      receivedAtEpoch: message.sentTime ?? Date.now(),
    }),
  );
}
