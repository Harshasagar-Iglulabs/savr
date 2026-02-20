import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  SectionList,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {PALETTE} from '../../../constants/palette';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {updateOrderStatus} from '../../../store/slices/userSlice';
import type {UserOrder} from '../../../types';
import {formatPrice} from '../../../utils/format';

type OrdersTabKey = 'upcoming' | 'completed';
type GroupedOrder = {
  restaurantId: string;
  restaurantName: string;
  orders: UserOrder[];
  totalItems: number;
  totalAmount: number;
};

export function OrdersScreen() {
  const dispatch = useAppDispatch();
  const {orders, restaurants} = useAppSelector(state => state.user);
  const [activeTab, setActiveTab] = useState<OrdersTabKey>('upcoming');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const tabTranslate = useRef(new Animated.Value(0)).current;

  const upcomingOrders = useMemo(
    () => orders.filter(order => order.status !== 'completed'),
    [orders],
  );
  const completedOrders = useMemo(
    () => orders.filter(order => order.status === 'completed'),
    [orders],
  );

  const data = activeTab === 'upcoming' ? upcomingOrders : completedOrders;
  const totalOrders = orders.length;
  const totalSaved = useMemo(() => {
    return orders.reduce((savedSum, order) => {
      const restaurant = restaurants.find(entry => entry.id === order.restaurantId);
      if (!restaurant) {
        return savedSum;
      }
      const orderSaved = order.items.reduce((itemSaved, cartItem) => {
        const food = restaurant.foods.find(entry => entry.id === cartItem.foodId);
        if (!food) {
          return itemSaved;
        }
        const savedPerUnit = Math.max(food.actualPrice - food.discountedPrice, 0);
        return itemSaved + savedPerUnit * cartItem.quantity;
      }, 0);
      return savedSum + orderSaved;
    }, 0);
  }, [orders, restaurants]);
  const upcomingSaved = useMemo(() => {
    return upcomingOrders.reduce((savedSum, order) => {
      const restaurant = restaurants.find(entry => entry.id === order.restaurantId);
      if (!restaurant) {
        return savedSum;
      }
      const orderSaved = order.items.reduce((itemSaved, cartItem) => {
        const food = restaurant.foods.find(entry => entry.id === cartItem.foodId);
        if (!food) {
          return itemSaved;
        }
        const savedPerUnit = Math.max(food.actualPrice - food.discountedPrice, 0);
        return itemSaved + savedPerUnit * cartItem.quantity;
      }, 0);
      return savedSum + orderSaved;
    }, 0);
  }, [upcomingOrders, restaurants]);
  const totalUpcoming = upcomingOrders.length;
  const placedCount = useMemo(
    () => orders.filter(order => order.status === 'placed').length,
    [orders],
  );
  const doneCount = useMemo(
    () => orders.filter(order => order.status === 'completed').length,
    [orders],
  );
  const chartMax = Math.max(placedCount, doneCount, 1);
  const groupedData = useMemo<GroupedOrder[]>(() => {
    const map = new Map<string, GroupedOrder>();
    for (const order of data) {
      if (!map.has(order.restaurantId)) {
        map.set(order.restaurantId, {
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          orders: [],
          totalItems: 0,
          totalAmount: 0,
        });
      }
      const entry = map.get(order.restaurantId);
      if (entry) {
        entry.orders.push(order);
        entry.totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
        entry.totalAmount += order.totalAmount;
      }
    }
    return Array.from(map.values());
  }, [data]);
  const sections = useMemo(() => [{title: 'orders', data: groupedData}], [groupedData]);

  useEffect(() => {
    Animated.spring(tabTranslate, {
      toValue: activeTab === 'upcoming' ? 0 : 1,
      useNativeDriver: true,
      stiffness: 220,
      damping: 20,
      mass: 0.7,
    }).start();
  }, [activeTab, tabTranslate]);

  const indicatorTranslateX = tabTranslate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 148],
  });

  const formatOrderTime = (epoch: number) =>
    new Date(epoch).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderTabRow = () => (
    <View style={styles.stickyHeaderWrap}>
      <View style={styles.tabRow}>
        <Animated.View
          pointerEvents="none"
          style={[styles.tabIndicator, {transform: [{translateX: indicatorTranslateX}]}]}
        />
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.tabLabelActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('completed')}>
          <Text style={[styles.tabLabel, activeTab === 'completed' && styles.tabLabelActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderCard = ({item}: {item: GroupedOrder}) => (
    <Card
      mode="contained"
      style={styles.orderCard}
      onPress={() =>
        setExpandedGroups(prev => ({
          ...prev,
          [item.restaurantId]: !prev[item.restaurantId],
        }))
      }>
      <Card.Content style={styles.orderContent}>
        <View style={styles.titleRow}>
          <Text variant="titleMedium" style={styles.restaurantName}>
            {item.restaurantName}
          </Text>
          <View style={[styles.statusChip, activeTab === 'completed' && styles.statusChipDone]}>
            <Text style={[styles.statusChipText, activeTab === 'completed' && styles.statusChipTextDone]}>
              {activeTab === 'completed' ? 'Completed' : 'Upcoming'}
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" style={styles.metaText}>
          Orders: {item.orders.length}
        </Text>
        <Text variant="bodySmall" style={styles.metaText}>
          Items: {item.totalItems}
        </Text>
        <Text variant="titleSmall" style={styles.amountText}>
          Total: {formatPrice(item.totalAmount)}
        </Text>

        {expandedGroups[item.restaurantId] ? (
          <View style={styles.itemsWrap}>
            {item.orders.map(order => (
              <View key={order.id} style={styles.orderDetailBlock}>
                <Text variant="bodySmall" style={styles.itemLine}>
                  Code: {order.id.slice(-5).toUpperCase()}
                </Text>
                <Text variant="bodySmall" style={styles.itemLine}>
                  Ordered: {formatOrderTime(order.orderedAtEpoch)}
                </Text>
                {order.completedAtEpoch ? (
                  <Text variant="bodySmall" style={styles.itemLine}>
                    Completed: {formatOrderTime(order.completedAtEpoch)}
                  </Text>
                ) : null}
                {order.items.map(orderItem => (
                  <Text key={orderItem.id} variant="bodySmall" style={styles.itemLine}>
                    {orderItem.quantity}x {orderItem.name}
                  </Text>
                ))}
                {order.status === 'placed' ? (
                  <Button
                    mode="contained"
                    style={styles.actionBtn}
                    onPress={() =>
                      dispatch(updateOrderStatus({orderId: order.id, status: 'completed'}))
                    }>
                    Mark Picked Up
                  </Button>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.restaurantId}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      contentContainerStyle={[styles.listContent, !groupedData.length && styles.listContentEmpty]}
      scrollEnabled={groupedData.length > 0}
      stickySectionHeadersEnabled
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <View style={styles.metricGrid}>
            <Card mode="contained" style={styles.metricCard}>
              <Card.Content style={styles.metricCardContent}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>{totalOrders}</Text>
              </Card.Content>
            </Card>
            <Card mode="contained" style={styles.metricCard}>
              <Card.Content style={styles.metricCardContent}>
                <Text style={styles.metricLabel}>Amount Saved</Text>
                <Text style={styles.metricValue}>{formatPrice(totalSaved)}</Text>
              </Card.Content>
            </Card>
            <Card mode="contained" style={styles.metricCard}>
              <Card.Content style={styles.metricCardContent}>
                <Text style={styles.metricLabel}>Upcoming Savings</Text>
                <Text style={styles.metricValue}>{formatPrice(upcomingSaved)}</Text>
              </Card.Content>
            </Card>
            <Card mode="contained" style={styles.metricCard}>
              <Card.Content style={styles.metricCardContent}>
                <Text style={styles.metricLabel}>Upcoming Orders</Text>
                <Text style={styles.metricValue}>{totalUpcoming}</Text>
              </Card.Content>
            </Card>
          </View>
          <Card mode="contained" style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Order Status Overview</Text>
              <View style={styles.chartRow}>
                <Text style={styles.chartLabel}>Placed</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      styles.barPlaced,
                      {width: `${(placedCount / chartMax) * 100}%`},
                    ]}
                  />
                </View>
                <Text style={styles.chartCount}>{placedCount}</Text>
              </View>
              <View style={styles.chartRow}>
                <Text style={styles.chartLabel}>Completed</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      styles.barCompleted,
                      {width: `${(doneCount / chartMax) * 100}%`},
                    ]}
                  />
                </View>
                <Text style={styles.chartCount}>{doneCount}</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      }
      renderSectionHeader={renderTabRow}
      renderSectionFooter={() =>
        !groupedData.length ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIllustration}>
              <View style={styles.emptyPlate}>
                <MaterialIcons name="circle" size={74} color={PALETTE.surface} />
                <MaterialIcons
                  name="local-dining"
                  size={28}
                  color={PALETTE.primary}
                  style={styles.centerDiningIcon}
                />
              </View>
            </View>
            <RNText style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No upcoming orders' : 'No completed orders'}
            </RNText>
            <RNText style={styles.emptySubText}>
              {activeTab === 'upcoming'
                ? 'Place your next food order from Near You.'
                : 'Completed orders will appear here once delivered.'}
            </RNText>
          </View>
        ) : null
      }
      renderItem={renderOrderCard}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 0,
    paddingBottom: 12,
    marginTop: -100
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerWrap: {
    gap: 10,
    marginBottom: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCard: {
    width: '48.5%',
    borderRadius: 12,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
  },
  metricCardContent: {
    gap: 4,
  },
  metricLabel: {
    fontFamily: 'Nunito-Regular',
    color: PALETTE.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    fontFamily: 'Nunito-Bold',
    color: PALETTE.primary,
    fontSize: 20,
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
  },
  chartTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    width: 72,
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: PALETTE.skeleton,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 999,
  },
  barPlaced: {
    backgroundColor: PALETTE.status.warning,
  },
  barCompleted: {
    backgroundColor: PALETTE.status.success,
  },
  chartCount: {
    width: 26,
    textAlign: 'right',
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    marginLeft: 8,
  },
  stickyHeaderWrap: {
    backgroundColor: PALETTE.background,
    paddingBottom: 8,
  },
  tabRow: {
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.divider,
    borderRadius: 14,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    width: 296,
    alignSelf: 'center',
  },
  tabBtn: {
    width: 148,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabIndicator: {
    position: 'absolute',
    width: 148,
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 10,
    backgroundColor: PALETTE.primary,
    zIndex: 1,
  },
  tabLabel: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Bold',
  },
  tabLabelActive: {
    color: PALETTE.textInverse,
  },
  emptyWrap: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyIllustration: {
    width: 86,
    height: 86,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlate: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: PALETTE.background,
    borderWidth: 2,
    borderColor: PALETTE.divider,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerDiningIcon: {
    position: 'absolute',
  },
  emptyTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  emptySubText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  orderCard: {
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    elevation: 2,
    shadowColor: PALETTE.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  orderContent: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  metaText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  statusChip: {
    backgroundColor: PALETTE.status.warningLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipDone: {
    backgroundColor: PALETTE.status.successLight,
  },
  statusChipText: {
    color: PALETTE.status.warning,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  statusChipTextDone: {
    color: PALETTE.status.success,
  },
  itemsWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.background,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  itemLine: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  orderDetailBlock: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.lightBorder,
    paddingTop: 8,
    marginTop: 8,
    gap: 2,
  },
  amountText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 4,
  },
});
