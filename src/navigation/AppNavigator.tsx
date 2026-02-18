import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CartScreen} from '../screens/CartScreen';
import {FoodsScreen} from '../screens/FoodsScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {OtpScreen} from '../screens/OtpScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {RestaurantAddFoodScreen} from '../screens/RestaurantAddFoodScreen';
import {RestaurantDashboardScreen} from '../screens/RestaurantDashboardScreen';
import {RestaurantMenuScreen} from '../screens/RestaurantMenuScreen';
import {RestaurantProfileScreen} from '../screens/RestaurantProfileScreen';
import {RestaurantsScreen} from '../screens/RestaurantsScreen';
import {SplashScreen} from '../screens/SplashScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          animation: 'slide_from_right',
          headerStyle: {backgroundColor: '#027146'},
          headerTintColor: '#f9f9f9',
          headerTitleStyle: {fontFamily: 'Nunito-Bold', fontSize: 20},
          headerBackTitleStyle: {fontFamily: 'Nunito-Regular'},
          contentStyle: {backgroundColor: '#f9f9f9'},
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false, animation: 'fade'}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false, animation: 'fade_from_bottom'}}
        />
        <Stack.Screen name="Otp" component={OtpScreen} options={{headerShown: false}} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Restaurants"
          component={RestaurantsScreen}
          options={{
            title: 'Pickup Nearby',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Foods" component={FoodsScreen} options={{title: 'Food List'}} />
        <Stack.Screen name="Cart" component={CartScreen} options={{title: 'Checkout'}} />
        <Stack.Screen
          name="RestaurantDashboard"
          component={RestaurantDashboardScreen}
          options={{title: 'Restaurant Dashboard'}}
        />
        <Stack.Screen
          name="RestaurantProfile"
          component={RestaurantProfileScreen}
          options={{title: 'Edit Restaurant Profile'}}
        />
        <Stack.Screen
          name="RestaurantAddFood"
          component={RestaurantAddFoodScreen}
          options={{title: 'Add or Update Food'}}
        />
        <Stack.Screen
          name="RestaurantMenu"
          component={RestaurantMenuScreen}
          options={{title: 'Restaurant Menu'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
