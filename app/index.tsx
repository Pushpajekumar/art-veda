import { View, Text } from "../context/ThemeContext";
import { Dimensions, Image, StyleSheet } from "react-native";
import { TYPOGRAPHY, FONT_SIZE, FONT_WEIGHT } from "../utils/fonts";

export default function Index() {
  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo-art-veda.png")}
        style={{
          width: width * 0.7,
          height: height * 0.3,
          resizeMode: "contain",
        }}
      />
      <Text style={[styles.title]}>Welcome to Artveda</Text>
      <Text style={styles.subtitle}>
        Create beautiful posters in minutes with our easy-to-use tools
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontFamily: FONT_WEIGHT.bold, // Apply medium weight specifically to title
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: 30,
  },
});
