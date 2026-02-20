import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  FlatList,
  SectionList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Surface, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {resetToUserLogin} from '../../store/slices/authSlice';
import {clearNotifications} from '../../store/slices/notificationSlice';
import {clearRestaurantState, loadRestaurantDashboardThunk} from '../../store/slices/restaurantSlice';
import {clearUserState} from '../../store/slices/userSlice';
import {formatPrice, formatSavings} from '../../utils/format';
import {clearAllPersistedUserSessionData} from '../../utils/localStorage';
import {epochToTimeLabel} from '../../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantHome'>;
type TabKey = 'performance' | 'orders' | 'menu' | 'profile';
type OrdersTabKey = 'upcoming' | 'completed';
type RestaurantOrder = {
  id: string;
  customerName: string;
  status: 'placed' | 'completed';
  orderedAtEpoch: number;
  completedAtEpoch?: number;
  totalAmount: number;
  items: Array<{id: string; name: string; quantity: number}>;
};

const seededRestaurantOrders: RestaurantOrder[] = [
  {
    id: 'ro-101',
    customerName: 'Rohan Patel',
    status: 'placed',
    orderedAtEpoch: Date.now() - 45 * 60 * 1000,
    totalAmount: 540,
    items: [
      {id: 'i-1', name: 'Pesto Pasta', quantity: 1},
      {id: 'i-2', name: 'Paneer Tikka Wrap', quantity: 1},
    ],
  },
  {
    id: 'ro-102',
    customerName: 'Ananya Verma',
    status: 'placed',
    orderedAtEpoch: Date.now() - 20 * 60 * 1000,
    totalAmount: 830,
    items: [
      {id: 'i-3', name: 'Pesto Pasta', quantity: 2},
      {id: 'i-4', name: 'Greek Salad Bowl', quantity: 1},
    ],
  },
  {
    id: 'ro-099',
    customerName: 'Karthik Rao',
    status: 'completed',
    orderedAtEpoch: Date.now() - 4 * 60 * 60 * 1000,
    completedAtEpoch: Date.now() - 3 * 60 * 60 * 1000,
    totalAmount: 460,
    items: [{id: 'i-5', name: 'Paneer Tikka Wrap', quantity: 2}],
  },
];

export function RestaurantHomeScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {metrics, profile, menu, loading, error} = useAppSelector(state => state.restaurant);
  const [activeTab, setActiveTab] = useState<TabKey>('performance');
  const [ordersTab, setOrdersTab] = useState<OrdersTabKey>('upcoming');
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>(
    seededRestaurantOrders,
  );
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [tabWidth, setTabWidth] = useState(0);
  const tabTranslate = useRef(new Animated.Value(4)).current;
  const ordersTabTranslate = useRef(new Animated.Value(0)).current;
  const isRefreshing = loading;
  const onLogout = useCallback(async () => {
    await clearAllPersistedUserSessionData();
    dispatch(clearNotifications());
    dispatch(clearUserState());
    dispatch(clearRestaurantState());
    dispatch(resetToUserLogin());
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }, [dispatch, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight:
        activeTab === 'profile'
          ? () => (
              <Pressable style={styles.logoutBtn} onPress={onLogout} hitSlop={8}>
                <MaterialIcons name="logout" size={16} color={PALETTE.textOnPrimary} />
              </Pressable>
            )
          : undefined,
    });
  }, [activeTab, navigation, onLogout]);
  const formatCount = (value: number) => value.toLocaleString('en-US');

  useEffect(() => {
    if (!profile || !metrics || !menu.length) {
      dispatch(loadRestaurantDashboardThunk());
    }
  }, [dispatch, menu.length, metrics, profile]);

  const tabIndex = useMemo(() => {
    if (activeTab === 'orders') {
      return 1;
    }
    if (activeTab === 'menu') {
      return 2;
    }
    if (activeTab === 'profile') {
      return 3;
    }
    return 0;
  }, [activeTab]);

  const tabSlotWidth = tabWidth > 0 ? tabWidth / 4 : 0;
  const indicatorWidth = tabSlotWidth > 0 ? tabSlotWidth - 8 : 0;

  useEffect(() => {
    if (!tabSlotWidth) {
      return;
    }
    Animated.spring(tabTranslate, {
      toValue: tabIndex * tabSlotWidth + 4,
      useNativeDriver: true,
      stiffness: 220,
      damping: 22,
      mass: 0.7,
    }).start();
  }, [tabIndex, tabSlotWidth, tabTranslate]);

  useEffect(() => {
    Animated.spring(ordersTabTranslate, {
      toValue: ordersTab === 'upcoming' ? 0 : 1,
      useNativeDriver: true,
      stiffness: 220,
      damping: 20,
      mass: 0.7,
    }).start();
  }, [ordersTab, ordersTabTranslate]);

  const revenueBars = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      {label: 'Today', value: metrics.todayEarnings, display: formatPrice(metrics.todayEarnings)},
      {label: 'Week', value: metrics.weeklyRevenue, display: formatPrice(metrics.weeklyRevenue)},
      {label: 'Month', value: metrics.monthlyRevenue, display: formatPrice(metrics.monthlyRevenue)},
    ];
  }, [metrics]);

  const orderBars = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      {label: 'Pending', value: metrics.orderStatus.pending},
      {label: 'Completed', value: metrics.orderStatus.completed},
      {label: 'Cancelled', value: metrics.orderStatus.cancelled},
    ];
  }, [metrics]);

  const maxRevenueValue = Math.max(...revenueBars.map(item => item.value), 1);
  const maxOrderValue = Math.max(...orderBars.map(item => item.value), 1);
  const incomingOrders = useMemo(
    () => restaurantOrders.filter(order => order.status !== 'completed'),
    [restaurantOrders],
  );
  const fulfilledOrders = useMemo(
    () => restaurantOrders.filter(order => order.status === 'completed'),
    [restaurantOrders],
  );
  const activeOrders = ordersTab === 'upcoming' ? incomingOrders : fulfilledOrders;
  const ordersIndicatorTranslateX = ordersTabTranslate.interpolate({
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

  const markOrderCompleted = (orderId: string) => {
    setRestaurantOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: 'completed',
              completedAtEpoch: Date.now(),
            }
          : order,
      ),
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.contentWrap}>
        {activeTab === 'performance' ? (
          <ScrollView
            style={styles.sectionWrap}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => dispatch(loadRestaurantDashboardThunk())}
                tintColor={PALETTE.primary}
                colors={[PALETTE.primary]}
              />
            }
            contentContainerStyle={styles.metricsContent}>
            <View style={styles.metricsHeader}>
              <Text variant="headlineSmall">
                {profile?.storeName ?? 'Restaurant Dashboard'}
              </Text>
              <Text variant="bodyMedium" style={styles.metricsHint}>
                Pull down to refresh performance
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {metrics ? (
              <>
                <View style={styles.kpiGrid}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Today</Text>
                    <Text style={styles.kpiValue}>{formatPrice(metrics.todayEarnings)}</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Orders</Text>
                    <Text style={styles.kpiValue}>{formatCount(metrics.ordersToday)}</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Avg Order</Text>
                    <Text style={styles.kpiValue}>{formatPrice(metrics.averageOrderValue)}</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total</Text>
                    <Text style={styles.kpiValue}>{formatPrice(metrics.totalRevenue)}</Text>
                  </View>
                </View>

                <Card mode="contained" style={styles.chartCard}>
                  <Card.Content style={styles.cardGap}>
                    <Text variant="titleMedium">Revenue Trend</Text>
                    {revenueBars.map(item => (
                      <View key={item.label} style={styles.barRow}>
                        <Text style={styles.barLabel}>{item.label}</Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              styles.revenueBarFill,
                              {width: `${(item.value / maxRevenueValue) * 100}%`},
                            ]}
                          />
                          <Text numberOfLines={1} style={styles.barValueCentered}>
                            {item.display}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>

                <Card mode="contained" style={styles.chartCard}>
                  <Card.Content style={styles.cardGap}>
                    <Text variant="titleMedium">Order Status</Text>
                    {orderBars.map(item => (
                      <View key={item.label} style={styles.barRow}>
                        <Text style={styles.barLabel}>{item.label}</Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              styles.orderBarFill,
                              {width: `${(item.value / maxOrderValue) * 100}%`},
                            ]}
                          />
                          <Text numberOfLines={1} style={styles.barValueCentered}>
                            {formatCount(item.value)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              </>
            ) : null}
          </ScrollView>
        ) : null}

        {activeTab === 'orders' ? (
          <SectionList
            sections={[{title: 'orders', data: activeOrders}]}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.ordersListContent,
              !activeOrders.length && styles.ordersListContentEmpty,
            ]}
            stickySectionHeadersEnabled
            renderSectionHeader={() => (
              <View style={styles.ordersStickyHeaderWrap}>
                <View style={styles.ordersTabRow}>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.ordersTabIndicator,
                      {transform: [{translateX: ordersIndicatorTranslateX}]},
                    ]}
                  />
                  <TouchableOpacity style={styles.ordersTabBtn} onPress={() => setOrdersTab('upcoming')}>
                    <Text style={[styles.ordersTabLabel, ordersTab === 'upcoming' && styles.ordersTabLabelActive]}>
                      Upcoming
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.ordersTabBtn} onPress={() => setOrdersTab('completed')}>
                    <Text style={[styles.ordersTabLabel, ordersTab === 'completed' && styles.ordersTabLabelActive]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            renderItem={({item}) => (
              <Card
                mode="contained"
                style={styles.orderCard}
                onPress={() =>
                  setExpandedOrderIds(prev => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }>
                <Card.Content style={styles.orderContent}>
                  <View style={styles.titleRow}>
                    <Text variant="titleMedium" style={styles.restaurantName}>
                      {item.customerName}
                    </Text>
                    <View
                      style={[
                        styles.statusChip,
                        ordersTab === 'completed' && styles.statusChipDone,
                      ]}>
                      <Text
                        style={[
                          styles.statusChipText,
                          ordersTab === 'completed' && styles.statusChipTextDone,
                        ]}>
                        {ordersTab === 'completed' ? 'Completed' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodySmall" style={styles.metaText}>
                    Order ID: {item.id.toUpperCase()}
                  </Text>
                  <Text variant="bodySmall" style={styles.metaText}>
                    Items: {formatCount(item.items.reduce((sum, entry) => sum + entry.quantity, 0))}
                  </Text>
                  <Text variant="titleSmall" style={styles.amountText}>
                    Total: {formatPrice(item.totalAmount)}
                  </Text>

                  {expandedOrderIds[item.id] ? (
                    <View style={styles.itemsWrap}>
                      <Text variant="bodySmall" style={styles.itemLine}>
                        Ordered: {formatOrderTime(item.orderedAtEpoch)}
                      </Text>
                      {item.completedAtEpoch ? (
                        <Text variant="bodySmall" style={styles.itemLine}>
                          Completed: {formatOrderTime(item.completedAtEpoch)}
                        </Text>
                      ) : null}
                      {item.items.map(orderItem => (
                        <Text key={orderItem.id} variant="bodySmall" style={styles.itemLine}>
                          {orderItem.quantity}x {orderItem.name}
                        </Text>
                      ))}
                      {item.status === 'placed' ? (
                        <Button
                          mode="contained"
                          style={styles.actionBtn}
                          onPress={() => markOrderCompleted(item.id)}>
                          Mark Completed
                        </Button>
                      ) : null}
                    </View>
                  ) : null}
                </Card.Content>
              </Card>
            )}
            renderSectionFooter={() =>
              !activeOrders.length ? (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIllustration}>
                    <View style={styles.emptyPlate}>
                      <MaterialIcons name="circle" size={74} color={PALETTE.surface} />
                      <MaterialIcons
                        name="receipt-long"
                        size={28}
                        color={PALETTE.primary}
                        style={styles.centerDiningIcon}
                      />
                    </View>
                  </View>
                  <RNText style={styles.emptyTitle}>
                    {ordersTab === 'upcoming' ? 'No upcoming orders' : 'No completed orders'}
                  </RNText>
                  <RNText style={styles.emptySubText}>
                    {ordersTab === 'upcoming'
                      ? 'New customer orders will appear here.'
                      : 'Completed orders will appear here once marked.'}
                  </RNText>
                </View>
              ) : null
            }
          />
        ) : null}

        {activeTab === 'menu' ? (
          <View style={styles.sectionWrap}>
            <PrimaryButton
              label="Add Food Item"
              onPress={() => navigation.navigate('RestaurantAddFood')}
            />
            <FlatList
              data={menu}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.menuList}
              renderItem={({item}) => (
                <Card mode="contained" style={styles.menuCard}>
                  <Card.Content style={styles.cardGap}>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text variant="bodySmall">{item.description}</Text>
                    <Text variant="bodySmall">
                      {formatPrice(item.actualPrice)} {'->'} {formatPrice(item.discountedPrice)}
                    </Text>
                    <Text variant="bodySmall">
                      Discount: {formatSavings(item.actualPrice, item.discountedPrice)}
                    </Text>
                    <Text variant="bodySmall">
                      Available From:{' '}
                      {item.availableFrom ? epochToTimeLabel(item.availableFrom) : '-'} | Qty:{' '}
                      {item.quantity ?? 0}
                    </Text>
                  </Card.Content>
                </Card>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyMenuText}>No menu items available yet.</Text>
              }
            />
          </View>
        ) : null}

        {activeTab === 'profile' ? (
          <View style={styles.sectionWrap}>
            <Card mode="contained" style={styles.profileHeaderCard}>
              <Card.Content style={styles.profileHeaderContent}>
                <View style={styles.profileIconWrap}>
                  <MaterialIcons name="storefront" size={20} color={PALETTE.textOnPrimary} />
                </View>
                <Text variant="titleLarge" style={styles.profileHeaderTitle}>
                  {profile?.storeName ?? 'Restaurant Profile'}
                </Text>
                <Text variant="bodySmall" style={styles.profileMetaText}>
                  {profile?.ownerName
                    ? `${profile.ownerName} • ${profile.phone}`
                    : 'Complete your profile details.'}
                </Text>
              </Card.Content>
            </Card>

            <Card mode="contained" style={styles.profileDetailsCard}>
              <Card.Content style={styles.cardGap}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cuisine</Text>
                  <Text style={styles.detailValue}>{profile?.cuisine ?? '-'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{profile?.email ?? '-'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{profile?.address ?? '-'}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Business Hours</Text>
                  <Text style={styles.detailValue}>
                    {profile
                      ? `${epochToTimeLabel(profile.openTimeEpoch)} - ${epochToTimeLabel(
                          profile.closeTimeEpoch,
                        )}`
                      : '-'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
            <PrimaryButton
              label="Edit Profile"
              onPress={() => navigation.navigate('RestaurantProfile')}
            />
          </View>
        ) : null}
      </View>

      <Surface
        style={styles.bottomTabWrap}
        elevation={4}
        onLayout={event => setTabWidth(event.nativeEvent.layout.width)}>
        {indicatorWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bottomTabIndicator,
              {width: indicatorWidth, transform: [{translateX: tabTranslate}]},
            ]}
          />
        ) : null}

        <Pressable style={styles.bottomTabBtn} onPress={() => setActiveTab('performance')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="insights"
              size={16}
              color={
                activeTab === 'performance'
                  ? PALETTE.textOnPrimary
                  : PALETTE.navigation.tabInactive
              }
            />
            <Text style={[styles.bottomTabText, activeTab === 'performance' && styles.bottomTabTextActive]}>
              Metrics
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.bottomTabBtn} onPress={() => setActiveTab('orders')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="receipt-long"
              size={16}
              color={
                activeTab === 'orders'
                  ? PALETTE.textOnPrimary
                  : PALETTE.navigation.tabInactive
              }
            />
            <Text style={[styles.bottomTabText, activeTab === 'orders' && styles.bottomTabTextActive]}>
              Orders
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.bottomTabBtn} onPress={() => setActiveTab('menu')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="restaurant-menu"
              size={16}
              color={
                activeTab === 'menu'
                  ? PALETTE.textOnPrimary
                  : PALETTE.navigation.tabInactive
              }
            />
            <Text style={[styles.bottomTabText, activeTab === 'menu' && styles.bottomTabTextActive]}>
              Menu
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.bottomTabBtn} onPress={() => setActiveTab('profile')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="store"
              size={16}
              color={
                activeTab === 'profile'
                  ? PALETTE.textOnPrimary
                  : PALETTE.navigation.tabInactive
              }
            />
            <Text style={[styles.bottomTabText, activeTab === 'profile' && styles.bottomTabTextActive]}>
              Profile
            </Text>
          </View>
        </Pressable>
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentWrap: {
    flex: 1,
  },
  sectionWrap: {
    flex: 1,
    gap: 10,
  },
  metricsContent: {
    gap: 10,
    paddingBottom: 12,
  },
  metricsHeader: {
    gap: 2,
  },
  metricsHint: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  kpiLabel: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
  },
  kpiValue: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
  },
  barRow: {
    gap: 6,
  },
  barLabel: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
  },
  barTrack: {
    height: 26,
    borderRadius: 999,
    backgroundColor: PALETTE.skeleton,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    minWidth: 44,
    paddingHorizontal: 8,
  },
  revenueBarFill: {
    backgroundColor: PALETTE.primary,
  },
  orderBarFill: {
    backgroundColor: PALETTE.status.success,
  },
  barValueCentered: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  cardGap: {
    gap: 6,
  },
  ordersListContent: {
    paddingBottom: 12,
  },
  ordersListContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  ordersStickyHeaderWrap: {
    backgroundColor: PALETTE.background,
    paddingBottom: 8,
  },
  ordersTabRow: {
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
  ordersTabBtn: {
    width: 148,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ordersTabIndicator: {
    position: 'absolute',
    width: 148,
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 10,
    backgroundColor: PALETTE.primary,
    zIndex: 1,
  },
  ordersTabLabel: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Bold',
  },
  ordersTabLabelActive: {
    color: PALETTE.textOnPrimary,
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
  amountText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
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
  actionBtn: {
    marginTop: 8,
    borderRadius: 10,
  },
  emptyWrap: {
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
  profileHeaderCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
  },
  profileHeaderContent: {
    alignItems: 'center',
    gap: 6,
  },
  profileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.primary,
  },
  profileHeaderTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  profileMetaText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
  profileDetailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    color: PALETTE.textMuted,
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
  },
  detailValue: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  detailDivider: {
    height: 1,
    backgroundColor: PALETTE.lightBorder,
  },
  menuList: {
    paddingBottom: 12,
    gap: 10,
  },
  menuCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
  },
  emptyMenuText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
  bottomTabWrap: {
    flexDirection: 'row',
    backgroundColor: PALETTE.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  bottomTabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 12,
    backgroundColor: PALETTE.primary,
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    zIndex: 2,
  },
  bottomTabItem: {
    alignItems: 'center',
    gap: 2,
  },
  bottomTabText: {
    color: PALETTE.navigation.tabInactive,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  bottomTabTextActive: {
    color: PALETTE.textOnPrimary,
  },
  logoutBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.textOnPrimary,
    backgroundColor: 'transparent',
  },
});
