import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";

const Options = () => {
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
              <Text style={styles.profileName}>Manoj Kumar Ji</Text>
              <Text style={styles.profilePhone}>9876543210</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Card */}
        <View style={styles.referralCard}>
          <View style={styles.referralLeft}>
            <View style={styles.referralCode}>
              <Text style={styles.referralCodeText}>MKwqbZ</Text>
              <TouchableOpacity>
                <Ionicons name="copy-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.referralActions}>
              <TouchableOpacity style={styles.referNowButton}>
                <Text style={styles.referNowText}>Refer Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.referralRight}>
            {/* <Image
              source={require("@/assets/gift-icon.png")}
              style={styles.giftIcon}
              defaultSource={require("@/assets/gift-icon.png")}
            /> */}
            <Text style={styles.referralTitle}>Refer & Earn Wallet coin</Text>
          </View>
        </View>

        {/* Help & Support Section */}
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconText}>
              <FontAwesome name="comment" size={20} color="#333" />
              <Text style={styles.optionText}>Chat Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconText}>
              <FontAwesome name="phone" size={20} color="#333" />
              <Text style={styles.optionText}>Call Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
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

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIconText}>
              <MaterialIcons name="privacy-tip" size={20} color="#333" />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
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
              <FontAwesome name="facebook" size={24} color="#1877F2" />
              <FontAwesome name="instagram" size={24} color="#E4405F" />
              <FontAwesome name="twitter" size={24} color="#1DA1F2" />
              <FontAwesome name="youtube-play" size={24} color="#FF0000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
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
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
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
});

export default Options;
