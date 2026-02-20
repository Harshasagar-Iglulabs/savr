import {useRef} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import 'react-native-get-random-values';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PALETTE} from '../../constants/palette';

type PlaceSelection = {
  label: string;
  latitude: number;
  longitude: number;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelected: (place: PlaceSelection) => void;
  apiKey: string;
  countryCode?: string;
  placeholder?: string;
};

export function LocationSearch({
  value,
  onChangeText,
  onPlaceSelected,
  apiKey,
  countryCode = 'in',
  placeholder = 'Search for a place',
}: Props) {
  const placesRef = useRef<any>(null);

  return (
    <View style={styles.wrap}>
      <GooglePlacesAutocomplete
        ref={placesRef}
        placeholder={placeholder}
        fetchDetails
        onPress={(data, details) => {
          const latitude = details?.geometry?.location?.lat;
          const longitude = details?.geometry?.location?.lng;
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return;
          }

          onPlaceSelected({
            label: data.description ?? value,
            latitude,
            longitude,
          });
        }}
        onFail={error => {
          // Keep this non-blocking; search can still fall back to typed query.
          console.warn('Location search failed', error);
        }}
        enablePoweredByContainer={false}
        debounce={200}
        query={{
          key: apiKey,
          language: 'en',
          components: `country:${countryCode}`,
        }}
        textInputProps={{
          value,
          onChangeText,
          placeholderTextColor: PALETTE.textMuted,
        }}
        styles={{
          container: styles.container,
          textInputContainer: styles.inputContainer,
          textInput: styles.input,
          listView: styles.listView,
          row: styles.row,
          separator: styles.separator,
          description: styles.description,
        }}
        listViewDisplayed="auto"
        renderLeftButton={() => (
          <Ionicons
            name="search"
            size={18}
            color={PALETTE.textMuted}
            style={styles.leftIcon}
          />
        )}
        renderRightButton={() =>
          value ? (
            <Ionicons
              name="close-outline"
              size={22}
              color={PALETTE.textSecondary}
              style={styles.rightIcon}
              onPress={() => {
                placesRef.current?.clear();
                onChangeText('');
              }}
            />
          ) : null
        }
        nearbyPlacesAPI={Platform.OS === 'ios' ? 'GooglePlacesSearch' : 'GoogleReverseGeocoding'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 54,
  },
  container: {
    flex: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    borderRadius: 12,
    backgroundColor: PALETTE.surface,
    paddingLeft: 32,
    paddingRight: 32,
    minHeight: 48,
  },
  input: {
    height: 46,
    color: PALETTE.textPrimary,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  leftIcon: {
    position: 'absolute',
    left: 10,
    top: 13,
    zIndex: 3,
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
    zIndex: 3,
  },
  listView: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightBorder,
    backgroundColor: PALETTE.surface,
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: PALETTE.surface,
  },
  description: {
    color: PALETTE.textSecondary,
    fontFamily: 'Nunito-Regular',
  },
  separator: {
    backgroundColor: PALETTE.lightBorder,
  },
});
