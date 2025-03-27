import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import React from "react";

const profile = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={require("../../assets/images/name.png")}
          style={styles.image}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 20,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              source={{ uri: "https://picsum.photos/80" }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: "bold" }}>
              Name
            </Text>
            <Text style={{ color: "gray" }}>Phone Number</Text>
          </View>
          
          <View style={{ 
            backgroundColor: "#4285F4", 
            paddingVertical: 10, 
            paddingHorizontal: 20, 
            borderRadius: 8,
          }}>
            <Text style={{ color: "white", fontWeight: "600" }}>
              Edit Profile
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  image: {
    width: "90%",
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "contain",
    margin: 20,
  },
});
