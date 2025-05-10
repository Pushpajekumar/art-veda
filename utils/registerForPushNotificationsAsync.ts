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
    });
    
    // Create a second channel for marketing notifications with different settings
    await Notifications.setNotificationChannelAsync("marketing", {
      name: "Marketing",
      description: "Promotional notifications and updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100, 100, 100],
      enableLights: true,
      lightColor: "#00FF00",
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

  // Get project ID - with improved fallback strategy
  const projectId = 
    Constants?.expoConfig?.extra?.eas?.projectId || 
    Constants?.easConfig?.projectId ||
    process.env.EXPO_PUBLIC_PROJECT_ID;

  if (!projectId) {
    console.warn("Project ID not available - are you running in development mode?");
    // Fallback for development environment
    try {
      // In development, use the classic push service
      const devToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("DEV TOKEN:", devToken);
      cachedToken = devToken;
      return devToken;
    } catch (e) {
      console.error("Failed to get development push token:", e);
      throw new Error("Failed to get push token in development mode");
    }
  }

  try {
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
    
    throw e;
  }
}