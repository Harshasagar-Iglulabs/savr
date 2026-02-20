import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppSelector} from '../../store/hooks';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CommonHeaderTitle() {
  const navigation = useNavigation<Nav>();
  const {locationGranted, locationLabel} = useAppSelector(state => state.user);
  const title = locationGranted ? locationLabel : 'Set location';

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('Restaurants', {
          tab: 'explore',
          openLocationPicker: true,
        })
      }
      style={styles.locationWrap}>
      <MaterialIcons name="location-on" size={18} color={PALETTE.textOnPrimary} />
      <Text numberOfLines={1} style={styles.locationText}>
        {title}
      </Text>
      <MaterialIcons name="keyboard-arrow-down" size={18} color={PALETTE.textOnPrimary} />
    </Pressable>
  );
}

export function CommonRestaurantHeaderTitle() {
  const storeName = useAppSelector(
    state => state.restaurant.profile?.storeName?.trim() || 'Restaurant',
  );

  return (
    <View style={styles.restaurantWrap}>
      <MaterialIcons name="storefront" size={18} color={PALETTE.textOnPrimary} />
      <Text numberOfLines={1} style={styles.locationText}>
        {storeName}
      </Text>
    </View>
  );
}

export function CommonHeaderRight() {
  const navigation = useNavigation<Nav>();
  const unreadCount = useAppSelector(
    state => state.notifications.items.filter(item => !item.read).length,
  );

  return (
    <Pressable
      onPress={() => navigation.navigate('Notifications')}
      style={styles.bellBtn}
      hitSlop={8}>
      <MaterialIcons name="notifications-none" size={16} color={PALETTE.textOnPrimary} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 240,
    gap: 6,
  },
  locationText: {
    color: PALETTE.textOnPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    maxWidth: 170,
  },
  restaurantWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 240,
    gap: 6,
  },
  bellBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PALETTE.textOnPrimary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: PALETTE.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: PALETTE.secondary,
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    lineHeight: 12,
  },
});
