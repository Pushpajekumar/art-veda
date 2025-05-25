import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary_textColor, primaryColor } from "@/constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { useRouter } from "expo-router";
import { account, database, ID } from "@/context/app-write";
import { Query } from "react-native-appwrite";

const Login = () => {
  const { width, height } = Dimensions.get("window");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Memoized styles that depend on window dimensions
  const dynamicStyles = useMemo(
    () => ({
      gradientContainer: {
        borderRadius: width * 0.11,
        width: width * 0.22,
        height: height * 0.1,
        overflow: "hidden" as const,
        position: "absolute" as const,
        top: 0,
        right: 0,
      },
      contentContainer: {
        padding: 20,
        marginTop: (height - 600) / 2,
      },
    }),
    [width, height]
  );

  // Validate phone number
  const isValidPhoneNumber = useCallback(() => {
    return phoneNumber && phoneNumber.length === 10;
  }, [phoneNumber]);

  // Handle phone number input
  const handlePhoneChange = useCallback(
    (e: { nativeEvent: { text: string } }) => {
      setPhoneNumber(e.nativeEvent.text);
    },
    []
  );

  // Handle OTP input
  const handleOtpChange = useCallback(
    (e: { nativeEvent: { text: string } }) => {
      setOtp(e.nativeEvent.text);
    },
    []
  );

  // Shared OTP request function
  const requestOTP = useCallback(
    async (isResend = false) => {
      setIsLoading(true);
      setError("");

      if (!isValidPhoneNumber()) {
        setError("Please enter a valid 10-digit phone number");
        setIsLoading(false);
        return;
      }

      try {
        const fullPhoneNumber = `+91${phoneNumber}`;

        const existingSession = await account.getSession("current");

        if (existingSession) {
          // If user is already logged in, log them out
          await account.deleteSession(existingSession.$id);
        }

        const existingUserList = await database.listDocuments(
          "6815de2b0004b53475ec",
          "6815e0be001731ca8b1b",
          [Query.equal("phone", fullPhoneNumber)]
        );

        if (!existingUserList.documents.length) {
          setError("User does not exist. Please register first.");
          setIsLoading(false);
          return;
        }

        const token = await account.createPhoneToken(
          ID.unique(),
          fullPhoneNumber
        );
        setUserId(token.userId);
        setShowOtpField(true);
        Alert.alert(
          isResend ? "OTP Resent" : "OTP Sent",
          `An OTP has been ${isResend ? "resent" : "sent"} to your phone number`
        );
      } catch (error) {
        console.error(
          `Error ${isResend ? "resending" : "requesting"} OTP:`,
          error
        );
        setError(
          `Failed to ${isResend ? "resend" : "send"} OTP. Please try again.`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [phoneNumber, isValidPhoneNumber]
  );

  // Handle login with OTP
  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    setError("");

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      setIsLoading(false);
      return;
    }

    try {
      await account.createSession(userId, otp);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [otp, userId, router]);

  const navigateToSignup = useCallback(() => {
    router.push("/auth/signup");
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header_container, { position: "relative" }]}>
        <LinearGradient
          colors={["#bedbff", "#0099FF"]}
          style={dynamicStyles.gradientContainer}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 0.7 }}
          locations={[0, 0.9, 1]}
        >
          <View style={styles.gradientOverlay} />
        </LinearGradient>
        <View>
          <Text style={styles.text}>Login to your Account</Text>
          <Text style={styles.subtext}>Enter your mobile number to</Text>
          <Text style={styles.subtext}>receive an OTP</Text>
        </View>
      </View>

      <View style={dynamicStyles.contentContainer}>
        <View>
          <Text style={styles.inputLabel}>Enter your mobile number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              onChange={handlePhoneChange}
              value={phoneNumber}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.input, styles.phoneInput]}
              editable={!showOtpField || !isLoading}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {!showOtpField ? (
          <View style={styles.requestOtpContainer}>
            <TouchableOpacity
              style={styles.requestOtpButton}
              onPress={() => requestOTP(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Request OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.otpContainer}>
              <Text style={styles.inputLabel}>
                Enter OTP received on your phone
              </Text>
              <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                secureTextEntry={false}
                maxLength={6}
                keyboardType="numeric"
                style={[styles.input, styles.otpInput]}
              />
            </View>

            <Text style={styles.resendOtp} onPress={() => requestOTP(true)}>
              Didn't receive OTP? Resend
            </Text>

            <View style={styles.loginButtonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.newUserText}>
          New User?
          <Text style={styles.signupText} onPress={navigateToSignup}>
            {" "}
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;

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
    borderRadius: 11,
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
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: "grey",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  otpContainer: {
    marginTop: 20,
  },
  otpInput: {
    marginBottom: 10,
    letterSpacing: 5,
  },
  requestOtpContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonContainer: {
    alignItems: "center",
  },
  requestOtpButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 50,
    width: "70%",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 50,
    marginTop: 20,
    width: "70%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    ...TYPOGRAPHY.button,
  },
  resendOtp: {
    ...TYPOGRAPHY.caption,
    color: primaryColor,
    marginTop: 10,
    textAlign: "right",
    marginBottom: 20,
  },
  newUserText: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.regular,
    color: primary_textColor,
    marginTop: 30,
    textAlign: "center",
  },
  signupText: {
    fontFamily: FONT_WEIGHT.semiBold,
    color: primaryColor,
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
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: "grey",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
});
