import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import PoliticalPartyCard from "@/component/political-party-card";
import { router, useLocalSearchParams } from "expo-router";
import { database } from "@/context/app-write";

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

const SelectPoliticalParty = () => {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId as string;

  const [politicalParties, setPoliticalParties] = useState<PoliticalParty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Memoized filtered parties for better performance
  const filteredParties = useMemo(() => {
    if (searchQuery.trim() === "") return politicalParties;
    
    const query = searchQuery.toLowerCase();
    return politicalParties.filter(
      (party) =>
        party.name.toLowerCase().includes(query) ||
        party.shortName.toLowerCase().includes(query)
    );
  }, [searchQuery, politicalParties]);

  useEffect(() => {
    const fetchPoliticalParties = async () => {
      try {
        const response = await database.getDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          "6815de6e00023c32614a",
          "682da2c7003407a61553"
        );

        const mappedData: PoliticalParty[] = response.subCategory.map((party: any) => ({
          id: party.$id,
          name: party.name,
          shortName: party.name,
          logo: party.logoUrl,
        }));

        setPoliticalParties(mappedData);
      } catch (error) {
        console.error("Error fetching political parties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalParties();
  }, []);

  const navigateToTabs = useCallback(() => {
    router.replace("/(tabs)");
  }, []);

  const handlePartySelect = useCallback(async (party: PoliticalParty) => {
    setLoading(true);
    try {
      await database.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        "6815e0be001731ca8b1b",
        userId,
        { politicalParty: party.id }
      );
      navigateToTabs();
    } catch (error) {
      console.error("Error selecting party:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, navigateToTabs]);

  const renderPartyItem = useCallback(({ item }: { item: PoliticalParty }) => (
    <TouchableOpacity onPress={() => handlePartySelect(item)}>
      <PoliticalPartyCard party={item} />
    </TouchableOpacity>
  ), [handlePartySelect]);

  const keyExtractor = useCallback((item: PoliticalParty) => item.id, []);

  const EmptyListComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No political parties found</Text>
    </View>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>Loading political parties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Select Your Political Party</Text>
          <TouchableOpacity style={styles.skipButton} onPress={navigateToTabs}>
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
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={filteredParties}
        keyExtractor={keyExtractor}
        renderItem={renderPartyItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyListComponent}
      />
    </SafeAreaView>
  );
};

export default SelectPoliticalParty;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
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
  searchInput: {
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
