import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {PALETTE} from '../../constants/palette';
import type {FoodItem} from '../../types';
import {formatPrice, formatSavings} from '../../utils/format';
import {SkeletonBlock} from '../common/SkeletonBlock';

type Props = {
  food: FoodItem;
  onPress?: () => void;
  onAddToCart?: () => void;
  cartQuantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
};

export function FoodCard({
  food,
  onPress,
  onAddToCart,
  cartQuantity = 0,
  onIncrease,
  onDecrease,
}: Props) {
  return (
    <Card mode="contained" style={styles.card} onPress={onPress}>
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

        {cartQuantity <= 0 && onAddToCart ? (
          <Button mode="contained" style={styles.addBtn} onPress={onAddToCart}>
            Add to Cart
          </Button>
        ) : null}

        {cartQuantity > 0 ? (
          <View style={styles.orderRow}>
            <View style={styles.counterWrap}>
              <Button
                mode="contained"
                compact
                buttonColor={PALETTE.primary}
                textColor={PALETTE.textInverse}
                style={styles.qtyBtn}
                contentStyle={styles.qtyBtnContent}
                labelStyle={styles.qtyBtnLabel}
                onPress={onDecrease}>
                -
              </Button>
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              <Button
                mode="contained"
                compact
                buttonColor={PALETTE.primary}
                textColor={PALETTE.textInverse}
                style={styles.qtyBtn}
                contentStyle={styles.qtyBtnContent}
                labelStyle={styles.qtyBtnLabel}
                onPress={onIncrease}>
                +
              </Button>
            </View>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export function FoodCardSkeleton() {
  return (
    <Card mode="contained" style={styles.card}>
      <SkeletonBlock style={styles.image} />
      <Card.Content>
        <SkeletonBlock style={styles.skeletonTitle} />
        <SkeletonBlock style={styles.skeletonSub} />
        <View style={styles.skeletonPriceRow}>
          <SkeletonBlock style={styles.skeletonPriceOld} />
          <SkeletonBlock style={styles.skeletonPriceNew} />
        </View>
        <SkeletonBlock style={styles.skeletonSave} />
        <SkeletonBlock style={styles.skeletonBtn} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 14,
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
    height: 170,
    backgroundColor: PALETTE.skeleton,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actualPrice: {
    textDecorationLine: 'line-through',
    color: PALETTE.textMuted,
  },
  discountText: {
    marginTop: 4,
    color: PALETTE.primary,
    fontWeight: '600',
  },
  addBtn: {
    marginTop: 8,
  },
  orderRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  counterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  qtyBtn: {
    minWidth: 74,
    borderRadius: 10,
  },
  qtyBtnContent: {
    height: 46,
  },
  qtyBtnLabel: {
    fontSize: 26,
    lineHeight: 28,
    marginVertical: 0,
  },
  qtyText: {
    minWidth: 34,
    textAlign: 'center',
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  skeletonTitle: {
    marginTop: 2,
    height: 18,
    width: '58%',
    marginBottom: 8,
  },
  skeletonSub: {
    height: 14,
    width: '74%',
    marginBottom: 8,
  },
  skeletonPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  skeletonPriceOld: {
    height: 13,
    width: 56,
  },
  skeletonPriceNew: {
    height: 16,
    width: 74,
  },
  skeletonSave: {
    height: 14,
    width: 110,
    marginBottom: 10,
  },
  skeletonBtn: {
    height: 36,
    borderRadius: 10,
    width: '100%',
  },
});
