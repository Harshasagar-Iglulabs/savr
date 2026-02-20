import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FormInput} from '../../components/common/FormInput';
import {PALETTE} from '../../constants/palette';
import type {RootStackParamList} from '../../navigation/types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setProfile} from '../../store/slices/userSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const profile = useAppSelector(state => state.user.profile);
  const formPaddingBottom = 16 + insets.bottom;

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const isSubmitDisabled = !(firstName.trim() && lastName.trim());

  const onContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    dispatch(setProfile({firstName, lastName}));
    navigation.reset({index: 0, routes: [{name: 'Restaurants'}]});
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80&auto=format&fit=crop'}}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text variant="titleMedium" style={styles.heroCaption}>
              Set up your profile to continue
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
                  Complete Your Profile
                </Text>
                <Text variant="bodyMedium" style={styles.formSubtitle}>
                  Enter your first and last name
                </Text>
                <FormInput label="First Name" value={firstName} onChangeText={setFirstName} />
                <FormInput label="Last Name" value={lastName} onChangeText={setLastName} />
                <Button
                  mode="outlined"
                  onPress={onContinue}
                  textColor={
                    !isSubmitDisabled
                      ? PALETTE.buttons.secondary.text
                      : PALETTE.buttons.secondary.disabledText
                  }
                  style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                  contentStyle={styles.submitButtonContent}
                  disabled={isSubmitDisabled}
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
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // minHeight: '35%',
    // maxHeight: '48%',
    overflow: 'hidden',
  },
  card: {
    marginHorizontal: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: PALETTE.surface,
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
});
