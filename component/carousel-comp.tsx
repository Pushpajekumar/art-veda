import * as React from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { TYPOGRAPHY } from "@/utils/fonts";

interface CarouselCompProps {
  images: string[];
  title?: string;
  showViewAll?: boolean;
  subCatId: string;
  subCatName?: string;
}

const { width } = Dimensions.get("window");
const cardWidth = width / 2.5;

const CarouselComp: React.FC<CarouselCompProps> = ({
  images = [],
  title = "Trending Posts",
  showViewAll = true,
  subCatId,
  subCatName,
}) => {
  const ref = React.useRef<ICarouselInstance>(null);
  const router = useRouter();

  const onViewAllPress = React.useCallback(() => {
    router.push({
      pathname: "/view-all",
      params: { subCatId, subCatName },
    });
  }, [subCatId, subCatName, router]);

  return (
    <View style={{ flex: 1 }}>
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
        {images.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ ...TYPOGRAPHY.body, color: "#666" }}>
              Loading...
            </Text>
          </View>
        ) : (
          <Carousel
            ref={ref}
            width={cardWidth}
            height={cardWidth}
            data={images}
            autoPlay
            style={{ width: "100%" }}
            loop
            renderItem={({ index }) => (
              <View
                style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#f9f9f9",
                  gap: 10,
                  width: "100%",
                  padding: 5,
                }}
              >
                <Image
                  source={{ uri: images[index] }}
                  style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default React.memo(CarouselComp);
