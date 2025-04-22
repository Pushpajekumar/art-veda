import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { primaryColor, tabBar_activeTintColor, tabBar_color } from "@/constant/contant";

type TabBarProps = BottomTabBarProps;

export default function TabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Get icon from the options
          const Icon = options.tabBarIcon
            ? () =>
                options.tabBarIcon?.({
                  color: isFocused
                    ? tabBar_activeTintColor
                    : tabBar_color,
                  focused: isFocused,
                  size: 28, // Increased icon size
                })
            : null;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={styles.tabContent}>
                {Icon && <Icon />}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused
                        ? tabBar_activeTintColor
                        : tabBar_color,
                      fontWeight: isFocused ? "600" : "400",
                    },
                  ]}
                >
                  {typeof label === 'function'
                    ? label({
                        focused: isFocused,
                        color: isFocused ?   tabBar_activeTintColor : tabBar_color,
                        position: 'below-icon',
                        children: route.name
                      })
                    : label.toString()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: primaryColor,
    height: 70,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "90%",
    borderRadius: 20,
    position: "absolute",
    bottom: 20,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
});