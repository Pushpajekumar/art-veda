import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider } from "@/context/notificationContext";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { data } = notification.request.content;
    
    // Handle image notifications
    const notificationConfig: any = {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };

    // Add image support for Android
    if (Platform.OS === "android" && (data?.imageUri || data?.bigimage)) {
      notificationConfig.style = {
        type: "bigPicture",
        bigPicture: data?.bigimage || data?.imageUri,
      };
    }

    return notificationConfig;
  },
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// 👇 Define the task at the top level
if (Platform.OS !== "web" && !TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error, executionInfo }) => {
      // Keep logging minimal in production; this is useful for debugging
      console.log("✅ Background Notification Received!", {
        data,
        error,
        executionInfo,
      });
      return null;
    }
  );
}
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }
  }, []);

  useEffect(() => {
    const registerTask = async () => {
      try {
        if (Platform.OS !== "web") {
          await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
        }
      } catch (err) {
        console.warn("⚠️ Failed to register background task:", err);
      }
    };

    registerTask();
  }, []);

  useEffect(() => {
    if (error) console.error("Failed to load font:", error);
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      setTimeout(() => SplashScreen.hideAsync(), 100);
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <NotificationProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#ffffff" },
            headerTintColor: "#000000",
            headerTitleStyle: { fontFamily: "Montserrat" },
            contentStyle: { backgroundColor: "#ffffff" },
            freezeOnBlur: false,
            animationDuration: 150,
            gestureDirection: "horizontal",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="select-political-party"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="edit-profile"
            options={{ headerBackTitle: "Profile" }}
          />
          <Stack.Screen name="view-all" options={{ headerShown: false }} />
          <Stack.Screen
            name="search-screen"
            options={{ headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="edit-screen"
            options={{ headerBackTitle: "Back" }}
          />
          <Stack.Screen name="no-network" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </NotificationProvider>
  );
}
