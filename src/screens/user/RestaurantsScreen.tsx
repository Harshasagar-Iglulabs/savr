import React, {useEffect, useMemo, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Modal, Portal, Surface, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {LocationSearch} from '../../components/common/LocationSearch';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  dismissRatingPrompt,
  fetchNearbyRestaurantsThunk,
  setUserLocation,
  submitOrderRating,
} from '../../store/slices/userSlice';
import {GOOGLE_PLACES_API_KEY} from '../../utils/constants';
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
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState<LandingTab>(
    route.params?.tab === 'orders' ? 'orders' : 'explore',
  );
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [bottomTabWidth, setBottomTabWidth] = useState(0);
  const bottomTabTranslate = React.useRef(new Animated.Value(4)).current;
  const hasSelectedLocation =
    locationGranted || (latitude !== null && longitude !== null);
  const activeTabIndex = activeTab === 'explore' ? 0 : activeTab === 'orders' ? 1 : 2;
  const tabSlotWidth = bottomTabWidth > 0 ? bottomTabWidth / 3 : 0;
  const activeIndicatorWidth = tabSlotWidth > 0 ? tabSlotWidth - 8 : 0;

  useEffect(() => {
    if (!tabSlotWidth) {
      return;
    }

    Animated.spring(bottomTabTranslate, {
      toValue: activeTabIndex * tabSlotWidth + 4,
      useNativeDriver: true,
      stiffness: 220,
      damping: 22,
      mass: 0.7,
    }).start();
  }, [activeTabIndex, bottomTabTranslate, tabSlotWidth]);

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

    setLocationPromptDismissed(false);
    setLocationModalVisible(true);
    navigation.setParams({openLocationPicker: undefined});
  }, [navigation, route.params?.openLocationPicker]);

  useEffect(() => {
    if (!hasSelectedLocation && !locationPromptDismissed) {
      setLocationModalVisible(true);
      return;
    }

    if (restaurants.length === 0 && latitude !== null && longitude !== null) {
      dispatch(fetchNearbyRestaurantsThunk({latitude, longitude}));
    }
  }, [
    dispatch,
    hasSelectedLocation,
    latitude,
    locationPromptDismissed,
    longitude,
    restaurants.length,
  ]);

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
    setLocationPromptDismissed(false);
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
    setLocationPromptDismissed(false);
    await dispatch(
      fetchNearbyRestaurantsThunk({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    );
    setLocationModalVisible(false);
  };

  const applySelectedPlace = async (place: {
    label: string;
    latitude: number;
    longitude: number;
  }) => {
    setSearchLocation(place.label);
    dispatch(setUserLocation(place));
    setLocationPromptDismissed(false);
    await dispatch(
      fetchNearbyRestaurantsThunk({
        latitude: place.latitude,
        longitude: place.longitude,
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

      <Surface
        style={styles.bottomTabWrap}
        elevation={4}
        onLayout={event => setBottomTabWidth(event.nativeEvent.layout.width)}>
        {activeIndicatorWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bottomTabIndicator,
              {
                width: activeIndicatorWidth,
                transform: [{translateX: bottomTabTranslate}],
              },
            ]}
          />
        ) : null}
        <Pressable
          style={styles.bottomTabBtn}
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
          style={styles.bottomTabBtn}
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
          style={styles.bottomTabBtn}
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
          onDismiss={() => {
            setLocationModalVisible(false);
            setLocationPromptDismissed(true);
          }}
          dismissable
          dismissableBackButton
          contentContainerStyle={styles.modalWrap}>
          <TouchableWithoutFeedback
            onPress={() => {
              setLocationModalVisible(false);
              setLocationPromptDismissed(true);
            }}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <Surface style={styles.modalCard} elevation={4}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeaderRow}>
                    <View style={styles.modalIconWrap}>
                      <MaterialIcons name="place" size={18} color={PALETTE.primary} />
                    </View>
                    <View style={styles.modalHeaderTextWrap}>
                      <Text variant="headlineSmall" style={styles.modalTitle}>
                        Choose Location
                      </Text>
                      <Text variant="bodyMedium" style={styles.modalSubtitle}>
                        Search, use current location, or pick from recent locations.
                      </Text>
                    </View>
                  </View>

                  <LocationSearch
                    value={searchLocation}
                    onChangeText={setSearchLocation}
                    onPlaceSelected={applySelectedPlace}
                    apiKey={GOOGLE_PLACES_API_KEY}
                    placeholder="Search location"
                  />

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={useCurrentLocation}
                      disabled={loadingNearby}
                      style={styles.modalButton}
                      labelStyle={styles.modalButtonLabel}>
                      Use Current Location
                    </Button>
                    <Button
                      mode="contained"
                      onPress={applySearchedLocation}
                      disabled={loadingNearby || !searchLocation.trim()}
                      style={styles.modalButton}
                      labelStyle={styles.modalButtonLabel}>
                      Search & Apply
                    </Button>
                  </View>

                  <View style={styles.recentWrap}>
                    <Text variant="titleSmall" style={styles.recentTitle}>
                      Recent Locations
                    </Text>
                    {recentLocations.map(location => (
                      <Button
                        key={location.label}
                        mode="outlined"
                        icon={({size, color}) => (
                          <MaterialIcons name="history" size={size} color={color} />
                        )}
                        style={styles.recentLocationBtn}
                        contentStyle={styles.recentLocationBtnContent}
                        labelStyle={styles.recentLocationBtnLabel}
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
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
  },
  bottomTabTextActive: {
    color: PALETTE.textOnPrimary,
  },
  modalWrap: {
    marginHorizontal: 14,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 14,
    backgroundColor: PALETTE.modal,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: PALETTE.divider,
    marginBottom: 2,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  modalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.buttons.secondary.pressedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  modalHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
  },
  modalSubtitle: {
    color: PALETTE.textSecondary,
  },
  modalButton: {
    borderRadius: 10,
  },
  modalButtonLabel: {
    fontFamily: 'Nunito-Bold',
  },
  modalButtons: {
    gap: 8,
  },
  recentWrap: {
    gap: 8,
    marginTop: 2,
  },
  recentTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  recentLocationBtn: {
    borderRadius: 10,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.surface,
  },
  recentLocationBtnContent: {
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  recentLocationBtnLabel: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Regular',
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
