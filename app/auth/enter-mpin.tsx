import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { primary_textColor, primaryColor } from "@/constant/contant";
import { router } from "expo-router";
import { account } from "@/context/app-write";

const { width, height } = Dimensions.get("window");
const MPIN_KEY = "mpin"; // Key used in Appwrite preferences

const EnterMpin = () => {
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const dotScale = useRef(
    new Array(4).fill(null).map(() => new Animated.Value(1))
  ).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Animate the dots when PIN is entered
  const animateDot = (index: number) => {
    Animated.sequence([
      Animated.timing(dotScale[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle digit press
  const handleDigitPress = (digit: string) => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Clear error when user starts typing
    if (error) setError("");

    if (mpin.length < 4) {
      const newMpin = mpin + digit;
      setMpin(newMpin);
      animateDot(mpin.length);

      // If we have a complete PIN, verify it
      if (newMpin.length === 4) {
        setTimeout(() => {
          verifyMpin(newMpin);
        }, 300);
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (mpin.length > 0) {
      setMpin((prev) => prev.slice(0, -1));
    }
  };

  // Verify existing MPIN
  const verifyMpin = async (pinToVerify: string) => {
    setIsLoading(true);
    try {
      const prefs = await account.getPrefs();
      console.log("Retrieved preferences:", prefs);

      if (prefs && prefs[MPIN_KEY] === pinToVerify) {
        // MPIN verified, proceed to main app
        router.replace("/(tabs)");
      } else {
        Vibration.vibrate(300);
        setError("Incorrect MPIN. Please try again.");
        setMpin("");
      }
    } catch (err) {
      console.error("Error verifying MPIN:", err);
      setError("An error occurred. Please try again.");
      setMpin("");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render PIN dots
  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < mpin.length ? primaryColor : "#D9D9D9",
                transform: [{ scale: dotScale[index] }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header_container, { position: "relative" }]}>
        <LinearGradient
          colors={["#bedbff", "#0099FF"]}
          style={{
            borderRadius: width * 0.11,
            width: width * 0.22,
            height: height * 0.1,
            overflow: "hidden",
            position: "absolute",
            top: 0,
            right: 0,
          }}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 0.7 }}
          locations={[0, 0.9, 1]}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: width * 0.11,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}
          />
        </LinearGradient>
        <View>
          <Text style={styles.text}>Enter MPIN</Text>
          <Text style={styles.subtext}>Enter your 4-digit PIN to continue</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* PIN Dots */}
        {renderPinDots()}

        {/* PIN Pad */}
        <View style={styles.pinPadContainer}>
          <View style={styles.pinPadRow}>
            {[1, 2, 3].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.digitButton}
                onPress={() => handleDigitPress(digit.toString())}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Animated.Text
                  style={[
                    styles.digitText,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  {digit}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pinPadRow}>
            {[4, 5, 6].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.digitButton}
                onPress={() => handleDigitPress(digit.toString())}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Animated.Text
                  style={[
                    styles.digitText,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  {digit}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pinPadRow}>
            {[7, 8, 9].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.digitButton}
                onPress={() => handleDigitPress(digit.toString())}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Animated.Text
                  style={[
                    styles.digitText,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  {digit}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pinPadRow}>
            <View style={styles.digitButton} />
            <TouchableOpacity
              style={styles.digitButton}
              onPress={() => handleDigitPress("0")}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Animated.Text
                style={[
                  styles.digitText,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                0
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.digitButton}
              onPress={handleBackspace}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.backspaceText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}

        {/* Forgot MPIN option */}
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => router.push("/auth/login")}
          disabled={isLoading}
        >
          <Text style={styles.forgotButtonText}>Forgot MPIN?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  header_container: {
    width: "100%",
    height: "20%",
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    paddingLeft: 20,
  },
  text: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    color: primary_textColor,
    marginBottom: 5,
    fontSize: 24,
  },
  subtext: {
    ...TYPOGRAPHY.caption,
    color: primary_textColor,
    marginTop: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 50,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pinPadContainer: {
    width: "80%",
    maxWidth: 300,
  },
  pinPadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  digitButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  digitText: {
    fontSize: 28,
    fontWeight: "600",
    color: primary_textColor,
  },
  backspaceText: {
    fontSize: 24,
    color: primary_textColor,
  },
  forgotButton: {
    marginTop: 30,
    padding: 10,
  },
  forgotButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontFamily: FONT_WEIGHT.medium,
  },
});

export default EnterMpin;
