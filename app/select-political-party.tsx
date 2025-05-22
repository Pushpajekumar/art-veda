import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import PoliticalPartyCard from "@/component/political-party-card";
import { router, useLocalSearchParams } from "expo-router";
import { database } from "@/context/app-write";

// Define the structure we need for our UI components
type PoliticalParty = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
};

const selectpoliticalparty = () => {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId)
    ? params.userId[0]
    : (params.userId as string);

  console.log(userId, "🟢");

  const [politicalParties, setPoliticalParties] = useState<PoliticalParty[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredParties, setFilteredParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticalParties = async () => {
      setLoading(true);
      try {
        const response = await database.getDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          "6815de6e00023c32614a",
          "682da2c7003407a61553"
        );

        // Map the response data to the format our UI expects
        const mappedData: PoliticalParty[] = response.subCategory.map(
          (party: any) => ({
            id: party.$id,
            name: party.name,
            shortName: party.name, // Use the full name if shortName doesn't exist
            logo: party.logoUrl,
          })
        );

        console.log("Political parties fetched successfully:", mappedData);
        setPoliticalParties(mappedData);
        setFilteredParties(mappedData);
      } catch (error) {
        console.error("Error fetching political parties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalParties();
  }, []);

  // Update filtered parties whenever search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredParties(politicalParties);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = politicalParties.filter(
        (party) =>
          party.name.toLowerCase().includes(query) ||
          party.shortName.toLowerCase().includes(query)
      );
      setFilteredParties(filtered);
    }
  }, [searchQuery, politicalParties]);

  const handleSkip = () => {
    // Navigate to the next screen
    router.replace("/(tabs)");
  };

  const handlePartySelect = async (party: PoliticalParty) => {
    try {
      // Store the selected party in user preferences
      await database.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
        userId.toString(),
        {
          politicalParty: party.id,
        }
      );

      console.log("Selected party:", party);
      // Navigate to the next screen
      router.replace("/auth/personal-details");
    } catch (error) {
      console.error("Error selecting party:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_container}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Select Your Political Party</Text>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText} onPress={handleSkip}>
              Skip
            </Text>
            <Entypo name="chevron-small-right" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <EvilIcons name="search" size={24} color="black" />
          </View>
          <TextInput
            placeholder="Search political parties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.search_input}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>Loading political parties...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredParties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePartySelect(item)}>
              <PoliticalPartyCard party={item} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No political parties found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default selectpoliticalparty;

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
  headerTitleRow: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  headerTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.semiBold,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  skipText: {
    ...TYPOGRAPHY.body,
    color: "#4A6572",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginTop: 10,
  },
  searchIconContainer: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  search_input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    paddingLeft: 40,
    width: "100%",
    height: 44,
    backgroundColor: "#ffffff",
    ...TYPOGRAPHY.body,
  },
  listContainer: {
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    marginTop: 10,
    color: "#666",
  },
});
