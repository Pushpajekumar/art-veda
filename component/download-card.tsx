import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import React from "react";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";

type DownloadCardProps = {
  title: string;
  date: string;
  imageUri: string;
};

const DownloadCard = ({ title, date, imageUri }: DownloadCardProps) => {
  const { width } = Dimensions.get("window");
  const imageWidth = width * 0.2;
  const imageHeight = width * 0.2;
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: imageWidth, height: imageHeight }]}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  image: {
    borderRadius: 8,
  },
  contentContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
});

export default DownloadCard;
