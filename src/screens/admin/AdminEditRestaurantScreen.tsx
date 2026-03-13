import React, {useEffect, useMemo, useState} from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text} from 'react-native-paper';
import {FormInput} from '../../components/common/FormInput';
import {GoogleMapPicker} from '../../components/common/GoogleMapPicker';
import {LocationSearch} from '../../components/common/LocationSearch';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {
  updateRestaurantByAdmin,
  type AdminUpdateRestaurantInput,
} from '../../services/admin';
import {useAppSelector} from '../../store/hooks';
import {GOOGLE_PLACES_API_KEY} from '../../utils/constants';
import {epochToTimeLabel} from '../../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminEditRestaurant'>;

type Draft = {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cuisine: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  openTimeEpoch: number | null;
  closeTimeEpoch: number | null;
};

type PickerTarget = 'open' | 'close' | null;

export function AdminEditRestaurantScreen({navigation, route}: Props) {
  const role = useAppSelector(state => state.auth.session?.role ?? '');
  const token = useAppSelector(state => state.auth.session?.token ?? '');
  const source = route.params.restaurant;
  const [draft, setDraft] = useState<Draft>({
    storeName: source.storeName,
    ownerName: source.ownerName,
    phone: source.phone,
    email: source.email,
    address: source.address,
    cuisine: source.cuisine,
    latitude: String(source.latitude || ''),
    longitude: String(source.longitude || ''),
    imageUrl: typeof source.imageUrl === 'string' ? source.imageUrl : '',
    openTimeEpoch: source.openTimeEpoch || null,
    closeTimeEpoch: source.closeTimeEpoch || null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [locationQuery, setLocationQuery] = useState(source.address ?? '');

  useEffect(() => {
    if (role !== 'admin') {
      navigation.goBack();
    }
  }, [navigation, role]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        draft.storeName.trim() &&
          draft.ownerName.trim() &&
          draft.phone.trim() &&
          draft.email.trim() &&
          draft.address.trim() &&
          draft.cuisine.trim() &&
          draft.latitude.trim() &&
          draft.longitude.trim() &&
          draft.openTimeEpoch &&
          draft.closeTimeEpoch,
      ),
    [draft],
  );

  const openTimeLabel = draft.openTimeEpoch
    ? epochToTimeLabel(draft.openTimeEpoch)
    : 'Select time';
  const closeTimeLabel = draft.closeTimeEpoch
    ? epochToTimeLabel(draft.closeTimeEpoch)
    : 'Select time';
  const parseCoordinate = (value: string): number | null => {
    if (!value.trim()) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };
  const mapLatitude = parseCoordinate(draft.latitude);
  const mapLongitude = parseCoordinate(draft.longitude);

  const onOpenDateTimePicker = (target: Exclude<PickerTarget, null>) => {
    setPickerTarget(target);
  };

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate || !pickerTarget) {
      setPickerTarget(null);
      return;
    }

    const now = new Date();
    const merged = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      selectedDate.getHours(),
      selectedDate.getMinutes(),
      0,
      0,
    );
    const epoch = merged.getTime();
    setDraft(prev =>
      pickerTarget === 'open'
        ? {...prev, openTimeEpoch: epoch}
        : {...prev, closeTimeEpoch: epoch},
    );
    setPickerTarget(null);
  };

  const onSubmit = async () => {
    if (!canSubmit || saving) {
      return;
    }

    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError('Latitude and longitude must be valid numbers.');
      return;
    }
    if (!draft.openTimeEpoch || !draft.closeTimeEpoch) {
      setError('Open and close time are required.');
      return;
    }
    if (!token.trim()) {
      setError('Missing authenticated token.');
      return;
    }

    const payload: AdminUpdateRestaurantInput = {
      storeName: draft.storeName.trim(),
      ownerName: draft.ownerName.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      address: draft.address.trim(),
      cuisine: draft.cuisine.trim(),
      latitude,
      longitude,
      openTimeEpoch: draft.openTimeEpoch,
      closeTimeEpoch: draft.closeTimeEpoch,
      imageUrl: draft.imageUrl.trim() ? draft.imageUrl.trim() : null,
    };

    setSaving(true);
    setError('');
    try {
      await updateRestaurantByAdmin(source.id, payload, token);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update restaurant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={14}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}>
          <Text variant="headlineSmall" style={styles.title}>
            Edit Restaurant
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Update restaurant details and timings.
          </Text>

          <FormInput
            label="Store Name"
            value={draft.storeName}
            onChangeText={value => setDraft(prev => ({...prev, storeName: value}))}
          />
          <FormInput
            label="Owner Name"
            value={draft.ownerName}
            onChangeText={value => setDraft(prev => ({...prev, ownerName: value}))}
          />
          <FormInput
            label="Phone"
            value={draft.phone}
            keyboardType="phone-pad"
            onChangeText={value => setDraft(prev => ({...prev, phone: value}))}
          />
          <FormInput
            label="Email"
            value={draft.email}
            keyboardType="email-address"
            onChangeText={value => setDraft(prev => ({...prev, email: value}))}
          />
          <FormInput
            label="Address"
            value={draft.address}
            onChangeText={value => setDraft(prev => ({...prev, address: value}))}
          />
          <LocationSearch
            value={locationQuery}
            onChangeText={setLocationQuery}
            apiKey={GOOGLE_PLACES_API_KEY}
            placeholder="Search location on map"
            onPlaceSelected={place => {
              setDraft(prev => ({
                ...prev,
                address: place.label,
                latitude: String(place.latitude),
                longitude: String(place.longitude),
              }));
            }}
          />
          <FormInput
            label="Cuisine"
            value={draft.cuisine}
            onChangeText={value => setDraft(prev => ({...prev, cuisine: value}))}
          />
          <FormInput
            label="Image URL (Blank will clear)"
            value={draft.imageUrl}
            onChangeText={value => setDraft(prev => ({...prev, imageUrl: value}))}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormInput
                label="Latitude"
                value={draft.latitude}
                keyboardType="decimal-pad"
                onChangeText={value => setDraft(prev => ({...prev, latitude: value}))}
              />
            </View>
            <View style={styles.flex}>
              <FormInput
                label="Longitude"
                value={draft.longitude}
                keyboardType="decimal-pad"
                onChangeText={value => setDraft(prev => ({...prev, longitude: value}))}
              />
            </View>
          </View>
          <GoogleMapPicker
            latitude={mapLatitude}
            longitude={mapLongitude}
            onCoordinateChange={next => {
              setDraft(prev => ({
                ...prev,
                latitude: next.latitude.toFixed(6),
                longitude: next.longitude.toFixed(6),
              }));
            }}
          />

          <PrimaryButton
            label={`Open Time: ${openTimeLabel}`}
            onPress={() => onOpenDateTimePicker('open')}
          />
          <PrimaryButton
            label={`Close Time: ${closeTimeLabel}`}
            onPress={() => onOpenDateTimePicker('close')}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label="Save Changes"
            onPress={onSubmit}
            disabled={!canSubmit || saving}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {pickerTarget ? (
        <DateTimePicker
          value={
            pickerTarget === 'open' && draft.openTimeEpoch
              ? new Date(draft.openTimeEpoch)
              : pickerTarget === 'close' && draft.closeTimeEpoch
              ? new Date(draft.closeTimeEpoch)
              : new Date()
          }
          mode="time"
          onChange={onDateTimeChange}
          display="default"
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
});
