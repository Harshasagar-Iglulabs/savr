import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ActivityIndicator, Chip, Text} from 'react-native-paper';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({navigation}: Props) {
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.03,
            duration: 850,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: -6,
            duration: 850,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    loop.start();

    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 1800);

    return () => {
      loop.stop();
      clearTimeout(timeout);
    };
  }, [floatY, logoScale, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.backBlobTop} />
      <View style={styles.backBlobBottom} />

      <Animated.View
        style={[
          styles.brandCard,
          {
            transform: [{scale: logoScale}, {translateY: floatY}],
          },
        ]}>
        <Text variant="displaySmall" style={styles.brand}>
          savr
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Fast food ordering for users and restaurants
        </Text>
      </Animated.View>

      <View style={styles.badges}>
        <Chip compact icon="food-outline">
          Nearby
        </Chip>
        <Chip compact icon="clock-outline">
          Live ETA
        </Chip>
        <Chip compact icon="sale-outline">
          Best Deals
        </Chip>
      </View>

      <ActivityIndicator animating color="#027146" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    gap: 16,
  },
  backBlobTop: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#cde3d9',
  },
  backBlobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#e8e8e8',
  },
  brandCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#d8e8e1',
  },
  brand: {
    color: '#027146',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#4b5563',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
