import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FormInput} from '../../components/common/FormInput';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {resetToUserLogin} from '../../store/slices/authSlice';
import {clearNotifications} from '../../store/slices/notificationSlice';
import {
  clearRestaurantState,
  loadRestaurantDashboardThunk,
  saveRestaurantProfileThunk,
} from '../../store/slices/restaurantSlice';
import {clearUserState} from '../../store/slices/userSlice';
import type {RestaurantProfile} from '../../types';
import {clearAllPersistedUserSessionData} from '../../utils/localStorage';
import {epochToTimeLabel, timeLabelToEpoch} from '../../utils/time';

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
  const insets = useSafeAreaInsets();
  const {profile, saving, info, error} = useAppSelector(state => state.restaurant);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const formPaddingBottom = 16 + insets.bottom;

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

  const onLogout = useCallback(async () => {
    await clearAllPersistedUserSessionData();
    dispatch(clearNotifications());
    dispatch(clearUserState());
    dispatch(clearRestaurantState());
    dispatch(resetToUserLogin());
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }, [dispatch, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.logoutBtn} onPress={onLogout} hitSlop={8}>
          <MaterialIcons name="logout" size={16} color={PALETTE.textOnPrimary} />
        </Pressable>
      ),
    });
  }, [navigation, onLogout]);

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text variant="titleMedium" style={styles.heroCaption}>
              Update your restaurant profile
            </Text>
          </View>
        </View>

        <View style={styles.formWrap}>
          <Card mode="contained" style={styles.card}>
            <View style={styles.dragHandle} />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.cardContent, {paddingBottom: formPaddingBottom}]}
              style={styles.cardScroll}>
              <Card.Content style={styles.cardInner}>
                <Text variant="headlineSmall" style={styles.formTitle}>
                  Restaurant Profile
                </Text>
                <Text variant="bodyMedium" style={styles.formSubtitle}>
                  Keep your store details accurate for better operations.
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

                {info ? <Text style={styles.infoText}>{info}</Text> : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                  mode="outlined"
                  onPress={onSave}
                  loading={saving}
                  textColor={
                    isValid && !saving
                      ? PALETTE.buttons.secondary.text
                      : PALETTE.buttons.secondary.disabledText
                  }
                  style={[
                    styles.submitButton,
                    (!isValid || saving) && styles.submitButtonDisabled,
                  ]}
                  contentStyle={styles.submitButtonContent}
                  disabled={!isValid || saving}
                  labelStyle={styles.submitButtonLabel}>
                  Submit
                </Button>
              </Card.Content>
            </ScrollView>
          </Card>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: PALETTE.surface,
  },
  container: {
    flex: 1,
    backgroundColor: PALETTE.surface,
  },
  hero: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: PALETTE.overlays.dark,
    paddingBottom: 160,
    paddingHorizontal: 24,
  },
  heroCaption: {
    color: PALETTE.textInverse,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  formWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  card: {
    marginHorizontal: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: PALETTE.card,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    shadowColor: PALETTE.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
    flex: 1,
  },
  cardScroll: {
    flex: 1,
  },
  dragHandle: {
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: PALETTE.divider,
    alignSelf: 'center',
    marginTop: 10,
  },
  cardInner: {
    gap: 10,
  },
  cardContent: {
    paddingTop: 14,
    paddingHorizontal: 20,
    backgroundColor: PALETTE.card,
  },
  formTitle: {
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
  },
  formSubtitle: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
    marginBottom: 8,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: PALETTE.buttons.secondary.border,
    borderRadius: 12,
    width: '52%',
    alignSelf: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    borderColor: PALETTE.disabled.border,
    opacity: PALETTE.disabled.opacity,
  },
  submitButtonContent: {
    height: 46,
  },
  submitButtonLabel: {
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.4,
  },
  infoText: {
    color: PALETTE.status.success,
    fontFamily: 'Nunito-Regular',
  },
  errorText: {
    color: PALETTE.status.error,
    fontFamily: 'Nunito-Regular',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.textOnPrimary,
    backgroundColor: 'transparent',
  },
});
