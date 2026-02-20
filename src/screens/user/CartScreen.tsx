import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Surface, Text} from 'react-native-paper';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  changeCartItemQuantity,
  placeCartOrder,
} from '../../store/slices/userSlice';
import {formatPrice} from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {cart, restaurants} = useAppSelector(state => state.user);

  const foodActualPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const restaurant of restaurants) {
      for (const food of restaurant.foods) {
        map.set(`${restaurant.id}-${food.id}`, food.actualPrice);
      }
    }
    return map;
  }, [restaurants]);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderAmount = cart.reduce((sum, item) => {
    const actualPrice = foodActualPriceMap.get(`${item.restaurantId}-${item.foodId}`) ?? item.unitPrice;
    return sum + actualPrice * item.quantity;
  }, 0);
  const totalSaved = Math.max(orderAmount - total, 0);
  const groupedCart = useMemo(() => {
    const map = new Map<
      string,
      {
        restaurantId: string;
        restaurantName: string;
        items: typeof cart;
        subtotal: number;
        orderAmount: number;
        savedAmount: number;
      }
    >();

    for (const item of cart) {
      const key = item.restaurantId;
      if (!map.has(key)) {
        map.set(key, {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          items: [],
          subtotal: 0,
          orderAmount: 0,
          savedAmount: 0,
        });
      }
      const entry = map.get(key);
      if (entry) {
        const actualPrice =
          foodActualPriceMap.get(`${item.restaurantId}-${item.foodId}`) ?? item.unitPrice;
        const actualTotal = actualPrice * item.quantity;
        const discountedTotal = item.unitPrice * item.quantity;
        entry.items.push(item);
        entry.subtotal += discountedTotal;
        entry.orderAmount += actualTotal;
        entry.savedAmount += Math.max(actualTotal - discountedTotal, 0);
      }
    }

    return Array.from(map.values());
  }, [cart, foodActualPriceMap]);

  return (
    <ScreenContainer>
      <FlatList
        data={groupedCart}
        keyExtractor={item => item.restaurantId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text variant="bodyMedium">Your cart is empty.</Text>}
        renderItem={({item: group}) => (
          <Card mode="contained" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.restaurantHeader}>
                <Text variant="titleMedium" style={styles.restaurantName}>
                  {group.restaurantName}
                </Text>
                {group.savedAmount > 0 ? (
                  <View style={styles.savedChip}>
                    <Text style={styles.savedChipText}>Save {formatPrice(group.savedAmount)}</Text>
                  </View>
                ) : null}
              </View>
              {group.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemMeta}>
                    <Text variant="titleSmall" style={styles.itemName}>{item.name}</Text>
                    <Text variant="bodySmall" style={styles.itemPrice}>
                      {formatPrice(item.unitPrice)} each
                    </Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <Button
                      mode="contained"
                      compact
                      buttonColor={PALETTE.primary}
                      textColor={PALETTE.textInverse}
                      style={styles.qtyBtn}
                      contentStyle={styles.qtyBtnContent}
                      labelStyle={styles.qtyBtnLabel}
                      onPress={() =>
                        dispatch(changeCartItemQuantity({cartItemId: item.id, delta: -1}))
                      }>
                      -
                    </Button>
                    <Text variant="bodyMedium" style={styles.qtyText}>
                      {item.quantity}
                    </Text>
                    <Button
                      mode="contained"
                      compact
                      buttonColor={PALETTE.primary}
                      textColor={PALETTE.textInverse}
                      style={styles.qtyBtn}
                      contentStyle={styles.qtyBtnContent}
                      labelStyle={styles.qtyBtnLabel}
                      onPress={() =>
                        dispatch(changeCartItemQuantity({cartItemId: item.id, delta: 1}))
                      }>
                      +
                    </Button>
                  </View>
                </View>
              ))}
              <Text variant="titleSmall" style={styles.subtotalText}>
                You Pay: {formatPrice(group.subtotal)}
              </Text>
              <Text variant="bodySmall" style={styles.orderAmountText}>
                Order Amount: {formatPrice(group.orderAmount)}
              </Text>
              {group.savedAmount > 0 ? (
                <Text variant="bodySmall" style={styles.savedText}>
                  You Saved: {formatPrice(group.savedAmount)}
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        )}
      />

      <Surface style={styles.reserveBar} elevation={4}>
        <View style={styles.summaryRow}>
          <Text variant="bodySmall" style={styles.summaryLabel}>
            Order Amount
          </Text>
          <Text variant="bodySmall" style={styles.summaryValueMuted}>
            {formatPrice(orderAmount)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="titleSmall" style={styles.summaryLabelBold}>
            You Save
          </Text>
          <Text variant="titleSmall" style={styles.summaryValueSaved}>
            {formatPrice(totalSaved)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="titleMedium" style={styles.totalText}>
            Payable
          </Text>
          <Text variant="titleMedium" style={styles.totalText}>
            {formatPrice(total)}
          </Text>
        </View>
        <PrimaryButton
          label="Place Order"
          onPress={() => {
            dispatch(placeCartOrder());
            navigation.reset({
              index: 0,
              routes: [{name: 'Restaurants', params: {tab: 'orders'}}],
            });
          }}
          disabled={cart.length === 0}
        />
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.card,
    shadowColor: PALETTE.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    gap: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  savedChip: {
    backgroundColor: PALETTE.status.successLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedChipText: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  itemRow: {
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: PALETTE.lightBorder,
    gap: 10,
    backgroundColor: PALETTE.background,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  itemMeta: {
    gap: 2,
    alignItems: 'flex-start',
  },
  itemName: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  itemPrice: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  qtyBtn: {
    minWidth: 60,
    borderRadius: 10,
  },
  qtyBtnContent: {
    height: 42,
  },
  qtyBtnLabel: {
    fontSize: 24,
    lineHeight: 26,
    marginVertical: 0,
  },
  qtyText: {
    minWidth: 28,
    textAlign: 'center',
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  subtotalText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
  },
  orderAmountText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  savedText: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Bold',
  },
  reserveBar: {
    borderRadius: 20,
    padding: 12,
    gap: 8,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    shadowColor: PALETTE.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  summaryLabelBold: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  summaryValueMuted: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  summaryValueSaved: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Bold',
  },
  totalText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
  },
});
