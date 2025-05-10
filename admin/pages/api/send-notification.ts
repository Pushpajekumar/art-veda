import { NextApiRequest, NextApiResponse } from "next";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// Initialize the Expo SDK
const expo = new Expo();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      tokens,
      title,
      body,
      data = {},
      sound = "default",
      channelId = "default",
    } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: "Push tokens are required" });
    }

    if (!title || !body) {
      return res
        .status(400)
        .json({ error: "Notification title and body are required" });
    }

    // Create the messages to send
    const messages: ExpoPushMessage[] = [];

    // Validate each push token
    for (const pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid Expo push token: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound,
        title,
        body,
        data,
        channelId, // For Android channel ID
      });
    }

    // Send the messages
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunk:", error);
      }
    }

    // Process the tickets
    const receiptIds: string[] = [];
    for (const ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    // Log the results for debugging
    console.log("Sent notifications:", {
      totalSent: tickets.length,
      tokens,
      title,
      body,
    });

    return res.status(200).json({
      success: true,
      ticketsCount: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
