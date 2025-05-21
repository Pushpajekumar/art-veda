import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { EvilIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { primary_textColor } from "@/constant/contant";
import AntDesign from "@expo/vector-icons/AntDesign";
import CarouselComp from "@/component/carousel-comp";
import { router } from "expo-router";
import DailyEvent from "@/component/daily-event";
import { database } from "@/context/app-write";
import { Query } from "react-native-appwrite";
import { useNotification } from "@/context/notificationContext";

const OfficialHome = () => {
  const [subCategories, setSubCategories] = React.useState<any[]>([]);

  const { expoPushToken, error, notification } = useNotification();

  console.log(expoPushToken, error, notification);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const subCategories = await database.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
          [Query.equal("isOnHomescreen", true)]
        );
        setSubCategories(subCategories.documents);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#ffffff", "#DAF0FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header_container}
        >
          <View style={styles.searchContainer}>
            <View
              style={styles.searchInputContainer}
              onTouchEnd={() => router.push("/search-screen")}
            >
              <View style={styles.searchIconContainer} />
              <EvilIcons name="search" size={24} color="black" />
              <Text style={styles.searchPlaceholder}>
                Search category or media
              </Text>
            </View>
            <FontAwesome
              name="bell-o"
              size={24}
              color="black"
              style={{
                marginLeft: 10,
              }}
            />
          </View>
        </LinearGradient>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarText_container}>
            <AntDesign name="calendar" size={18} color="black" />
            <Text style={styles.calendarText}>Calendar Events 2025</Text>
          </View>

          <DailyEvent />
        </View>

        {/* Dynamic subcategories carousels */}
        {subCategories
          .sort((a, b) => a.numbering - b.numbering)
          .map((subcategory) => (
            <View
              key={subcategory.$id}
              style={{
                padding: 16,
              }}
            >
              <CarouselComp
                images={
                  subcategory.posts
                    ? subcategory.posts.map((item: any) => ({
                        previewImage:
                          item.previewImage ||
                          "https://via.placeholder.com/400",
                        id: item.$id,
                      }))
                    : []
                }
                title={subcategory.name}
                subCatName={subcategory.name}
                subCatId={subcategory.$id}
              />
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfficialHome;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header_container: {
    width: "100%",
    backgroundColor: "rgba(217, 217, 217, 0.4)",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 8,
  },
  searchIconContainer: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  searchPlaceholder: {
    ...TYPOGRAPHY.body,
    marginLeft: 5,
    color: "#888",
  },
  search_input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    paddingLeft: 40,
    flex: 1,
    height: 44,
    backgroundColor: "#ffffff",
    ...TYPOGRAPHY.body,
  },

  calendarContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
  },

  calendarText_container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  calendarText: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.bold,
    color: primary_textColor,
  },

  dateScrollContainer: {
    paddingVertical: 10,
    marginTop: 10,
  },

  dateCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    minWidth: 60,
  },

  dateDay: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },

  dateMonth: {
    ...TYPOGRAPHY.caption,
    color: "#666",
  },
});
