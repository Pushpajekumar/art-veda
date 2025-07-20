import { useFont } from "@shopify/react-native-skia";
import { useMemo } from "react";

// Optimized font loading
export const useFonts = () => {
  const fontSizes = useMemo(
    () => Array.from({ length: 43 }, (_, i) => i + 8),
    []
  );

  const regularFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Montserrat-Medium.ttf"), size)
  );
  const boldFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Montserrat-Bold.ttf"), size)
  );
  const robotoRegularFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Roboto-Medium.ttf"), size)
  );
  const robotoBoldFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Roboto-Bold.ttf"), size)
  );
  // Add Hindi fonts
  const hindiRegularFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Hind-Regular.ttf"), size)
  );
  const hindiBoldFonts = fontSizes.map((size) =>
    useFont(require("../assets/fonts/Hind-Bold.ttf"), size)
  );

  return {
    fontSizes,
    regularFonts,
    boldFonts,
    robotoRegularFonts,
    robotoBoldFonts,
    hindiRegularFonts,
    hindiBoldFonts,
  };
};


  // Function to detect Hindi (Devanagari) characters
 export const isHindiText = (text: string) => /[\u0900-\u097F]/.test(text);