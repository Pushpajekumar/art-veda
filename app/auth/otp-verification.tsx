import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary_textColor, primaryColor } from "../../constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { router, useLocalSearchParams } from "expo-router";
import { account, database, ID } from "@/context/app-write";

const otpVerification = () => {
  const { userId, phoneNumber } = useLocalSearchParams();
  console.log(userId, phoneNumber, "🟢");

  const { width, height } = Dimensions.get("window");
  const [otp, setOtp] = React.useState("");
  const [referralCode, setReferralCode] = React.useState(""); // New state for referral code
  const [isLoading, setIsLoading] = React.useState(false);
  const [token, setToken] = React.useState<{ userId: string } | null>(null);
  const [error, setError] = React.useState("");
  const handleOtpChange = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Extract the userId string safely
      const userIdString =
        (typeof userId === "string"
          ? userId
          : Array.isArray(userId)
          ? userId[0]
          : "") || (token?.userId || "");

      if (!userIdString) {
        throw new Error("User ID not found");
      }

      const session = await account.createSession(userIdString, otp);

      if (!session) {
        setError("Session creation failed");
        setIsLoading(false);
        ToastAndroid.show(
          "Session creation failed, please try again",
          ToastAndroid.SHORT
        );
        return;
      }

      // Format phone number consistently
      const phoneStr =
        typeof phoneNumber === "string"
          ? phoneNumber
          : Array.isArray(phoneNumber)
          ? phoneNumber[0]
          : "";

      // Create user data object with optional referral code
      const userData: {
        phone: string;
        userId: string;
        referralCode?: string;
      } = {
        phone: phoneStr,
        userId: session.userId,
      };

      // Add referral code if provided
      if (referralCode.trim()) {
        userData.referralCode = referralCode.trim();
      }

      // Create a new user in the database with the userData
      const newUser = await database.createDocument(
        "6815de2b0004b53475ec",
        "6815e0be001731ca8b1b",
        ID.unique(),
        userData
      );

      if (!newUser) {
        await account.deleteIdentity(userIdString);
        setError("User creation failed");
        setIsLoading(false);
        ToastAndroid.show(
          "User creation failed, please try again",
          ToastAndroid.SHORT
        );
        return;
      }

      router.push({
        pathname: "/auth/personal-details",
        params: { documentId: newUser.$id },
      });
    } catch (error) {
      console.error("Error handling OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    console.log("Resend OTP logic here");
    try {
      const userIdString =
        typeof userId === "string"
          ? userId
          : Array.isArray(userId)
          ? userId[0]
          : "";
      const phoneNumberString =
        typeof phoneNumber === "string"
          ? phoneNumber
          : Array.isArray(phoneNumber)
          ? phoneNumber[0]
          : "";

      const token = await account.createPhoneToken(
        userIdString,
        phoneNumberString
      );
      setToken(token);
      console.log("Token created:", token);
    } catch (error) {
      console.error("Error resending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header_container, { position: "relative" }]}>
        <LinearGradient
          colors={["#bedbff", "#0099FF"]}
          style={{
            borderRadius: width * 0.11, // Adjusted to make it more circular
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
              borderRadius: width * 0.11, // Adjusted to match the outer border radius
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10, // Added shadow to create a blur effect
            }}
          />
        </LinearGradient>
        <View>
          <Text style={styles.text}>OTP Verification</Text>
          <Text style={styles.subtext}>
            Enter the OTP you received on your phone
          </Text>
        </View>
      </View>

      <View
        style={{
          padding: 20,
          marginTop: (height - 600) / 2, 
        }}
      >
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              ...TYPOGRAPHY.caption,
              fontFamily: FONT_WEIGHT.medium,
              color: "grey",
              marginBottom: 5,
            }}
          >
            Enter your OTP
          </Text>
          <TextInput
            placeholder="Enter your OTP"
            maxLength={6}
            keyboardType="numeric"
            style={[styles.input, { marginBottom: 10 }]}
            onChange={(e) => setOtp(e.nativeEvent.text)}
            value={otp}
          />
        </View>

        {/* New Referral Code Input */}
        <View style={{ marginTop: 10, marginBottom: 15 }}>
          <Text
            style={{
              ...TYPOGRAPHY.caption,
              fontFamily: FONT_WEIGHT.medium,
              color: "grey",
              marginBottom: 5,
            }}
          >
            Have a referral code? (Optional)
          </Text>
          <TextInput
            placeholder="Enter referral code if available"
            style={styles.input}
            value={referralCode}
            onChange={(e) => setReferralCode(e.nativeEvent.text)}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={5}
          />
        </View>

        <Text
          style={{
            ...TYPOGRAPHY.body,
            fontFamily: FONT_WEIGHT.semiBold,
            color: primary_textColor,
            marginBottom: 5,
            textAlign: "center",
          }}
          onPress={handleResendOtp}
        >
          Resend OTP
        </Text>

        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={{
              backgroundColor: primaryColor,
              padding: 15,
              borderRadius: 50,
              marginTop: 20,
              width: "70%",
            }}
            onPress={handleOtpChange}
            disabled={isLoading}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                ...TYPOGRAPHY.button,
              }}
            >
              {isLoading ? "Processing..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default otpVerification;

export const styles = StyleSheet.create({
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

  input: {
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
});
