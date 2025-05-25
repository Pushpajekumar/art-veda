import { View, Text } from "../context/ThemeContext";
import { Dimensions, StyleSheet, Animated } from "react-native";
import { TYPOGRAPHY, FONT_WEIGHT } from "../utils/fonts";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { account } from "@/context/app-write";
import * as Network from "expo-network";

export default function Index() {
  const { width, height } = Dimensions.get("window");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start the scale animation
    Animated.timing(scaleAnim, {
      toValue: 1.6,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Navigation effect - only runs after loading is complete
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth/login");
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isLoading]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        //check user phone has connected to internet or not
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          router.replace("/no-network");
          return;
        }

        // Check if the user is authenticated with longer timeout
        const session = await Promise.race([
          account.getSession("current"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 5000)
          )
        ]);
        console.log(session, "session 🟢");
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo-art-veda.png")}
        style={{
          width: width * 0.4,
          height: height * 0.2,
          resizeMode: "contain",
          transform: [{ scale: scaleAnim }],
        }}
      />
      <View style={{ marginTop: 20 }}>
        <Text style={[styles.title]}>Welcome to Artveda</Text>
        <Text style={styles.subtitle}>
          Create beautiful posters in minutes with our easy-to-use tools
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontFamily: FONT_WEIGHT.bold,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: 30,
  },
});
