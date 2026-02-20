import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Animated, FlatList, Image, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Modal, Portal, Surface, Text} from 'react-native-paper';
import {FadeSlideIn} from '../../components/animations/FadeSlideIn';
import {FoodCard, FoodCardSkeleton} from '../../components/cards/FoodCard';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {addFoodToCart, changeCartItemQuantity} from '../../store/slices/userSlice';
import type {FoodItem} from '../../types';
import {formatPrice, formatSavings} from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Foods'>;

export function FoodsScreen({navigation, route}: Props) {
  const dispatch = useAppDispatch();
  const {restaurants, cart, loadingNearby} = useAppSelector(state => state.user);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const modalScale = useRef(new Animated.Value(0.92)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const restaurant = useMemo(
    () => restaurants.find(item => item.id === route.params.restaurantId),
    [restaurants, route.params.restaurantId],
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const maxAllowedQuantity = selectedFood?.quantity ?? 10;

  useLayoutEffect(() => {
    if (!restaurant) {
      return;
    }

    navigation.setOptions({
      headerTitle: restaurant.name,
    });
  }, [navigation, restaurant]);

  useEffect(() => {
    if (!foodModalVisible) {
      return;
    }

    modalScale.setValue(0.92);
    modalOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [foodModalVisible, modalOpacity, modalScale]);

  const validateQuantity = (nextQuantity: number): string | null => {
    if (!selectedFood) {
      return 'Please select an item.';
    }
    if (nextQuantity < 1) {
      return 'Quantity should be at least 1.';
    }
    if (nextQuantity > maxAllowedQuantity) {
      return `Only ${maxAllowedQuantity} item(s) available.`;
    }
    return null;
  };

  const onSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
    setQuantityError(null);
    setFoodModalVisible(true);
  };

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(nextQuantity);
    setQuantityError(validateQuantity(nextQuantity));
  };

  const onConfirmAdd = () => {
    if (!selectedFood || !restaurant) {
      return;
    }

    const validation = validateQuantity(quantity);
    if (validation) {
      setQuantityError(validation);
      return;
    }

    for (let index = 0; index < quantity; index += 1) {
      dispatch(
        addFoodToCart({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          food: selectedFood,
        }),
      );
    }

    setFoodModalVisible(false);
  };

  const quickAddToCart = (food: FoodItem) => {
    if (!restaurant) {
      return;
    }

    dispatch(
      addFoodToCart({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        food,
      }),
    );
  };

  const getCartQuantity = (foodId: string) => {
    if (!restaurant) {
      return 0;
    }
    const cartItemId = `${restaurant.id}-${foodId}`;
    return cart.find(item => item.id === cartItemId)?.quantity ?? 0;
  };

  const changeFoodQuantity = (foodId: string, delta: 1 | -1) => {
    if (!restaurant) {
      return;
    }
    dispatch(
      changeCartItemQuantity({
        cartItemId: `${restaurant.id}-${foodId}`,
        delta,
      }),
    );
  };

  if (!restaurant) {
    if (loadingNearby) {
      return (
        <ScreenContainer>
          <FlatList
            data={Array.from({length: 5}, (_, i) => `food-sk-${i}`)}
            keyExtractor={item => item}
            contentContainerStyle={styles.listContent}
            renderItem={() => <FoodCardSkeleton />}
          />
        </ScreenContainer>
      );
    }

    return (
      <ScreenContainer>
        <Text variant="bodyMedium">Restaurant not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={restaurant.foods}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loadingNearby ? (
            <>
              <FoodCardSkeleton />
              <FoodCardSkeleton />
              <FoodCardSkeleton />
            </>
          ) : null
        }
        renderItem={({item, index}) => (
          <FadeSlideIn delay={index * 70} distance={16}>
            <FoodCard
              food={item}
              onPress={() => onSelectFood(item)}
              onAddToCart={() => quickAddToCart(item)}
              cartQuantity={getCartQuantity(item.id)}
              onIncrease={() => changeFoodQuantity(item.id, 1)}
              onDecrease={() => changeFoodQuantity(item.id, -1)}
            />
          </FadeSlideIn>
        )}
      />
      <View style={styles.bottomActions}>
        <PrimaryButton
          label={`Reserve Pickup (${cartCount})`}
          onPress={() => navigation.navigate('Cart')}
          disabled={cartCount === 0}
        />
      </View>

      <Portal>
        <Modal
          visible={foodModalVisible}
          onDismiss={() => setFoodModalVisible(false)}
          contentContainerStyle={styles.modalWrap}>
          <Animated.View
            style={[
              styles.modalAnimatedWrap,
              {
                opacity: modalOpacity,
                transform: [{scale: modalScale}],
              },
            ]}>
            <Surface style={styles.modalCard} elevation={4}>
              {selectedFood ? (
                <>
                  <Image
                    source={{
                      uri:
                        selectedFood.imageUrl ??
                        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&q=80&auto=format&fit=crop',
                    }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <Text variant="titleLarge" style={styles.modalTitle}>
                    {selectedFood.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.modalDescription}>
                    {selectedFood.description}
                  </Text>

                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalOldPrice}>
                      {formatPrice(selectedFood.actualPrice)}
                    </Text>
                    <Text style={styles.modalNewPrice}>
                      {formatPrice(selectedFood.discountedPrice)}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.modalSavings}>
                    Save {formatSavings(selectedFood.actualPrice, selectedFood.discountedPrice)}
                  </Text>

                  <View style={styles.qtyRow}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => updateQuantity(quantity - 1)}>
                      -
                    </Button>
                    <Text variant="titleMedium" style={styles.qtyText}>
                      Qty {quantity}
                    </Text>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => updateQuantity(quantity + 1)}>
                      +
                    </Button>
                  </View>
                  <Text variant="bodySmall" style={styles.stockText}>
                    Available: {maxAllowedQuantity}
                  </Text>

                  {quantityError ? (
                    <Text variant="bodySmall" style={styles.qtyError}>
                      {quantityError}
                    </Text>
                  ) : null}

                  <Button mode="contained" onPress={onConfirmAdd}>
                    Add {quantity} to Cart
                  </Button>
                </>
              ) : null}
            </Surface>
          </Animated.View>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 10,
  },
  bottomActions: {
    gap: 8,
  },
  modalWrap: {
    marginHorizontal: 14,
    justifyContent: 'center',
  },
  modalAnimatedWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCard: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
    backgroundColor: PALETTE.modal,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: PALETTE.skeleton,
  },
  modalTitle: {
    color: PALETTE.textPrimary,
  },
  modalDescription: {
    color: PALETTE.textSecondary,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOldPrice: {
    color: PALETTE.textMuted,
    textDecorationLine: 'line-through',
    fontFamily: 'Nunito-Regular',
  },
  modalNewPrice: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  modalSavings: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Bold',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  qtyText: {
    color: PALETTE.textPrimary,
  },
  stockText: {
    color: PALETTE.textMuted,
    textAlign: 'center',
  },
  qtyError: {
    color: PALETTE.status.error,
    textAlign: 'center',
  },
});
