import React, { createContext, useContext, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TextProps,
  View,
  ViewProps,
} from "react-native";

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
    fontFamily: "Montserrat",
  },
  defaultView: {
    // Any default view styles you want
  },
});

// Create font utility functions to make it easier to use different weights
export const fontStyles = {
  light: { fontFamily: "Montserrat-Light" },
  regular: { fontFamily: "Montserrat" },
  medium: { fontFamily: "Montserrat-Medium" },
  semiBold: { fontFamily: "Montserrat-SemiBold" },
  bold: { fontFamily: "Montserrat-Bold" },
};

// Export custom components
export { ThemedText as Text, ThemedView as View };

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);
