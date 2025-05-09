import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import an icon set
import { LinearGradient } from "expo-linear-gradient"; // For a gradient background
import * as Network from "expo-network";
import { useState, useEffect } from "react";

const { width, height } = Dimensions.get("window");

export default function NoNetworkScreen() {
  const router = useRouter();

  // Function to check network connectivity
  const checkNetworkStatus = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected && networkState.isInternetReachable;
    } catch (error) {
      console.error("Failed to check network status:", error);
      return false;
    }
  };

  const handleRetry = async () => {
    try {
      const isConnected = await checkNetworkStatus();

      if (isConnected) {
        // Network is available, navigate back to home
        router.replace("/");
      } else {
        // Still no connection, you could show a toast/alert here
        alert("Still no internet connection. Please check your settings.");
      }
    } catch (error) {
      console.error("Error during network check:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#6DD5FA", "#2980B9"]} // Example gradient colors
      style={styles.gradientContainer}
    >
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={width * 0.3} // Responsive icon size
          color="#FFFFFF"
          style={styles.icon}
        />

        <Text style={styles.title}>Oops! No Connection</Text>

        <Text style={styles.message}>
          It seems you're offline. Please check your internet connection and try
          again.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Retry</Text>
          <MaterialCommunityIcons
            name="reload"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight overlay for content
    borderRadius: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  icon: {
    marginBottom: 30,
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "System", // Consider using a custom font if available
  },
  message: {
    fontSize: 16,
    color: "#E0E0E0", // Lighter text color for contrast on dark background
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: "System",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B", // A vibrant button color
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30, // More rounded button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600", // Semi-bold
    fontFamily: "System",
  },
});
