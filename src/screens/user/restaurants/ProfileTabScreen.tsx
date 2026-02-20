import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {FormInput} from '../../../components/common/FormInput';
import {PALETTE} from '../../../constants/palette';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {clearNotifications} from '../../../store/slices/notificationSlice';
import {resetToUserLogin} from '../../../store/slices/authSlice';
import {setProfile} from '../../../store/slices/userSlice';
import {clearUserState} from '../../../store/slices/userSlice';
import {clearAllPersistedUserSessionData} from '../../../utils/localStorage';

export function ProfileTabScreen() {
  const dispatch = useAppDispatch();
  const {profile} = useAppSelector(state => state.user);
  const {session, phone} = useAppSelector(state => state.auth);

  const initialFirstName = profile.firstName;
  const initialLastName = profile.lastName;
  const currentPhone = useMemo(() => {
    if (session?.phone?.trim()) {
      return session.phone;
    }
    if (phone.trim()) {
      return phone;
    }
    return 'Not available';
  }, [phone, session?.phone]);

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const hasChanges =
    firstName.trim() !== initialFirstName.trim() ||
    lastName.trim() !== initialLastName.trim();

  const canSave = hasChanges && firstName.trim().length > 0 && lastName.trim().length > 0;

  const onSave = () => {
    if (!canSave) {
      return;
    }

    dispatch(
      setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }),
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.profileTitle}>
        Profile
      </Text>
      <Text variant="bodySmall" style={styles.profileSubtitle}>
        Update your personal information.
      </Text>

      <FormInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <FormInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <FormInput
        label="Phone Number"
        value={currentPhone}
        editable={false}
        disabled
        style={styles.phoneInput}
      />

      {hasChanges ? (
        <Button
          mode="contained"
          onPress={onSave}
          disabled={!canSave}
          style={styles.saveBtn}
          contentStyle={styles.saveBtnContent}>
          Save Update
        </Button>
      ) : null}

      <Button
        mode="outlined"
        onPress={async () => {
          await clearAllPersistedUserSessionData();
          dispatch(clearNotifications());
          dispatch(clearUserState());
          dispatch(resetToUserLogin());
        }}
        textColor={PALETTE.status.error}
        style={styles.logoutBtn}
        labelStyle={styles.logoutBtnLabel}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
    paddingTop: 8,
  },
  profileTitle: {
    color: PALETTE.textPrimary,
    marginBottom: 2,
  },
  profileSubtitle: {
    color: PALETTE.textSecondary,
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: PALETTE.input.disabledBg,
  },
  saveBtn: {
    marginTop: 4,
    borderRadius: 12,
  },
  saveBtnContent: {
    height: 44,
  },
  logoutBtn: {
    marginTop: 8,
    borderColor: PALETTE.status.error,
    borderRadius: 12,
  },
  logoutBtnLabel: {
    fontFamily: 'Nunito-Bold',
  },
});
