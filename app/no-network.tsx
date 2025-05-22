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
import * as Network from "expo-network";
import { SafeAreaView } from "react-native-safe-area-context";
import { TYPOGRAPHY } from "@/utils/fonts";

const { width } = Dimensions.get("window");

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
    <SafeAreaView style={styles.gradientContainer}>
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={width * 0.16}
          color="rgba(31, 133, 222, 0.9)"
          style={styles.icon}
        />

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>No Internet</Text>
          <Text style={styles.message}>
            It seems you're not connected. Please check your internet settings
            and try again.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
          <MaterialCommunityIcons
            name="sync"
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    ...TYPOGRAPHY.title,
    opacity: 0.8,
    marginBottom: 10,
  },
  message: {
    ...TYPOGRAPHY.caption,
    opacity: 0.8,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "rgba(31, 133, 222, 0.9)", // A vibrant button color
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30, // More rounded button
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600", // Semi-bold
  },
});
