import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HelperText, Text} from 'react-native-paper';
import {FormInput} from '../components/common/FormInput';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  prefillMenuItemByNameThunk,
  setPrefillItem,
  upsertMenuItemThunk,
} from '../store/slices/restaurantSlice';
import {epochToTimeLabel, timeLabelToEpoch} from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantAddFood'>;

type Draft = {
  imageUrl: string;
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  availableFrom: string;
  quantity: string;
};

const initialDraft: Draft = {
  imageUrl: '',
  name: '',
  description: '',
  actualPrice: '',
  discountedPrice: '',
  availableFrom: '',
  quantity: '',
};

export function RestaurantAddFoodScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {prefillItem, saving, error, info} = useAppSelector(state => state.restaurant);
  const [draft, setDraft] = useState<Draft>(initialDraft);

  useEffect(() => {
    if (!prefillItem) {
      return;
    }

    setDraft({
      imageUrl: prefillItem.imageUrl ?? '',
      name: prefillItem.name,
      description: prefillItem.description,
      actualPrice: String(prefillItem.actualPrice),
      discountedPrice: String(prefillItem.discountedPrice),
      availableFrom: prefillItem.availableFrom
        ? epochToTimeLabel(prefillItem.availableFrom)
        : '',
      quantity: String(prefillItem.quantity ?? ''),
    });
  }, [prefillItem]);

  const onPrefill = async () => {
    if (!draft.name.trim()) {
      return;
    }

    await dispatch(prefillMenuItemByNameThunk(draft.name));
  };

  const onSave = async () => {
    const actualPrice = Number(draft.actualPrice);
    const discountedPrice = Number(draft.discountedPrice);
    const quantity = Number(draft.quantity);
    const availableFrom = timeLabelToEpoch(draft.availableFrom);

    if (
      !draft.name.trim() ||
      !draft.imageUrl.trim() ||
      Number.isNaN(actualPrice) ||
      Number.isNaN(discountedPrice) ||
      Number.isNaN(quantity) ||
      Number.isNaN(availableFrom)
    ) {
      return;
    }

    const result = await dispatch(
      upsertMenuItemThunk({
        imageUrl: draft.imageUrl,
        name: draft.name,
        description: draft.description,
        actualPrice,
        discountedPrice,
        availableFrom,
        quantity,
      }),
    );

    if (upsertMenuItemThunk.fulfilled.match(result)) {
      dispatch(setPrefillItem(null));
      setDraft(initialDraft);
      navigation.navigate('RestaurantMenu');
    }
  };

  return (
    <ScreenContainer>
      <FormInput
        label="Food Name"
        value={draft.name}
        onChangeText={value => setDraft(prev => ({...prev, name: value}))}
      />
      <PrimaryButton
        label="Fetch Existing Item From DB"
        onPress={onPrefill}
        disabled={!draft.name.trim()}
      />

      <FormInput
        label="Image URL"
        value={draft.imageUrl}
        onChangeText={value => setDraft(prev => ({...prev, imageUrl: value}))}
      />

      {draft.imageUrl.trim() ? (
        <Image source={{uri: draft.imageUrl}} style={styles.preview} resizeMode="cover" />
      ) : null}

      <FormInput
        label="Description"
        value={draft.description}
        onChangeText={value => setDraft(prev => ({...prev, description: value}))}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <FormInput
            label="Actual Price (₹)"
            keyboardType="number-pad"
            value={draft.actualPrice}
            onChangeText={value => setDraft(prev => ({...prev, actualPrice: value}))}
          />
        </View>
        <View style={styles.flex}>
          <FormInput
            label="Discounted Price (₹)"
            keyboardType="number-pad"
            value={draft.discountedPrice}
            onChangeText={value => setDraft(prev => ({...prev, discountedPrice: value}))}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <FormInput
            label="Available From"
            placeholder="11:00"
            value={draft.availableFrom}
            onChangeText={value => setDraft(prev => ({...prev, availableFrom: value}))}
          />
        </View>
        <View style={styles.flex}>
          <FormInput
            label="Quantity"
            keyboardType="number-pad"
            value={draft.quantity}
            onChangeText={value => setDraft(prev => ({...prev, quantity: value}))}
          />
        </View>
      </View>

      <HelperText type="info">
        Timings are stored as epoch in DB. Enter time as HH:mm for display.
      </HelperText>
      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton label="Save Food Item" onPress={onSave} loading={saving} disabled={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 140,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  infoText: {
    color: '#027146',
  },
  errorText: {
    color: '#b91c1c',
  },
});
