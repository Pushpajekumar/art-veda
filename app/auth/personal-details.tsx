import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { primaryColor } from "@/constant/contant";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { database, storage } from "@/context/app-write";
import { ID } from "react-native-appwrite";

// Constants
const BUCKET_ID = process.env.EXPO_PUBLIC_BUCKET_ID!;
const DATABASE_ID = "6815de2b0004b53475ec";
const COLLECTION_ID = "6815e0be001731ca8b1b";
const PROJECT_ID = "6815dda60027ce5089d8";

interface FormData {
  fullName: string;
  address: string;
  image: string | null;
}

const PersonalDetails = () => {
  const params = useLocalSearchParams();
  const documentId = useMemo(() => 
    Array.isArray(params.documentId) ? params.documentId[0] : params.documentId as string,
    [params.documentId]
  );

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    address: "",
    image: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const updateFormData = useCallback((field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  }, [error]);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need storage permissions to select photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        updateFormData("image", result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to select image");
    }
  }, [updateFormData]);

  const uploadImage = useCallback(async (imageUri: string) => {
    const filename = imageUri.split("/").pop() || "profile.jpg";
    const fileData = {
      name: filename,
      type: "image/jpeg",
      size: 0,
      uri: imageUri,
    };

    return await storage.createFile(BUCKET_ID, ID.unique(), fileData);
  }, []);

  const updateUserDocument = useCallback(async (profileImageData?: { url: string; id: string }) => {
    const updateData: any = {
      name: formData.fullName,
      address: formData.address,
    };

    if (profileImageData) {
      updateData.profileImage = profileImageData.url;
      updateData.profileImageId = profileImageData.id;
    }

    return await database.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, updateData);
  }, [formData.fullName, formData.address, documentId]);

  const handleContinue = useCallback(async () => {
    if (!formData.fullName.trim() || !formData.address.trim()) {
      setError("Please enter your full name and address");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let profileImageData;
      
      if (formData.image) {
        const file = await uploadImage(formData.image);
        profileImageData = {
          url: `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`,
          id: file.$id,
        };
      }

      await updateUserDocument(profileImageData);

      router.replace({
        pathname: "/select-political-party",
        params: { userId: documentId },
      });
    } catch (err) {
      console.error("Error saving details:", err);
      setError("Failed to save your details. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [formData, uploadImage, updateUserDocument, documentId]);

  const isFormValid = useMemo(() => 
    formData.fullName.trim() && formData.address.trim(),
    [formData.fullName, formData.address]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fill Your Personal Details</Text>

        {/* Profile Image Section */}
        <View style={styles.photoContainer}>
          <View style={styles.profileImageContainer}>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.profileImage} />
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

        {/* Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(value) => updateFormData("fullName", value)}
          placeholderTextColor="#888"
          editable={!uploading}
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(value) => updateFormData("address", value)}
          placeholderTextColor="#888"
          editable={!uploading}
        />

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.disabledButton]}
          onPress={handleContinue}
          disabled={uploading || !isFormValid}
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
    borderRadius: 5,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "rgba(217, 217, 217, 0.4)",
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
  disabledButton: {
    opacity: 0.6,
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
