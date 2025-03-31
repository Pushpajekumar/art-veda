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

const login = () => {
  const { width, height } = Dimensions.get("window");

  

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
          <Text style={styles.text}>Login to your Account</Text>
          <Text style={styles.subtext}>Enter your mobile number to create</Text>
          <Text style={styles.subtext}>your account</Text>
        </View>
      </View>

      <View
        style={{
          padding: 20,
          marginTop: (height - 600) / 2, // Dynamically calculate margin to center vertically
        }}
      >
        <View>
          <Text
            style={{
              ...TYPOGRAPHY.caption,
              fontFamily: FONT_WEIGHT.medium,
              color: "grey",
              marginBottom: 5,
            }}
          >
            Enter your mobile number
          </Text>
          <TextInput
            onChange={(e) => console.log(e.nativeEvent.text)}
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              ...TYPOGRAPHY.caption,
              fontFamily: FONT_WEIGHT.medium,
              color: "grey",
              marginBottom: 5,
            }}
          >
            Enter your mPin
          </Text>
          <TextInput
            placeholder="Enter your mpin"
            secureTextEntry={true}
            maxLength={4}
            keyboardType="numeric"
            style={[styles.input, { marginBottom: 10 }]}
            onChange={(e) => console.log(e.nativeEvent.text)}
          />
        </View>

        <Text
          style={{
            ...TYPOGRAPHY.caption,
            color: primary_textColor,
            marginTop: 5,
            textAlign: "right",
            marginBottom: 20,
          }}
          onPress={() => router.push("/auth/otp-verification")}
        >
          Forgot your mPin ?
        </Text>
        <Text
          style={{
            ...TYPOGRAPHY.body,
            fontFamily: FONT_WEIGHT.semiBold,
            color: primary_textColor,
            marginBottom: 5,
            textAlign: "center",
          }}
        >
          New User SignUp ?
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
            onPress={() => router.replace("/select-political-party")}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                ...TYPOGRAPHY.button,
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default login;

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
