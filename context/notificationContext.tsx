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
import { Subscription } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, AppState } from "react-native";
import { updateUserToken } from "@/utils/updateUserToken";
import { account } from "@/context/app-write";

// Token storage key
const PUSH_TOKEN_STORAGE_KEY = "@art_veda_push_token";
// User ID storage key to detect login changes
const USER_ID_STORAGE_KEY = "@art_veda_user_id";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  registerForPushNotifications: () => Promise<string | null>;
  sendTestPushNotification: (title: string, body: string) => Promise<void>;
  updateTokenInDatabase: () => Promise<boolean>;
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
  const [userId, setUserId] = useState<string | null>(null);

  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  // Check authentication status and update token if needed
  const checkAuthStatusAndUpdateToken = useCallback(async () => {
    try {
      // Get stored user ID for comparison
      const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);

      let currentUserId: string | null = null;
      let isAuthenticated = false;

      try {
        const session = await account.getSession("current");
        if (session) {
          const user = await account.get();
          currentUserId = user.$id;
          isAuthenticated = true;
        }
      } catch (error) {
        isAuthenticated = false;
        currentUserId = null;
      }

      // Only update state if values actually changed
      setIsUserAuthenticated((prev) =>
        prev !== isAuthenticated ? isAuthenticated : prev
      );
      setUserId((prev) => (prev !== currentUserId ? currentUserId : prev));

      // If user logged in (either new login or different user)
      if (isAuthenticated && currentUserId !== storedUserId) {
        console.log("User login detected:", currentUserId);

        // Save the new user ID
        if (currentUserId) {
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, currentUserId);
        }

        // Update token in database if we have one
        if (expoPushToken) {
          console.log("Updating token after login:", expoPushToken);
          await updateUserToken(expoPushToken);
        } else {
          // If no token yet, register for one
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
            await updateUserToken(token);
          }
        }
      }

      // If user logged out
      if (!isAuthenticated && storedUserId) {
        console.log("User logout detected");
        await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }, []); // Remove expoPushToken dependency to prevent infinite loop

  // Improved app state change handling with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App came to foreground, checking auth status");
        // Add a longer delay and debounce to prevent multiple calls
        timeoutId = setTimeout(() => {
          checkAuthStatusAndUpdateToken();
        }, 300);
      }

      appState.current = nextAppState;
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.remove();
    };
  }, [checkAuthStatusAndUpdateToken]);

  // Run initial auth check only once on mount
  useEffect(() => {
    checkAuthStatusAndUpdateToken();
  }, []); // Empty dependency array

  // Function to register for push notifications
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
          console.log("Updated stored token in database");
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
          console.log("Updated new token in database");
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

  // Initial setup of notification listeners and token registration
  useEffect(() => {
    registerForPushNotifications();

    // Listen for incoming notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification Received in Foreground: ", notification);
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("🔔 Notification Response Received: ", data);
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
  }, [registerForPushNotifications]);

  // Expose a method to manually update the token (useful after login)
  const updateTokenInDatabase = useCallback(async () => {
    if (expoPushToken) {
      try {
        await updateUserToken(expoPushToken);
        console.log("Token manually updated in database");
        return true;
      } catch (error) {
        console.error("Failed to manually update token:", error);
        return false;
      }
    }
    return false;
  }, [expoPushToken]);

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

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        error,
        registerForPushNotifications,
        sendTestPushNotification,
        updateTokenInDatabase,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
