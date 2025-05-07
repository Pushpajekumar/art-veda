import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  Modal,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { account, database } from "@/context/app-write";
import { ID, Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Text as SkiaText,
  useFont,
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
  | {  type: 'text';
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
  | { type: 'image'; id: string; x: number; y: number; width: number; height: number; src: string; label: string; };

const ImageLoader = ({ maxImages = 20 }) => {
  const [urls, setUrls] = useState<Array<string | null>>(Array(maxImages).fill(null));
  
  const img1 = useImage(urls[0]);
  const img2 = useImage(urls[1]);
  const img3 = useImage(urls[2]);
  const img4 = useImage(urls[3]);
  const img5 = useImage(urls[4]);
  const img6 = useImage(urls[5]);
  const img7 = useImage(urls[6]);
  const img8 = useImage(urls[7]);
  const img9 = useImage(urls[8]);
  const img10 = useImage(urls[9]);
  const img11 = useImage(urls[10]);
  const img12 = useImage(urls[11]);
  const img13 = useImage(urls[12]);
  const img14 = useImage(urls[13]);
  const img15 = useImage(urls[14]);
  const img16 = useImage(urls[15]);
  const img17 = useImage(urls[16]);
  const img18 = useImage(urls[17]);
  const img19 = useImage(urls[18]);
  const img20 = useImage(urls[19]);
  
  const imageHooks = [
    img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
    img11, img12, img13, img14, img15, img16, img17, img18, img19, img20
  ];
  
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

const EditScreen = () => {
  const { postId: initialPostId } = useLocalSearchParams();
  const [currentPostId, setCurrentPostId] = useState<string>(initialPostId as string);
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown | null>(null);
  const [frames, setFrames] = React.useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = React.useState<any>(null);
  const [canvasWidth, setCanvasWidth] = React.useState(0);
  const [canvasHeight, setCanvasHeight] = React.useState(0);
  const [elements, setElements] = React.useState<SkiaRenderable[]>([]);
  const [imageSources, setImageSources] = useState<string[]>([]);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);

  // Canvas reference to access makeImageSnapshot method
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const accountDetails = await account.get(); // Await the account.get() call
      const userId = accountDetails?.$id;

      const userDetails = await database.listDocuments(
        "6815de2b0004b53475ec",
        "6815e0be001731ca8b1b",
        [Query.equal("userId", userId)]
      );
      setCurrentUser(userDetails.documents);
    };

    fetchUserData();
  }, [])

  const fontSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
  // Font loading
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

  // Font selection state
  const [selectedFontFamily, setSelectedFontFamily] = useState<'montserrat' | 'roboto'>('montserrat');

  // Function to get the appropriate font based on selection
  // const getSelectedFont = (weight: string, fontSize: number) => {
  //   const closestSize = getClosestFontSize(fontSize);
  //   const index = fontSizes.indexOf(closestSize);
    
  //   if (index === -1) return null;
    
  //   if (selectedFontFamily === 'montserrat') {
  //     return weight === 'bold' ? boldFonts[index] : regularFonts[index];
  //   } else {
  //     return weight === 'bold' ? robotoBoldFonts[index] : robotoRegularFonts[index];
  //   }
  // };

  const getClosestFontSize = (size: number) => {
    return fontSizes.reduce((prev, curr) => 
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    , fontSizes[0]);
  };

  const getFontWithSize = (weight: string, fontSize: number) => {
    if (!frameWidth || !frameHeight) {
      const index = fontSizes.indexOf(12); // Default font size
      return weight === 'bold' ? boldFonts[index] : regularFonts[index];
    }
    
    const screenWidth = width - 40;
    const screenHeight = screenWidth * (frameHeight / frameWidth);
    
    // Scale ratio from original frame to screen size
    const scaleX = screenWidth / (frameWidth / 2);;
    const scaleY = screenHeight / (frameHeight / 2);
    
    // Use minimum of both scales for proportional scaling
    const scale = Math.min(scaleX, scaleY);

    console.log(scaleX, scaleY, scale, "Scale X and Y");
    
    // Scale the font size
    const scaledSize = fontSize * scale;

    console.log(scaledSize, "Scaled Size");
    
    // Find closest available font size
    const closestSize = getClosestFontSize(scaledSize);
    console.log(closestSize, "Closest Size");
    const index = fontSizes.indexOf(closestSize - 5);
    
    if (index === -1) return null;
    if (selectedFontFamily === 'montserrat') {
      return weight === 'bold' ? boldFonts[index] : regularFonts[index];
    } else {
      return weight === 'bold' ? robotoBoldFonts[index] : robotoRegularFonts[index];
    }
  };

  const { imageHooks, updateUrls } = ImageLoader({ maxImages: 20 });

  const imageMap = React.useMemo(() => {
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

  const parseFabricToSkia = (fabricJson: any): SkiaRenderable[] => {
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
    console.log(fabricObjects, "Fabric Json 🟡");
    
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
        return {
          type: 'image',
          id: obj.id,
          x: obj.left ?? 0,
          y: obj.top ?? 0,
          width: (obj.label === 'logo') ? Math.min(80, (obj.width ?? 50) * (obj.scaleX ?? 1)) : (obj.width ?? 50) * (obj.scaleX ?? 1),
          height: (obj.label === 'logo') ? Math.min(80, (obj.height ?? 50) * (obj.scaleY ?? 1)) : (obj.height ?? 50) * (obj.scaleY ?? 1),
          src: obj.src ?? '',
          label: obj.label ?? '',
        };
      }
      return null;
    }).filter(Boolean) as SkiaRenderable[];
  };

  const calculatePositionFromRatio = (x: number, y: number) => {
    if (!frameWidth || !frameHeight) return { x, y };
    
    const screenWidth = width - 40;
    const screenHeight = screenWidth * (frameHeight / frameWidth);
    
    // Scale ratio from original frame to screen size
    const scaleX = screenWidth / (frameWidth / 2);
    const scaleY = screenHeight / (frameHeight / 2);
    
    // Apply the scale to position elements correctly
    const newX = x * scaleX;
    const newY = y * scaleY;
    
  
    
    console.log(`Original (${x},${y}) -> Scaled (${newX},${newY}), Scale: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);
    
    return { x: newX, y: newY };
  };

  const selectFrame = (index: number) => {
    if (index >= 0 && index < frames.length) {
      setSelectedFrameIndex(index);
      const frame = frames[index];
      setSelectedFrame(frame);
      
      // Update elements, frame width and height based on selected frame
      if (frame?.template) {
        setElements(parseFabricToSkia(frame.template));
        setFrameWidth(frame.width);
        setFrameHeight(frame.height);
      }
    }
  };

  const handleDownload = async () => {
    try {
      // First check if we already have permissions
      let permissionStatus = await MediaLibrary.getPermissionsAsync();
      
      // If we don't have permissions, request them
      if (!permissionStatus.granted) {
        permissionStatus = await MediaLibrary.requestPermissionsAsync();
        
        // If the user denied permissions, show an alert with instructions
        if (!permissionStatus.granted) {
          Alert.alert(
            'Permission Required',
            'To save images, this app needs access to your media library. Please go to app settings and enable Media Library permissions.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              }
            ]
          );
          return;
        }
      }
      
      // Check for canvas reference
      if (!canvasRef.current) {
        Alert.alert('Error', 'Canvas not ready. Please try again.');
        return;
      }
      
      // Create a snapshot using makeImageSnapshot
      Alert.alert('Creating snapshot...', 'Please wait while we save your image.');
      const snapshot = await canvasRef.current.makeImageSnapshot();
      
      if (!snapshot) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }
      
      // Use the correct method to encode to base64
      const base64 = snapshot.encodeToBase64();
      
      // Create a temporary file path with proper naming
      const fileUri = `${FileSystem.cacheDirectory}artframe_${Date.now()}.png`;
      
      // Write the base64 data to the file
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Save to media library with proper error handling
      try {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("ArtVeda", asset, false);

//         //save in our db as downloaded
//  await database.createDocument(
//           '6815de2b0004b53475ec',
//           '681a1b3c0020eb66b3b1',
//           ID.unique(),
//           {
//             posts: initialPostId,
//             userId: currentUser.$id,
//           }
//         )

        Alert.alert('Success', 'Image saved to your gallery!');
      } catch (mediaError) {
        console.error('Media library error:', mediaError);
        Alert.alert(
          'Save Failed',
          'Failed to save to gallery. Please check your permissions and try again.'
        );
      }
      
      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
    } catch (error:any) {
      console.error('Error saving image:', error);
      Alert.alert('Error', `Failed to save image: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);     
        
        // Fetch current post and frames
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
        
        // Initialize with first frame
        if (framesResponse.documents && framesResponse.documents.length > 0) {
          selectFrame(0);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentPostId]);

  console.log(post, "Post 🟢");

  const anotherImage = useImage(post?.previewImage);

  console.log(elements, "Elements 🟣");
  console.log(canvasHeight, canvasWidth, "Canvas dimensions");
  console.log(canvasWidth
    ? (canvasHeight / canvasWidth) * (width - 40)
    : width - 40, "Calculated height");
  console.log(width - 40, "Width");
  console.log(currentUser, "Current User🔴");

  const renderFontSelectionBottomSheet = () => {
    return (
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
                <Text 
                  style={[
                    styles.fontPreview, 
                    { fontFamily: 'Montserrat' }
                  ]}
                >
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
                <Text 
                  style={[
                    styles.fontPreview, 
                    { fontFamily: 'Roboto' }
                  ]}
                >
                  Sample Text
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading post</Text>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.previewContainer}>
              <ScrollView
                horizontal={true}
                maximumZoomScale={3}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Canvas
                  ref={canvasRef}
                  style={{
                    width: width - 40,
                    height: canvasWidth
                      ? (canvasHeight / canvasWidth) * (width - 40)
                      : width - 40,
                    backgroundColor: "lightgrey",
                  }}
                >
                  <SkiaImage 
                  image={anotherImage}
                  fit="contain"
                  x={0}
                  y={0}
                  width={width - 40}
                  height={width - 40}
                 
                  />
                  {elements.map((el) => {
                    if (el.type === 'text') {
                      const position = calculatePositionFromRatio(el.x, el.y);
                      const font = getFontWithSize(el.fontWeight, el.fontSize);
                      if (!font) return null;

                      // Determine text content based on label
                      let displayText = el.text;
                        if (el.label && currentUser && currentUser[0]) {
                        if (el.label === 'name' && currentUser[0].name) {
                          displayText = currentUser[0].name;
                        } else if (el.label === 'email' && currentUser[0].email) {
                          displayText = currentUser[0].email;
                        } else if (el.label === 'address' && currentUser[0].address) {
                          displayText = currentUser[0].address;
                        }else if (el.label === 'phone' && currentUser[0].phone) {
                          displayText = currentUser[0].phone;
                        }}

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
                    }

                    if (el.type === 'image') {
                      
                      let imgSrc = el.src;
                      
                      // Handle logo case specially
                      if (el.label === 'logo' && currentUser && currentUser[0]?.logo) {
                        // Add the logo URL to image sources if not already there
                        if (!imageSources.includes(currentUser[0].logo)) {
                          setImageSources(prev => [...prev, currentUser[0].logo]);
                        }
                        imgSrc = currentUser[0].logo;
                      }
                      
                      const img = imgSrc ? imageMap[imgSrc] : null;
                      
                      console.log(imgSrc, "Image Source URL");
                      console.log(img, "Image Source");
                      if (!img) return null;

                      const position = calculatePositionFromRatio(el.x, el.y);

                      if (el.label === 'logo') {
                        console.log(img, "Logo Image 🤔");
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
                      } else {
                        // For other images, use default dimensions
                        console.log(img, "Other Image 😂");
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
                    }

                    return null;
                  })}
                </Canvas>
              </ScrollView>
              
              {/* Font button */}
              <TouchableOpacity 
                style={styles.fontButton} 
                onPress={() => setFontSelectorVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="type" size={24} color="white" />
              </TouchableOpacity>
              
              {/* Download Button */}
              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Feather name="download" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Render the font selection bottom sheet */}
            {renderFontSelectionBottomSheet()}

            {/* Frames Selection Section */}
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
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 0,
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
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
  frameDimensions: {
    fontSize: 12,
    color: "#666",
  },
  postsSection: {
    marginBottom: 20,
  },
  postsScrollView: {
    flexGrow: 0,
  },
  postsContentContainer: {
    paddingVertical: 10,
  },
  postItem: {
    width: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedPost: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  normalPost: {
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  postImage: {
    width: '100%',
    height: 70,
  },
  postName: {
    fontSize: 12,
    textAlign: 'center',
    padding: 4,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  fontButton: {
    position: 'absolute',
    bottom: 30,
    right: 80, // Position to the left of download button
    backgroundColor: primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Bottom sheet styles
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
    backgroundColor: `${primaryColor}10`, // 10% opacity of primary color
  },
  fontLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  fontPreview: {
    fontSize: 16,
    color: '#666',
  },
});
