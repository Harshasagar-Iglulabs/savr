import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
};

export function ScreenContainer({children}: Props) {
  const insets = useSafeAreaInsets();

  return <View style={[styles.container, {paddingTop: insets.top + 12}]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
});
