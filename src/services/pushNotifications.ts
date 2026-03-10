import notifee, {AndroidImportance} from '@notifee/react-native';

const DEFAULT_CHANNEL_ID = 'savr-default';

let initialized = false;

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
