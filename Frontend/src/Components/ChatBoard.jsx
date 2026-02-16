import { useState, useEffect, useRef } from "react";
import ticketService from "../services/ticketService";

export default function ChatBoard({
  ticketId,
  ticketData,
  onBack,
  customerProfile,
}) {
  const [messages, setMessages] = useState(
    ticketData?.responses || []
  );
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      setError("");

      // Add message to response
      await ticketService.addResponse(
        ticketId,
        newMessage.trim(),
        true
      );

      // Create a temporary message object for immediate UI update
      const tempMessage = {
        responderName: customerProfile?.fullName || "You",
        message: newMessage,
        isCustomerResponse: true,
        timestamp: new Date(),
      };

      setMessages([...messages, tempMessage]);
      setNewMessage("");

      // Optionally fetch updated ticket to sync with backend
      setTimeout(() => {
        // This ensures the message is persisted
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">💬 Support Chat</h2>
          {ticketData && (
            <p className="text-green-100 text-sm">
              Ticket #{ticketData.ticketNumber}
            </p>
          )}
        </div>
        <button
          onClick={onBack}
          className="text-white hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          ← Back
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500">
                No messages yet. Start typing to describe your issue!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.isCustomerResponse ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.isCustomerResponse
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-300 text-gray-900 rounded-bl-none"
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-1 ${
                    msg.isCustomerResponse ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  {msg.responderName}
                </div>
                <p className="break-words">{msg.message}</p>
                <div
                  className={`text-xs mt-2 ${
                    msg.isCustomerResponse
                      ? "text-blue-200"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 text-red-700 px-6 py-3">
          {error}
        </div>
      )}

      {/* Message Input Area */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message here... (Shift+Enter for new line)"
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows="3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition h-fit"
          >
            {loading ? "🔄 Sending..." : "📤 Send"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Press Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
