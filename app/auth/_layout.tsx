import React from "react";
import { Stack } from "expo-router";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

export default function AuthLayout() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="otp-verification"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
