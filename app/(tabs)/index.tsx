import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";
import { useNotification } from "@/context/notificationContext";

const OfficialHome = () => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [favPoliticalParty, setFavPoliticalParty] = useState<any>(null); // Initialize as null
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const { expoPushToken, error, notification } = useNotification();

  console.log(expoPushToken, error, notification);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const fetchSubCategories = async () => {
          const subCategoriesData = await database.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
            [Query.equal("isOnHomescreen", true)]
          );
          setSubCategories(subCategoriesData.documents);
        };

        const fetchFavPoliticalParty = async () => {
          const user = await account.get();
          const userId = user.$id;

          const userDetailsResponse = await database.listDocuments(
            "6815de2b0004b53475ec",
            "6815e0be001731ca8b1b",
            [Query.equal("userId", userId)]
          );

          if (userDetailsResponse.documents.length > 0) {
            const politicalPartyId =
              userDetailsResponse.documents[0].politicalParty;
            if (politicalPartyId) {
              const response = await database.listDocuments(
                process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                "6815de600031711fadff",
                [Query.equal("$id", politicalPartyId)]
              );
              if (response.documents.length > 0) {
                setFavPoliticalParty(response.documents[0]);
                console.log(response.documents[0], "response");
              } else {
                setFavPoliticalParty({}); // Set to empty object if not found
              }
            } else {
              setFavPoliticalParty({}); // Set to empty object if no politicalPartyId
            }
          } else {
            setFavPoliticalParty({}); // Set to empty object if no user details
          }
        };

        await Promise.all([fetchSubCategories(), fetchFavPoliticalParty()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={primary_textColor} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

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

        {favPoliticalParty && favPoliticalParty.name && (
          <View
            style={{
              padding: 16,
            }}
          >
            <CarouselComp
              images={
                favPoliticalParty.posts && favPoliticalParty.posts.length > 0
                  ? favPoliticalParty.posts.map((item: any) => ({
                      previewImage:
                        item.previewImage || "https://via.placeholder.com/400",
                      id: item.$id,
                    }))
                  : []
              }
              title={favPoliticalParty.name}
              subCatName={favPoliticalParty.name}
              subCatId={favPoliticalParty.$id}
            />
          </View>
        )}

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
                  subcategory.posts && subcategory.posts.length > 0
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    ...TYPOGRAPHY.body,
    color: primary_textColor,
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
