import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
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
        <Text style={styles.ratingText}>⭐ {restaurant.averageRating.toFixed(1)}</Text>
      </View>
      <Card.Content>
        <Text variant="titleMedium">{restaurant.name}</Text>
        <Text variant="bodySmall">{restaurant.cuisine}</Text>
        <View style={styles.metaRow}>
          <Text variant="bodySmall">{restaurant.distanceKm.toFixed(1)} km away</Text>
          <Text variant="bodySmall">ETA {restaurant.etaMin} min</Text>
          <Text variant="bodySmall">⭐ {restaurant.averageRating.toFixed(1)}</Text>
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
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 125,
    backgroundColor: '#e5e7eb',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    color: '#027146',
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
