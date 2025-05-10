import { account, database } from "@/context/app-write";
import { Query } from "react-native-appwrite";

/**
 * Updates the user's expo push notification token in the database
 * @param token The Expo push notification token
 * @returns Promise that resolves when the token is updated
 */
export async function updateUserToken(token: string): Promise<void> {
  try {
    // Get the current user's ID from Appwrite
    const currentUser = await account.get();
    const userId = currentUser.$id;

    // Only proceed if we have an authenticated user
    if (!userId) {
      console.log(
        "No authenticated user found, skipping token database update"
      );
      return;
    }

    // First find the user document to get its ID
    const userDetailsResponse = await database.listDocuments(
      "6815de2b0004b53475ec", // Replace with your actual database ID
      "6815e0be001731ca8b1b", // Collection name
      [Query.equal("userId", userId)]
    );

    // Check if user document exists
    if (userDetailsResponse.documents.length > 0) {
      const userDocumentId = userDetailsResponse.documents[0].$id;

      // Update the user document in the Appwrite database
      await database.updateDocument(
        "6815de2b0004b53475ec", // Replace with your actual database ID
        "6815e0be001731ca8b1b", // Collection name
        userDocumentId, // Document ID
        {
          expoToken: token,
          tokenUpdatedAt: new Date().toISOString(),
        }
      );
    }

    console.log("User push token updated successfully in database");
  } catch (error) {
    console.error("Failed to update push token in database:", error);
    // Don't throw the error, as we don't want to break notification registration
    // if the database update fails
  }
}
