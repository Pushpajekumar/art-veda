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
import { Alert, AppState, Platform } from "react-native";
import { updateUserToken } from "@/utils/updateUserToken";
import { account } from "@/context/app-write";

const PUSH_TOKEN_STORAGE_KEY = "@art_veda_push_token";
const USER_ID_STORAGE_KEY = "@art_veda_user_id";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  registerForPushNotifications: () => Promise<string | null>;
  updateTokenInDatabase: () => Promise<boolean>;
  scheduleLocalNotificationWithImage: (title: string, body: string, imageUri?: string, data?: any) => Promise<void>;
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
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(false);

  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const checkAuthStatusAndUpdateToken = useCallback(async () => {
    try {
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
      } catch {
        isAuthenticated = false;
        currentUserId = null;
      }

      setIsUserAuthenticated(isAuthenticated);

      if (isAuthenticated && currentUserId !== storedUserId) {
        if (currentUserId) {
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, currentUserId);
        }

        if (expoPushToken) {
          await updateUserToken(expoPushToken);
        } else {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
            await updateUserToken(token);
          }
        }
      }

      if (!isAuthenticated && storedUserId) {
        await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }, [expoPushToken]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
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

  useEffect(() => {
    checkAuthStatusAndUpdateToken();
  }, [checkAuthStatusAndUpdateToken]);

  const registerForPushNotifications = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (storedToken) {
        setExpoPushToken(storedToken);
        if (isUserAuthenticated) {
          await updateUserToken(storedToken);
        }
        return storedToken;
      }

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
        setExpoPushToken(token);
        if (isUserAuthenticated) {
          await updateUserToken(token);
        }
      }

      return token;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      
      if (
        err instanceof Error &&
        err.message?.includes("Permission not granted")
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

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📱 Notification Received:", {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("🔔 Notification Response Received:", {
          title: response.notification.request.content.title,
          body: response.notification.request.content.body,
          data: response.notification.request.content.data,
        });
        
        // Handle notification tap action here if needed
        // You can navigate to specific screens based on the data
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [registerForPushNotifications]);

  const updateTokenInDatabase = useCallback(async () => {
    if (expoPushToken) {
      try {
        await updateUserToken(expoPushToken);
        return true;
      } catch (error) {
        console.error("Failed to manually update token:", error);
        return false;
      }
    }
    return false;
  }, [expoPushToken]);

  const scheduleLocalNotificationWithImage = useCallback(async (
    title: string,
    body: string,
    imageUri?: string,
    data?: any
  ) => {
    try {
      const notificationContent: Notifications.NotificationContentInput = {
        title,
        body,
        data: {
          ...data,
          imageUri,
          bigimage: imageUri, // For Android compatibility
        },
      };

      // For Android, add style for big picture
      if (Platform.OS === "android" && imageUri) {
        (notificationContent as any).style = {
          type: "bigPicture",
          bigPicture: imageUri,
        };
      }

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error scheduling local notification with image:", error);
    }
  }, []);



  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        error,
        registerForPushNotifications,
        updateTokenInDatabase,
        scheduleLocalNotificationWithImage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
