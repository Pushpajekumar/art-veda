import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { EventSubscription } from "expo-modules-core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { updateUserToken } from "@/utils/updateUserToken";
import { account } from "./app-write";

// Token storage key
const PUSH_TOKEN_STORAGE_KEY = "@art_veda_push_token";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  registerForPushNotifications: () => Promise<string | null>;
  sendTestPushNotification: (title: string, body: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [
    notification,
    setNotification,
  ] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(
    false
  );

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();
  // Check authentication status using the backend service
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await account.getSession("current");
        const isAuthenticated = !!session;
        setIsUserAuthenticated(isAuthenticated);

        // If user is authenticated and we have a token, update it in the database
        if (isAuthenticated && expoPushToken) {
          await updateUserToken(expoPushToken);
        }
      } catch (error) {
        // User is not authenticated
        setIsUserAuthenticated(false);
      }
    };

    // Initial check
    checkAuthStatus();

    // Set up event listeners for auth state changes
    // Note: Implement subscription to auth events if available in your setup
    // This could be through the client SDK event system

    return () => {
      // Clean up any event listeners if needed
    };
  }, [expoPushToken]);

  // Function to register for push notifications with retry logic
  const registerForPushNotifications = useCallback(async () => {
    try {
      // Check if we have a stored token first
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (storedToken) {
        console.log("Using stored push token:", storedToken);
        setExpoPushToken(storedToken);

        // Update token in database if user is authenticated
        if (isUserAuthenticated) {
          await updateUserToken(storedToken);
        }

        return storedToken;
      }

      // If no stored token, register for a new one
      const token = await registerForPushNotificationsAsync();
      console.log("Registered new push token:", token);

      // Store token for future use
      if (token) {
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
        setExpoPushToken(token);

        // Update token in database if user is authenticated
        if (isUserAuthenticated) {
          await updateUserToken(token);
        }
      }

      return token;
    } catch (err) {
      console.error("Error registering for push notifications:", err);
      setError(err instanceof Error ? err : new Error(String(err)));

      // Show user-friendly error message only for permission issues
      if (
        err instanceof Error &&
        err.message &&
        err.message.includes("Permission not granted")
      ) {
        Alert.alert(
          "Notifications Disabled",
          "To receive updates about your content, please enable notifications in your device settings.",
          [{ text: "OK" }]
        );
      }
      return null;
    }
  }, [isUserAuthenticated]);

  // Function to send test notification (useful for debugging)
  const sendTestPushNotification = useCallback(
    async (title: string, body: string) => {
      if (!expoPushToken) {
        Alert.alert(
          "Error",
          "Push token not available. Please register first."
        );
        return;
      }

      const message = {
        to: expoPushToken,
        sound: "default",
        title: title || "Test Notification",
        body: body || "This is a test notification",
        data: { route: "(tabs)" },
      };

      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log("Test notification sent:", result);
      } catch (err) {
        console.error("Error sending test notification:", err);
        Alert.alert("Error", "Failed to send test notification");
      }
    },
    [expoPushToken]
  );

  // Initial setup of notification listeners and token registration
  useEffect(() => {
    registerForPushNotifications();

    // Listen for incoming notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification Received in Foreground: ", notification);
        setNotification(notification);

        // Optionally show an in-app alert or banner here
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("🔔 Notification Response Received: ", data);

        // Navigation handling is in _layout.tsx to avoid circular dependencies
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        error,
        registerForPushNotifications,
        sendTestPushNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
