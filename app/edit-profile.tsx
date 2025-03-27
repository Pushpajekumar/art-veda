import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { primaryColor } from "@/constant/contant";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    dob: "",
    occupation: "",
    gender: "male", // Default value
    email: "",
    phone: "",
    profileImage: "https://via.placeholder.com/150",
  });

  const handleSave = () => {
    // Handle save profile logic here
    console.log("Profile data:", profileData);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: profileData.profileImage }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.imageEditButton}>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfile;
