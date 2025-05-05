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
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { primaryColor } from "@/constant/contant";
import { useLocalSearchParams, useRouter } from "expo-router";
import { database } from "@/context/app-write";

const EditProfile = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
            profileImage: user.profileImage || "https://via.placeholder.com/150",
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
          profileImage: profileData.profileImage,
        }
      );
      alert("Profile updated successfully");
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image selection (placeholder for now)
  const handleImageSelect = () => {
    // Image picker implementation would go here
    alert("Image selection functionality to be implemented");
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: profileData.profileImage }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.imageEditButton} onPress={handleImageSelect}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
          </TouchableOpacity>
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
                onPress={() => setProfileData({ ...profileData, gender: "male" })}
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
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
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
  imageEditButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
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
