import { View, Text } from "../context/ThemeContext";
import { Dimensions, Image, StyleSheet, Animated } from "react-native";
import { TYPOGRAPHY, FONT_SIZE, FONT_WEIGHT } from "../utils/fonts";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
export default function Index() {
  const { width, height } = Dimensions.get("window");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the scale animation
    Animated.timing(scaleAnim, {
      toValue: 1.6,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Set timeout to navigate after 1 second
    const timeout = setTimeout(() => {
      router.replace("/home");
    }, 1000);

    // Clean up function
    return () => {
      clearTimeout(timeout);
      scaleAnim.stopAnimation();
    };
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
