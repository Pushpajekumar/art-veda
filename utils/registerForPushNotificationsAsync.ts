import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Cache to prevent redundant API calls
let cachedToken: string | null = null;

export async function registerForPushNotificationsAsync(): Promise<string> {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }

  // Setup notification channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  // Check if running on physical device
  if (!Device.isDevice) {
    console.log("Must use physical device for push notifications");
    throw new Error("Must use physical device for push notifications");
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== "granted") {
    throw new Error("Permission not granted to get push token for push notification!");
  }

  try {
    // Get project ID - with improved fallback strategy
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId || 
      Constants?.easConfig?.projectId ||
      process.env.EXPO_PUBLIC_PROJECT_ID;

    if (!projectId) {
      console.warn("Project ID not available - using fallback method");
      // Fallback for development environment
      const devToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("DEV TOKEN:", devToken);
      cachedToken = devToken;
      return devToken;
    }

    // Get token with EAS project ID
    const pushToken = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;
    
    console.log("PUSH TOKEN:", pushToken);
    
    // Cache the token
    cachedToken = pushToken;
    return pushToken;
  } catch (e: any) {
    console.error("Error getting push token:", e);
    
    // Add descriptive error message
    if (e.message?.includes("project ID")) {
      throw new Error(
        "Invalid project ID. Please check your app.json or app.config.js configuration."
      );
    }
    
    // Try fallback method if main method fails
    try {
      const fallbackToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("FALLBACK TOKEN:", fallbackToken);
      cachedToken = fallbackToken;
      return fallbackToken;
    } catch (fallbackError) {
      console.error("Fallback token generation also failed:", fallbackError);
      throw e; // Throw original error
    }
  }
}