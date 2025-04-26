import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo vector icons if you haven't
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import { primaryColor } from "@/constant/contant";
import { useRouter } from "expo-router";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    // Implement your search logic here
    console.log("Searching for:", searchQuery);
    setLoading(true);
    try {
      const result = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_SUB_CATEGORY_COLLECTION_ID!,
        [Query.search("name", searchQuery), Query.select(["$id", "name"])]
      );
      console.log(result.documents);

      // Cast the documents to the proper type
      setSearchResults(result.documents);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };
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
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={primaryColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search results section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ marginTop: 10 }}>Searching...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <>
              <Text style={styles.resultsHeader}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item: Models.Document) => item.$id}
                renderItem={({ item }: { item: Models.Document }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => {
                      router.push({
                        pathname: "/view-all",
                        params: {
                          subCatId: item.$id,
                          subCatName: item.name,
                        },
                      });
                    }}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle}>{item.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.flatListContent}
              />
            </>
          ) : (
            <Text style={styles.noResultsText}>
              {searchQuery ? "No results found" : "Start typing to search"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  resultId: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
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
