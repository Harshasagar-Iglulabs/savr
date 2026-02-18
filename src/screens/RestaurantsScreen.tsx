import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Animated, FlatList, Pressable, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Button,
  Card,
  Chip,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {RestaurantCard} from '../components/cards/RestaurantCard';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  dismissRatingPrompt,
  fetchNearbyRestaurantsThunk,
  setUserLocation,
  submitOrderRating,
  updateOrderStatus,
} from '../store/slices/userSlice';
import {formatPrice} from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;
type LandingTab = 'explore' | 'orders';

const recentLocations = [
  {label: 'Indiranagar, Bengaluru', latitude: 12.9784, longitude: 77.6408},
  {label: 'Koramangala, Bengaluru', latitude: 12.9352, longitude: 77.6245},
  {label: 'HSR Layout, Bengaluru', latitude: 12.9116, longitude: 77.6474},
];

function pseudoCoordsFromQuery(query: string): {latitude: number; longitude: number} {
  const seed = query
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const latitude = 12.9 + (seed % 100) / 1000;
  const longitude = 77.5 + (seed % 120) / 1000;
  return {latitude, longitude};
}

export function RestaurantsScreen({navigation, route}: Props) {
  const dispatch = useAppDispatch();
  const {
    restaurants,
    locationGranted,
    locationLabel,
    latitude,
    longitude,
    loadingNearby,
    orders,
    pendingRatingOrderId,
  } = useAppSelector(state => state.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState<LandingTab>(
    route.params?.tab === 'orders' ? 'orders' : 'explore',
  );
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  const heroPulse = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (route.params?.tab === 'orders') {
      setActiveTab('orders');
    }
  }, [route.params?.tab]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: locationGranted ? locationLabel : 'Set Location',
      headerTitleAlign: 'center',
      headerTitle: () => (
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={styles.headerTitle}>{locationGranted ? locationLabel : 'Set Location'}</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Button compact mode="text" textColor="#f9f9f9" onPress={() => setModalVisible(true)}>
          Change
        </Button>
      ),
    });
  }, [locationGranted, locationLabel, navigation]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.02,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(heroPulse, {
          toValue: 0.98,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [heroPulse]);

  useEffect(() => {
    if (!locationGranted) {
      setModalVisible(true);
      return;
    }

    if (locationGranted && restaurants.length === 0 && latitude !== null && longitude !== null) {
      dispatch(fetchNearbyRestaurantsThunk({latitude, longitude}));
    }
  }, [dispatch, latitude, locationGranted, longitude, restaurants.length]);

  useEffect(() => {
    if (pendingRatingOrderId) {
      setRatingModalVisible(true);
    }
  }, [pendingRatingOrderId]);

  const pendingOrderForRating = useMemo(
    () => orders.find(order => order.id === pendingRatingOrderId) ?? null,
    [orders, pendingRatingOrderId],
  );

  const useCurrentLocation = async () => {
    const current = {
      label: 'Current Location',
      latitude: 12.9716,
      longitude: 77.5946,
    };

    dispatch(setUserLocation(current));
    await dispatch(
      fetchNearbyRestaurantsThunk({
        latitude: current.latitude,
        longitude: current.longitude,
      }),
    );
    setModalVisible(false);
  };

  const applySearchedLocation = async () => {
    if (!searchLocation.trim()) {
      return;
    }

    const coords = pseudoCoordsFromQuery(searchLocation.trim());
    dispatch(
      setUserLocation({
        label: searchLocation.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    );
    await dispatch(
      fetchNearbyRestaurantsThunk({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    );
    setModalVisible(false);
  };

  const renderExploreTab = () => (
    <FlatList
      data={restaurants}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({item, index}) => (
        <FadeSlideIn delay={index * 80} distance={18}>
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('Foods', {restaurantId: item.id})}
          />
        </FadeSlideIn>
      )}
    />
  );

  const renderOrdersTab = () => (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Card mode="outlined" style={styles.emptyCard}>
          <Card.Content>
            <Text variant="titleMedium">No orders yet</Text>
            <Text variant="bodySmall">Place an order from Explore tab to track it here.</Text>
          </Card.Content>
        </Card>
      }
      renderItem={({item}) => (
        <Card mode="contained" style={styles.orderCard}>
          <Card.Content style={styles.orderContent}>
            <Text variant="titleMedium">{item.restaurantName}</Text>
            <Text variant="bodySmall">Order Code: {item.id.slice(-5).toUpperCase()}</Text>
            <Text variant="bodySmall">Amount: {formatPrice(item.totalAmount)}</Text>
            <Text variant="bodySmall">Status: {item.status.toUpperCase()}</Text>
            {item.status === 'placed' ? (
              <Button
                mode="contained-tonal"
                onPress={() => dispatch(updateOrderStatus({orderId: item.id, status: 'preparing'}))}>
                Mark Preparing (Demo)
              </Button>
            ) : null}
            {item.status === 'preparing' ? (
              <Button
                mode="contained"
                onPress={() => dispatch(updateOrderStatus({orderId: item.id, status: 'completed'}))}>
                Mark Completed (Demo)
              </Button>
            ) : null}
          </Card.Content>
        </Card>
      )}
    />
  );

  return (
    <ScreenContainer>
      <FadeSlideIn>
        <Animated.View style={[styles.heroWrap, {transform: [{scale: heroPulse}]}]}>
          <Text variant="bodyMedium" style={styles.locationText}>
            Current Location
          </Text>
          <Text variant="headlineSmall" style={styles.heroTitle}>
            {locationGranted ? locationLabel : 'Set your location'}
          </Text>

          <View style={styles.searchRow}>
            <Pressable style={styles.searchBox} onPress={() => setModalVisible(true)}>
              <Text style={styles.searchPlaceholder}>Find food or restaurant...</Text>
            </Pressable>
            <Pressable style={styles.filterBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.filterText}>⚙</Text>
            </Pressable>
          </View>

          <View style={styles.categoryRow}>
            <Chip style={styles.categoryChip} textStyle={styles.categoryText}>Meals</Chip>
            <Chip style={styles.categoryChip} textStyle={styles.categoryText}>Bakery</Chip>
            <Chip style={styles.categoryChip} textStyle={styles.categoryText}>Pantry</Chip>
          </View>

          <View style={styles.saleCard}>
            <Text style={styles.saleTitle}>Launch Sale</Text>
            <Text style={styles.saleSub}>20% OFF</Text>
          </View>
        </Animated.View>
      </FadeSlideIn>

      <View style={styles.tabSwitchWrap}>
        <Pressable
          style={[styles.topTabBtn, activeTab === 'explore' && styles.topTabActive]}
          onPress={() => setActiveTab('explore')}>
          <Text style={[styles.topTabText, activeTab === 'explore' && styles.topTabTextActive]}>Near You</Text>
        </Pressable>
        <Pressable
          style={[styles.topTabBtn, activeTab === 'orders' && styles.topTabActive]}
          onPress={() => setActiveTab('orders')}>
          <Text style={[styles.topTabText, activeTab === 'orders' && styles.topTabTextActive]}>Orders</Text>
        </Pressable>
      </View>

      <View style={styles.contentWrap}>{activeTab === 'explore' ? renderExploreTab() : renderOrdersTab()}</View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => locationGranted && setModalVisible(false)}
          contentContainerStyle={styles.modalWrap}>
          <Surface style={styles.modalCard} elevation={4}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Choose Location
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Search, use current location, or pick from recent locations.
            </Text>

            <TextInput
              mode="outlined"
              label="Search location"
              placeholder="Koramangala, Bengaluru"
              value={searchLocation}
              onChangeText={setSearchLocation}
            />

            <View style={styles.modalButtons}>
              <Button mode="contained-tonal" onPress={useCurrentLocation} disabled={loadingNearby}>
                Use Current Location
              </Button>
              <Button mode="contained" onPress={applySearchedLocation} disabled={loadingNearby || !searchLocation.trim()}>
                Search & Apply
              </Button>
            </View>

            <View style={styles.recentWrap}>
              <Text variant="titleSmall">Recent Locations</Text>
              {recentLocations.map(location => (
                <Button
                  key={location.label}
                  mode="text"
                  onPress={async () => {
                    dispatch(setUserLocation(location));
                    await dispatch(
                      fetchNearbyRestaurantsThunk({
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }),
                    );
                    setModalVisible(false);
                  }}>
                  {location.label}
                </Button>
              ))}
            </View>
          </Surface>
        </Modal>

        <Modal
          visible={ratingModalVisible}
          onDismiss={() => setRatingModalVisible(false)}
          contentContainerStyle={styles.ratingModalWrap}>
          <Surface style={styles.ratingCard} elevation={4}>
            <Text variant="titleLarge">Rate your pickup order</Text>
            <Text variant="bodySmall">{pendingOrderForRating?.restaurantName ?? 'Restaurant'}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(score => (
                <Button
                  key={score}
                  mode="contained-tonal"
                  onPress={() => {
                    if (pendingOrderForRating) {
                      dispatch(
                        submitOrderRating({
                          orderId: pendingOrderForRating.id,
                          rating: score,
                        }),
                      );
                    }
                    setRatingModalVisible(false);
                  }}>
                  {score}★
                </Button>
              ))}
            </View>
            <Button
              onPress={() => {
                dispatch(dismissRatingPrompt());
                setRatingModalVisible(false);
              }}>
              Skip for now
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: '#f9f9f9',
    fontFamily: 'Nunito-Bold',
    maxWidth: 210,
  },
  heroWrap: {
    backgroundColor: '#027146',
    borderRadius: 22,
    padding: 14,
    gap: 10,
  },
  locationText: {
    color: '#d1fae5',
  },
  heroTitle: {
    color: '#ffffff',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchPlaceholder: {
    color: '#94a3b8',
    fontFamily: 'Nunito-Regular',
  },
  filterBtn: {
    width: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    color: '#027146',
    fontSize: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#0f5132',
  },
  categoryText: {
    color: '#ffffff',
  },
  saleCard: {
    backgroundColor: '#0b5e3c',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saleTitle: {
    color: '#d1fae5',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  saleSub: {
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
  },
  tabSwitchWrap: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  topTabBtn: {
    flex: 1,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  topTabActive: {
    backgroundColor: '#027146',
  },
  topTabText: {
    color: '#0f5132',
    fontFamily: 'Nunito-Bold',
  },
  topTabTextActive: {
    color: '#ffffff',
  },
  contentWrap: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  emptyCard: {
    marginTop: 12,
  },
  orderCard: {
    marginBottom: 10,
    borderRadius: 16,
  },
  orderContent: {
    gap: 6,
  },
  modalWrap: {
    marginHorizontal: 14,
    justifyContent: 'flex-end',
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    color: '#027146',
  },
  modalSubtitle: {
    color: '#4b5563',
  },
  modalButtons: {
    gap: 8,
  },
  recentWrap: {
    gap: 4,
  },
  ratingModalWrap: {
    marginHorizontal: 24,
    justifyContent: 'center',
  },
  ratingCard: {
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
