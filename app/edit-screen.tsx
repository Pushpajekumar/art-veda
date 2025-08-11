import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo, FC } from "react";
import { useLocalSearchParams } from "expo-router";
import { account, database } from "@/context/app-write";
import { ID, Query } from "react-native-appwrite";
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Text as SkiaText,
  Group,
  Circle,
  Rect,
} from "@shopify/react-native-skia";
import { primaryColor, secondaryColor, primary_textColor, secondary_textColor, width } from "@/constant/contant";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import { 
  isHindiText, 
  useFonts, 
  useImageLoader, 
  SkiaRenderable, 
  parseFabricToSkia,
  getCanvasOrientation,
  calculatePositionFromRatio
} from "@/utils/edit-utilities";

// Helper to derive canvas container style based on orientation and computed sizes
const getCanvasContainerStyle = (
  orientation: 'square' | 'portrait' | 'landscape' | null,
  postWidthTesting: number,
  postHeightTesting: number,
  deviceWidth: number
) => {
  if (orientation === 'square') {
    return { width: postWidthTesting, height: postHeightTesting };
  }
  if (orientation === 'portrait') {
    return { width: postWidthTesting / 1.5, height: postHeightTesting / 1.5 };
  }
  // landscape default
  return { width: deviceWidth - 40, height: (deviceWidth - 40) * 0.7 };
};

// Small bouncy button component for delightful presses
const BouncyButton = ({ children, onPress, disabled, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const EditScreen = () => {
  const { postId: initialPostId } = useLocalSearchParams();
  const [currentPostId] = useState<string>(initialPostId as string);
  const { width : deviceWidth, height: deviceHeight } = Dimensions.get('window');

  // State management
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [elements, setElements] = useState<SkiaRenderable[]>([]);
  const [imageSources, setImageSources] = useState<string[]>([]);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);
  const [imageShapeVisible, setImageShapeVisible] = useState(false);
  const [selectedImageShape, setSelectedImageShape] = useState<'square' | 'circle'>('square');
  const [isFrameLoading, setIsFrameLoading] = useState(false);
  const [selectedFontFamily, setSelectedFontFamily] = useState<'montserrat' | 'roboto'>('montserrat');
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<any>(null);
  const { imageHooks, updateUrls } = useImageLoader(20);
  const { fontSizes, regularFonts, boldFonts, robotoRegularFonts, robotoBoldFonts, hindiRegularFonts, hindiBoldFonts } = useFonts();

  // Memoized calculations
  const imageMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof useImage> | null> = {};
    imageSources.forEach((src, index) => {
      if (index < imageHooks.length) {
        map[src] = imageHooks[index];
      } else {
        map[src] = null;
      }
    });
    return map;
  }, [imageSources, imageHooks]);

  // Determine if the canvas is portrait, landscape, or square
  const canvasOrientation = useMemo(() => 
    getCanvasOrientation(canvasWidth, canvasHeight), 
    [canvasWidth, canvasHeight]
  );

  // Canvas ratios and derived sizes (memoized)
  const { widthRatio, heightRatio, postWidthTesting, postHeightTesting } = useMemo(() => {
    const safeWidthRatio = canvasWidth ? (deviceWidth - 40) / canvasWidth : 1;
    const safeHeightRatio = canvasHeight ? (deviceHeight - 40) / canvasHeight : 1;
    return {
      widthRatio: safeWidthRatio,
      heightRatio: safeHeightRatio,
      postWidthTesting: canvasWidth ? canvasWidth * safeWidthRatio : deviceWidth - 40,
      postHeightTesting: canvasHeight ? canvasHeight * safeWidthRatio : deviceWidth - 40,
    };
  }, [canvasWidth, canvasHeight, deviceWidth, deviceHeight]);

  const postImage = useImage(post?.previewImage);

  // Function to get font with size and weight, fallback to Hindi font if Hindi detected
  const getFontWithSize = useCallback((weight: string, fontSize: number, text?: string) => {
    let scaledFontSize = fontSize * widthRatio * 1.2;
    if (canvasOrientation === 'portrait') {
      scaledFontSize = scaledFontSize / 1.5;
    }

    const closestSize = fontSizes.reduce((prev, curr) =>
      Math.abs(curr - scaledFontSize) < Math.abs(prev - scaledFontSize) ? curr : prev
    );
    const index = fontSizes.indexOf(closestSize);

    // If Hindi detected, use Hindi font
    if (text && isHindiText(text)) {
      if (index === -1) return null;
      return weight === 'bold' ? hindiBoldFonts[index] : hindiRegularFonts[index];
    }

    if (index === -1) return null;

    if (selectedFontFamily === 'montserrat') {
      return weight === 'bold' ? boldFonts[index] : regularFonts[index];
    } else {
      return weight === 'bold' ? robotoBoldFonts[index] : robotoRegularFonts[index];
    }
  }, [
    widthRatio,
    selectedFontFamily,
    fontSizes,
    boldFonts,
    regularFonts,
    robotoBoldFonts,
    robotoRegularFonts,
    canvasOrientation,
    hindiRegularFonts,
    hindiBoldFonts,
  ]);

  // Use the extracted calculatePositionFromRatio, but wrapped to provide the component-specific params
  const getAdjustedPosition = useCallback((x: number, y: number) => {
    return calculatePositionFromRatio(x, y, frameWidth, frameHeight, widthRatio, canvasOrientation);
  }, [frameWidth, frameHeight, widthRatio, canvasOrientation]);

  // Filter frames based on canvas orientation and user access
  const compatibleFrames = useMemo(() => {
    if (!frames || !Array.isArray(frames) || !frames.length || !canvasOrientation) return [];
    
    return frames.filter(frame => {
      // Determine frame orientation
      const frameOrientation = frame.width === frame.height ? 'square' : 
                              frame.width > frame.height ? 'landscape' : 'portrait';
      
      // Check if frame matches the post orientation
      const orientationMatch = frameOrientation === canvasOrientation;
      
      // Check if user has access to this frame
      let userAccess = false;
      
      if (!frame.users || frame.users.length === 0) {
        userAccess = true;
      } else if (currentUser && currentUser.length > 0) {
        const currentUserId = currentUser[0].$id;
        
        userAccess = frame.users.some((frameUser: any) => {
          if (typeof frameUser === 'string') {
            return frameUser === currentUserId;
          } else if (frameUser && frameUser.$id) {
            return frameUser.$id === currentUserId;
          } else if (frameUser && frameUser.userId) {
            return frameUser.userId === currentUserId;
          }
          return false;
        });
      }
      
      // Only show frames that match orientation AND user has access to
      return orientationMatch && userAccess;
    });
  }, [frames, canvasOrientation, currentUser]);

  // (Removed duplicate auto-select effect; kept a single one below)

  const selectFrame = useCallback((index: number) => {
    if (index < 0 || index >= compatibleFrames.length) return;

    setIsFrameLoading(true);
    setSelectedFrameIndex(index);
    const frame = compatibleFrames[index];

    if (frame?.template) {
      try {
        const parsedElements = parseFabricToSkia(frame.template);
        setElements(parsedElements);

        let newWidth = frame.width * widthRatio;
        let newHeight = frame.height * widthRatio;

        if (canvasOrientation === 'portrait' || canvasOrientation !== 'square') {
          newWidth /= 1.5;
          newHeight /= 1.5;
        }

        setFrameWidth(newWidth);
        setFrameHeight(newHeight);

        // console.info("Parsed Elements:", parsedElements, "Frame Width:", newWidth, "Frame Height:", newHeight, "🟢🔴🟡🔵");
      } catch (error) {
        console.error("Error parsing frame template:", error);
      } finally {
        setTimeout(() => setIsFrameLoading(false), 500);
      }
    } else {
      setIsFrameLoading(false);
    }
  }, [compatibleFrames, parseFabricToSkia, widthRatio, canvasOrientation]);

  const handleDownload = useCallback(async () => {
    if (!isCanvasReady || !canvasRef.current || isDownloading) {
      if (isDownloading) {
        return; // Prevent multiple download attempts
      }
      Alert.alert('Error', 'Canvas is not ready yet. Please wait.');
      return;
    }

    setIsDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'To save images, this app needs access to your media library.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Double check canvas is still available
      if (!canvasRef.current) {
        Alert.alert('Error', 'Canvas not ready. Please try again.');
        return;
      }

      const snapshot = await canvasRef.current.makeImageSnapshot(undefined, 3);
      if (!snapshot) {
        Alert.alert('Error', 'Failed to take a snapshot. Please try again.');
        return;
      }

      const base64 = snapshot.encodeToBase64();
      const fileUri = FileSystem.cacheDirectory + `art_frame_${Date.now()}.png`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(fileUri);

      if (Platform.OS === 'android') {
        try {
          const albumName = 'ArtVeda';
          const album = await MediaLibrary.getAlbumAsync(albumName);
          
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
          }
        } catch (albumError) {
          console.error('Album creation error:', albumError);
        }
      }

      if (currentUser && currentUser.length > 0) {
        try {
          await database.createDocument(
            '6815de2b0004b53475ec',
            '681a1b3c0020eb66b3b1',
            ID.unique(),
            {
              posts: [currentPostId],
              users: [currentUser[0].$id],
              userId: currentUser[0].$id,
            }
          );
        } catch (dbError) {
          console.error('Failed to save download record:', dbError);
        }
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show('Image saved successfully!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Image saved to your gallery!');
      }

      await FileSystem.deleteAsync(fileUri, { idempotent: true });

    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', `Failed to save image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  }, [currentPostId, currentUser, isCanvasReady, isDownloading]);

  // Fetching User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accountDetails = await account.get();
        const userId = accountDetails?.$id;

        const userDetails = await database.listDocuments(
          "6815de2b0004b53475ec",
          "6815e0be001731ca8b1b",
          [Query.equal("userId", userId)]
        );
        setCurrentUser(userDetails.documents);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    updateUrls(imageSources);
  }, [imageSources, updateUrls]);


  useEffect(() => {
    const sources: string[] = [];
    elements.forEach(el => {
      if (el.type === 'image' && el.src) {
        sources.push(el.src);
      }
    });
    const logo = currentUser?.[0]?.logo;
    if (logo) sources.push(logo);
    const profileImage = currentUser?.[0]?.profileImage;
    if (profileImage) sources.push(profileImage);
    const unique = Array.from(new Set(sources));
    setImageSources(unique);
  }, [elements, currentUser]);

  // Fetch post and frames data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [postDetails, framesResponse] = await Promise.all([
          database.getDocument(
            "6815de2b0004b53475ec",
            "6815de8d00124a0a9572",
            currentPostId
          ),
          database.listDocuments(
            "6815de2b0004b53475ec",
            "6815de5300077ef22735"
          ),
        ]);

        setPost(postDetails);
        setCanvasWidth(postDetails.width);
        setCanvasHeight(postDetails.height);
        setFrames(framesResponse.documents);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentPostId) {
      fetchInitialData();
    }
  }, [currentPostId]);

  // Auto-select first compatible frame when frames are loaded and filtered
  useEffect(() => {
    if (compatibleFrames.length > 0 && !loading) {
      const firstFrame = compatibleFrames[0];
      setSelectedFrameIndex(0);
      
      if (firstFrame?.template) {
        try {
          const parsedElements = parseFabricToSkia(firstFrame.template);
          setElements(parsedElements);
          setFrameWidth(firstFrame.width);
          setFrameHeight(firstFrame.height);
        } catch (error) {
          console.error("Error parsing frame template:", error);
        }
      }
    }
  }, [compatibleFrames, loading, parseFabricToSkia]);

  // Check canvas readiness based on multiple conditions
  useEffect(() => {
    if (post && postImage && !isFrameLoading && elements.length >= 0 && !loading) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          setIsCanvasReady(true);
        }
      }, 2500); // Reduced delay for better responsiveness
      
      return () => clearTimeout(timer);
    } else {
      setIsCanvasReady(false);
    }
  }, [post, postImage, isFrameLoading, elements, loading]);

  // Reset canvas ready state when frame changes
  useEffect(() => {
    if (isFrameLoading) {
      setIsCanvasReady(false);
    }
  }, [isFrameLoading]);

  // Additional effect to check canvas readiness after frame loading completes
  useEffect(() => {
    if (!isFrameLoading && post && postImage && elements.length >= 0 && !loading) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          setIsCanvasReady(true);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isFrameLoading, post, postImage, elements, loading]);

  // Render functions
  const renderTextElement = useCallback((el: SkiaRenderable & { type: 'text' }) => {
    const position = getAdjustedPosition(el.x, el.y);
    let displayText = el.text;
    if (el.label && currentUser && currentUser[0]) {
      const userData = currentUser[0];
      switch (el.label) {
        case 'name':
          displayText = userData.name || " ";
          break;
        case 'email':
          displayText = userData.email || " ";
          break;
        case 'address':
          displayText = userData.address || " ";
          break;
        case 'phone':
          displayText = userData.phone || " ";
          break;
      }
    }

    const font = getFontWithSize(el.fontWeight, el.fontSize, displayText);

    // If Hindi, fallback to system font by not passing font prop
    if (font === undefined) {
      return (
        <SkiaText
          key={el.id}
          x={position.x}
          y={position.y}
          text={displayText}
          color={el.fill}
          font={null}
        />
      );
    }

    if (!font) return null;

    return (
      <SkiaText
        key={el.id}
        x={position.x}
        y={position.y}
        text={displayText}
        font={font}
        color={el.fill}
      />
    );
  }, [getAdjustedPosition, getFontWithSize, currentUser]);

  const renderImageElement = useCallback((el: SkiaRenderable & { type: 'image' }) => {
    // console.log(el, "Rendering Image Element 🟢🔴🟡🔵");

    let imgSrc = el.src;

    if (el.label === 'logo') {
      imgSrc = currentUser?.[0]?.logo;
      if (!imgSrc) return null;
    }

    if (el.label === 'userImage') {
      imgSrc = currentUser?.[0]?.profileImage;
      if (!imgSrc) return null;
    }

    const img = imgSrc ? imageMap[imgSrc] : null;
    if (!img) return null;

    const position = getAdjustedPosition(el.x, el.y);

    if (el.label === 'logo') {
      return (
        <SkiaImage
          key={el.id}
          image={img}
          x={position.x}
          y={position.y}
          width={el.width}
          height={el.height}
          fit="fill"
        />
      );
    } else if (el.label === 'userImage') {

      // const centerX = position.x + el.width/2;
      // const centerY = position.y + el.height/2;

      // Make user images bigger by increasing width and height by 40%
      const scale = 1.2;
      const scaledWidth = el.width * scale;
      const scaledHeight = el.height * scale;
      const offsetX = (scaledWidth - el.width) / 2;
      const offsetY = (scaledHeight - el.height) / 2;
      const scaledPosition = {
        x: position.x - offsetX,
        y: position.y - offsetY,
      };
      const centerX = scaledPosition.x + scaledWidth / 2;
      const centerY = scaledPosition.y + scaledHeight / 2;

      if (selectedImageShape === 'circle') {
        const radius = Math.min(scaledWidth, scaledHeight) / 2;
        return (
          <Group key={el.id}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius + 4}
          color="white"
        />
        <SkiaImage
          image={img}
          x={scaledPosition.x}
          y={scaledPosition.y}
          width={scaledWidth}
          height={scaledHeight}
          fit="cover"
          clip={{
            rect: {
          x: scaledPosition.x,
          y: scaledPosition.y,
          width: scaledWidth,
          height: scaledHeight
            },
            rx: radius,
            ry: radius
          }}
        />
          </Group>
        );
      } else if (selectedImageShape === 'square') {
        return (
          <Group key={el.id}>
        <Rect
          x={scaledPosition.x - 2}
          y={scaledPosition.y - 2}
          width={scaledWidth + 4}
          height={scaledHeight + 4}
          color="white"
        />
        <SkiaImage
          image={img}
          x={scaledPosition.x}
          y={scaledPosition.y}
          width={scaledWidth}
          height={scaledHeight}
          fit="cover"
        />
          </Group>
        );
      } else { // rectangle
      return (
        <SkiaImage
        key={el.id}
        image={img}
        x={position.x}
        y={position.y}
        width={el.width }
        height={el.height}
        fit="cover"
        />
      );
      }
    } else {
      // console.log(el, "Rendering image element 🟢🔴🟡🔵");
      // console.log((el.width * widthRatio / 1.5) * 2, (el.height * heightRatio / 1.5) * 2, "Image Width and Height 📏");
      // console.log(el.x, el.y, "Image new x and y position 📏");
      // console.log((el.width * widthRatio / 1.5) * 2  , (el.height * widthRatio / 1.5) * 2 , "Image new Width and Height 📏");
      // console.log(((el.x * widthRatio * 2 * 2) / 1.5)   , ((el.y * heightRatio * 2 * 2) / 1.5)  , "Image new x and y position 📏");
      // console.log(el.scaleX, el.scaleY, "Image scaleX and scaleY 📏");
    
      // In portrait, only multiply by scaleX/scaleY if scale < 1, otherwise don't multiply
      const portraitX =
        ((el.x * widthRatio * 2) / 1.5);
      const portraitY =
        ((el.y * widthRatio * 2) / 1.5);
      const portraitWidth =
        ((el.width * widthRatio) * 2  ) / 1.5;
      const portraitHeight =
        ((el.height * widthRatio) * 2 ) / 1.5;

      return (
        <SkiaImage
          key={el.id}
          image={img}
          x={
        canvasOrientation === 'portrait'
          ? portraitX
          : ((el.x * widthRatio * 2) / 1.5)
          }
          y={
        canvasOrientation === 'portrait'
          ? portraitY
          : ((el.y * heightRatio * 2) / 1.5)
          }
          width={
        canvasOrientation === 'square'
          ? (el.width * widthRatio * 2)
          : canvasOrientation === 'portrait'
            ? portraitWidth
            : (el.width * widthRatio * 2) / 1.5
          }
          height={
        canvasOrientation === 'square'
          ? (el.width * widthRatio * 2)
          : canvasOrientation === 'portrait'
            ? portraitHeight
            : (el.height * widthRatio / 1.5) * 2 
          }
          fit="fill"
        />
      );
    }
  }, [calculatePositionFromRatio, currentUser, imageMap, selectedImageShape, widthRatio, heightRatio, canvasOrientation]);

  const renderFontSelectionBottomSheet = () => (
    <Modal
      visible={fontSelectorVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFontSelectorVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setFontSelectorVisible(false)}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Select Font</Text>

          <View style={styles.fontOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.fontOption,
                selectedFontFamily === 'montserrat' && styles.selectedFontOption
              ]}
              onPress={() => {
                setSelectedFontFamily('montserrat');
                setFontSelectorVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.fontLabel}>Montserrat</Text>
              <Text style={styles.fontPreview}>Sample Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fontOption,
                selectedFontFamily === 'roboto' && styles.selectedFontOption
              ]}
              onPress={() => {
                setSelectedFontFamily('roboto');
                setFontSelectorVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.fontLabel}>Roboto</Text>
              <Text style={styles.fontPreview}>Sample Text</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderImageShapeSelectionBottomSheet = () => (
    <Modal
      visible={imageShapeVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setImageShapeVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setImageShapeVisible(false)}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Select Image Shape</Text>

          <View style={styles.shapeOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.shapeOption,
                selectedImageShape === 'square' && styles.selectedShapeOption
              ]}
              onPress={() => {
                setSelectedImageShape('square');
                setImageShapeVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Feather name="square" size={32} color={selectedImageShape === 'square' ? primaryColor : '#666'} />
              <Text style={styles.shapeLabel}>Square</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shapeOption,
                selectedImageShape === 'circle' && styles.selectedShapeOption
              ]}
              onPress={() => {
                setSelectedImageShape('circle');
                setImageShapeVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Feather name="circle" size={32} color={selectedImageShape === 'circle' ? primaryColor : '#666'} />
              <Text style={styles.shapeLabel}>Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading post</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenTitle}>Customize Your Post</Text>
            <View style={styles.headerRow}>
              <Text style={styles.screenSubtitle}>Pick a frame, tweak text and shape</Text>
              <View style={styles.chip}>
                <Feather name="smartphone" size={14} color={primaryColor} />
                <Text style={styles.chipText}>{canvasOrientation || 'auto'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Preview</Text>
                <View style={styles.badgeSoft}>
                  <Text style={styles.badgeSoftText}>Live</Text>
                </View>
              </View>
              <View style={[styles.canvas, getCanvasContainerStyle(canvasOrientation, postWidthTesting, postHeightTesting, deviceWidth)]}>
              <Canvas
                ref={canvasRef}
                style={StyleSheet.absoluteFill}
              >
                {!isFrameLoading && (
                  <>
                    <SkiaImage
                      image={postImage}
                      fit="contain"
                      x={0}
                      y={0}
                      width={canvasOrientation === 'square'
                        ? deviceWidth - 40
                        : canvasOrientation === 'portrait'
                          ? postWidthTesting/1.5
                          : width - 40}
                      height={canvasOrientation === 'square'
                        ? deviceWidth - 40
                        : canvasOrientation === 'portrait'
                          ? postHeightTesting/1.5
                          : width - 40}
                    />
                    {elements.map((el) => {
                      if (el.type === 'text') {
                        // console.warn(el, "Rendering Text Element 📝🔵");
                        return renderTextElement(el);
                      }
                      if (el.type === 'image') {
                        return renderImageElement(el);
                      }
                      return null;
                    })}
                  </>
                )}
              </Canvas>

              {isFrameLoading && (
                <View style={styles.frameLoadingOverlay}>
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text style={styles.loadingFrameText}>Loading frame...</Text>
                </View>
              )}
              </View>
            </View>
          </View>
          {/* Spacer for floating bar */}
          <View style={{ height: 96 }} />

          {renderFontSelectionBottomSheet()}
          {renderImageShapeSelectionBottomSheet()}

            {compatibleFrames.length > 0 ? (
            <View style={styles.framesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Available Frames</Text>
                <View style={styles.countChip}><Text style={styles.countChipText}>{compatibleFrames.length}</Text></View>
              </View>
              <FlatList
                horizontal
                data={compatibleFrames}
                keyExtractor={(item: any) => item.$id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.framesContentContainer}
                renderItem={({ item, index }) => {
                  let isPremium = false;
                  const myUserId = currentUser?.[0]?.$id;
                  if (item.users && item.users.length > 0 && myUserId) {
                    isPremium = item.users.some((u: any) =>
                      (typeof u === "string" && u === myUserId) ||
                      (u && u.$id === myUserId) ||
                      (u && u.userId === myUserId)
                    );
                  }
                  const isSelected = selectedFrameIndex === index;
                  return (
                    <FrameCard
                      item={item}
                      index={index}
                      isSelected={isSelected}
                      isPremium={isPremium}
                      orientationText={item.orientation || canvasOrientation}
                      onPress={() => selectFrame(index)}
                    />
                  );
                }}
              />
            </View>
            ) : (
            <View style={styles.framesSection}>
              <Text style={styles.sectionTitle}>No Available Frames</Text>
              <View style={styles.emptyStateCard}>
                <Feather name="image" size={28} color={primaryColor} />
                <Text style={styles.noFramesText}>
                  No {canvasOrientation} frames are available for your account.
                </Text>
              </View>
            </View>
            )}
        </View>
  </ScrollView>
      <FloatingActionBar
        disabledPrimary={!isCanvasReady || isFrameLoading || loading || isDownloading}
        onFont={() => setFontSelectorVisible(true)}
        onShape={() => setImageShapeVisible(true)}
        onDownload={handleDownload}
      />
    </View>
  );
};

export default EditScreen;

// Floating action bar component
const FloatingActionBar: FC<{
  disabledPrimary?: boolean;
  onFont: () => void;
  onShape: () => void;
  onDownload: () => void;
}> = ({ disabledPrimary, onFont, onShape, onDownload }) => {
  return (
    <View style={styles.floatingBarWrapper} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        <BouncyButton onPress={onFont} style={styles.fabNeutral}>
          <Feather name="type" size={18} color={primaryColor} />
          <Text style={styles.fabLabel}>Font</Text>
        </BouncyButton>
        <BouncyButton onPress={onShape} style={styles.fabNeutral}>
          <Feather name="square" size={18} color={primaryColor} />
          <Text style={styles.fabLabel}>Shape</Text>
        </BouncyButton>
        <BouncyButton
          onPress={onDownload}
          disabled={!!disabledPrimary}
          style={[styles.fabPrimary, disabledPrimary && styles.disabledPrimary]}
        >
          <Feather name="download" size={18} color={secondary_textColor} />
          <Text style={styles.fabLabelPrimary}>Download</Text>
        </BouncyButton>
      </View>
    </View>
  );
};

// Reusable frame card
const FrameCard: FC<{
  item: any;
  index: number;
  isSelected: boolean;
  isPremium: boolean;
  orientationText?: string | null;
  onPress: () => void;
}> = ({ item, isSelected, isPremium, orientationText, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={{ marginRight: 12 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <View style={[styles.frameItem, isSelected ? styles.selectedFrame : styles.normalFrame]}>
          <View>
            <Image source={{ uri: item.previewImage }} style={styles.frameImage} resizeMode="cover" />
            <View style={styles.frameImageOverlay} />
            <View style={styles.frameBottomBar}>
              <Text style={styles.frameBottomText} numberOfLines={1}>
                {item.name || 'Untitled'}
              </Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
            {isSelected && <View style={styles.selectionGlow} />}
          </View>
          <View style={styles.frameDetails}>
            {orientationText ? (
              <View style={styles.smallChip}><Text style={styles.smallChipText}>{orientationText}</Text></View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#F7FAFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: primary_textColor,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  headerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${secondaryColor}40`,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipText: {
    color: primaryColor,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  previewContainer: {
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
  padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#E9EEF5',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: primary_textColor,
  },
  badgeSoft: {
    backgroundColor: `${primaryColor}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSoftText: {
    color: primaryColor,
    fontWeight: '700',
    fontSize: 12,
  },
  canvasScrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    backgroundColor: "lightgrey",
  },
  // Old toolbar styles kept for reference; floating bar replaces it
  actionButton: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    minHeight: 56,
  },
  actionButtonNeutral: {
    flex: 1,
    backgroundColor: `${secondaryColor}40`,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledPrimary: {
    backgroundColor: '#8ecbff',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  actionLabel: {
    color: primaryColor,
    fontWeight: '600',
    fontSize: 14,
  },
  actionLabelPrimary: {
    color: secondary_textColor,
    fontWeight: '700',
    fontSize: 14,
  },
  framesSection: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  countChip: {
    backgroundColor: `${secondaryColor}60`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countChipText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 12,
  },
  framesScrollView: {
    flexGrow: 0,
  },
  framesContentContainer: {
    paddingVertical: 10,
  },
  frameItem: {
  width: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  backgroundColor: "#fff",
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#E9EEF5',
  },
  selectedFrame: {
  borderWidth: 2,
  borderColor: primaryColor,
  },
  normalFrame: {
  borderWidth: 1,
  borderColor: "#eeeeee",
  },
  frameImage: {
    width: "100%",
  height: 120,
  },
  frameImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  frameBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  frameBottomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  frameDetails: {
    padding: 8,
  },
  frameName: {
    fontWeight: "500",
  },
  smallChip: {
    alignSelf: 'flex-start',
    backgroundColor: `${secondaryColor}40`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  smallChipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  premiumText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectionGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderWidth: 2,
    borderColor: `${primaryColor}60`,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    maxHeight: '50%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fontOptionsContainer: {
    marginBottom: 20,
  },
  fontOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 60,
  },
  selectedFontOption: {
    borderColor: primaryColor,
    backgroundColor: `${primaryColor}10`,
  },
  fontLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  fontPreview: {
    fontSize: 16,
    color: '#666',
  },
  frameLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingFrameText: {
    marginTop: 10,
    fontSize: 14,
    color: primaryColor,
    fontWeight: '500',
  },
  shapeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  shapeOption: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedShapeOption: {
    borderColor: primaryColor,
    backgroundColor: `${primaryColor}10`,
  },
  shapeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  noFramesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  emptyStateCard: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Floating action bar styles
  floatingBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    paddingBottom: 20,
  },
  floatingBar: {
    backgroundColor: '#FFFFFFEE',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E9EEF5',
  },
  fabNeutral: {
    flex: 1,
    backgroundColor: `${secondaryColor}30`,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fabPrimary: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fabLabel: {
    color: primaryColor,
    fontWeight: '700',
    fontSize: 13,
  },
  fabLabelPrimary: {
    color: secondary_textColor,
    fontWeight: '700',
    fontSize: 13,
  },
});