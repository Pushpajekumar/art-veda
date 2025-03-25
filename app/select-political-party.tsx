import { View, Text, Dimensions, StyleSheet, TextInput } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import Entypo from "@expo/vector-icons/Entypo";
import EvilIcons from "@expo/vector-icons/EvilIcons";

const selectpoliticalparty = () => {
  const { width, height } = Dimensions.get("window");
  return (
    <SafeAreaView>
      <View style={styles.header_container}>
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <Text
            style={{ ...TYPOGRAPHY.body, fontFamily: FONT_WEIGHT.semiBold }}
          >
            Select Your Political Party
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>Skip</Text>
            <Entypo name="chevron-small-right" size={24} color="black" />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
            <EvilIcons name="search" size={24} color="black" />
          </View>
          <TextInput
            placeholder="Search..."
            onChangeText={(text) => console.log(text)}
            style={[
              styles.search_input,
              { paddingLeft: 40, flex: 1 }, // Adjust padding to make space for the icon
            ]}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
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

  search_input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    marginTop: 10,
  },
});
