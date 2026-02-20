export const PALETTE = {
  primary: '#D32F2F',
  secondary: '#000000',
  accent: '#FFC107',

  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  modal: '#FFFFFF',
  divider: '#E0E0E0',
  lightBorder: '#EEEEEE',
  skeleton: '#F2F2F2',

  textPrimary: '#111111',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnCta: '#FFFFFF',
  linkText: '#D32F2F',

  buttons: {
    primary: {
      background: '#D32F2F',
      text: '#FFFFFF',
      border: '#D32F2F',
      pressed: '#B71C1C',
      disabledBg: '#F5C6C6',
      disabledText: '#FFFFFF80',
    },
    cta: {
      background: '#FF9800',
      text: '#FFFFFF',
      pressed: '#F57C00',
      disabledBg: '#FFE0B2',
      disabledText: '#FFFFFF80',
    },
    secondary: {
      background: '#FFFFFF',
      border: '#D32F2F',
      text: '#D32F2F',
      pressedBg: '#FDECEA',
      disabledText: '#BDBDBD',
      disabledBorder: '#BDBDBD',
    },
    ghost: {
      text: '#D32F2F',
      pressedBg: '#FDECEA',
      disabledText: '#BDBDBD',
    },
  },

  status: {
    success: '#4CAF50',
    successLight: '#E8F5E9',
    warning: '#FFC107',
    warningLight: '#FFF8E1',
    error: '#D32F2F',
    errorLight: '#FDECEA',
    info: '#1976D2',
    infoLight: '#E3F2FD',
  },

  input: {
    background: '#FFFFFF',
    border: '#E0E0E0',
    focusBorder: '#D32F2F',
    errorBorder: '#D32F2F',
    placeholder: '#9E9E9E',
    text: '#111111',
    disabledBg: '#F5F5F5',
  },

  chips: {
    discountBg: '#D32F2F',
    discountText: '#FFFFFF',
    vegBg: '#4CAF50',
    vegText: '#FFFFFF',
    closingSoonBg: '#FFC107',
    closingSoonText: '#111111',
  },

  navigation: {
    tabActive: '#D32F2F',
    tabInactive: '#757575',
    tabBackground: '#FFFFFF',
    topBarBackground: '#FFFFFF',
    topBarText: '#111111',
  },

  overlays: {
    dark: 'rgba(0,0,0,0.5)',
    light: 'rgba(0,0,0,0.2)',
  },

  shadow: '#000000',

  disabled: {
    opacity: 0.6,
    background: '#EEEEEE',
    text: '#BDBDBD',
    border: '#BDBDBD',
  },
} as const;
