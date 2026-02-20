import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, SegmentedButtons, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FadeSlideIn} from '../components/animations/FadeSlideIn';
import {FormInput} from '../components/common/FormInput';
import {PALETTE} from '../constants/palette';
import type {RootStackParamList} from '../navigation/types';
import {requestOtpThunk, setPhone, setToken} from '../store/slices/authSlice';
import {useAppDispatch, useAppSelector} from '../store/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const {phone, loading, error} = useAppSelector(state => state.auth);
  const [loginMode, setLoginMode] = React.useState<'user' | 'restaurant'>('user');
  const heroScale = useRef(new Animated.Value(1)).current;
  const formPaddingBottom = 16 + insets.bottom;
  const isSubmitDisabled = loading || !phone.trim();

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
    dispatch(setToken(loginMode === 'restaurant' ? 'restaurant-demo-token' : 'user-demo-token'));
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
              uri: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=80&auto=format&fit=crop',
            }}
            style={[styles.heroImage, {transform: [{scale: heroScale}]}]}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Image source={{uri: 'https://i.imgur.com/8QfQf8N.png'}} style={styles.logo} resizeMode="contain" />
            <Text variant="titleMedium" style={styles.heroCaption}>
              Fast, secure sign in
            </Text>
          </View>
        </View>

        <FadeSlideIn delay={120} style={styles.formWrap}>
          <Surface style={styles.formCard} elevation={3}>
            <View style={styles.dragHandle} />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.formContent, {paddingBottom: formPaddingBottom}]}
              style={styles.formScroll}>
              <Text variant="headlineSmall" style={styles.formTitle}>
                Welcome
              </Text>
              <Text variant="bodyMedium" style={styles.formSubtitle}>
                Enter your mobile number to continue
              </Text>
              <SegmentedButtons
                value={loginMode}
                onValueChange={value => setLoginMode(value as 'user' | 'restaurant')}
                buttons={[
                  {
                    value: 'user',
                    label: 'User',
                    style: styles.roleSegmentButton,
                    checkedColor: PALETTE.textOnPrimary,
                    uncheckedColor: PALETTE.primary,
                  },
                  {
                    value: 'restaurant',
                    label: 'Restaurant',
                    style: styles.roleSegmentButton,
                    checkedColor: PALETTE.textOnPrimary,
                    uncheckedColor: PALETTE.primary,
                  },
                ]}
                style={styles.roleSegment}
                theme={{
                  colors: {
                    secondaryContainer: PALETTE.primary,
                    onSecondaryContainer: PALETTE.textOnPrimary,
                    outline: PALETTE.primary,
                  },
                }}
              />

              <FormInput
                label="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={value => dispatch(setPhone(value))}
                placeholder="+91 98765 43210"
                outlineColor={error ? PALETTE.input.errorBorder : PALETTE.input.border}
                activeOutlineColor={PALETTE.input.focusBorder}
                textColor={PALETTE.input.text}
                placeholderTextColor={PALETTE.input.placeholder}
                style={[styles.phoneInput, error ? styles.phoneInputError : null]}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="outlined"
                onPress={onSendOtp}
                loading={loading}
                textColor={
                  isSubmitDisabled
                    ? PALETTE.buttons.secondary.disabledText
                    : PALETTE.buttons.secondary.text
                }
                style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                contentStyle={styles.submitButtonContent}
                disabled={isSubmitDisabled}
                labelStyle={styles.submitButtonLabel}>
                Submit
              </Button>
            </ScrollView>
          </Surface>
        </FadeSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  formWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    minHeight: '44%',
    maxHeight: '60%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: PALETTE.overlays.dark,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 160,
  },
  logo: {
    width: 210,
    height: 92,
    borderRadius: 14,
    marginBottom: 10,
  },
  heroCaption: {
    color: PALETTE.textInverse,
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  formCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: PALETTE.surface,
    flex: 1,
  },
  formScroll: {
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
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 8,
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
  roleSegment: {
    marginBottom: 8,
  },
  roleSegmentButton: {
    borderColor: PALETTE.primary,
  },
  errorText: {
    color: PALETTE.primary,
    fontFamily: 'Nunito-Regular',
  },
  phoneInput: {
    backgroundColor: PALETTE.input.background,
  },
  phoneInputError: {
    backgroundColor: PALETTE.input.background,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: PALETTE.buttons.secondary.border,
    borderRadius: 12,
    width: '100%',
    alignSelf: 'center',
    marginTop: 10,
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
