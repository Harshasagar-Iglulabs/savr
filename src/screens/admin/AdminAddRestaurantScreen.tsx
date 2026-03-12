import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text} from 'react-native-paper';
import {FormInput} from '../../components/common/FormInput';
import {PrimaryButton} from '../../components/common/PrimaryButton';
import {ScreenContainer} from '../../components/common/ScreenContainer';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {
  createRestaurantByAdmin,
  type AdminCreateRestaurantInput,
} from '../../services/admin';
import {useAppSelector} from '../../store/hooks';
import {timeLabelToEpoch} from '../../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminAddRestaurant'>;

type Draft = {
  storeName: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  openTime: string;
  closeTime: string;
};

const initialDraft: Draft = {
  storeName: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
  openTime: '',
  closeTime: '',
};

export function AdminAddRestaurantScreen({navigation}: Props) {
  const role = useAppSelector(state => state.auth.session?.role ?? '');
  const token = useAppSelector(state => state.auth.session?.token ?? '');
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'admin') {
      navigation.goBack();
    }
  }, [navigation, role]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        draft.storeName.trim() &&
          draft.phone.trim() &&
          draft.address.trim() &&
          draft.latitude.trim() &&
          draft.longitude.trim() &&
          draft.openTime.trim() &&
          draft.closeTime.trim(),
      ),
    [draft],
  );

  const onSubmit = async () => {
    if (!canSubmit || saving) {
      return;
    }

    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    const openTimeEpoch = timeLabelToEpoch(draft.openTime);
    const closeTimeEpoch = timeLabelToEpoch(draft.closeTime);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError('Latitude and longitude must be valid numbers.');
      return;
    }

    if (!Number.isFinite(openTimeEpoch) || !Number.isFinite(closeTimeEpoch)) {
      setError('Business hours must be in HH:MM format.');
      return;
    }

    if (!token.trim()) {
      setError('Missing authenticated token.');
      return;
    }

    const payload: AdminCreateRestaurantInput = {
      storeName: draft.storeName.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      latitude,
      longitude,
      openTimeEpoch,
      closeTimeEpoch,
    };

    setSaving(true);
    setInfo('');
    setError('');
    try {
      await createRestaurantByAdmin(payload, token);
      setInfo('Restaurant created successfully.');
      setDraft(initialDraft);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create restaurant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        Add Restaurant
      </Text>
      <Text variant="bodySmall" style={styles.subtitle}>
        Enter restaurant name, mobile, address, Google latitude/longitude, and business hours.
      </Text>

      <FormInput
        label="Restaurant Name"
        value={draft.storeName}
        onChangeText={value => setDraft(prev => ({...prev, storeName: value}))}
      />
      <FormInput
        label="Mobile Number"
        value={draft.phone}
        keyboardType="phone-pad"
        onChangeText={value => setDraft(prev => ({...prev, phone: value}))}
      />
      <FormInput
        label="Address"
        value={draft.address}
        onChangeText={value => setDraft(prev => ({...prev, address: value}))}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormInput
            label="Google Latitude"
            value={draft.latitude}
            keyboardType="decimal-pad"
            onChangeText={value => setDraft(prev => ({...prev, latitude: value}))}
          />
        </View>
        <View style={styles.flex}>
          <FormInput
            label="Google Longitude"
            value={draft.longitude}
            keyboardType="decimal-pad"
            onChangeText={value => setDraft(prev => ({...prev, longitude: value}))}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormInput
            label="Open Time"
            value={draft.openTime}
            placeholder="09:00"
            onChangeText={value => setDraft(prev => ({...prev, openTime: value}))}
          />
        </View>
        <View style={styles.flex}>
          <FormInput
            label="Close Time"
            value={draft.closeTime}
            placeholder="23:00"
            onChangeText={value => setDraft(prev => ({...prev, closeTime: value}))}
          />
        </View>
      </View>

      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton
        label="Create Restaurant"
        onPress={onSubmit}
        disabled={!canSubmit || saving}
        loading={saving}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  infoText: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Regular',
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
});
