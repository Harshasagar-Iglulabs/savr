import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GlobalSnackbar} from './components/common/GlobalSnackbar';
import {PALETTE} from './constants/palette';
import {AppNavigator} from './navigation/AppNavigator';
import {useAppSelector} from './store/hooks';
import {store} from './store';
import {paperTheme} from './theme/paperTheme';
import {subscribeAuthFcmTokenSync, syncCurrentDeviceFcmToken} from './services/auth';
import {
  savePersistedAuthState,
  savePersistedProfile,
} from './utils/localStorage';
import {initializePushNotifications} from './services/pushNotifications';

function AppBootstrap() {
  const {hydrated, token, phone, session, shouldUpdateProfile, isLoggedIn} =
    useAppSelector(state => state.auth);
  const {profile} = useAppSelector(state => state.user);

  useEffect(() => {
    void initializePushNotifications().catch(() => {
      // App should still boot if notification permission/channel setup fails.
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void savePersistedAuthState({
      token,
      phone,
      session,
      shouldUpdateProfile,
      isLoggedIn,
    });
  }, [hydrated, token, phone, session, shouldUpdateProfile, isLoggedIn]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void savePersistedProfile(profile);
  }, [hydrated, profile]);

  useEffect(() => {
    const authToken = session?.token ?? token;
    if (!hydrated || !isLoggedIn || !authToken.trim()) {
      return;
    }

    void syncCurrentDeviceFcmToken(authToken).catch(() => {
      // Keep app flow running if FCM token sync fails.
    });

    const unsubscribe = subscribeAuthFcmTokenSync(() => {
      const auth = store.getState().auth;
      return (auth.session?.token ?? auth.token ?? '').trim();
    });

    return () => {
      unsubscribe();
    };
  }, [hydrated, isLoggedIn, session?.token, token]);

  return (
    <>
      <AppNavigator />
      <GlobalSnackbar />
    </>
  );
}

export default function SavrApp() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={PALETTE.primary}
          />
          <AppBootstrap />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
