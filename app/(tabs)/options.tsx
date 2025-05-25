import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { useRouter } from "expo-router";
import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";

const shareAbleLink = 'https://play.google.com/apps/test/com.evolcrm.artveda'
const privacyPolicyLink = 'https://docs.google.com/document/d/1SVfjgbdCI6ZfXyqGefDGJ6i4eUF9Nr2WlyQbN8uUfp4/edit?usp=sharing'
const termsAndConditionLink = 'https://docs.google.com/document/d/1IekV0wKw4EJOM5lgQR8KPajbN-dUcpiDZDLT72YWoOU/edit?usp=sharing'
const faqsLink = 'https://docs.google.com/document/d/15EKnE8FwOp2CDknEkkEvXcBM29XG1hF73fpK-jHuh_o/edit?usp=sharing'
const contactUsLink = 'https://docs.google.com/document/d/1xpYw3TNPnYjlaekH7SvR0HyWEhf9dLWztUs4WAOUyAI/edit?usp=sharing'
const callSupportLink = 'tel:+919999999999' // Replace with your support number
 

 const Options = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

const shareApp = async () => {
  try {
  const result = await Share.share({
    message: `Check out this amazing app! ${shareAbleLink}`,
    url: shareAbleLink,
    title: "Share App",
  })

  if (result.action === Share.sharedAction) {
    if (result.activityType) {
      // Track sharing with specific activity type
      console.log(`App shared successfully via ${result.activityType}`);
      Alert.alert("Thank you!", "Thanks for sharing our app with others!");
    } else {
      // Shared without specific activity type
      console.log("App shared successfully");
      Alert.alert("Thank you!", "Thanks for sharing our app!");
    }
  } else if (result.action === Share.dismissedAction) {
    // User dismissed the share dialog
    console.log("Share dismissed by user");
  }

  } catch (error) {
    console.error("Error sharing the app:", error);
  }
}

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get();
        const userId = userData?.$id;
        if (userId) {
          setUserId(userId);
          const userDetails = await database.listDocuments(
            '6815de2b0004b53475ec',
            '6815e0be001731ca8b1b',
            [Query.equal('userId', userId)]
          );
          setUser(userDetails.documents[0]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      Alert.alert("Success", "Logged out successfully");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            {/* <Image
              source={require("@/assets/profile-placeholder.png")}
              style={styles.profileImage}
              defaultSource={require("@/assets/profile-placeholder.png")}
            /> */}
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profilePhone}>
                {user?.phone && user.phone.replace(/^(\+\d{2})(\d+)$/, '$1 $2')}
                </Text>
            </View>
          </View>
          {/* <TouchableOpacity onPress={() => router.push("/edit-profile")}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity> */}
        </View>

        {/* Referral Card */}
        <View style={styles.referralCard}>
          <View style={styles.referralContent}>
            <View style={styles.referralHeader}>
          <FontAwesome name="gift" size={24} color="#FFD700" />
              <View style={styles.headerText}>
          <Text style={styles.referralTitle}>Refer & Earn</Text>
          <Text style={styles.referralSubtitle}>Get rewards for every friend you invite</Text>
              </View>
            </View>
            
            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <View style={styles.referralCode}>
          <Text style={styles.referralCodeText}>{userId ? userId.slice(-6).toUpperCase() : 'LOADING'}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={18} color="#0099ff" />
          </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              {/* <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Invite Friends</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.secondaryButton} onPress={shareApp}>
          <Ionicons name="share-outline" size={18} color="#0099ff" />
          <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Help & Support Section */}
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.sectionContainer}>
            <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => {
              // Open the contact us link
              Linking.openURL(contactUsLink);
            }}>
            <View style={styles.optionIconText}>
              <FontAwesome name="comment" size={20} color="#333" />
              <Text style={styles.optionText}>Chat Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} 
          onPress={() => {
            // Open the call support link
            Linking.openURL(callSupportLink);
          }}>
            <View style={styles.optionIconText}>
              <FontAwesome name="phone" size={20} color="#333" />
              <Text style={styles.optionText}>Call Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}
          onPress={() => {
            // Open the FAQs link
            Linking.openURL(faqsLink);
          }}>
            <View style={styles.optionIconText}>
              <FontAwesome name="question-circle" size={20} color="#333" />
              <Text style={styles.optionText}>FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* About App Section */}
        <Text style={styles.sectionTitle}>About App</Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconText}>
              <MaterialIcons name="feedback" size={20} color="#333" />
              <Text style={styles.optionText}>Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}
          onPress={() => {
            // Open the privacy policy link
            Linking.openURL(privacyPolicyLink);
          }}
          >
            <View style={styles.optionIconText}>
              <MaterialIcons name="privacy-tip" size={20} color="#333" />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}
          onPress={() => {
            // Open the terms and conditions link
            Linking.openURL(termsAndConditionLink);
          }}>
            <View style={styles.optionIconText}>
              <MaterialIcons name="description" size={20} color="#333" />
              <Text style={styles.optionText}>Term & Condition</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconText}>
              <FontAwesome name="user-plus" size={20} color="#333" />
              <Text style={styles.optionText}>Follow Us</Text>
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/share/1CLjutm3v3/')}>
              <FontAwesome name="facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/_artveda_?utm_source=qr&igsh=MWk0ejRzaXJxcGly')}>
              <FontAwesome name="instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://youtube.com/@art_veda?si=GZtV13cMBAF91i9d')}>
              <FontAwesome name="youtube-play" size={24} color="#FF0000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/8218551994')}>
              <FontAwesome name="whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome
            name="sign-out"
            size={18}
            color="red"
            style={{
              marginRight: 8,
            }}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Made With Love */}
        <View style={styles.madeWithLove}>
          <Text style={styles.madeWithLoveText}>Made With </Text>
          <FontAwesome name="heart" size={16} color="#888" />
          <Text style={styles.madeWithLoveText}> in India</Text>
        </View>

        {/* Space for bottom tab bar */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e1e1e1",
  },
  profileText: {
    marginLeft: 16,
  },
  profileName: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.semiBold,
  },
  profilePhone: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.semiBold,
    marginTop: 4,
  },
  editButton: {
    color: "#0099ff",
    fontSize: 16,
    fontWeight: "500",
  },
  referralCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    padding: 16,
    backgroundColor: "#333",
    borderRadius: 12,
    overflow: "hidden",
  },
  referralLeft: {
    flex: 1,
  },
  referralRight: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  referralCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  referralCodeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  referralActions: {
    flexDirection: "row",
  },
  referNowButton: {
    backgroundColor: "#0099ff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  referNowText: {
    color: "white",
    fontWeight: "600",
  },
  shareButton: {
    backgroundColor: "#0099ff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  shareText: {
    color: "white",
    fontWeight: "600",
  },
  giftIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  referralTitle: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    color: "white",
    marginLeft: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.semiBold,
    color: "#666",
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIconText: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.medium,
    marginLeft: 16,
    color: "#333",
  },
  socialIcons: {
    flexDirection: "row",
    width: 140,
    justifyContent: "space-between",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "red",
    ...TYPOGRAPHY.body,
  },
  madeWithLove: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  madeWithLoveText: {
    color: "#888",
    ...TYPOGRAPHY.caption,
    fontFamily: FONT_WEIGHT.regular,
  },
  bottomSpace: {
    height: 100,
  },
  referralContent: {
    flex: 1,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 12,
  },
  referralSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  codeSection: {
    marginBottom: 16,
  },
  codeLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 8,
  },
  copyButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#0099ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0099ff",
  },
  secondaryButtonText: {
    color: "#0099ff",
    fontWeight: "600",
    marginLeft: 4,
  },
});


export default Options;