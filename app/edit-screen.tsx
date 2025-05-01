import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
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
    fontStyle: 'normal' | 'italic';}
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
  const { postId } = useLocalSearchParams();
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown | null>(null);
  const [frames, setFrames] = React.useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = React.useState<any>(null);
  const [canvasWidth, setCanvasWidth] = React.useState(0);
  const [canvasHeight, setCanvasHeight] = React.useState(0);
  const [elements, setElements] = React.useState<SkiaRenderable[]>([]);
  const [imageSources, setImageSources] = useState<string[]>([]);

  const regularFont = useFont(require("../assets/fonts/Montserrat-Light.ttf"));
  const boldFont = useFont(require("../assets/fonts/Montserrat-Bold.ttf"));

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

  const getFont = (weight: string, style: string, size: number) => {
    if (weight === 'bold') return boldFont;
    return regularFont;
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        const [postDetails, framesResponse] = await Promise.all([
          database.getDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
            postId as string
          ),
          database.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!
          ),
        ]);

        setPost(postDetails.previewImage);
        setCanvasWidth(postDetails.width);
        setCanvasHeight(postDetails.height);
        setFrames(framesResponse.documents);
        setElements(framesResponse.documents && framesResponse.documents.length > 0 
          ? parseFabricToSkia(framesResponse.documents[3]?.template) 
          : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  console.log(post, "Post 🟢");

  const image = useImage(post);
  const fontSize = 32;
  const font = useFont(
    require("../assets/fonts/Montserrat-Light.ttf"),
    fontSize
  );

  const anotherImage = useImage(post);

  console.log(elements, "Elements 🟣");

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
            <Text style={styles.title}>{post.name}</Text>

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
                  width={256}
                  height={256}
                 
                  />
                  <SkiaText x={20} y={40} text="Hello World" font={font} />
                  {elements.map((el) => {
                    if (el.type === 'text' && font) {
                      const font = getFont(el.fontWeight, el.fontStyle, el.fontSize);
                      if (!font) return null;
                      return (
                        <SkiaText
                          key={el.id}
                          x={el.x}
                          y={el.y}
                          text={el.text}
                          font={font}
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
                          width={el.width}
                          height={el.height}
                          fit="contain"
                        />
                      );
                    }

                    return null;
                  })}
                </Canvas>
              </ScrollView>
            </View>
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
});
