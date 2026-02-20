import {MD3LightTheme, type MD3Theme} from 'react-native-paper';
import {PALETTE} from '../constants/palette';

const savrFonts = {
  ...MD3LightTheme.fonts,
  displayLarge: {...MD3LightTheme.fonts.displayLarge, fontFamily: 'Nunito-Bold'},
  displayMedium: {...MD3LightTheme.fonts.displayMedium, fontFamily: 'Nunito-Bold'},
  displaySmall: {...MD3LightTheme.fonts.displaySmall, fontFamily: 'Nunito-Bold'},
  headlineLarge: {...MD3LightTheme.fonts.headlineLarge, fontFamily: 'Nunito-Bold'},
  headlineMedium: {...MD3LightTheme.fonts.headlineMedium, fontFamily: 'Nunito-Bold'},
  headlineSmall: {...MD3LightTheme.fonts.headlineSmall, fontFamily: 'Nunito-Bold'},
  titleLarge: {...MD3LightTheme.fonts.titleLarge, fontFamily: 'Nunito-Bold'},
  titleMedium: {...MD3LightTheme.fonts.titleMedium, fontFamily: 'Nunito-Bold'},
  titleSmall: {...MD3LightTheme.fonts.titleSmall, fontFamily: 'Nunito-Bold'},
  labelLarge: {...MD3LightTheme.fonts.labelLarge, fontFamily: 'Nunito-Regular'},
  labelMedium: {...MD3LightTheme.fonts.labelMedium, fontFamily: 'Nunito-Regular'},
  labelSmall: {...MD3LightTheme.fonts.labelSmall, fontFamily: 'Nunito-Regular'},
  bodyLarge: {...MD3LightTheme.fonts.bodyLarge, fontFamily: 'Nunito-Regular'},
  bodyMedium: {...MD3LightTheme.fonts.bodyMedium, fontFamily: 'Nunito-Regular'},
  bodySmall: {...MD3LightTheme.fonts.bodySmall, fontFamily: 'Nunito-Regular'},
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 14,
  fonts: savrFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: PALETTE.primary,
    onPrimary: PALETTE.textOnPrimary,
    primaryContainer: PALETTE.accent,
    onPrimaryContainer: PALETTE.textPrimary,
    secondary: PALETTE.secondary,
    background: PALETTE.background,
    surface: PALETTE.surface,
    surfaceVariant: PALETTE.divider,
    outline: PALETTE.divider,
    onBackground: PALETTE.textPrimary,
    onSurface: PALETTE.textPrimary,
  },
};
