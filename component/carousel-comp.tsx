import * as React from "react";
import { Dimensions, Image, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import Entypo from "@expo/vector-icons/Entypo";
import { TYPOGRAPHY } from "@/utils/fonts";
import Feather from "@expo/vector-icons/Feather";

const COUNT = 6;

// Sample image URLs for the carousel
const data = [
  "https://images.unsplash.com/photo-1558979158-65a1eaa08691",
  "https://images.unsplash.com/photo-1501446529957-6226bd447c46",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
  "https://images.unsplash.com/photo-1475189778702-5ec9941484ae",
  "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368",
  "https://images.unsplash.com/photo-1542903660-eedba2cda473",
];
const width = Dimensions.get("window").width;

const CarouselComp = () => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Feather name="trending-up" size={18} color="black" />
          <Text style={{ ...TYPOGRAPHY.body, fontWeight: "bold" }}>
            Trending Posts
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#666" }}>View All</Text>
          <Entypo name="chevron-small-right" size={24} color="#666" />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Carousel
          ref={ref}
          width={width / 2} // Half width to show 2 items
          height={width / 2}
          data={data}
          loop
          autoPlay
          mode="parallax" // Enables multiple items view
          modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 50,
          }}
          style={{
        width: "100%",
          }}
          onProgressChange={(_, absoluteProgress) =>
        (progress.value = absoluteProgress)
          }
          renderItem={({ index }) => (
        <View
          style={{
            flex: 1,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#f9f9f9",
            gap: 10,
            width: "100%", // Use full item width
            padding: 5,
          }}
        >
          <View style={{ width: "100%", height: "100%" }}>
            <Image
          source={{ uri: data[index] }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
            />
          </View>
        </View>
          )}
        />
      </View>
    </View>
  );
};

export default CarouselComp;
