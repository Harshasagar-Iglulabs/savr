import React, {useEffect, useMemo, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text} from 'react-native-paper';
import {FormInput} from '../components/common/FormInput';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  loadRestaurantDashboardThunk,
  saveRestaurantProfileThunk,
} from '../store/slices/restaurantSlice';
import type {RestaurantProfile} from '../types';
import {epochToTimeLabel, timeLabelToEpoch} from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantProfile'>;

type ProfileDraft = {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cuisine: string;
  openTime: string;
  closeTime: string;
};

const emptyDraft: ProfileDraft = {
  storeName: '',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  cuisine: '',
  openTime: '',
  closeTime: '',
};

function profileToDraft(profile: RestaurantProfile): ProfileDraft {
  return {
    storeName: profile.storeName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    cuisine: profile.cuisine,
    openTime: epochToTimeLabel(profile.openTimeEpoch),
    closeTime: epochToTimeLabel(profile.closeTimeEpoch),
  };
}

export function RestaurantProfileScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {profile, saving, info, error} = useAppSelector(state => state.restaurant);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);

  useEffect(() => {
    if (!profile) {
      dispatch(loadRestaurantDashboardThunk());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setDraft(profileToDraft(profile));
    }
  }, [profile]);

  const isValid = useMemo(
    () =>
      Boolean(
        draft.storeName.trim() &&
          draft.ownerName.trim() &&
          draft.phone.trim() &&
          draft.email.trim() &&
          draft.address.trim(),
      ),
    [draft],
  );

  const onSave = async () => {
    const openTimeEpoch = timeLabelToEpoch(draft.openTime);
    const closeTimeEpoch = timeLabelToEpoch(draft.closeTime);

    if (Number.isNaN(openTimeEpoch) || Number.isNaN(closeTimeEpoch)) {
      return;
    }

    const payload: RestaurantProfile = {
      storeName: draft.storeName,
      ownerName: draft.ownerName,
      phone: draft.phone,
      email: draft.email,
      address: draft.address,
      cuisine: draft.cuisine,
      openTimeEpoch,
      closeTimeEpoch,
    };

    const result = await dispatch(saveRestaurantProfileThunk(payload));
    if (saveRestaurantProfileThunk.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <ScreenContainer>
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
        onChangeText={value => setDraft(prev => ({...prev, phone: value}))}
      />
      <FormInput
        label="Email"
        value={draft.email}
        onChangeText={value => setDraft(prev => ({...prev, email: value}))}
      />
      <FormInput
        label="Address"
        value={draft.address}
        onChangeText={value => setDraft(prev => ({...prev, address: value}))}
      />
      <FormInput
        label="Cuisine"
        value={draft.cuisine}
        onChangeText={value => setDraft(prev => ({...prev, cuisine: value}))}
      />
      <FormInput
        label="Open Time"
        value={draft.openTime}
        onChangeText={value => setDraft(prev => ({...prev, openTime: value}))}
        placeholder="09:00"
      />
      <FormInput
        label="Close Time"
        value={draft.closeTime}
        onChangeText={value => setDraft(prev => ({...prev, closeTime: value}))}
        placeholder="23:00"
      />

      <Text variant="bodySmall">Time is displayed as HH:mm but stored in DB as epoch.</Text>
      {info ? <Text style={{color: '#027146'}}>{info}</Text> : null}
      {error ? <Text style={{color: '#b91c1c'}}>{error}</Text> : null}

      <PrimaryButton
        label="Save Profile"
        onPress={onSave}
        loading={saving}
        disabled={!isValid || saving}
      />
    </ScreenContainer>
  );
}
