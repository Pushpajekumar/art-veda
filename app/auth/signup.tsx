import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary_textColor, primaryColor } from "../../constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { router } from "expo-router";
import { account, database, ID } from "@/context/app-write";
import { Query } from "react-native-appwrite";

const PHONE_NUMBER_LENGTH = 10;
const COUNTRY_CODE = "+91";

const signup = () => {
  const dimensions = useMemo(() => Dimensions.get("window"), []);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidPhoneNumber = useMemo(
    () =>
      phoneNumber.length === PHONE_NUMBER_LENGTH && /^\d+$/.test(phoneNumber),
    [phoneNumber]
  );

  const showToast = useCallback(
    (message: string, duration = ToastAndroid.SHORT) => {
      ToastAndroid.show(message, duration);
    },
    []
  );

  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      setPhoneNumber(text);
      if (error) setError("");
    },
    [error]
  );

  const handleSignup = useCallback(async () => {
    if (!isValidPhoneNumber) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
      const usersCollectionId =
        process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

      if (!databaseId || !usersCollectionId) {
        throw new Error("Database configuration is missing");
      }

      const fullPhoneNumber = `${COUNTRY_CODE}${phoneNumber}`;

      // Check if user already exists
      const existingUser = await database.listDocuments(
        databaseId,
        "6815e0be001731ca8b1b",
        [Query.equal("phone", fullPhoneNumber)]
      );

      if (existingUser.total > 0) {
        setError("User already exists");
        showToast("User already exists, Please Login");
        return;
      }

      const token = await account.createPhoneToken(
        ID.unique(),
        fullPhoneNumber
      );

      if (token) {
        router.push({
          pathname: "/auth/otp-verification",
          params: {
            userId: token.userId,
            phoneNumber: fullPhoneNumber,
          },
        });
        showToast(`OTP sent to ${fullPhoneNumber}`);
      }
    } catch (error) {
      console.error("Error creating token:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError("Failed to send OTP. Please try again.");
      showToast(`Error: ${errorMessage}`, ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
    }
  }, [isValidPhoneNumber, phoneNumber, showToast]);

  const navigateToLogin = useCallback(() => {
    router.push("/auth/login");
  }, []);

  const gradientStyle = useMemo(
    () => ({
      borderRadius: dimensions.width * 0.11,
      width: dimensions.width * 0.22,
      height: dimensions.height * 0.1,
      overflow: "hidden" as const,
      position: "absolute" as const,
      top: 0,
      right: 0,
    }),
    [dimensions]
  );

  const containerStyle = useMemo(
    () => ({
      padding: 20,
      marginTop: (dimensions.height - 600) / 2,
    }),
    [dimensions]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header_container, { position: "relative" }]}>
        <LinearGradient
          colors={["#bedbff", "#0099FF"]}
          style={gradientStyle}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 0.7 }}
          locations={[0, 0.9, 1]}
        >
          <View
            style={[
              styles.gradientOverlay,
              { borderRadius: dimensions.width * 0.11 },
            ]}
          />
        </LinearGradient>
        <View>
          <Text style={styles.text}>Create your Account</Text>
          <Text style={styles.subtext}>Enter your mobile number to create</Text>
          <Text style={styles.subtext}>your account</Text>
        </View>
      </View>

      <View style={containerStyle}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your mobile number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>{COUNTRY_CODE}</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="Enter 10-digit mobile number"
              keyboardType="numeric"
              maxLength={PHONE_NUMBER_LENGTH}
              style={styles.phoneInput}
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Text style={styles.loginPrompt}>
          Already a User?
          <Text style={styles.loginLink} onPress={navigateToLogin}>
            {" "}
            Login
          </Text>
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.signupButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SignUp</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header_container: {
    width: "100%",
    height: "20%",
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    paddingLeft: 20,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  text: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    color: primary_textColor,
    marginBottom: 5,
  },
  subtext: {
    ...TYPOGRAPHY.caption,
    color: primary_textColor,
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: "grey",
    marginBottom: 5,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    borderRadius: 5,
    marginBottom: 10,
  },
  countryCode: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingVertical: 15,
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.medium,
    color: primary_textColor,
  },
  phoneInput: {
    flex: 1,
    padding: 15,
    backgroundColor: "transparent",
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: "red",
    marginTop: 5,
    textAlign: "left",
  },
  loginPrompt: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    color: primary_textColor,
    marginBottom: 5,
    textAlign: "center",
  },
  loginLink: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    color: primaryColor,
  },
  buttonContainer: {
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 50,
    marginTop: 20,
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    ...TYPOGRAPHY.button,
  },
});
