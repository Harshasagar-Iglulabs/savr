import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {PALETTE} from '../../constants/palette';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({style}: Props) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, style, {opacity}]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: PALETTE.skeleton,
    borderRadius: 8,
  },
});

