import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { primaryColor, width } from "@/constant/contant";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";

const profile = () => {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const user = await account.get();
        console.log(user, "user");
        if (!user) {
          ToastAndroid.show(
            "Please login to access this page",
            ToastAndroid.SHORT
          );
          router.push("/auth/login");
          return;
        }

        const userId = user.$id;

        const userDetailsResponse = await database.listDocuments(
          "6815de2b0004b53475ec",
          "6815e0be001731ca8b1b",
          [Query.equal("userId", userId)]
        );

        const userDetails = userDetailsResponse.documents[0];
        if (!userDetails) {
          ToastAndroid.show("User details not found", ToastAndroid.SHORT);
          return;
        }

        setName(userDetails.name || "");
        setPhone(userDetails.phone || "");
        setProfileImage(userDetails.profileImage || "");
        setUserId(userDetails.$id || "");
        console.log(userDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
        ToastAndroid.show("Failed to load profile", ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={require("../../assets/images/name.png")}
          style={styles.image}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
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
                  source={
                    profileImage && profileImage.length > 0
                      ? { uri: profileImage }
                      : require("../../assets/images/user.png")
                  }
                  style={{
                    width: width * 0.25,
                    height: width * 0.25,
                    borderRadius: width * 0.25,
                    borderWidth: 3,
                    marginTop: -width * 0.175,
                    borderColor: "white",
                    backgroundColor: "#e5e7eb", // Add background color for transparent images
                    overflow: "hidden", // Ensure content doesn't overflow rounded borders
                  }}
                  resizeMode="cover"
                  onError={() => console.log("Error loading profile image")}
                />
                <Text
                  style={{ marginTop: 8, fontSize: 16, fontWeight: "bold" }}
                >
                  {name}
                </Text>
                {phone && (
                  <Text style={{ color: "gray" }}>
                    {phone.substring(0, 3)} {phone.substring(3)}
                  </Text>
                )}
              </View>

              <Pressable
                style={{
                  backgroundColor: primaryColor,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/edit-profile",
                    params: {
                      userId,
                    },
                  })
                }
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
                <Text
                  style={{ marginLeft: 12, fontSize: 16, fontWeight: "500" }}
                >
                  Language
                </Text>
              </View>
              <Text style={{ color: "gray" }}>English</Text>
            </View>
          </>
        )}
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 10,
    color: "#4285F4",
    fontSize: 16,
  },
});
