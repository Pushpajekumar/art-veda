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
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// Register background task safely
useEffect(() => {
  const setupBackgroundNotificationTask = async () => {
    const taskName = "BACKGROUND-NOTIFICATION-TASK";

    if (!TaskManager.isTaskDefined(taskName)) {
      TaskManager.defineTask(
        taskName,
        async ({ data, error, executionInfo }) => {
          console.log("✅ Background Notification Received!", {
            data,
            error,
            executionInfo,
          });
          return null;
        }
      );
    }

    try {
      await Notifications.registerTaskAsync(taskName);
    } catch (err) {
      console.warn("⚠️ Notification background task not registered:", err);
    }
  };

  setupBackgroundNotificationTask();
}, []);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
SplashScreen.preventAutoHideAsync();

useEffect(() => {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}, []);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

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
