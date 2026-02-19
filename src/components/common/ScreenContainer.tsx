import React from 'react';
import {StyleSheet, View} from 'react-native';

type Props = {
  children: React.ReactNode;
};

export function ScreenContainer({children}: Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
});
