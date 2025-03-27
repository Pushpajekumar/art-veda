import * as React from "react";
import { Dimensions, Image, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Entypo from "@expo/vector-icons/Entypo";
import { TYPOGRAPHY } from "@/utils/fonts";
import Feather from "@expo/vector-icons/Feather";

interface CarouselCompProps {
  images: string[];
  title?: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

const width = Dimensions.get("window").width;

const CarouselComp: React.FC<CarouselCompProps> = ({
  images,
  title = "Trending Posts",
  showViewAll = true,
  onViewAllPress,
}) => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
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
            {title}
          </Text>
        </View>
        {showViewAll && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#666" }} onPress={onViewAllPress}>
              View All
            </Text>
            <Entypo name="chevron-small-right" size={24} color="#666" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Carousel
          ref={ref}
          width={width / 2.5}
          height={width / 2.5}
          data={images}
          loop
          autoPlay
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
                  source={{ uri: images[index] }}
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
