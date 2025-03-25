import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { FONT_WEIGHT, TYPOGRAPHY } from "@/utils/fonts";
import { primary_textColor } from "@/constant/contant";

interface PoliticalPartyCardProps {
  party: { name: string; shortName: string; logo: string };
}

const PoliticalPartyCard = ({ party }: PoliticalPartyCardProps) => {
  return (
    <View style={styles.card_container}>
      <Text style={styles.title}>{party.name}</Text>
      <Image source={{ uri: party.logo }} style={styles.logo} />{" "}
      {/* Added Image with source */}
    </View>
  );
};

export default PoliticalPartyCard;

export const styles = StyleSheet.create({
  card_container: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...TYPOGRAPHY.body,
    fontFamily: FONT_WEIGHT.medium,
    color: primary_textColor,
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
