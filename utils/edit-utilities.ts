import { useFont, useImage } from "@shopify/react-native-skia";
import { useMemo, useState, useCallback } from "react";

// Types
export type FabricObject = {
  type: string;
  left: number;
  top: number;
  fontSize?: number;
  text?: string;
  src?: string;
  id: string;
  [key: string]: any;
};

export type SkiaRenderable =
  | {
    type: 'text';
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    fill: string;
    label: string;
  }
  | { 
    type: 'image'; 
    id: string; 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    src: string; 
    label: string; 
    scaleX?: number;
    scaleY?: number;
  };

// Optimized ImageLoader with dynamic loading
export const useImageLoader = (maxImages = 20) => {
  const [urls, setUrls] = useState<Array<string | null>>(Array(maxImages).fill(null));
  
  const imageHooks = Array.from({ length: maxImages }, (_, i) => 
    useImage(urls[i])
  );

  const updateUrls = useCallback((newUrls: string[]) => {
    const updatedUrls = Array(maxImages).fill(null);
    newUrls.forEach((url, i) => {
      if (i < maxImages) {
        updatedUrls[i] = url;
      }
    });
    setUrls(updatedUrls);
  }, [maxImages]);

  return { imageHooks, updateUrls };
};

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

// Canvas orientation calculation
export const getCanvasOrientation = (width: number, height: number) => {
  if (!width || !height) return null;
  if (width === height) return 'square';
  if (width > height) return 'landscape';
  return 'portrait';
};

// Parse Fabric JSON to Skia renderable elements
export const parseFabricToSkia = (fabricJson: any): SkiaRenderable[] => {
  let fabricObjects;
  if (typeof fabricJson === 'string') {
    try {
      fabricObjects = JSON.parse(fabricJson);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  } else {
    fabricObjects = fabricJson;
  }

  const objects = fabricObjects?.objects || [];

  return objects.map((obj: FabricObject) => {
    if (obj.type === 'IText') {
      return {
        type: 'text',
        id: obj.id,
        x: obj.left ?? 0,
        y: (obj.top ?? 0) + (obj.fontSize ?? 12),
        text: obj.text ?? '',
        fontSize: obj.fontSize ?? 12,
        fontWeight: (obj.fontWeight ?? 'normal') as 'normal' | 'bold',
        fontStyle: (obj.fontStyle ?? 'normal') as 'normal' | 'italic',
        fill: obj.fill ?? '#000000',
        label: obj.label ?? '',
      };
    }
    if (obj.type === 'Image') {
      const isConstrainedSize = obj.label === 'logo' || obj.label === 'userImage';
      return {
        type: 'image',
        id: obj.id,
        x: obj.left ?? 0,
        y: obj.top ?? 0,
        width: isConstrainedSize
          ? Math.min(80, (obj.width ?? 50) * (obj.scaleX ?? 1))
          : (obj.width ?? 50) * (obj.scaleX ?? 1),
        height: isConstrainedSize
          ? Math.min(80, (obj.height ?? 50) * (obj.scaleY ?? 1))
          : (obj.height ?? 50) * (obj.scaleY ?? 1),
        src: obj.src ?? '',
        label: obj.label ?? '',
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
      };
    }
    return null;
  }).filter(Boolean) as SkiaRenderable[];
};

// Calculate position from ratio (can be reused)
export const calculatePositionFromRatio = (
  x: number, 
  y: number, 
  frameWidth: number, 
  frameHeight: number, 
  widthRatio: number, 
  canvasOrientation: string | null
) => {
  if (!frameWidth || !frameHeight) return { x, y };
  let newX: number, newY: number;
  if (canvasOrientation === 'square') {
    newX = x * widthRatio * 2;
    newY = y * widthRatio * 2;
  } else if (canvasOrientation === 'portrait') {
    newX = (x * widthRatio * 2) / 1.5;
    newY = (y * widthRatio * 2) / 1.5;
  } else {
    newX = (x * widthRatio * 2) / 1.5;
    newY = (y * widthRatio * 2) / 1.5;
  }
  return { x: newX, y: newY };
};