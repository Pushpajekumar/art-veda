import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider } from "@/context/notificationContext";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { AppState } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    // Do something with the notification data
    return null;
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Regular weight
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    // Additional weights
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    // Add any other weights you have in your assets/fonts directory
  });

  // Add app state persistence with better handling
  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState: string) => {
  //     console.log('Root layout - App state changed to:', nextAppState);
      
  //     // Prevent automatic reloading that might cause white screens
  //     if (nextAppState === 'active') {
  //       // Small delay to ensure proper rehydration
  //       setTimeout(() => {
  //         console.log('App fully active, ready for interactions');
  //       }, 100);
  //     }
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);
  //   return () => subscription?.remove();
  // }, []);

  useEffect(() => {
    if (error) {
      console.error("Failed to load font:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NotificationProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#ffffff",
            },
            headerTintColor: "#000000",
            headerTitleStyle: {
              fontFamily: "Montserrat",
            },
            contentStyle: {
              backgroundColor: "#ffffff",
            },
            // Enhanced options to prevent white screens
            freezeOnBlur: false,
            animationDuration: 150,
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="select-political-party"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              // headerShown: false,
              headerBackTitle: "Profile",
            }}
          />
          <Stack.Screen
            name="view-all"
            options={{
              headerShown: false,
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="search-screen"
            options={{
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="edit-screen"
            options={{
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="no-network"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </NotificationProvider>
  );
}
