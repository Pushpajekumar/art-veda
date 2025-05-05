import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const index = () => {
  const { subCatId, subCatName } = useLocalSearchParams();
  const router = useRouter();
  console.log("Sub Category 🟡 ID:", subCatId);
  const [posts, setPosts] = React.useState<Models.Document[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await database.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
          [Query.equal("$id", subCatId)]
        );

        if (response.documents[0]?.posts) {
          try {
            const parsedPosts = response.documents[0]?.posts
            // Extract only preview image and ID from each template
            const extractedData = parsedPosts.map((post: { $id: string; previewImage: string; name: string }) => ({
              id: post.$id,
              previewImage: post.previewImage,
              name: post.name,
            }));
            setPosts(extractedData);
          } catch (error) {
            console.error("Error parsing templates:", error);
            setPosts([]);
          }
        } else {
          setPosts([]);
        }
        console.log("Posts:", response.documents[0]?.posts);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchData();
  }, [subCatId]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {typeof subCatName === 'string' ? subCatName.charAt(0).toUpperCase() + subCatName.slice(1) : subCatName}
              </Text>
            </View>
          <View style={styles.gridContainer}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <View key={post.id} style={styles.gridItem}  
                onTouchEnd={() => {
                                    router.push({
                                      pathname: "/edit-screen",
                                      params: {
                                      postId: post.id,
                                      },
                                    });
                                  }}>
                  <Image 
                    source={{ uri: post.previewImage }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {/* //TODO: Add a click event to navigate to the template details page */}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text>No templates found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '32%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6'
  },
  image: {
    width: '100%',
    height: 120
  },
  textContainer: {
    padding: 8
  },
  templateName: {
    fontWeight: '500'
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center'
  }
});


export default index;
