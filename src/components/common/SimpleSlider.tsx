import React, {useMemo, useState} from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
};

export function SimpleSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  suffix,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);

  const clampedRatio = useMemo(() => {
    if (max <= min) {
      return 0;
    }
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }, [max, min, value]);

  const thumbX = clampedRatio * trackWidth;

  const updateFromX = (x: number) => {
    if (!trackWidth) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const rawValue = min + ratio * (max - min);
    const snapped = Math.round(rawValue / step) * step;
    const finalValue = Math.max(min, Math.min(max, snapped));
    onChange(finalValue);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          updateFromX(event.nativeEvent.locationX);
        },
        onPanResponderMove: event => {
          updateFromX(event.nativeEvent.locationX);
        },
      }),
    [trackWidth, min, max, step, value],
  );

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          {suffix ?? ''}
        </Text>
      </View>
      <View style={styles.trackArea} onLayout={onTrackLayout} {...panResponder.panHandlers}>
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, {width: thumbX}]} />
        <View style={[styles.thumb, {left: Math.max(0, thumbX - 9)}]} />
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{min}</Text>
        <Text style={styles.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#334155',
    fontFamily: 'Nunito-Bold',
  },
  value: {
    fontSize: 14,
    color: '#027146',
    fontFamily: 'Nunito-Bold',
  },
  trackArea: {
    height: 28,
    justifyContent: 'center',
  },
  trackBg: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#d1d5db',
  },
  trackFill: {
    position: 'absolute',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#027146',
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#027146',
    borderWidth: 2,
    borderColor: '#f9f9f9',
    top: 5,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Nunito-Regular',
  },
});
