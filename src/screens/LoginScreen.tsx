import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {FormInput} from '../components/common/FormInput';
import {PrimaryButton} from '../components/common/PrimaryButton';
import type {RootStackParamList} from '../navigation/types';
import {requestOtpThunk, setPhone} from '../store/slices/authSlice';
import {useAppDispatch, useAppSelector} from '../store/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const {phone, loading, error} = useAppSelector(state => state.auth);
  const heroScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const motion = Animated.loop(
      Animated.sequence([
        Animated.timing(heroScale, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heroScale, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    motion.start();
    return () => motion.stop();
  }, [heroScale]);

  const onSendOtp = async () => {
    const result = await dispatch(requestOtpThunk());
    if (requestOtpThunk.fulfilled.match(result)) {
      navigation.navigate('Otp');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Animated.Image
            source={{
              uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80&auto=format&fit=crop',
            }}
            style={[styles.heroImage, {transform: [{scale: heroScale}]}]}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Image
              source={{uri: 'https://i.imgur.com/8QfQf8N.png'}}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="titleMedium" style={styles.heroTitle}>
              Continue with mobile OTP
            </Text>
          </View>
        </View>

        <FadeSlideIn delay={120} style={styles.formWrap}>
          <Surface style={styles.formCard} elevation={3}>
            <View style={[styles.formContent, {paddingBottom: 20 }]}>
              <Text variant="headlineSmall" style={styles.formHeading}>
                Login
              </Text>
              <Text variant="bodySmall" style={styles.helperText}>
                Enter your mobile number to continue.
              </Text>

              <FormInput
                label="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={value => dispatch(setPhone(value))}
                placeholder="+91 98765 43210"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <PrimaryButton
                label="Send OTP"
                onPress={onSendOtp}
                loading={loading}
                disabled={loading || !phone.trim()}
              />
            </View>
          </Surface>
        </FadeSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: '100%',
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
    paddingTop: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 113, 70, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 230,
    height: 110,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#ffffff',
    textAlign: 'center',
  },
  formCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
  },
  formContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  formHeading: {
    color: '#027146',
    fontFamily: 'Nunito-Bold',
  },
  helperText: {
    color: '#539c80',
    fontFamily: 'Nunito-Regular',
  },
  errorText: {
    color: '#b91c1c',
    fontFamily: 'Nunito-Regular',
  },
});
