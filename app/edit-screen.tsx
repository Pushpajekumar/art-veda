import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { database } from "@/context/app-write";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const EditScreen = () => {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown | null>(null);
  const [frames, setFrames] = React.useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = React.useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
      setLoading(true);
      
      const [postDetails, framesResponse] = await Promise.all([
        database.getDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TEMPLATE_COLLECTION_ID!,
        postId as string
        // [Query.select(["$id, name, previewImage, width, height"])]
        ),
        database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_FRAMES_COLLECTION_ID!
        )
      ]);
      
      setPost(postDetails);
      setFrames(framesResponse.documents);
      
      console.log(postDetails, "Post Details 🟢");
      console.log(framesResponse.documents, "Frames 🟡");
      } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      } finally {
      setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

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
            
            {/* Preview Image */}
            {post.previewImage && (
              <View style={styles.previewContainer}>
                <Image 
                  source={{ uri: post.previewImage }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            )}
            
            {/* Frames Section */}
            {frames.length > 0 && (
              <View style={styles.framesSection}>
                <Text style={styles.sectionTitle}>Available Frames</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.framesScrollView}
                  contentContainerStyle={styles.framesContentContainer}
                >
                  {frames.map((frame) => (
                    <TouchableOpacity 
                      key={frame.$id}
                      style={[
                        styles.frameItem,
                        selectedFrame?.$id === frame.$id ? styles.selectedFrame : styles.normalFrame
                      ]}
                      onPress={() => setSelectedFrame(frame)}
                    >
                      <Image 
                        source={{ uri: frame.previewImage }} 
                        style={styles.frameImage}
                        resizeMode="cover"
                      />
                      <View style={styles.frameDetails}>
                        <Text style={styles.frameName}>{frame.name || 'Unnamed Frame'}</Text>
                        <Text style={styles.frameDimensions}>{frame.width}×{frame.height}</Text>
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
    backgroundColor: "yellow",
    paddingTop: 10, // Adjusted padding top
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0, // Ensure no top padding in the container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 0, // Keep title close to the top
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  framesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    overflow: 'hidden',
  },
  selectedFrame: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  normalFrame: {
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  frameImage: {
    width: '100%',
    height: 100,
  },
  frameDetails: {
    padding: 8,
  },
  frameName: {
    fontWeight: '500',
  },
  frameDimensions: {
    fontSize: 12,
    color: '#666',
  },
});
