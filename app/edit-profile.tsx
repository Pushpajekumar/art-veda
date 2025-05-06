import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { primaryColor } from "@/constant/contant";
import { useLocalSearchParams, useRouter } from "expo-router";
import { database, ID } from "@/context/app-write";
import * as ImagePicker from "expo-image-picker";
import { storage } from "@/context/app-write"; // Make sure this is imported or available

const EditProfile = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    dob: "",
    occupation: "",
    gender: "male",
    email: "",
    phone: "",
    address: "",
    profileImage: "https://via.placeholder.com/150",
    profileImageId: "",
    logo: "https://via.placeholder.com/150",
    logoId: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;

        setLoading(true);
        const user = await database.getDocument(
          "6815de2b0004b53475ec",
          "6815e0be001731ca8b1b",
          userId.toString()
        );

        if (user) {
          setProfileData({
            name: user.name || "",
            dob: user.dob || "",
            occupation: user.occupation || "",
            gender: user.gender || "male",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            profileImage:
              user.profileImage || "https://via.placeholder.com/150",
            profileImageId: user.profileImageId || "",
            logo: user.logo || "https://via.placeholder.com/150",
            logoId: user.logoId || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await database.updateDocument(
        "6815de2b0004b53475ec",
        "6815e0be001731ca8b1b",
        userId.toString(),
        {
          name: profileData.name,
          dob: profileData.dob,
          occupation: profileData.occupation,
          gender: profileData.gender,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
        }
      );

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image selection
  const pickImage = async (type: "profile" | "logo") => {
    try {
      // Request permissions
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload images"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUploading(true);

        try {
          const uri = result.assets[0].uri;
          const filename = uri.substring(uri.lastIndexOf("/") + 1);

          // Get file info
          const response = await fetch(uri);
          const blob = await response.blob();

          // Create a file object compatible with Appwrite storage
          const fileData = {
            name: filename,
            type: blob.type,
            size: blob.size,
            uri: uri,
          };

          const bucketId = process.env.EXPO_PUBLIC_BUCKET_ID!;

          // Upload to storage
          const file = await storage.createFile(
            bucketId,
            ID.unique(),
            fileData
          );

          // Generate the complete file URL
          const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${
            file.$id
          }/view?project=6815dda60027ce5089d8`;

          // Update document with the new image info
          if (type === "profile") {
            await database.updateDocument(
              "6815de2b0004b53475ec",
              "6815e0be001731ca8b1b",
              userId.toString(),
              {
                profileImage: fileUrl,
                profileImageId: file.$id,
              }
            );
          } else if (type === "logo") {
            await database.updateDocument(
              "6815de2b0004b53475ec",
              "6815e0be001731ca8b1b",
              userId.toString(),
              {
                logo: fileUrl,
                logoId: file.$id,
              }
            );
          }

          // Update state based on type
          if (type === "profile") {
            setProfileData((prev) => ({
              ...prev,
              profileImage: fileUrl,
              profileImageId: file.$id,
            }));
          } else if (type === "logo") {
            setProfileData((prev) => ({
              ...prev,
              logo: fileUrl,
              logoId: file.$id,
            }));
          }

          // Show success message
          Alert.alert(
            "Upload Success",
            `Your ${
              type === "profile" ? "profile picture" : "business logo"
            } has been uploaded successfully!`
          );
        } catch (err) {
          console.error("Error uploading image:", err);
          Alert.alert(
            "Upload Failed",
            "Failed to upload image. Please try again."
          );
        } finally {
          setImageUploading(false);
        }
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Something went wrong while selecting the image");
      setImageUploading(false);
    }
  };

  if (loading && !profileData.name) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {imageUploading ? (
            <View style={styles.profileImageLoader}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : (
            <Image
              source={{ uri: profileData.profileImage }}
              style={styles.profileImage}
            />
          )}
          <TouchableOpacity
            style={styles.imageEditButton}
            onPress={() => pickImage("profile")}
            disabled={imageUploading}
          >
            <Ionicons name="camera-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Logo Image Section */}
        <View style={styles.logoSection}>
          <Text style={styles.sectionTitle}>Business Logo</Text>
          <View style={styles.logoContainer}>
            {imageUploading ? (
              <View style={styles.logoImageLoader}>
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : (
              <Image
                source={{ uri: profileData.logo }}
                style={styles.logoImage}
              />
            )}
            <TouchableOpacity
              style={styles.logoEditButton}
              onPress={() => pickImage("logo")}
              disabled={imageUploading}
            >
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) =>
                setProfileData({ ...profileData, name: text })
              }
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={profileData.dob}
              onChangeText={(text) =>
                setProfileData({ ...profileData, dob: text })
              }
              placeholder="DD/MM/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={profileData.occupation}
              onChangeText={(text) =>
                setProfileData({ ...profileData, occupation: text })
              }
              placeholder="Enter your occupation"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setProfileData({ ...profileData, gender: "male" })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === "male" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setProfileData({ ...profileData, gender: "female" })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === "female" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setProfileData({ ...profileData, gender: "other" })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === "other" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text) =>
                setProfileData({ ...profileData, email: text })
              }
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) =>
                setProfileData({ ...profileData, phone: text })
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={profileData.address}
              onChangeText={(text) =>
                setProfileData({ ...profileData, address: text })
              }
              placeholder="Enter your address"
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (loading || imageUploading) && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={loading || imageUploading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40, // Add padding to bottom of scroll content
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImageLoader: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  imageEditButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: primaryColor,
    padding: 8,
    borderRadius: 20,
  },
  // Logo styles
  logoSection: {
    alignItems: "center",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  logoContainer: {
    position: "relative",
    marginBottom: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  logoImageLoader: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  logoEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: primaryColor,
    padding: 8,
    borderRadius: 20,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  addressInput: {
    height: 100,
    textAlignVertical: "top",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: primaryColor,
    borderWidth: 6,
    borderColor: "#fff",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20, // Added margin at bottom of button
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfile;
