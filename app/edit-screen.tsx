import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { database } from "@/context/app-write";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Text as SkiaText,
  useFont,
} from "@shopify/react-native-skia";
import { width } from "@/constant/contant";

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
  
  }
  | { type: 'image'; id: string; x: number; y: number; width: number; height: number; src: string };

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

  const fontSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
  const regularFonts = fontSizes.map(size => 
    useFont(require("../assets/fonts/Montserrat-Light.ttf"), size)
  );
  const boldFonts = fontSizes.map(size => 
    useFont(require("../assets/fonts/Montserrat-Bold.ttf"), size)
  );

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
    return weight === 'bold' ? boldFonts[index] : regularFonts[index];
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
        };
      }
      if (obj.type === 'Image') {
        return {
          type: 'image',
          id: obj.id,
          x: obj.left ?? 0,
          y: obj.top ?? 0,
          width: (obj.width ?? 100) * (obj.scaleX ?? 1),
          height: (obj.height ?? 100) * (obj.scaleY ?? 1),
          src: obj.src ?? '',
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



  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        
        
        // Fetch current post and frames
        const [postDetails, framesResponse] = await Promise.all([
          database.getDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
            currentPostId
          ),
          database.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!
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
                      return (
                        <SkiaText
                          key={el.id}
                          x={position.x} 
                          y={position.y}
                          text={el.text}
                          font={font}
                          color={el.fill}
                        />
                      );
                    }

                    if (el.type === 'image') {
                      const img = el.src ? imageMap[el.src] : null;
                      if (!img) return null;
                      
                      return (
                        <SkiaImage
                          key={el.id}
                          image={img}
                          x={el.x}
                          y={el.y}
                          width={width - 40}
                          height={width - 40}
                          fit="fill"
                        />
                      );
                    }

                    return null;
                  })}
                </Canvas>
              </ScrollView>
            </View>

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
});
