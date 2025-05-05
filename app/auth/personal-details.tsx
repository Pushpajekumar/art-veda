import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { primaryColor } from "@/constant/contant";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { account, database, storage } from "@/context/app-write";
import { ID } from "react-native-appwrite";
import profile from "../(tabs)/profile";

const PersonalDetails = () => {
  const params = useLocalSearchParams();
  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : (params.documentId as string);
  console.log(documentId, "🟢");

  const [fullName, setFullName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");

  // Pick an image from gallery
  const pickImage = async () => {
    try {
      // Request media library permissions
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to select image");
    }
  };

  // Handle continue button
  const handleContinue = async () => {
    if (!fullName.trim() || !address.trim()) {
      setError("Please enter your full name and address");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
      // const usersCollectionId =
      //   process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

      // if (!databaseId || !usersCollectionId) {
      //   throw new Error("Database configuration is missing");
      // }

      // Upload profile image if selected
      if (image) {
        const imageUri: string = image;
        const filename = imageUri.split("/").pop();

        // Android only implementation
        const fileData = {
          name: filename || "profile.jpg",
          type: "image/jpeg",
          size: 0, // This will be determined by the backend for Android
          uri: imageUri,
        };

        const bucketId = process.env.EXPO_PUBLIC_BUCKET_ID!;
        const file = await storage.createFile(bucketId, ID.unique(), fileData);

        //update user data in our database
        await database.updateDocument(
          "6815de2b0004b53475ec",
          "6815e0be001731ca8b1b",
          documentId,
          {
            name: fullName,
            profileImage: `https://cloud.appwrite.io/v1/storage/buckets/${
              process.env.EXPO_PUBLIC_BUCKET_ID
            }/files/${file.$id}/view?project=${
              process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
            }`,
            profileImageId: file.$id,
            address: address,
          }
        );
      }

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error saving details:", err);
      setError("Failed to save your details. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fill Your Personal Details</Text>

        {/* Profile Image Section */}
        <View style={styles.photoContainer}>
          <View style={styles.profileImageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={80} color="#fff" />
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.addPhotoText}>Add Your Photo</Text>
        </View>

        {/* Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#888"
          editable={!uploading}
        />

        {/* Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#888"
          editable={!uploading}
        />

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By Signing Up, you confirm that you accept
          </Text>
          <View style={styles.termsLinkContainer}>
            <TouchableOpacity>
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and have read our </Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>Privacy policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8ff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 40,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
    marginBottom: 10,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addPhotoText: {
    fontSize: 16,
    color: "#000",
    marginTop: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#E6F0FF",
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: primaryColor,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  termsContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  termsText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  termsLinkContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  termsLink: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default PersonalDetails;
