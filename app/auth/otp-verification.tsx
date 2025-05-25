import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { account, database, ID } from "@/context/app-write";
import { primary_textColor, primaryColor } from "../../constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";

const DATABASE_ID = "6815de2b0004b53475ec";
const COLLECTION_ID = "6815e0be001731ca8b1b";
const OTP_MAX_LENGTH = 6;
const REFERRAL_MAX_LENGTH = 5;

// Move dimension calculations outside component to avoid recalculation
const { width, height } = Dimensions.get("window");

const OtpVerification = () => {
  const { userId, phoneNumber } = useLocalSearchParams();
  
  const [otp, setOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simplified param extraction with early return pattern
  const userIdString = useMemo(() => 
    Array.isArray(userId) ? userId[0] : userId || "", [userId]);
  
  const phoneNumberString = useMemo(() => 
    Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber || "", [phoneNumber]);

  // Simplified toast function
  const showToast = useCallback((message: string) => {
    Platform.OS === "android" 
      ? ToastAndroid.show(message, ToastAndroid.SHORT)
      : Alert.alert("Error", message);
  }, []);

  // Validation helper
  const validateInputs = useCallback(() => {
    if (!otp.trim()) {
      showToast("Please enter the OTP");
      return false;
    }
    if (!userIdString) {
      showToast("User ID not found");
      return false;
    }
    return true;
  }, [otp, userIdString, showToast]);

  const handleOtpSubmit = useCallback(async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const session = await account.createSession(userIdString, otp);
      
      const userData = {
        phone: phoneNumberString,
        userId: session.userId,
        ...(referralCode.trim() && { referralCode: referralCode.trim() }),
      };

      const newUser = await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        userData
      );

      router.push({
        pathname: "/auth/personal-details",
        params: { documentId: newUser.$id },
      });
    } catch (error) {
      console.error("OTP verification failed:", error);
      showToast("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [validateInputs, userIdString, phoneNumberString, referralCode, otp, showToast]);

  const handleResendOtp = useCallback(async () => {
    if (!userIdString || !phoneNumberString) {
      showToast("Missing user information");
      return;
    }

    setIsLoading(true);
    try {
      await account.createPhoneToken(userIdString, phoneNumberString);
      showToast("OTP resent successfully");
    } catch (error) {
      console.error("Resend OTP failed:", error);
      showToast("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userIdString, phoneNumberString, showToast]);

  // Memoized styles to prevent recreation
  const dynamicStyles = useMemo(() => ({
    gradientStyle: {
      borderRadius: width * 0.11,
      width: width * 0.22,
      height: height * 0.1,
      overflow: "hidden" as const,
      position: "absolute" as const,
      top: 0,
      right: 0,
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: width * 0.11,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
    formContainer: {
      padding: 20,
      marginTop: (height - 600) / 2,
    },
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#bedbff", "#0099FF"]}
          style={dynamicStyles.gradientStyle}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 0.7 }}
          locations={[0, 0.9, 1]}
        >
          <View style={dynamicStyles.gradientOverlay} />
        </LinearGradient>
        
        <View>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the OTP you received on your phone
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter your OTP</Text>
          <TextInput
            placeholder="Enter your OTP"
            maxLength={OTP_MAX_LENGTH}
            keyboardType="numeric"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Have a referral code? (Optional)</Text>
          <TextInput
            placeholder="Enter referral code if available"
            style={styles.input}
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={REFERRAL_MAX_LENGTH}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={handleOtpSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Processing..." : "Continue"}
          </Text>
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
  headerContainer: {
    width: "100%",
    height: "20%",
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    paddingLeft: 20,
    position: "relative",
  },
  title: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
    color: primary_textColor,
    marginBottom: 5,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: primary_textColor,
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: "grey",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    borderRadius: 5,
    padding: 15,
  },
  resendText: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: primaryColor,
    textAlign: "right",
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 50,
    alignSelf: "center",
    width: "70%",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    ...TYPOGRAPHY.button,
  },
});

export default OtpVerification;
