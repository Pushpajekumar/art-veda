import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import { StyleSheet } from "react-native";

const index = () => {
  const { subCatId, subCatName } = useLocalSearchParams();
  const router = useRouter();
  console.log("Sub Category 🟡 ID:", subCatId);
  const [templates, setTemplates] = React.useState<Models.Document[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await database.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
          [Query.equal("$id", subCatId)]
        );

        if (response.documents[0]?.template) {
          try {
            const parsedTemplates = response.documents[0]?.template
            // Extract only preview image and ID from each template
            const extractedData = parsedTemplates.map((template: { $id: string; previewImage: string; name: string }) => ({
              id: template.$id,
              previewImage: template.previewImage,
              name: template.name,
            }));
            setTemplates(extractedData);
          } catch (error) {
            console.error("Error parsing templates:", error);
            setTemplates([]);
          }
        } else {
          setTemplates([]);
        }
        console.log("Templates:", response.documents[0]?.template);
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
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {subCatName}
            </Text>
          </View>
          <View style={styles.gridContainer}>
            {templates.length > 0 ? (
              templates.map((template) => (
                <View key={template.id} style={styles.gridItem}>
                  <Image 
                    source={{ uri: template.previewImage }} 
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
    marginBottom: 16
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
    marginBottom: 16
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
