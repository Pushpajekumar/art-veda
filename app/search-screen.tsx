import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import { primaryColor } from "@/constant/contant";
import { useRouter } from "expo-router";

interface SearchResult extends Models.Document {
  name: string;
}

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const result = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        [
          Query.search("name", searchQuery.trim()),
          Query.select(["$id", "name"]),
        ]
      );

      setSearchResults(result.documents as SearchResult[]);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const navigateToResults = useCallback(
    (item: SearchResult) => {
      router.push({
        pathname: "/view-all",
        params: {
          subCatId: item.$id,
          subCatName: item.name,
        },
      });
    },
    [router]
  );

  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigateToResults(item)}
      >
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>{item.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    ),
    [navigateToResults]
  );

  const keyExtractor = useCallback((item: SearchResult) => item.$id, []);

  const itemSeparator = useMemo(() => <View style={styles.separator} />, []);

  const showClearButton = searchQuery.length > 0;
  const hasResults = searchResults.length > 0;
  const showNoResults = searchQuery && !hasResults && !loading;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={22}
          color={primaryColor}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for artworks, artists..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {showClearButton && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={primaryColor} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {hasResults ? (
            <>
              <Text style={styles.resultsHeader}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={keyExtractor}
                renderItem={renderSearchResult}
                ItemSeparatorComponent={() => itemSeparator}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <Text style={styles.noResultsText}>
              {showNoResults ? "No results found" : "Start typing to search"}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    width: "100%",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    width: "100%",
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
  },
  flatListContent: {
    width: "100%",
  },
  noResultsText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default SearchScreen;
