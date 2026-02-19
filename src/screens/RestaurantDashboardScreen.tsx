import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card, Chip, Divider, Text} from 'react-native-paper';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {resetToUserLogin} from '../store/slices/authSlice';
import {clearRestaurantState, loadRestaurantDashboardThunk} from '../store/slices/restaurantSlice';
import {clearUserState} from '../store/slices/userSlice';
import {formatPrice} from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantDashboard'>;

export function RestaurantDashboardScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {metrics, profile, loading, error} = useAppSelector(state => state.restaurant);

  useEffect(() => {
    dispatch(loadRestaurantDashboardThunk());
  }, [dispatch]);

  const onSwitchToUser = () => {
    dispatch(resetToUserLogin());
    dispatch(clearUserState());
    dispatch(clearRestaurantState());
    navigation.replace('Login');
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall">{profile?.storeName ?? 'Restaurant Dashboard'}</Text>
      <Text variant="bodyMedium">Manage profile, menu, orders and analytics.</Text>

      <View style={styles.actions}>
        <PrimaryButton label="Edit Profile" onPress={() => navigation.navigate('RestaurantProfile')} />
        <PrimaryButton label="Add Food Item" onPress={() => navigation.navigate('RestaurantAddFood')} />
        <PrimaryButton label="View Menu" onPress={() => navigation.navigate('RestaurantMenu')} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {metrics ? (
        <>
          <Card mode="contained">
            <Card.Content style={styles.cardGap}>
              <Text variant="titleMedium">Today's Performance</Text>
              <Text variant="bodyMedium">Today's Earnings: {formatPrice(metrics.todayEarnings)}</Text>
              <Text variant="bodyMedium">Today's Orders: {metrics.ordersToday}</Text>
              <Text variant="bodyMedium">Average Order Value: {formatPrice(metrics.averageOrderValue)}</Text>
            </Card.Content>
          </Card>

          <Card mode="contained">
            <Card.Content style={styles.cardGap}>
              <Text variant="titleMedium">Revenue (Multiple Views)</Text>
              <Text variant="bodyMedium">Total Revenue: {formatPrice(metrics.totalRevenue)}</Text>
              <Text variant="bodyMedium">Weekly Revenue: {formatPrice(metrics.weeklyRevenue)}</Text>
              <Text variant="bodyMedium">Monthly Revenue: {formatPrice(metrics.monthlyRevenue)}</Text>
              <Divider style={styles.divider} />
              {metrics.revenueChannels.map(channel => (
                <Text key={channel.label} variant="bodySmall">
                  {channel.label}: {formatPrice(channel.amount)} ({channel.percentage}%)
                </Text>
              ))}
            </Card.Content>
          </Card>

          <Card mode="contained">
            <Card.Content style={styles.cardGap}>
              <Text variant="titleMedium">Today's Order Status</Text>
              <View style={styles.chips}>
                <Chip>Pending {metrics.orderStatus.pending}</Chip>
                <Chip>Completed {metrics.orderStatus.completed}</Chip>
                <Chip>Cancelled {metrics.orderStatus.cancelled}</Chip>
              </View>
            </Card.Content>
          </Card>
        </>
      ) : null}

      <PrimaryButton label={loading ? 'Loading...' : 'Refresh Dashboard'} onPress={() => dispatch(loadRestaurantDashboardThunk())} disabled={loading} />
      <PrimaryButton label="Switch to User Flow" onPress={onSwitchToUser} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 8,
  },
  cardGap: {
    gap: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  divider: {
    marginVertical: 6,
  },
  errorText: {
    color: '#b91c1c',
  },
});
