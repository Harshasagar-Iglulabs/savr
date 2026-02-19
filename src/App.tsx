import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PALETTE} from './constants/palette';
import {AppNavigator} from './navigation/AppNavigator';
import {useAppSelector} from './store/hooks';
import {store} from './store';
import {paperTheme} from './theme/paperTheme';
import {
  savePersistedAuthState,
  savePersistedProfile,
} from './utils/localStorage';

function AppBootstrap() {
  const {hydrated, token, phone, session, isLoggedIn} = useAppSelector(state => state.auth);
  const {profile} = useAppSelector(state => state.user);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void savePersistedAuthState({
      token,
      phone,
      session,
      isLoggedIn,
    });
  }, [hydrated, token, phone, session, isLoggedIn]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void savePersistedProfile(profile);
  }, [hydrated, profile]);

  return <AppNavigator />;
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
