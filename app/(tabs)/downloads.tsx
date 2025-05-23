import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DownloadCard from "@/component/download-card";
import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";
import { useRouter } from "expo-router";

const downloads = () => {
  const [downloads, setDownloads] = React.useState<
    {
      id: string;
      name: any;
      createdAt: string;
      previewImage: any;
    }[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchDownloads = async () => {
      // router.reload();
      try {
        const currentUser = await account.get();

        console.log(currentUser, "currentUser 🟢");

        if (currentUser) {
          const userDetails = await database.listDocuments(
            "6815de2b0004b53475ec",
            "6815e0be001731ca8b1b",
            [Query.equal("userId", currentUser.$id)]
          );

          console.log(userDetails, "userDetails 🟡");

          if (userDetails.documents.length > 0) {
            const userDoc = userDetails.documents[0];
            const downloadsResult = await database.listDocuments(
              "6815de2b0004b53475ec",
              "681a1b3c0020eb66b3b1",
              [Query.equal("userId", userDoc.$id)]
            );

            console.log(downloadsResult, "downloadsResult 🔴");

            if (downloadsResult.documents.length > 0) {
              const extractedDownloads = downloadsResult.documents.flatMap(
                (doc) => {
                  // Check if posts is an array
                  if (Array.isArray(doc.posts)) {
                    return doc.posts.map((post) => ({
                      id: post.id || doc.$id,
                      name: post.name,
                      createdAt: doc.$createdAt, // Use document's createdAt
                      previewImage: post.previewImage,
                    }));
                  }
                  // If posts is a single object
                  else if (doc.posts && typeof doc.posts === "object") {
                    return [
                      {
                        id: doc.posts.id || doc.$id,
                        name: doc.posts.name,
                        createdAt: doc.$createdAt, // Use document's createdAt
                        previewImage: doc.posts.previewImage,
                      },
                    ];
                  }
                  return [];
                }
              );
              setDownloads(extractedDownloads);
            }
          }
          console.log(userDetails.documents, "userDetails.documents 🟡");
        }
      } catch (error) {
        console.error("Error fetching downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
    console.log("Downloads screen mounted");
  }, []);

  console.log(downloads, "downloads 🟢");

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      );
    }

    if (downloads.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No downloads available</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        {downloads.map((download) => (
          <DownloadCard
            key={download.id}
            date={download.createdAt}
            title={download.name}
            imageUri={download.previewImage}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {renderContent()}
    </SafeAreaView>
  );
};

export default downloads;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
});
