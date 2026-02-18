import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import type {FoodItem} from '../../types';
import {formatPrice, formatSavings} from '../../utils/format';

type Props = {
  food: FoodItem;
  onAddToCart?: () => void;
};

export function FoodCard({food, onAddToCart}: Props) {
  return (
    <Card mode="contained" style={styles.card}>
      <Image
        source={{
          uri:
            food.imageUrl ??
            'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&q=80&auto=format&fit=crop',
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <Card.Content>
        <Text variant="titleMedium">{food.name}</Text>
        <Text variant="bodySmall">{food.description}</Text>
        <View style={styles.priceRow}>
          <Text variant="bodySmall" style={styles.actualPrice}>
            {formatPrice(food.actualPrice)}
          </Text>
          <Text variant="titleSmall">{formatPrice(food.discountedPrice)}</Text>
        </View>
        <Text variant="bodySmall" style={styles.discountText}>
          Save {formatSavings(food.actualPrice, food.discountedPrice)}
        </Text>

        {onAddToCart ? (
          <Button mode="contained" style={styles.addBtn} onPress={onAddToCart}>
            Add to Cart
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actualPrice: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  discountText: {
    marginTop: 4,
    color: '#027146',
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 8,
  },
});
