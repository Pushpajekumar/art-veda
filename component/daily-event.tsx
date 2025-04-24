import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import React, { useEffect } from "react";
import { TYPOGRAPHY } from "@/utils/fonts";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import CarouselComp from "./carousel-comp";

const DailyEvent = () => {
  const [events, setEvents] = React.useState<Models.Document[]>([]);

  useEffect(() => {
    const fetchTodayEvent = async () => {
      const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
      const collectionId = process.env.EXPO_PUBLIC_APPWRITE_DAILY_EVENT_ID!;

      try {
        const today = new Date();
        const formattedDate =
          today.toISOString().split("T")[0] + "T12:00:00.000+00:00";

        const todayEvent = await database.listDocuments(
          databaseId,
          collectionId,
          [Query.equal("date", formattedDate)]
        );
        console.log("Event found:", todayEvent.documents.length > 0);
        console.log(todayEvent, "events 🟢");

        // Store all events in state
        setEvents(todayEvent.documents);

        if (todayEvent.documents.length > 0) {
          const eventData = todayEvent.documents[0];
          console.log("Date:", eventData.date);

          // Access template array and print previewImage
          if (eventData.template && eventData.template.length > 0) {
            console.log(
              "Preview Image URL:",
              eventData.template[0].previewImage
            );
          } else {
            console.log("No template data available");
          }
        }
      } catch (error) {
        console.error("Error fetching today's event:", error);
      }
    };

    fetchTodayEvent();
  }, []);

  console.log(events, "events 🟢");
  return (
    <View>
      {/* //TODO: Add a loading state and also it has padding horizontal issue */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContainer}
      >
        {Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const day = date
            .getDate()
            .toString()
            .padStart(2, "0");
          const month = date.toLocaleString("default", { month: "short" });

          return (
            <View key={i} style={styles.dateCard}>
              <View>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    <View>
      <CarouselComp
        images={events.flatMap(event => 
        event.template ? event.template.map((template: {previewImage: string}) => template.previewImage) : []
        )}
        title="Daily Event"
      />
    </View>
    </View>
  );
};

export default DailyEvent;

export const styles = StyleSheet.create({
  dateScrollContainer: {
    paddingVertical: 10,
    marginTop: 10,
  },

  dateCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    minWidth: 60,
  },

  dateDay: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },

  dateMonth: {
    ...TYPOGRAPHY.caption,
    color: "#666",
  },
});
