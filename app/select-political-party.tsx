import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import PoliticalPartyCard from "@/component/political-party-card";
import { router } from "expo-router";

const politicalParties = [
  {
    name: "Democratic Party",
    shortName: "Dem",
    logo: "https://picsum.photos/200?random=1",
  },
  {
    name: "Republican Party",
    shortName: "Rep",
    logo: "https://picsum.photos/200?random=2",
  },
  {
    name: "Green Party",
    shortName: "Green",
    logo: "https://picsum.photos/200?random=3",
  },
  {
    name: "Libertarian Party",
    shortName: "Lib",
    logo: "https://picsum.photos/200?random=4",
  },
  {
    name: "Independent Party",
    shortName: "Ind",
    logo: "https://picsum.photos/200?random=5",
  },
];

const selectpoliticalparty = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredParties, setFilteredParties] = useState(politicalParties);

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
  }, [searchQuery]);

  const handleSkip = () => {
    // Navigate to the next screen
    router.replace("/official-home");
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

      <FlatList
        data={filteredParties}
        keyExtractor={(item) => item.shortName}
        renderItem={({ item }) => <PoliticalPartyCard party={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No political parties found</Text>
          </View>
        }
      />
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
});
