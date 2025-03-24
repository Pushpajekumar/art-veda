import React, { createContext, useContext, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TextProps,
  View,
  ViewProps,
} from "react-native";
import { FONT_WEIGHT, TYPOGRAPHY, FONT_SIZE } from "../utils/fonts";

// Create the theme context
const ThemeContext = createContext(null);

// Create text components with default styles
const ThemedText = ({ style, ...props }: TextProps) => {
  return <Text style={[styles.defaultText, style]} {...props} />;
};

// Create view components with default styles
const ThemedView = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.defaultView, style]} {...props} />;
};

// Theme provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Override the default Text component
  if ((Text as any).defaultProps === undefined) {
    (Text as any).defaultProps = {};
  }
  (Text as any).defaultProps.style = [
    styles.defaultText,
    (Text as any).defaultProps?.style,
  ];

  return <ThemeContext.Provider value={null}>{children}</ThemeContext.Provider>;
};

// Define default styles
const styles = StyleSheet.create({
  defaultText: {
    ...TYPOGRAPHY.body,
  },
  defaultView: {
    // Any default view styles you want
  },
});

// Export the font styles from our utility
export { FONT_WEIGHT as fontStyles, TYPOGRAPHY, FONT_SIZE } from "../utils/fonts";

// Export custom components
export { ThemedText as Text, ThemedView as View };

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);
