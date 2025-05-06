import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TYPOGRAPHY } from "@/utils/fonts";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import CarouselComp from "./carousel-comp";
import { primaryColor } from "@/constant/contant";

const DailyEvent = () => {
  const [events, setEvents] = React.useState<Models.Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  const fetchEventByDate = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = 
        date.toISOString().split("T")[0] + "T12:00:00.000+00:00";

      const events = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_DAILY_EVENT_ID!,
        [Query.equal("date", formattedDate)]
      );
      
      setEvents(events.documents);
      console.log(events, "events for date:", formattedDate);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    fetchEventByDate(today);
  }, []);

  const handleDatePress = (index: number) => {
    setSelectedDateIndex(index);
    const date = new Date();
    date.setDate(date.getDate() + index);
    fetchEventByDate(date);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContainer}
      >
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const day = date
            .getDate()
            .toString()
            .padStart(2, "0");
          const month = date.toLocaleString("default", { month: "short" });

          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleDatePress(i)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dateCard,
                  i === selectedDateIndex
                    ? {
                        backgroundColor: "#e6f2ff",
                        borderColor: primaryColor,
                        borderWidth: 1,
                      }
                    : {},
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.dateDay,
                      i === selectedDateIndex ? { color: primaryColor } : {},
                    ]}
                  >
                    {day}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      i === selectedDateIndex ? { color: primaryColor } : {},
                    ]}
                  >
                    {month}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View>
        {loading ? (
          <View>
            <Animated.View
              style={[
                styles.skeletonImage,
                {
                  opacity: fadeAnim,
                  borderRadius: 8,
                  marginVertical: 10,
                  height: 150,
                  width: "100%",
                },
              ]}
            />
          </View>
        ) : events.length > 0 ? (
          <CarouselComp
            images={events.flatMap((event) =>
              event.posts
                ? event.posts.map(
                    (posts: { previewImage: string }) => posts.previewImage
                  )
                : []
            )}
            title="Daily Event"
            subCatId={events[0].$id}
            showViewAll={false}
          />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={TYPOGRAPHY.body}>No events for this date</Text>
          </View>
        )}
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

  skeletonContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
  },

  skeletonImage: {
    width: 100,
    height: 100,
    backgroundColor: "#e0e0e0",
  },

  skeletonTextContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },

  skeletonTitle: {
    height: 20,
    width: "80%",
    backgroundColor: "#e0e0e0",
    marginBottom: 8,
    borderRadius: 4,
  },

  skeletonText: {
    height: 15,
    width: "60%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
});
