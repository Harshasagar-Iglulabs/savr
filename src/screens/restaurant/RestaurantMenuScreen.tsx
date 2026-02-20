import React, {useEffect} from 'react';
import {FlatList, Image, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card, Text} from 'react-native-paper';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {loadRestaurantDashboardThunk} from '../../store/slices/restaurantSlice';
import {formatPrice, formatSavings} from '../../utils/format';
import {epochToTimeLabel} from '../../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantMenu'>;

export function RestaurantMenuScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {menu} = useAppSelector(state => state.restaurant);

  useEffect(() => {
    if (!menu.length) {
      dispatch(loadRestaurantDashboardThunk());
    }
  }, [dispatch, menu.length]);

  return (
    <ScreenContainer>
      <PrimaryButton label="Add New Item" onPress={() => navigation.navigate('RestaurantAddFood')} />
      <FlatList
        data={menu}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Card mode="contained" style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Image source={{uri: item.imageUrl}} style={styles.image} />
                <View style={styles.flex}>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall">{item.description}</Text>
                  <Text variant="bodySmall">
                    {formatPrice(item.actualPrice)} {'->'} {formatPrice(item.discountedPrice)}
                  </Text>
                  <Text variant="bodySmall">
                    Discount: {formatSavings(item.actualPrice, item.discountedPrice)}
                  </Text>
                  <Text variant="bodySmall">
                    Available From: {item.availableFrom ? epochToTimeLabel(item.availableFrom) : '-'} | Qty: {item.quantity ?? 0}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  flex: {
    flex: 1,
    gap: 2,
  },
});
