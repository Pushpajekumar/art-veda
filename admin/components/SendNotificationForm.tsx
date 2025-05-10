import React, { useState } from "react";
import { sendPushNotification } from "../utils/notifications";

type Props = {
  // You might pass user tokens or fetch them in the component
  userTokens?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export default function SendNotificationForm({
  userTokens = [],
  onSuccess,
  onError,
}: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [customTokens, setCustomTokens] = useState("");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [channelId, setChannelId] = useState("default");
  const [additionalData, setAdditionalData] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !body) {
      alert("Please enter both title and body for the notification");
      return;
    }

    if (selectedTokens.length === 0 && !customTokens) {
      alert("Please select users or enter push tokens");
      return;
    }

    const tokensToUse = [
      ...selectedTokens,
      ...customTokens
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean),
    ];

    if (tokensToUse.length === 0) {
      alert("No valid tokens provided");
      return;
    }

    setLoading(true);

    try {
      let data = {};
      if (additionalData) {
        try {
          data = JSON.parse(additionalData);
        } catch (error) {
          alert("Invalid JSON in additional data");
          setLoading(false);
          return;
        }
      }

      const result = await sendPushNotification({
        tokens: tokensToUse,
        title,
        body,
        channelId,
        data,
      });

      console.log("Notification sent:", result);
      alert(`Notification sent to ${result.ticketsCount} devices!`);

      // Reset form
      setTitle("");
      setBody("");
      setSelectedTokens([]);
      setCustomTokens("");
      setAdditionalData("");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert(`Error: ${error.message}`);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Send Push Notification</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Notification title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Notification message"
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Channel ID (Android)
          </label>
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="default">Default</option>
            <option value="marketing">Marketing</option>
            {/* Add other channels as needed */}
          </select>
        </div>

        {userTokens.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Users</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {userTokens.map((token, index) => (
                <div key={index} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`user-${index}`}
                    checked={selectedTokens.includes(token)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTokens([...selectedTokens, token]);
                      } else {
                        setSelectedTokens(
                          selectedTokens.filter((t) => t !== token)
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`user-${index}`} className="text-sm">
                    User #{index + 1} ({token.substr(0, 10)}...
                    {token.substr(-5)})
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Custom Push Tokens (comma separated)
          </label>
          <textarea
            value={customTokens}
            onChange={(e) => setCustomTokens(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx], ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]"
            rows={2}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Additional Data (JSON)
          </label>
          <textarea
            value={additionalData}
            onChange={(e) => setAdditionalData(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder='{"route": "(tabs)/my-content", "itemId": "123"}'
            rows={2}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
}
