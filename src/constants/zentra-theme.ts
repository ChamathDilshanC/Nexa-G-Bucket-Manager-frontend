/** Zentra-matched design tokens (typography, colors, spacing) */
export const ZentraColors = {
  background: '#0A0A0A',
  title: '#FFFFFF',
  body: '#9CA3AF',
  accent: '#2F80ED',
  buttonStart: '#4F9CF9',
  buttonEnd: '#2F80ED',
  footer: '#9CA3AF',
  screenGradient: [
    '#4F9CF9',
    '#3A8AE8',
    '#2F80ED',
    '#1B4F8A',
    '#122033',
    '#0D1117',
    '#0A0A0A',
  ] as const,
  screenGradientLocations: [0, 0.12, 0.24, 0.4, 0.58, 0.78, 1] as const,
  screenGradientHeight: 0.62,
  inputBackground: '#141414',
  inputBorder: '#2A2A2A',
  inputPlaceholder: '#555555',
  card: '#141414',
  cardBorder: '#1F1F1F',
  surface: '#111111',
  danger: '#EF4444',
  success: '#22C55E',
  muted: '#6B7280',
} as const;

export const ZentraTypography = {
  brand: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 17,
    lineHeight: 24,
  },
  footer: {
    fontSize: 15,
    lineHeight: 22,
  },
} as const;

export const ZentraLayout = {
  horizontalPadding: 24,
  buttonHeight: 56,
  buttonRadius: 28,
  contentGap: 16,
} as const;
