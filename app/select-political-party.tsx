import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Memoized component for political party items
const PoliticalPartyItem = React.memo(
  ({
    item,
    onPress,
  }: {
    item: PoliticalParty;
    onPress: (party: PoliticalParty) => void;
  }) => (
    <TouchableOpacity onPress={() => onPress(item)}>
      <PoliticalPartyCard party={item} />
    </TouchableOpacity>
  )
);

const selectpoliticalparty = () => {
  const { userId } = useLocalSearchParams();

  const [politicalParties, setPoliticalParties] = useState<PoliticalParty[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Memoized filtered parties to avoid unnecessary re-calculations
  const filteredParties = useMemo(() => {
    if (searchQuery.trim() === "") {
      return politicalParties;
    }

    const query = searchQuery.toLowerCase();
    return politicalParties.filter(
      (party) =>
        party.name.toLowerCase().includes(query) ||
        party.shortName.toLowerCase().includes(query)
    );
  }, [searchQuery, politicalParties]);

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
      } catch (error) {
        console.error("Error fetching political parties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalParties();
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSkip = useCallback(() => {
    router.replace("/(tabs)");
  }, []);

  const handlePartySelect = useCallback(
    async (party: PoliticalParty) => {
      try {
        await database.updateDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
          userId.toString(),
          {
            politicalParty: party.id,
          }
        );

        console.log("Selected party:", party);
        router.replace("/auth/personal-details");
      } catch (error) {
        console.error("Error selecting party:", error);
      }
    },
    [userId]
  );

  // Memoized search handler with debouncing effect
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Memoized render item function
  const renderItem = useCallback(
    ({ item }: { item: PoliticalParty }) => (
      <PoliticalPartyItem item={item} onPress={handlePartySelect} />
    ),
    [handlePartySelect]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: PoliticalParty) => item.id, []);

  // Memoized empty component
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No political parties found</Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_container}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Select Your Political Party</Text>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
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
            onChangeText={handleSearchChange}
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
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={ListEmptyComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 80, // Approximate height of each item
            offset: 80 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(selectpoliticalparty);

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
