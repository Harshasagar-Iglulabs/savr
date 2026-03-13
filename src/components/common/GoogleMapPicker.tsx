import React, {useMemo} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, type MapPressEvent} from 'react-native-maps';
import {Text} from 'react-native-paper';
import {PALETTE} from '../../constants/palette';

type Props = {
  latitude: number | null;
  longitude: number | null;
  onCoordinateChange: (next: {latitude: number; longitude: number}) => void;
};

const DEFAULT_COORDINATE = {
  latitude: 12.9716,
  longitude: 77.5946,
};

export function GoogleMapPicker({latitude, longitude, onCoordinateChange}: Props) {
  const hasSelectedCoordinate =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const coordinate = useMemo(
    () =>
      hasSelectedCoordinate
        ? {latitude: Number(latitude), longitude: Number(longitude)}
        : DEFAULT_COORDINATE,
    [hasSelectedCoordinate, latitude, longitude],
  );

  const onMapPress = (event: MapPressEvent) => {
    onCoordinateChange(event.nativeEvent.coordinate);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="bodySmall" style={styles.label}>
        Tap map to set location
      </Text>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        onPress={onMapPress}>
        <Marker
          coordinate={coordinate}
          draggable
          onDragEnd={event => onCoordinateChange(event.nativeEvent.coordinate)}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
  },
});
