import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Surface, Text} from 'react-native-paper';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  changeCartItemQuantity,
  placeCartOrder,
} from '../store/slices/userSlice';
import {formatPrice} from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {cart} = useAppSelector(state => state.user);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <ScreenContainer>
      <Card mode="outlined" style={styles.codeCard}>
        <Card.Content style={styles.codeContent}>
          <Text variant="titleSmall" style={styles.codeLabel}>ORDER CODE</Text>
          <View style={styles.codeRow}>
            {[...String(Date.now()).slice(-5)].map((char, idx) => (
              <View key={`${char}-${idx}`} style={styles.codeBox}>
                <Text style={styles.codeChar}>{char}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text variant="bodyMedium">Your cart is empty.</Text>}
        renderItem={({item}) => (
          <Card mode="contained" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">{item.restaurantName}</Text>
              <Text variant="bodySmall">{formatPrice(item.unitPrice)} each</Text>
              <View style={styles.qtyRow}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() =>
                    dispatch(changeCartItemQuantity({cartItemId: item.id, delta: -1}))
                  }>
                  -
                </Button>
                <Text variant="bodyMedium">Qty {item.quantity}</Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() =>
                    dispatch(changeCartItemQuantity({cartItemId: item.id, delta: 1}))
                  }>
                  +
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Surface style={styles.reserveBar} elevation={4}>
        <Text variant="titleMedium" style={styles.totalText}>Total: {formatPrice(total)}</Text>
        <PrimaryButton
          label="Reserve"
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
  codeCard: {
    borderRadius: 18,
  },
  codeContent: {
    gap: 10,
    alignItems: 'center',
  },
  codeLabel: {
    letterSpacing: 5,
    color: '#027146',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontSize: 28,
    color: '#027146',
    fontFamily: 'Nunito-Bold',
  },
  card: {
    marginBottom: 10,
    borderRadius: 14,
  },
  cardContent: {
    gap: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reserveBar: {
    borderRadius: 20,
    padding: 12,
    gap: 10,
    backgroundColor: '#ffffff',
  },
  totalText: {
    color: '#027146',
  },
});
