import React, {useEffect} from 'react';
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
import {autoFillOtp} from '../services/auth';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {FormInput} from '../components/common/FormInput';
import {PALETTE} from '../constants/palette';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {setOtpInput, verifyOtpThunk} from '../store/slices/authSlice';
import {DEMO_OTP} from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const {otpInput, loading, error} = useAppSelector(state => state.auth);
  const formPaddingBottom = 16 + insets.bottom;

  useEffect(() => {
    if (otpInput.trim().length === 6) {
      return;
    }

    let mounted = true;
    autoFillOtp().then(code => {
      if (mounted) {
        dispatch(setOtpInput(code));
      }
    });

    return () => {
      mounted = false;
    };
  }, [dispatch, otpInput]);

  const onVerify = async () => {
    const result = await dispatch(verifyOtpThunk());
    if (!verifyOtpThunk.fulfilled.match(result)) {
      return;
    }

    if (result.payload === 'restaurant') {
      navigation.reset({index: 0, routes: [{name: 'RestaurantDashboard'}]});
      return;
    }

    navigation.replace('Profile');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80&auto=format&fit=crop'}}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text variant="titleMedium" style={styles.heroCaption}>
              One step away from your account
            </Text>
          </View>
        </View>

        <FadeSlideIn delay={100} style={styles.formWrap}>
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
                  Verify OTP
                </Text>
                <Text variant="bodyMedium" style={styles.formSubtitle}>
                  Enter the 6-digit code sent to your mobile
                </Text>

                <FormInput
                  label="One-Time Password"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpInput}
                  onChangeText={value => dispatch(setOtpInput(value))}
                />

                <View style={styles.dotRow}>
                  {Array.from({length: 6}).map((_, index) => {
                    const filled = index < otpInput.length;
                    return <View key={index} style={[styles.dot, filled && styles.dotFilled]} />;
                  })}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                  mode="outlined"
                  onPress={onVerify}
                  loading={loading}
                  textColor={
                    loading
                      ? PALETTE.buttons.secondary.disabledText
                      : PALETTE.buttons.secondary.text
                  }
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  contentStyle={styles.submitButtonContent}
                  disabled={loading || otpInput.trim().length !== 6}
                  labelStyle={styles.submitButtonLabel}>
                  Submit
                </Button>

                <Text variant="bodySmall" style={styles.demoText}>
                  Demo OTP: {DEMO_OTP}
                </Text>
              </Card.Content>
            </ScrollView>
          </Card>
        </FadeSlideIn>
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
    overflow: 'hidden',
    minHeight: '34%',
    maxHeight: '48%',
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
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: PALETTE.divider,
  },
  dotFilled: {
    backgroundColor: PALETTE.status.success,
  },
  errorText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Regular',
  },
  demoText: {
    color: PALETTE.textSecondary,
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
    marginTop: 8,
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
