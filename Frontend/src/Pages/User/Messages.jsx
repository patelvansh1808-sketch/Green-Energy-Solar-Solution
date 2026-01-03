import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createMessage,
  getMyMessages,
} from "../../services/messageService";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "inquiry",
    priority: "medium",
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await getMyMessages();
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createMessage(formData);
      setFormData({
        subject: "",
        message: "",
        category: "inquiry",
        priority: "medium",
      });
      setShowForm(false);
      loadMessages();
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-700">
              Support & Messages
            </h2>
            <p className="text-gray-500 text-sm">
              Send messages, report issues, and get support
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            {showForm ? "Cancel" : "New Message"}
          </button>
        </div>

        {/* NEW MESSAGE FORM */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="inquiry">Inquiry</option>
                  <option value="support">Support</option>
                  <option value="complaint">Complaint</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your message"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  rows="6"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold disabled:bg-gray-400 transition"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}

        {/* MESSAGES LIST */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white p-6 rounded-lg text-center text-gray-500">
              No messages yet. Send one to get in touch with our support team.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => navigate(`/messages/${msg._id}`)}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {msg.subject}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {msg.message}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-2 ${getStatusColor(
                        msg.status
                      )}`}
                    >
                      {msg.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {msg.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Priority: {msg.priority}
                    </span>
                  </div>
                  <div>
                    {msg.replies.length > 0 && (
                      <span>
                        {msg.replies.length} reply
                        {msg.replies.length !== 1 ? "ies" : ""}
                      </span>
                    )}
                  </div>
                  <span>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
