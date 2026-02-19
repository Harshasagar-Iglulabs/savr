import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Modal, Portal, Surface, Text, TextInput} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {PALETTE} from '../constants/palette';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  dismissRatingPrompt,
  fetchNearbyRestaurantsThunk,
  setUserLocation,
  submitOrderRating,
} from '../store/slices/userSlice';
import {NearYouScreen} from './restaurants/NearYouScreen';
import {OrdersScreen} from './restaurants/OrdersScreen';
import {ProfileTabScreen} from './restaurants/ProfileTabScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;
type LandingTab = 'explore' | 'orders' | 'profile';

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
    latitude,
    longitude,
    loadingNearby,
    orders,
    pendingRatingOrderId,
  } = useAppSelector(state => state.user);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState<LandingTab>(
    route.params?.tab === 'orders' ? 'orders' : 'explore',
  );
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.tab === 'orders') {
      setActiveTab('orders');
      return;
    }

    if (route.params?.tab === 'explore') {
      setActiveTab('explore');
    }
  }, [route.params?.tab]);

  useEffect(() => {
    if (!route.params?.openLocationPicker) {
      return;
    }

    setLocationModalVisible(true);
    navigation.setParams({openLocationPicker: undefined});
  }, [navigation, route.params?.openLocationPicker]);

  useEffect(() => {
    if (!locationGranted) {
      setLocationModalVisible(true);
      return;
    }

    if (restaurants.length === 0 && latitude !== null && longitude !== null) {
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
    setLocationModalVisible(false);
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
    setLocationModalVisible(false);
  };

  return (
    <ScreenContainer>
      <View style={styles.contentWrap}>
        {activeTab === 'explore' ? (
          <NearYouScreen
            onSelectRestaurant={restaurantId => navigation.navigate('Foods', {restaurantId})}
            onOpenCart={() => navigation.navigate('Cart')}
          />
        ) : null}

        {activeTab === 'orders' ? <OrdersScreen /> : null}

        {activeTab === 'profile' ? <ProfileTabScreen /> : null}
      </View>

      <Surface style={styles.bottomTabWrap} elevation={4}>
        <Pressable
          style={[styles.bottomTabBtn, activeTab === 'explore' && styles.bottomTabBtnActive]}
          onPress={() => setActiveTab('explore')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="location-on"
              size={16}
              color={
                activeTab === 'explore'
                  ? PALETTE.textOnPrimary
                  : PALETTE.navigation.tabInactive
              }
            />
            <Text style={[styles.bottomTabText, activeTab === 'explore' && styles.bottomTabTextActive]}>
              Near You
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.bottomTabBtn, activeTab === 'orders' && styles.bottomTabBtnActive]}
          onPress={() => setActiveTab('orders')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="shopping-bag"
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

        <Pressable
          style={[styles.bottomTabBtn, activeTab === 'profile' && styles.bottomTabBtnActive]}
          onPress={() => setActiveTab('profile')}>
          <View style={styles.bottomTabItem}>
            <MaterialIcons
              name="person-outline"
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

      <Portal>
        <Modal
          visible={locationModalVisible}
          onDismiss={() => locationGranted && setLocationModalVisible(false)}
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
              <Button
                mode="contained"
                onPress={applySearchedLocation}
                disabled={loadingNearby || !searchLocation.trim()}>
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
                    setLocationModalVisible(false);
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
                  icon={({size, color}) => (
                    <MaterialIcons name="star-border" size={size} color={color} />
                  )}
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
                  {score}
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
  contentWrap: {
    flex: 1,
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
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  bottomTabBtnActive: {
    backgroundColor: PALETTE.primary,
    borderWidth: 1,
    borderColor: PALETTE.primary,
  },
  bottomTabItem: {
    alignItems: 'center',
    gap: 2,
  },
  bottomTabText: {
    color: PALETTE.navigation.tabInactive,
    fontFamily: 'Nunito-Bold',
  },
  bottomTabTextActive: {
    color: PALETTE.textOnPrimary,
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
    backgroundColor: PALETTE.modal,
  },
  modalTitle: {
    color: PALETTE.primary,
  },
  modalSubtitle: {
    color: PALETTE.textSecondary,
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
