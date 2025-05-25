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
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { account, database } from "@/context/app-write";
import { ID, Query } from "react-native-appwrite";
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Text as SkiaText,
  useFont,
  Group,
  Circle,
} from "@shopify/react-native-skia";
import { primaryColor, width } from "@/constant/contant";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';

type FabricObject = {
  type: string;
  left: number;
  top: number;
  fontSize?: number;
  text?: string;
  src?: string;
  id: string;
  [key: string]: any;
};

type SkiaRenderable =
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
  };

// Optimized ImageLoader with dynamic loading
const useImageLoader = (maxImages = 20) => {
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
const useFonts = () => {
  const fontSizes = useMemo(() => 
    Array.from({ length: 43 }, (_, i) => i + 8), 
    []
  );

  const regularFonts = fontSizes.map(size =>
    useFont(require("../assets/fonts/Montserrat-Medium.ttf"), size)
  );
  const boldFonts = fontSizes.map(size =>
    useFont(require("../assets/fonts/Montserrat-Bold.ttf"), size)
  );
  const robotoRegularFonts = fontSizes.map(size =>
    useFont(require("../assets/fonts/Roboto-Medium.ttf"), size)
  );
  const robotoBoldFonts = fontSizes.map(size =>
    useFont(require("../assets/fonts/Roboto-Bold.ttf"), size)
  );

  return {
    fontSizes,
    regularFonts,
    boldFonts,
    robotoRegularFonts,
    robotoBoldFonts,
  };
};

const EditScreen = () => {
  const { postId: initialPostId } = useLocalSearchParams();
  const [currentPostId] = useState<string>(initialPostId as string);
  
  // State management
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [elements, setElements] = useState<SkiaRenderable[]>([]);
  const [imageSources, setImageSources] = useState<string[]>([]);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);
  const [isFrameLoading, setIsFrameLoading] = useState(false);
  const [selectedFontFamily, setSelectedFontFamily] = useState<'montserrat' | 'roboto'>('montserrat');
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<any>(null);
  const { imageHooks, updateUrls } = useImageLoader(20);
  const { fontSizes, regularFonts, boldFonts, robotoRegularFonts, robotoBoldFonts } = useFonts();

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

  const canvasDisplayHeight = useMemo(() => 
    canvasWidth ? (canvasHeight / canvasWidth) * (width - 40) : width - 40,
    [canvasWidth, canvasHeight]
  );

  const postImage = useImage(post?.previewImage);

  // Utility functions
  const getClosestFontSize = useCallback((size: number) => {
    return fontSizes.reduce((prev, curr) =>
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    );
  }, [fontSizes]);

  const getFontWithSize = useCallback((weight: string, fontSize: number) => {
    if (!frameWidth || !frameHeight) {
      const index = fontSizes.indexOf(12);
      return weight === 'bold' ? boldFonts[index] : regularFonts[index];
    }

    const screenWidth = width - 40;
    const screenHeight = screenWidth * (frameHeight / frameWidth);
    const scaleX = screenWidth / (frameWidth / 2);
    const scaleY = screenHeight / (frameHeight / 2);
    const scale = Math.min(scaleX, scaleY);
    const scaledSize = fontSize * scale;
    const closestSize = getClosestFontSize(scaledSize);
    const index = fontSizes.indexOf(closestSize - 5);

    if (index === -1) return null;
    
    if (selectedFontFamily === 'montserrat') {
      return weight === 'bold' ? boldFonts[index] : regularFonts[index];
    } else {
      return weight === 'bold' ? robotoBoldFonts[index] : robotoRegularFonts[index];
    }
  }, [frameWidth, frameHeight, selectedFontFamily, fontSizes, boldFonts, regularFonts, robotoBoldFonts, robotoRegularFonts, getClosestFontSize]);

  const calculatePositionFromRatio = useCallback((x: number, y: number) => {
    if (!frameWidth || !frameHeight) return { x, y };

    const screenWidth = width - 40;
    const screenHeight = screenWidth * (frameHeight / frameWidth);
    const scaleX = screenWidth / (frameWidth / 2);
    const scaleY = screenHeight / (frameHeight / 2);
    const newX = x * scaleX;
    const newY = y * scaleY;

    return { x: newX, y: newY };
  }, [frameWidth, frameHeight]);

  const parseFabricToSkia = useCallback((fabricJson: any): SkiaRenderable[] => {
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
        };
      }
      return null;
    }).filter(Boolean) as SkiaRenderable[];
  }, []);

  const selectFrame = useCallback((index: number) => {
    if (index >= 0 && index < frames.length) {
      setIsFrameLoading(true);
      setSelectedFrameIndex(index);
      const frame = frames[index];
      setSelectedFrame(frame);

      if (frame?.template) {
        try {
          const parsedElements = parseFabricToSkia(frame.template);
          setElements(parsedElements);
          setFrameWidth(frame.width);
          setFrameHeight(frame.height);
        } catch (error) {
          console.error("Error parsing frame template:", error);
        } finally {
          setTimeout(() => setIsFrameLoading(false), 500);
        }
      } else {
        setIsFrameLoading(false);
      }
    }
  }, [frames, parseFabricToSkia]);

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

      const snapshot = await canvasRef.current.makeImageSnapshot();
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

  // Effects
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
    setImageSources(sources);
  }, [elements]);

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

        // Select first frame without dependency on selectFrame
        if (framesResponse.documents && framesResponse.documents.length > 0) {
          const firstFrame = framesResponse.documents[0];
          setSelectedFrameIndex(0);
          setSelectedFrame(firstFrame);
          
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
  }, [currentPostId, parseFabricToSkia]);

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
    const position = calculatePositionFromRatio(el.x, el.y);
    const font = getFontWithSize(el.fontWeight, el.fontSize);
    if (!font) return null;

    let displayText = el.text;
    if (el.label && currentUser && currentUser[0]) {
      const userData = currentUser[0];
      switch (el.label) {
        case 'name':
          displayText = userData.name || el.text;
          break;
        case 'email':
          displayText = userData.email || el.text;
          break;
        case 'address':
          displayText = userData.address || el.text;
          break;
        case 'phone':
          displayText = userData.phone || el.text;
          break;
      }
    }

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
  }, [calculatePositionFromRatio, getFontWithSize, currentUser]);

  const renderImageElement = useCallback((el: SkiaRenderable & { type: 'image' }) => {
    let imgSrc = el.src;

    if (el.label === 'logo' && currentUser?.[0]?.logo) {
      if (!imageSources.includes(currentUser[0].logo)) {
        setImageSources(prev => [...prev, currentUser[0].logo]);
      }
      imgSrc = currentUser[0].logo;
    }

    if (el.label === 'userImage' && currentUser?.[0]?.profileImage) {
      if (!imageSources.includes(currentUser[0].profileImage)) {
        setImageSources(prev => [...prev, currentUser[0].profileImage]);
      }
      imgSrc = currentUser[0].profileImage;
    }

    const img = imgSrc ? imageMap[imgSrc] : null;
    if (!img) return null;

    const position = calculatePositionFromRatio(el.x, el.y);

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
      const size = Math.min(el.width, el.height);
      const centerX = position.x + size/2;
      const centerY = position.y + size/2;
      
      return (
        <Group key={el.id}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={size/2 + 4}
            color="white"
          />
          <SkiaImage
            image={img}
            x={position.x}
            y={position.y}
            width={size}
            height={size}
            fit="cover"
            clip={{
              rect: {
                x: position.x,
                y: position.y,
                width: size,
                height: size
              },
              rx: size/2,
              ry: size/2
            }}
          />
        </Group>
      );
    } else {
      return (
        <SkiaImage
          key={el.id}
          image={img}
          x={position.x}
          y={position.y}
          width={width - 40}
          height={width - 40}
          fit="fill"
        />
      );
    }
  }, [calculatePositionFromRatio, currentUser, imageSources, imageMap]);

  const renderFontSelectionBottomSheet = () => (
    <Modal
      visible={fontSelectorVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFontSelectorVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setFontSelectorVisible(false)}
      >
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
            >
              <Text style={styles.fontLabel}>Montserrat</Text>
              <Text style={[styles.fontPreview, { fontFamily: 'Montserrat' }]}>
                Sample Text
              </Text>
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
            >
              <Text style={styles.fontLabel}>Roboto</Text>
              <Text style={[styles.fontPreview, { fontFamily: 'Roboto' }]}>
                Sample Text
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.previewContainer}>
            <ScrollView
              horizontal={true}
              maximumZoomScale={3}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.canvasScrollContent}
            >
              <Canvas
                ref={canvasRef}
                style={[
                  styles.canvas,
                  {
                    width: width - 40,
                    height: canvasDisplayHeight,
                  }
                ]}
                onLayout={() => {
                  // Additional check when canvas layout is complete
                  setTimeout(() => {
                    if (canvasRef.current && !isFrameLoading && post && postImage) {
                      setIsCanvasReady(true);
                    }
                  }, 1000);
                }}
              >
                {!isFrameLoading && (
                  <>
                    <SkiaImage
                      image={postImage}
                      fit="contain"
                      x={0}
                      y={0}
                      width={width - 40}
                      height={width - 40}
                    />
                    {elements.map((el) => {
                      if (el.type === 'text') {
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
            </ScrollView>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setFontSelectorVisible(true)}
              activeOpacity={0.8}
            >
              <Feather name="type" size={24} color="white" />
              <Text style={styles.buttonText}>Change Font</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                (!isCanvasReady || isFrameLoading || loading || isDownloading) && styles.disabledButton
              ]}
              onPress={handleDownload}
              activeOpacity={0.8}
              disabled={!isCanvasReady || isFrameLoading || loading || isDownloading}
            >
              <Feather name="download" size={24} color="white" />
              <Text style={styles.buttonText}>
                {isDownloading ? 'Saving...' : 
                 (!isCanvasReady || isFrameLoading || loading) ? 'Preparing...' : 'Save to Gallery'}
              </Text>
            </TouchableOpacity>
          </View>

          {renderFontSelectionBottomSheet()}

          {frames.length > 0 && (
            <View style={styles.framesSection}>
              <Text style={styles.sectionTitle}>Available Frames</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.framesScrollView}
                contentContainerStyle={styles.framesContentContainer}
              >
                {frames.map((frame, index) => (
                  <TouchableOpacity
                    key={frame.$id}
                    style={[
                      styles.frameItem,
                      selectedFrameIndex === index ? styles.selectedFrame : styles.normalFrame
                    ]}
                    onPress={() => selectFrame(index)}
                  >
                    <Image
                      source={{ uri: frame.previewImage }}
                      style={styles.frameImage}
                      resizeMode="cover"
                    />
                    <View style={styles.frameDetails}>
                      <Text style={styles.frameName}>{frame.name || `Frame ${index + 1}`}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
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
    width: "100%",
    aspectRatio: 1,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasScrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    backgroundColor: "lightgrey",
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  framesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  framesScrollView: {
    flexGrow: 0,
  },
  framesContentContainer: {
    paddingVertical: 10,
  },
  frameItem: {
    width: 150,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedFrame: {
    borderWidth: 2,
    borderColor: "#007bff",
  },
  normalFrame: {
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  frameImage: {
    width: "100%",
    height: 100,
  },
  frameDetails: {
    padding: 8,
  },
  frameName: {
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
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
});