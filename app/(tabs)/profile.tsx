import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import React from "react";
import { width } from "@/constant/contant";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";

const profile = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={require("../../assets/images/name.png")}
          style={styles.image}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            backgroundColor: "#f3f4f6",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              source={{ uri: "https://picsum.photos/80" }}
              style={{
                width: width * 0.25,
                height: width * 0.25,
                borderRadius: width * 0.25,
                borderWidth: 3,
                marginTop: -width * 0.175, // Increased from 0.125 to 0.25 to move up more
                borderColor: "white",
              }}
            />
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: "bold" }}>
              Name
            </Text>
            <Text style={{ color: "gray" }}>Phone Number</Text>
          </View>

          <Pressable
            style={{
              backgroundColor: "#4285F4",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Edit Profile
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingVertical: 20, backgroundColor: "#f3f4f6" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginHorizontal: 20,
              marginBottom: 10,
            }}
          >
            Frames
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {Array.from({ length: 10 }, (_, index) => (
              <View
                key={index}
                style={{
                  width: width * 0.25,
                  height: width * 0.25,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 10,
                  marginRight: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              />
            ))}
          </ScrollView>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "white",
            padding: 20,
            marginTop: 10,
            borderRadius: 10,
            marginHorizontal: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="globe" size={24} color="#4285F4" />
            <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: "500" }}>
              Language
            </Text>
          </View>
          <Text style={{ color: "gray" }}>English</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  image: {
    width: "100%",
    height: 150,
    marginBottom: 30,
    resizeMode: "contain",
    padding: 20,
    backgroundColor: "white",
  },
});
