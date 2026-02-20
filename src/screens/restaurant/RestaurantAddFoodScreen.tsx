import React, {useEffect, useState} from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {Image, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchCamera} from 'react-native-image-picker';
import {Card, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {FormInput} from '../../components/common/FormInput';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  prefillMenuItemByNameThunk,
  setPrefillItem,
  upsertMenuItemThunk,
} from '../../store/slices/restaurantSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantAddFood'>;

type Draft = {
  imageUrl: string | null;
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  availableFromEpoch: number | null;
  quantity: string;
};

const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80&auto=format&fit=crop';

const initialDraft: Draft = {
  imageUrl: null,
  name: '',
  description: '',
  actualPrice: '',
  discountedPrice: '',
  availableFromEpoch: null,
  quantity: '',
};

export function RestaurantAddFoodScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {prefillItem, saving, error, info} = useAppSelector(state => state.restaurant);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pendingDate, setPendingDate] = useState(new Date());

  useEffect(() => {
    if (!prefillItem) {
      return;
    }

    setDraft({
      imageUrl: prefillItem.imageUrl ?? null,
      name: prefillItem.name,
      description: prefillItem.description,
      actualPrice: String(prefillItem.actualPrice),
      discountedPrice: String(prefillItem.discountedPrice),
      availableFromEpoch: prefillItem.availableFrom ?? null,
      quantity: String(prefillItem.quantity ?? ''),
    });
  }, [prefillItem]);

  const availableFromLabel = draft.availableFromEpoch
    ? new Date(draft.availableFromEpoch).toLocaleString([], {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Select date and time';

  const onCaptureImage = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      includeBase64: false,
      saveToPhotos: false,
    });

    if (result.didCancel || result.errorCode) {
      return;
    }

    const uri = result.assets?.[0]?.uri;
    setDraft(prev => ({...prev, imageUrl: uri ?? prev.imageUrl}));
  };

  const onOpenDateTimePicker = () => {
    const base = draft.availableFromEpoch
      ? new Date(draft.availableFromEpoch)
      : new Date();
    setPendingDate(base);
    setPickerMode('date');
    setShowDateTimePicker(true);
  };

  const onDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDateTimePicker(false);
      return;
    }

    if (pickerMode === 'date') {
      const merged = new Date(selectedDate);
      merged.setHours(pendingDate.getHours(), pendingDate.getMinutes(), 0, 0);
      setPendingDate(merged);
      setPickerMode('time');
      return;
    }

    const merged = new Date(pendingDate);
    merged.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setDraft(prev => ({...prev, availableFromEpoch: merged.getTime()}));
    setShowDateTimePicker(false);
    setPickerMode('date');
  };

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
    const availableFrom = draft.availableFromEpoch;
    const imageUrl = draft.imageUrl?.trim() || DEFAULT_MENU_IMAGE;

    if (
      !draft.name.trim() ||
      Number.isNaN(actualPrice) ||
      Number.isNaN(discountedPrice) ||
      Number.isNaN(quantity) ||
      availableFrom === null
    ) {
      return;
    }

    const result = await dispatch(
      upsertMenuItemThunk({
        imageUrl,
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

      <Card mode="outlined" style={styles.imageCard}>
        <Card.Content style={styles.imageCardContent}>
          {draft.imageUrl ? (
            <Image source={{uri: draft.imageUrl}} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <MaterialIcons name="photo-camera" size={26} color={PALETTE.textMuted} />
              <Text variant="bodySmall" style={styles.previewPlaceholderText}>
                No image selected
              </Text>
            </View>
          )}
          <PrimaryButton label="Capture Image" onPress={onCaptureImage} />
        </Card.Content>
      </Card>

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
          <PrimaryButton
            label={`Available From: ${availableFromLabel}`}
            onPress={onOpenDateTimePicker}
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

      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton label="Save Food Item" onPress={onSave} loading={saving} disabled={saving} />

      {showDateTimePicker ? (
        <DateTimePicker
          value={pendingDate}
          mode={pickerMode}
          onChange={onDateTimeChange}
          display="default"
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.surface,
  },
  imageCardContent: {
    gap: 10,
  },
  preview: {
    height: 140,
    width: '100%',
    borderRadius: 12,
    backgroundColor: PALETTE.skeleton,
  },
  previewPlaceholder: {
    height: 140,
    width: '100%',
    borderRadius: 12,
    backgroundColor: PALETTE.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewPlaceholderText: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  infoText: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Regular',
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
});
