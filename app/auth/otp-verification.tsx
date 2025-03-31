import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary_textColor, primaryColor } from "../../constant/contant";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { router } from "expo-router";
import { account } from "@/context/app-write";

const otpVerification = () => {
  const { width, height } = Dimensions.get("window");
  const [otp, setOtp] = React.useState("");

  const [userId, setUserId] = React.useState("67ea6dfa000693f288fb"); // Replace with actual user ID
  const [isLoading, setIsLoading] = React.useState(false);
  const handleOtpChange = async () => {
    setIsLoading(true);
    console.log("OTP logic here");
   try {
    // const session = await account.createSession(
    //   userId,
    //   otp
    // );
    // console.log("Session created:", session);

    router.push("/auth/set-mpin");

   } catch (error) {
     console.error("Error handling OTP:", error);
     }finally {
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
          marginTop: (height - 600) / 2, // Dynamically calculate margin to center vertically
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

        <Text
          style={{
            ...TYPOGRAPHY.body,
            fontFamily: FONT_WEIGHT.semiBold,
            color: primary_textColor,
            marginBottom: 5,
            textAlign: "center",
          }}
          onPress={() => router.push("/auth/set-mpin")}
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
              Continue
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
