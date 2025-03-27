import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Download from "@/component/download-card";
import DownloadCard from "@/component/download-card";

const imageUri = "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368";

const downloads = () => {
  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView>
        <DownloadCard />
        <DownloadCard />
        <DownloadCard />
        <DownloadCard />
        <DownloadCard />
      </ScrollView>
    </SafeAreaView>
  );
};

export default downloads;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
