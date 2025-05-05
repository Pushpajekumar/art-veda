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
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary_textColor, primaryColor } from "@/constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { useRouter } from "expo-router";
import { account, ID } from "@/context/app-write";

const Login = () => {
  const { width, height } = Dimensions.get("window");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [showOtpField, setShowOtpField] = React.useState(false);
  const [userId, setUserId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const router = useRouter();

  // Shared OTP request function
  const requestOTP = async (isResend = false) => {
    setIsLoading(true);
    setError("");

    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    try {
      const token = await account.createPhoneToken(
        ID.unique(),
        `+91${phoneNumber}`
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
  };

  // Step 1: Request OTP
  const handleRequestOTP = () => requestOTP(false);

  // Handle resend OTP
  const handleResendOTP = () => requestOTP(true);

  // Step 2: Verify OTP and Login
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      setIsLoading(false);
      return;
    }

    try {
      // Create session with the userId and OTP
      const session = await account.createSession(userId, otp);
      console.log("Login successful:", session);
      setIsLoading(false);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.text}>Login to your Account</Text>
          <Text style={styles.subtext}>Enter your mobile number to</Text>
          <Text style={styles.subtext}>receive an OTP</Text>
        </View>
      </View>

      <View
        style={{
          padding: 20,
          marginTop: (height - 600) / 2,
        }}
      >
        <View>
          <Text style={styles.inputLabel}>Enter your mobile number</Text>
          <TextInput
            onChange={(e) => setPhoneNumber(e.nativeEvent.text)}
            value={phoneNumber}
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
            editable={!showOtpField || !isLoading}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {!showOtpField ? (
          <View style={styles.requestOtpContainer}>
            <TouchableOpacity
              style={styles.requestOtpButton}
              onPress={handleRequestOTP}
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
            <View style={{ marginTop: 20 }}>
              <Text style={styles.inputLabel}>
                Enter OTP received on your phone
              </Text>
              <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.nativeEvent.text)}
                secureTextEntry={false}
                maxLength={6}
                keyboardType="numeric"
                style={[styles.input, { marginBottom: 10, letterSpacing: 5 }]}
              />
            </View>

            <Text style={styles.resendOtp} onPress={handleResendOTP}>
              Didn't receive OTP? Resend
            </Text>

            <View style={{ alignItems: "center" }}>
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
          <Text
            style={styles.signupText}
            onPress={() => router.push("/auth/signup")}
          >
            {" "}
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;

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
  requestOtpContainer: {
    alignItems: "center",
    marginTop: 20,
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
});
