import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  CommonHeaderRight,
  CommonHeaderTitle,
  CommonRestaurantHeaderTitle,
} from '../components/common/CommonHeader';
import {PALETTE} from '../constants/palette';
import {CartScreen} from '../screens/user/CartScreen';
import {FoodsScreen} from '../screens/user/FoodsScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {NotificationsScreen} from '../screens/user/NotificationsScreen';
import {OtpScreen} from '../screens/OtpScreen';
import {ProfileScreen} from '../screens/user/ProfileScreen';
import {RestaurantAddFoodScreen} from '../screens/restaurant/RestaurantAddFoodScreen';
import {RestaurantDashboardScreen} from '../screens/restaurant/RestaurantDashboardScreen';
import {RestaurantHomeScreen} from '../screens/restaurant/RestaurantHomeScreen';
import {RestaurantMenuScreen} from '../screens/restaurant/RestaurantMenuScreen';
import {RestaurantProfileScreen} from '../screens/restaurant/RestaurantProfileScreen';
import {RestaurantsScreen} from '../screens/user/RestaurantsScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {useAppSelector} from '../store/hooks';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const nonAuthHeaderOptions = {
  headerTitle: CommonHeaderTitle,
  headerRight: CommonHeaderRight,
};
const restaurantHeaderOptions = {
  headerTitle: CommonRestaurantHeaderTitle,
};

export function AppNavigator() {
  const { session, isLoggedIn} = useAppSelector(state => state.auth);
  const hydrated = false;
  const {profile} = useAppSelector(state => state.user);
  const isUserAuthenticated = isLoggedIn && session?.role === 'user';
  const isUserProfileComplete = Boolean(
    profile.firstName.trim() && profile.lastName.trim(),
  );
  const isRestaurantAuthenticated = isLoggedIn && session?.role === 'restaurant';
  const shouldShowAuthStack =
    hydrated && !isLoggedIn;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: PALETTE.primary,
          },
          headerShadowVisible: true,
          headerTintColor: PALETTE.textOnPrimary,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontFamily: 'Nunito-Bold',
            fontSize: 20,
            color: PALETTE.textOnPrimary,
          },
          headerBackTitleStyle: {fontFamily: 'Nunito-Regular'},
          contentStyle: {backgroundColor: PALETTE.background},
        }}>
        {!hydrated ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown: false, animation: 'fade'}}
          />
        ) : null}

        {shouldShowAuthStack ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false, animation: 'fade_from_bottom'}}
            />
            <Stack.Screen name="Otp" component={OtpScreen} options={{headerShown: false}} />
          </>
        ) : null}

        {hydrated && isUserAuthenticated && !isUserProfileComplete ? (
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />
        ) : null}

        {hydrated && isUserAuthenticated && isUserProfileComplete ? (
          <>
            <Stack.Screen
              name="Restaurants"
              component={RestaurantsScreen}
              options={{
                ...nonAuthHeaderOptions,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={nonAuthHeaderOptions}
            />
            <Stack.Screen
              name="Foods"
              component={FoodsScreen}
              options={{
                title: 'Menu',
                headerRight: CommonHeaderRight,
              }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={nonAuthHeaderOptions}
            />
          </>
        ) : null}

        {hydrated && isRestaurantAuthenticated ? (
          <>
            <Stack.Screen
              name="RestaurantHome"
              component={RestaurantHomeScreen}
              options={{
                ...restaurantHeaderOptions,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="RestaurantDashboard"
              component={RestaurantDashboardScreen}
              options={{
                ...restaurantHeaderOptions,
              }}
            />
            <Stack.Screen
              name="RestaurantProfile"
              component={RestaurantProfileScreen}
              options={restaurantHeaderOptions}
            />
            <Stack.Screen
              name="RestaurantAddFood"
              component={RestaurantAddFoodScreen}
              options={restaurantHeaderOptions}
            />
            <Stack.Screen
              name="RestaurantMenu"
              component={RestaurantMenuScreen}
              options={restaurantHeaderOptions}
            />
          </>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
