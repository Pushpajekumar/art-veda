import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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

interface SubCategory {
  $id: string;
  name: string;
  numbering: number;
  posts?: Post[];
}

interface Post {
  $id: string;
  previewImage?: string;
}

interface PoliticalParty {
  $id: string;
  name: string;
  posts?: Post[];
}

const OfficialHome = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [favPoliticalParty, setFavPoliticalParty] = useState<PoliticalParty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { expoPushToken, error, notification } = useNotification();

  console.log(expoPushToken, "expoPushToken 🟢")
  console.log(error, "error 🟢")
  console.log(notification, "notification 🟢");

  const mapPostsToImages = useCallback((posts: Post[] = []) => 
    posts.map(item => ({
      previewImage: item.previewImage || "https://via.placeholder.com/400",
      id: item.$id,
    })), []
  );

  const sortedSubCategories = useMemo(() => 
    subCategories.sort((a, b) => a.numbering - b.numbering), 
    [subCategories]
  );

  const fetchSubCategories = useCallback(async () => {
    const response = await database.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
      [Query.equal("isOnHomescreen", true)]
    );
    return response.documents as unknown as SubCategory[];
  }, []);

  const fetchFavPoliticalParty = useCallback(async () => {
    try {
      const user = await account.get();
      const userDetailsResponse = await database.listDocuments(
        "6815de2b0004b53475ec",
        "6815e0be001731ca8b1b",
        [Query.equal("userId", user.$id)]
      );

      const userDetails = userDetailsResponse.documents[0];
      if (!userDetails?.politicalParty) return null;

      const response = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        "6815de600031711fadff",
        [Query.equal("$id", userDetails.politicalParty)]
      );

      return response.documents[0] as unknown as PoliticalParty || null;
    } catch (error) {
      console.error("Error fetching political party:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [subCategoriesData, politicalPartyData] = await Promise.all([
          fetchSubCategories(),
          fetchFavPoliticalParty(),
        ]);

        setSubCategories(subCategoriesData);
        setFavPoliticalParty(politicalPartyData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchSubCategories, fetchFavPoliticalParty]);

  const handleSearchPress = useCallback(() => {
    router.push("/search-screen");
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
      <ScrollView showsVerticalScrollIndicator={false} >
        <LinearGradient
          colors={["#ffffff", "#DAF0FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header_container}
        >
          <View style={styles.searchContainer}>
            <View
              style={styles.searchInputContainer}
              onTouchEnd={handleSearchPress}
            >
              <EvilIcons name="search" size={24} color="black" />
              <Text style={styles.searchPlaceholder}>
                Search category or media
              </Text>
            </View>
            <FontAwesome
              name="bell-o"
              size={24}
              color="black"
              style={styles.bellIcon}
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

        {favPoliticalParty?.name && (
          <View style={styles.carouselWrapper}>
            <CarouselComp
              images={mapPostsToImages(favPoliticalParty.posts)}
              title={favPoliticalParty.name}
              subCatName={favPoliticalParty.name}
              subCatId={favPoliticalParty.$id}
            />
          </View>
        )}

        {sortedSubCategories.map((subcategory) => (
          <View key={subcategory.$id} style={styles.carouselWrapper}>
            <CarouselComp
              images={mapPostsToImages(subcategory.posts)}
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
    marginBottom: 60,
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
  searchPlaceholder: {
    ...TYPOGRAPHY.body,
    marginLeft: 5,
    color: "#888",
  },
  bellIcon: {
    marginLeft: 10,
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
  carouselWrapper: {
    padding: 16,
  },
});
