import { View, Text } from "../context/ThemeContext";
import { StyleSheet } from "react-native";
import { fontStyles } from "../context/ThemeContext";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, fontStyles.bold]}>Welcome to Art Veda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
  },
});
