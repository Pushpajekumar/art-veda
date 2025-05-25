import * as React from "react";
import {
  Dimensions,
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { TYPOGRAPHY } from "@/utils/fonts";

interface CarouselCompProps {
  images: { previewImage: string; id: string }[];
  title?: string;
  showViewAll?: boolean;
  subCatId: string;
  subCatName?: string;
}

const { width } = Dimensions.get("window");
const PAGE_WIDTH = width;
const COUNT = 3;

const COLORS = {
  gray: "#666",
  lightGray: "#f9f9f9",
  black: "black",
  primary: "#0099FF",
  shadow: "rgba(0, 0, 0, 0.1)",
} as const;

const CarouselComp: React.FC<CarouselCompProps> = React.memo(
  ({
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

    const handlePostPress = React.useCallback(
      (postId: string) => {
        router.push({
          pathname: "/edit-screen",
          params: { postId },
        });
      },
      [router]
    );

    const renderCarouselItem = React.useCallback(
      ({ index }: { index: number }) => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePostPress(images[index].id)}
          style={styles.carouselItem}
        >
          <Image
            source={{ uri: images[index].previewImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ),
      [images, handlePostPress]
    );

    if (images.length === 0) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Feather name="trending-up" size={18} color={COLORS.black} />
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Feather name="trending-up" size={18} color={COLORS.black} />
            <Text style={styles.title}>{title}</Text>
          </View>

          {showViewAll && (
            <TouchableOpacity
              style={styles.viewAllContainer}
              onPress={onViewAllPress}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Entypo
                name="chevron-small-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          )}
        </View>

        <Carousel
          ref={ref}
          loop
          autoPlay
          vertical={false}
          width={PAGE_WIDTH / COUNT}
          height={120}
          style={{
            width: PAGE_WIDTH - 40,
          }}
          data={images}
          renderItem={renderCarouselItem}
          scrollAnimationDuration={1000}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    fontSize: 18,
    color: COLORS.black,
  },
  viewAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  carousel: {
    width: PAGE_WIDTH,
    alignSelf: "center",
  },
  carouselItem: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginHorizontal: 5,
    flex: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray,
    fontSize: 14,
  },
});

CarouselComp.displayName = "CarouselComp";

export default CarouselComp;
