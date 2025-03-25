import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Use whichever is smaller, width or height
const SCALE = SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_HEIGHT : SCREEN_WIDTH;

// Base width for scaling calculations
const BASE_WIDTH = 375;

// Configuration object for fine-tuning text sizes
const fontConfig = {
  phone: {
    small: { min: 0.8, max: 1 },
    medium: { min: 0.9, max: 1.1 },
    large: { min: 1, max: 1.2 },
  },
  tablet: {
    small: { min: 1.3, max: 1.4 },
    medium: { min: 1.4, max: 1.5 },
    large: { min: 1.5, max: 1.7 },
  },
};

// Helper function to get device type
export const getDeviceType = (): "phone" | "tablet" => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return "tablet";
  } else if (
    pixelDensity === 2 &&
    (adjustedWidth >= 1920 || adjustedHeight >= 1920)
  ) {
    return "tablet";
  } else {
    return "phone";
  }
};

// Helper function to determine screen size category
const getScreenSizeCategory = (): "small" | "medium" | "large" => {
  if (SCALE < 350) return "small";
  if (SCALE > 500) return "large";
  return "medium";
};

export const getFontSize = (size: number): number => {
  const deviceType = getDeviceType();
  const screenCategory = getScreenSizeCategory();
  const config = fontConfig[deviceType][screenCategory];

  // Calculate the scale factor
  const scaleFactor = SCALE / BASE_WIDTH;

  // Clamp the scale factor between the configured min and max
  const clampedScaleFactor = Math.min(
    Math.max(scaleFactor, config.min),
    config.max
  );

  // Calculate the new size
  let newSize = size * clampedScaleFactor;

  // Additional scaling for tablets to ensure text isn't too small
  if (deviceType === "tablet") {
    newSize *= 1.1; // Increase tablet font sizes by an additional 10%
  }

  // Round the size and adjust for the device's font scale
  return (
    Math.round(PixelRatio.roundToNearestPixel(newSize)) /
    PixelRatio.getFontScale()
  );
};

// Font weights mapped to our Montserrat variations
export const FONT_WEIGHT = {
  light: "Montserrat-Light",
  regular: "Montserrat",
  medium: "Montserrat-Medium",
  semiBold: "Montserrat-SemiBold",
  bold: "Montserrat-Bold",
};

// Preset font sizes that scale with device
export const FONT_SIZE = {
  xs: getFontSize(10),
  sm: getFontSize(12),
  md: getFontSize(14),
  lg: getFontSize(16),
  xl: getFontSize(18),
  xxl: getFontSize(20),
  h3: getFontSize(24),
  h2: getFontSize(28),
  h1: getFontSize(32),
};

// Typographic styles that can be imported and used directly
export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.h1,
    lineHeight: getFontSize(38),
  },
  h2: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.h2,
    lineHeight: getFontSize(32),
  },
  h3: {
    fontFamily: FONT_WEIGHT.semiBold,
    fontSize: FONT_SIZE.h3,
    lineHeight: getFontSize(28),
  },
  title: {
    fontFamily: FONT_WEIGHT.semiBold,
    fontSize: FONT_SIZE.xl,
    lineHeight: getFontSize(24),
  },
  subtitle: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.lg,
    lineHeight: getFontSize(22),
  },
  body: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: FONT_SIZE.md,
    lineHeight: getFontSize(20),
  },
  caption: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: getFontSize(12),
  },
  button: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.md,
    lineHeight: getFontSize(18),
  },
};
