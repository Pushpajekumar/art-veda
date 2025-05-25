import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { TYPOGRAPHY } from "@/utils/fonts";
import { database } from "@/context/app-write";
import { Query, Models } from "react-native-appwrite";
import CarouselComp from "./carousel-comp";
import { primaryColor } from "@/constant/contant";

const DailyEvent = () => {
  const [events, setEvents] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Memoized date array to avoid recreating on every render
  const dateArray = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date,
        day: date.getDate().toString().padStart(2, "0"),
        month: date.toLocaleString("default", { month: "short" }),
      };
    });
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
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
    );
    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  const fetchEventByDate = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split("T")[0] + "T12:00:00.000+00:00";

      const response = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_DAILY_EVENT_ID!,
        [Query.equal("date", formattedDate)]
      );

      setEvents(response.documents);
    } catch (error) {
      console.error("Error fetching event:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventByDate(new Date());
  }, [fetchEventByDate]);

  const handleDatePress = useCallback((index: number) => {
    setSelectedDateIndex(index);
    fetchEventByDate(dateArray[index].date);
  }, [dateArray, fetchEventByDate]);

  // Memoized carousel images
  const carouselImages = useMemo(() => 
    events.flatMap((event) =>
      event.posts?.map((post: { previewImage: string; $id: string }) => ({
        previewImage: post.previewImage,
        id: post.$id,
      })) || []
    ), [events]
  );

  const renderDateCard = useCallback(({ item, index }: { item: typeof dateArray[0], index: number }) => {
    const isSelected = index === selectedDateIndex;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleDatePress(index)}
        activeOpacity={0.7}
      >
        <View style={[styles.dateCard, isSelected && styles.selectedDateCard]}>
          <Text style={[styles.dateDay, isSelected && styles.selectedText]}>
            {item.day}
          </Text>
          <Text style={[styles.dateMonth, isSelected && styles.selectedText]}>
            {item.month}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [selectedDateIndex, handleDatePress]);

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <Animated.View style={[styles.skeletonImage, { opacity: fadeAnim }]} />
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <Text style={TYPOGRAPHY.body}>No events for this date</Text>
        </View>
      );
    }

    return (
      <CarouselComp
        images={carouselImages}
        title="Daily Event"
        subCatId={events[0].$id}
        showViewAll={false}
      />
    );
  }, [loading, events, carouselImages, fadeAnim]);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContainer}
      >
        {dateArray.map((item, index) => renderDateCard({ item, index }))}
      </ScrollView>
      {renderContent}
    </View>
  );
};

export default DailyEvent;

const styles = StyleSheet.create({
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
  selectedDateCard: {
    backgroundColor: "#e6f2ff",
    borderColor: primaryColor,
    borderWidth: 1,
  },
  dateDay: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },
  dateMonth: {
    ...TYPOGRAPHY.caption,
    color: "#666",
  },
  selectedText: {
    color: primaryColor,
  },
  skeletonImage: {
    height: 150,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginVertical: 10,
  },
  noEventsContainer: {
    padding: 20,
    alignItems: "center",
  },
});
