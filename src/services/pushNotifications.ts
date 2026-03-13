import notifee, {AndroidImportance} from '@notifee/react-native';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {ingestFcmMessage} from './notificationCenter';

const DEFAULT_CHANNEL_ID = 'savr-default';

let initialized = false;
let fcmHandlersInitialized = false;
let onMessageUnsubscribe: (() => void) | undefined;

export async function initializePushNotifications(): Promise<void> {
  if (initialized) {
    return;
  }

  await notifee.requestPermission();
  await notifee.createChannel({
    id: DEFAULT_CHANNEL_ID,
    name: 'General',
    importance: AndroidImportance.HIGH,
  });
  await messaging().requestPermission();
  await messaging().registerDeviceForRemoteMessages();
  await setupFcmForegroundHandlers();

  initialized = true;
}

export async function displayLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (!initialized) {
    await initializePushNotifications();
  }

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: DEFAULT_CHANNEL_ID,
      pressAction: {
        id: 'default',
      },
    },
  });
}

async function setupFcmForegroundHandlers(): Promise<void> {
  if (fcmHandlersInitialized) {
    return;
  }

  onMessageUnsubscribe = messaging().onMessage(message => {
    ingestFcmMessage(message);
  });

  messaging().onNotificationOpenedApp(message => {
    ingestFcmMessage(message);
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    ingestFcmMessage(initialNotification);
  }

  fcmHandlersInitialized = true;
}

export function teardownPushNotificationHandlers(): void {
  if (onMessageUnsubscribe) {
    onMessageUnsubscribe();
    onMessageUnsubscribe = undefined;
  }

  fcmHandlersInitialized = false;
}

export function handleBackgroundFcmMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): void {
  ingestFcmMessage(message);
}

export async function getCurrentFcmToken(): Promise<string> {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token?.trim() ?? '';
  } catch {
    return '';
  }
}

export function subscribeToFcmTokenRefresh(
  onRefresh: (token: string) => void,
): () => void {
  const unsubscribe = messaging().onTokenRefresh(nextToken => {
    onRefresh(nextToken);
  });

  return () => {
    unsubscribe();
  };
}
