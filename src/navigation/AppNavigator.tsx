import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  AdminCreateRestaurantHeaderRight,
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
import {AdminAddRestaurantScreen} from '../screens/admin/AdminAddRestaurantScreen';
import {AdminEditRestaurantScreen} from '../screens/admin/AdminEditRestaurantScreen';
import {AdminRestaurantsScreen} from '../screens/admin/AdminRestaurantsScreen';
import {RestaurantsScreen} from '../screens/user/RestaurantsScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {useAppSelector} from '../store/hooks';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const {hydrated, session, isLoggedIn, shouldUpdateProfile} = useAppSelector(
    state => state.auth,
  );
  const {locationGranted, locationLabel} = useAppSelector(state => state.user);
  const unreadCount = useAppSelector(
    state => state.notifications.items.filter(item => !item.read).length,
  );
  const storeName = useAppSelector(
    state => state.restaurant.profile?.storeName?.trim() || 'Restaurant',
  );
  const hasValidSessionRole =
    session?.role === 'user' || session?.role === 'restaurant' || session?.role === 'admin';
  const isUserAuthenticated = isLoggedIn && session?.role === 'user';
  const shouldShowUserProfileScreen = isUserAuthenticated && shouldUpdateProfile;
  const isRestaurantAuthenticated = isLoggedIn && session?.role === 'restaurant';
  const isAdminAuthenticated = isLoggedIn && session?.role === 'admin';
  const shouldShowAuthStack = hydrated && (!isLoggedIn || !hasValidSessionRole);
  const locationTitle = locationGranted ? locationLabel : 'Set location';

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

        {hydrated && shouldShowUserProfileScreen ? (
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />
        ) : null}

        {hydrated && isUserAuthenticated && !shouldShowUserProfileScreen ? (
          <>
            <Stack.Screen
              name="Restaurants"
              component={RestaurantsScreen}
              options={({navigation}) => ({
                gestureEnabled: false,
                headerTitle: () => (
                  <CommonHeaderTitle
                    title={locationTitle}
                    onPress={() =>
                      navigation.navigate('Restaurants', {
                        tab: 'explore',
                        openLocationPicker: true,
                      })
                    }
                  />
                ),
                headerRight: () => (
                  <CommonHeaderRight
                    unreadCount={unreadCount}
                    onPress={() => navigation.navigate('Notifications')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={({navigation}) => ({
                headerTitle: () => (
                  <CommonHeaderTitle
                    title={locationTitle}
                    onPress={() =>
                      navigation.navigate('Restaurants', {
                        tab: 'explore',
                        openLocationPicker: true,
                      })
                    }
                  />
                ),
                headerRight: () => (
                  <CommonHeaderRight
                    unreadCount={unreadCount}
                    onPress={() => navigation.navigate('Notifications')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Foods"
              component={FoodsScreen}
              options={({navigation}) => ({
                title: 'Menu',
                headerRight: () => (
                  <CommonHeaderRight
                    unreadCount={unreadCount}
                    onPress={() => navigation.navigate('Notifications')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={({navigation}) => ({
                headerTitle: () => (
                  <CommonHeaderTitle
                    title={locationTitle}
                    onPress={() =>
                      navigation.navigate('Restaurants', {
                        tab: 'explore',
                        openLocationPicker: true,
                      })
                    }
                  />
                ),
                headerRight: () => (
                  <CommonHeaderRight
                    unreadCount={unreadCount}
                    onPress={() => navigation.navigate('Notifications')}
                  />
                ),
              })}
            />
          </>
        ) : null}

        {hydrated && isRestaurantAuthenticated ? (
          <>
            <Stack.Screen
              name="RestaurantHome"
              component={RestaurantHomeScreen}
              options={{
                gestureEnabled: false,
                headerTitle: () => (
                  <CommonRestaurantHeaderTitle storeName={storeName} />
                ),
                headerRight: undefined,
              }}
            />
            <Stack.Screen
              name="RestaurantDashboard"
              component={RestaurantDashboardScreen}
              options={{
                headerTitle: () => (
                  <CommonRestaurantHeaderTitle storeName={storeName} />
                ),
                headerRight: undefined,
              }}
            />
            <Stack.Screen
              name="RestaurantProfile"
              component={RestaurantProfileScreen}
              options={{
                headerTitle: () => (
                  <CommonRestaurantHeaderTitle storeName={storeName} />
                ),
                headerRight: undefined,
              }}
            />
            <Stack.Screen
              name="RestaurantAddFood"
              component={RestaurantAddFoodScreen}
              options={{
                headerTitle: () => (
                  <CommonRestaurantHeaderTitle storeName={storeName} />
                ),
                headerRight: undefined,
              }}
            />
            <Stack.Screen
              name="RestaurantMenu"
              component={RestaurantMenuScreen}
              options={{
                headerTitle: () => (
                  <CommonRestaurantHeaderTitle storeName={storeName} />
                ),
                headerRight: undefined,
              }}
            />
          </>
        ) : null}

        {hydrated && isAdminAuthenticated ? (
          <>
            <Stack.Screen
              name="AdminRestaurants"
              component={AdminRestaurantsScreen}
              options={({navigation}) => ({
                gestureEnabled: false,
                title: 'Admin Restaurants',
                headerRight: () => (
                  <AdminCreateRestaurantHeaderRight
                    onPress={() => navigation.navigate('AdminAddRestaurant')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="AdminAddRestaurant"
              component={AdminAddRestaurantScreen}
              options={{title: 'Add Restaurant'}}
            />
            <Stack.Screen
              name="AdminEditRestaurant"
              component={AdminEditRestaurantScreen}
              options={{title: 'Edit Restaurant'}}
            />
          </>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
