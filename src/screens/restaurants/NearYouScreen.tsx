import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Button,
  Card,
  IconButton,
  Modal,
  Portal,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from '../../components/cards/RestaurantCard';
import {PALETTE} from '../../constants/palette';
import {useAppSelector} from '../../store/hooks';
import type {Restaurant} from '../../types';

const DEFAULT_MAX_DISTANCE_KM = 10;
const DEFAULT_MIN_RATING = 0;

type SortBy = 'distance' | 'rating';
type RestaurantListItem = string | Restaurant;

type Props = {
  onSelectRestaurant: (restaurantId: string) => void;
  onOpenCart: () => void;
};

export function NearYouScreen({onSelectRestaurant, onOpenCart}: Props) {
  const {restaurants, loadingNearby, cart} = useAppSelector(state => state.user);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('distance');
  const [filterVisible, setFilterVisible] = useState(false);

  const [maxDistanceKm, setMaxDistanceKm] = useState(DEFAULT_MAX_DISTANCE_KM);
  const [minRating, setMinRating] = useState(DEFAULT_MIN_RATING);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRestaurants = useMemo(() => {
    const result = restaurants
      .filter(item => {
        if (item.distanceKm > maxDistanceKm) {
          return false;
        }
        if (item.averageRating < minRating) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = `${item.name} ${item.cuisine}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'rating') {
          return b.averageRating - a.averageRating;
        }
        return a.distanceKm - b.distanceKm;
      });

    return result;
  }, [
    restaurants,
    maxDistanceKm,
    minRating,
    normalizedQuery,
    sortBy,
  ]);
  const listData: RestaurantListItem[] = loadingNearby
    ? Array.from({length: 6}, (_, i) => `s-${i}`)
    : filteredRestaurants;

  return (
    <View style={styles.container}>
      <Surface style={styles.searchCard} elevation={1}>
        <View style={styles.searchRow}>
          <TextInput
            mode="outlined"
            label="Search"
            placeholder="Restaurant or cuisine"
            value={query}
            onChangeText={setQuery}
            left={
              <TextInput.Icon
                icon={({size, color}) => (
                  <MaterialIcons name="search" size={size} color={color} />
                )}
              />
            }
            style={styles.searchInput}
          />
          <IconButton
            mode="outlined"
            icon={({size, color}) => <MaterialIcons name="tune" size={size} color={color} />}
            iconColor={PALETTE.buttons.secondary.text}
            containerColor={PALETTE.buttons.secondary.background}
            style={styles.filterIconBtn}
            onPress={() => setFilterVisible(true)}
            accessibilityLabel="Open sort and filter"
          />
        </View>
      </Surface>

      <FlatList<RestaurantListItem>
        data={listData}
        keyExtractor={item => (typeof item === 'string' ? item : item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Card mode="outlined" style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium">No restaurants found</Text>
              <Text variant="bodySmall">
                Try changing search, location, or filter values.
              </Text>
            </Card.Content>
          </Card>
        }
        renderItem={({item}) =>
          typeof item === 'string' ? (
            <RestaurantCardSkeleton />
          ) : (
            <RestaurantCard
              restaurant={item}
              onPress={() => onSelectRestaurant(item.id)}
            />
          )
        }
      />

      {cartCount > 0 ? (
        <Pressable style={styles.floatingCartBtn} onPress={onOpenCart}>
          <MaterialIcons name="shopping-cart" size={20} color={PALETTE.textInverse} />
          <Text style={styles.floatingCartText}>Cart ({cartCount})</Text>
        </Pressable>
      ) : null}

      <Portal>
        <Modal
          visible={filterVisible}
          onDismiss={() => setFilterVisible(false)}
          dismissable
          dismissableBackButton
          contentContainerStyle={styles.modalWrap}>
          <Surface style={styles.modalCard} elevation={3}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Sort & Filter
            </Text>
            <Text variant="bodySmall" style={styles.sectionHint}>
              Tune results for distance and rating.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
              Sort by
            </Text>
            <SegmentedButtons
              value={sortBy}
              onValueChange={value => setSortBy(value as SortBy)}
              buttons={[
                {value: 'distance', label: 'Distance'},
                {value: 'rating', label: 'Rating'},
              ]}
              style={styles.segment}
            />

            <View style={styles.sliderBlock}>
              <View style={styles.sliderHeader}>
                <Text variant="titleSmall">Max distance</Text>
                <Text variant="titleSmall" style={styles.sliderValue}>
                  {maxDistanceKm.toFixed(1)} km
                </Text>
              </View>
              <Slider
                value={maxDistanceKm}
                minimumValue={1}
                maximumValue={20}
                step={0.5}
                minimumTrackTintColor={PALETTE.primary}
                maximumTrackTintColor={PALETTE.divider}
                thumbTintColor={PALETTE.primary}
                onValueChange={setMaxDistanceKm}
              />
            </View>

            <View style={styles.sliderBlock}>
              <View style={styles.sliderHeader}>
                <Text variant="titleSmall">Minimum rating</Text>
                <Text variant="titleSmall" style={styles.sliderValue}>
                  {minRating.toFixed(1)}
                </Text>
              </View>
              <Slider
                value={minRating}
                minimumValue={0}
                maximumValue={5}
                step={0.1}
                minimumTrackTintColor={PALETTE.primary}
                maximumTrackTintColor={PALETTE.divider}
                thumbTintColor={PALETTE.primary}
                onValueChange={setMinRating}
              />
            </View>

            <View style={styles.footerRow}>
              <Button
                mode="text"
                onPress={() => {
                  setSortBy('distance');
                  setMaxDistanceKm(DEFAULT_MAX_DISTANCE_KM);
                  setMinRating(DEFAULT_MIN_RATING);
                }}>
                Reset
              </Button>
              <Button mode="contained" onPress={() => setFilterVisible(false)}>
                Apply
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchCard: {
    borderRadius: 14,
    padding: 8,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: PALETTE.surface,
  },
  filterIconBtn: {
    borderColor: PALETTE.buttons.secondary.border,
    borderRadius: 12,
    margin: 0,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  emptyCard: {
    marginTop: 10,
    borderColor: PALETTE.divider,
  },
  modalWrap: {
    marginHorizontal: 14,
    justifyContent: 'flex-end',
    flex: 1,
  },
  modalCard: {
    backgroundColor: PALETTE.modal,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    gap: 12,
  },
  modalTitle: {
    color: PALETTE.textPrimary,
  },
  sectionHint: {
    color: PALETTE.textSecondary,
  },
  sectionTitle: {
    color: PALETTE.textPrimary,
  },
  segment: {
    marginBottom: 2,
  },
  sliderBlock: {
    gap: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  floatingCartBtn: {
    position: 'absolute',
    right: 4,
    bottom: 12,
    zIndex: 4,
    backgroundColor: PALETTE.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: PALETTE.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCartText: {
    color: PALETTE.textInverse,
    fontFamily: 'Nunito-Bold',
  },
});
