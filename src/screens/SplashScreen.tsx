import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useAppDispatch} from '../store/hooks';
import {restoreAuthState, setAuthHydrated} from '../store/slices/authSlice';
import {setProfile} from '../store/slices/userSlice';
import {loadPersistedAuthState, loadPersistedProfile} from '../utils/localStorage';

export function SplashScreen() {
  const dispatch = useAppDispatch();
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const floatC = useRef(new Animated.Value(0)).current;
  const floatD = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    const hydrateFromStorage = async () => {
      const [authState, profileState] = await Promise.all([
        loadPersistedAuthState(),
        loadPersistedProfile(),
      ]);

      if (!mounted) {
        return;
      }

      if (authState) {
        dispatch(restoreAuthState(authState));
      }

      if (profileState) {
        dispatch(setProfile(profileState));
      }

      dispatch(setAuthHydrated(true));
    };

    hydrateFromStorage();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

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
    const rotateLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 3800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();
    rotateLoop.start();
    const makeFloat = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: -10,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
    const loopA = makeFloat(floatA, 0);
    const loopB = makeFloat(floatB, 180);
    const loopC = makeFloat(floatC, 360);
    const loopD = makeFloat(floatD, 520);
    loopA.start();
    loopB.start();
    loopC.start();
    loopD.start();

    return () => {
      mounted = false;
      loop.stop();
      rotateLoop.stop();
      loopA.stop();
      loopB.stop();
      loopC.stop();
      loopD.stop();
    };
  }, [dispatch, floatA, floatB, floatC, floatD, floatY, logoOpacity, logoScale, ringRotate]);

  const ringRotation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.backBlobTop} />
      <View style={styles.backBlobBottom} />

      <Animated.View style={[styles.foodIcon, styles.foodTopLeft, {transform: [{translateY: floatA}]}]}>
        <MaterialIcons name="ramen-dining" size={32} color="#b6b6b6" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, styles.foodTopRight, {transform: [{translateY: floatB}]}]}>
        <MaterialIcons name="lunch-dining" size={34} color="#a9a9a9" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, styles.foodBottomLeft, {transform: [{translateY: floatC}]}]}>
        <MaterialIcons name="bakery-dining" size={32} color="#bcbcbc" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, styles.foodBottomRight, {transform: [{translateY: floatD}]}]}>
        <MaterialIcons name="icecream" size={30} color="#b0b0b0" />
      </Animated.View>

      <Animated.View
        style={[
          styles.brandWrap,
          {
            opacity: logoOpacity,
            transform: [{scale: logoScale}, {translateY: floatY}],
          },
        ]}>
        <Animated.View style={[styles.logoRing, {transform: [{rotate: ringRotation}]}]}>
          <MaterialIcons name="circle" size={10} color="#d0d0d0" style={styles.ringDotTop} />
          <MaterialIcons name="circle" size={10} color="#c4c4c4" style={styles.ringDotRight} />
          <MaterialIcons name="circle" size={10} color="#d6d6d6" style={styles.ringDotBottom} />
          <MaterialIcons name="circle" size={10} color="#cfcfcf" style={styles.ringDotLeft} />
        </Animated.View>
        <View style={styles.logoBadge}>
          <Text variant="headlineMedium" style={styles.brand}>
            savr
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>Fast food ordering made simple</Text>
      </Animated.View>

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
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoRing: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDotTop: {
    position: 'absolute',
    top: -6,
  },
  ringDotRight: {
    position: 'absolute',
    right: -6,
  },
  ringDotBottom: {
    position: 'absolute',
    bottom: -6,
  },
  ringDotLeft: {
    position: 'absolute',
    left: -6,
  },
  logoBadge: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  foodIcon: {
    position: 'absolute',
    backgroundColor: '#efefef',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodTopLeft: {
    top: '24%',
    left: '16%',
  },
  foodTopRight: {
    top: '24%',
    right: '16%',
  },
  foodBottomLeft: {
    bottom: '28%',
    left: '18%',
  },
  foodBottomRight: {
    bottom: '28%',
    right: '18%',
  },
});
