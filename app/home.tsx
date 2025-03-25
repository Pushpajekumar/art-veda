import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";

const home = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TouchableOpacity
        style={{ padding: 20, backgroundColor: "#007BFF", borderRadius: 5 }}
        onPress={() => router.push("/auth/login")}
      >
        <Text>Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default home;
