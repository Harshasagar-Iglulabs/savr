import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SkeletonBlock} from '../common/SkeletonBlock';
import {PALETTE} from '../../constants/palette';
import type {Restaurant} from '../../types';

type Props = {
  restaurant: Restaurant;
  onPress: () => void;
};

export function RestaurantCard({restaurant, onPress}: Props) {
  return (
    <Card mode="contained" onPress={onPress} style={styles.card}>
      <Image
        source={{
          uri:
            restaurant.imageUrl ??
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop',
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.ratingBadge}>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star-border" size={13} color={PALETTE.accent} />
          <Text style={styles.ratingText}>{restaurant.averageRating.toFixed(1)}</Text>
        </View>
      </View>
      <Card.Content>
        <Text variant="titleMedium">{restaurant.name}</Text>
        <Text variant="bodySmall">{restaurant.cuisine}</Text>
        <View style={styles.metaRow}>
          <Text variant="bodySmall">{restaurant.distanceKm.toFixed(1)} km away</Text>
          <View style={styles.metaRating}>
            <MaterialIcons name="star-border" size={12} color={PALETTE.accent} />
            <Text variant="bodySmall">{restaurant.averageRating.toFixed(1)}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <Card mode="contained" style={styles.card}>
      <SkeletonBlock style={styles.image} />
      <Card.Content>
        <SkeletonBlock style={styles.skeletonTitle} />
        <SkeletonBlock style={styles.skeletonSub} />
        <View style={styles.skeletonMetaRow}>
          <SkeletonBlock style={styles.skeletonMetaChip} />
          <SkeletonBlock style={styles.skeletonMetaChip} />
          <SkeletonBlock style={styles.skeletonMetaChip} />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    shadowColor: PALETTE.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 125,
    backgroundColor: PALETTE.skeleton,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: PALETTE.surface,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  skeletonTitle: {
    height: 18,
    width: '62%',
    marginBottom: 8,
  },
  skeletonSub: {
    height: 14,
    width: '42%',
    marginBottom: 10,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonMetaChip: {
    height: 14,
    width: 72,
  },
});
