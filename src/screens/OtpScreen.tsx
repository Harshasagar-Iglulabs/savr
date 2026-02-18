import React, {useEffect} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {autoFillOtp} from '../services/auth';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {FormInput} from '../components/common/FormInput';
import {PrimaryButton} from '../components/common/PrimaryButton';
import type {RootStackParamList} from '../navigation/types';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {setOtpInput, verifyOtpThunk} from '../store/slices/authSlice';
import {DEMO_OTP} from '../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const {otpInput, loading, error} = useAppSelector(state => state.auth);

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
        </View>

        <FadeSlideIn delay={100} style={styles.formWrap}>
          <Card mode="contained" style={styles.card}>
            <Card.Content style={[styles.cardContent, {paddingBottom: 20 + insets.bottom}]}>
              <Text variant="headlineSmall" style={styles.title}>
                Verify OTP
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Enter the 6-digit code sent to your mobile.
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

              <PrimaryButton
                label="Confirm & Continue"
                onPress={onVerify}
                loading={loading}
                disabled={loading || otpInput.trim().length !== 6}
              />

              <Text variant="bodySmall" style={styles.demoText}>
                Demo OTP: {DEMO_OTP}
              </Text>
            </Card.Content>
          </Card>
        </FadeSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  hero: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  formWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  card: {
    marginHorizontal: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    gap: 12,
  },
  title: {
    color: '#027146',
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    color: '#4b5563',
    fontFamily: 'Nunito-Regular',
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
    backgroundColor: '#d1d5db',
  },
  dotFilled: {
    backgroundColor: '#027146',
  },
  errorText: {
    color: '#b91c1c',
    fontFamily: 'Nunito-Regular',
  },
  demoText: {
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
  },
});
