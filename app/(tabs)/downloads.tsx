import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import DownloadCard from "@/component/download-card";
import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";

interface Download {
  id: string;
  name: string;
  createdAt: string;
  previewImage: string;
}

const Downloads = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();
      
      if (!currentUser) return;

      const userDetails = await database.listDocuments(
        "6815de2b0004b53475ec",
        "6815e0be001731ca8b1b",
        [Query.equal("userId", currentUser.$id)]
      );

      if (userDetails.documents.length === 0) return;

      const userDoc = userDetails.documents[0];
      const downloadsResult = await database.listDocuments(
        "6815de2b0004b53475ec",
        "681a1b3c0020eb66b3b1",
        [Query.equal("userId", userDoc.$id)]
      );

      const extractedDownloads = downloadsResult.documents.flatMap((doc) => {
        const posts = Array.isArray(doc.posts) ? doc.posts : [doc.posts];
        
        return posts
          .filter(post => post && typeof post === "object")
          .map(post => ({
            id: post.id || doc.$id,
            name: post.name || "",
            createdAt: doc.$createdAt,
            previewImage: post.previewImage || "",
          }));
      });

      setDownloads(extractedDownloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  useFocusEffect(
    useCallback(() => {
      fetchDownloads();
    }, [fetchDownloads])
  );

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      );
    }

    if (downloads.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>No downloads available</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
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
  }, [loading, downloads]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {renderContent}
    </SafeAreaView>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
});
