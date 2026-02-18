import React, {useMemo} from 'react';
import {Image, FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Surface, Text} from 'react-native-paper';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {FoodCard} from '../components/cards/FoodCard';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {addFoodToCart} from '../store/slices/userSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Foods'>;

export function FoodsScreen({navigation, route}: Props) {
  const dispatch = useAppDispatch();
  const {restaurants, cart} = useAppSelector(state => state.user);

  const restaurant = useMemo(
    () => restaurants.find(item => item.id === route.params.restaurantId),
    [restaurants, route.params.restaurantId],
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!restaurant) {
    return (
      <ScreenContainer>
        <Text variant="bodyMedium">Restaurant not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FadeSlideIn>
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                restaurant.imageUrl ??
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Surface style={styles.heroInfo} elevation={2}>
            <Text variant="headlineSmall" style={styles.heroTitle}>{restaurant.name}</Text>
            <Text variant="bodyMedium" style={styles.heroSub}>
              Pickup Window: Today 10:30 AM to 7:30 PM
            </Text>
          </Surface>
        </View>
      </FadeSlideIn>

      <FlatList
        data={restaurant.foods}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 12}}
        renderItem={({item, index}) => (
          <FadeSlideIn delay={index * 70} distance={16}>
            <FoodCard
              food={item}
              onAddToCart={() =>
                dispatch(
                  addFoodToCart({
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    food: item,
                  }),
                )
              }
            />
          </FadeSlideIn>
        )}
      />
      <View style={{gap: 8}}>
        <PrimaryButton
          label={`Reserve Pickup (${cartCount})`}
          onPress={() => navigation.navigate('Cart')}
          disabled={cartCount === 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginBottom: 4,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
  },
  heroInfo: {
    marginTop: -38,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  heroTitle: {
    color: '#027146',
  },
  heroSub: {
    color: '#475569',
  },
});
