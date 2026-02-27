import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import ticketService from "../../services/ticketService";
import ChatBoard from "../../Components/ChatBoard";

export default function Support() {
  const { customerProfile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [mapsError, setMapsError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState({
    currentLocation: [],
    newLocation: [],
  });
  const suggestionTimerRef = useRef({ currentLocation: null, newLocation: null });
  const suggestionAbortRef = useRef({ currentLocation: null, newLocation: null });
  
  // Chat support state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTicketData, setChatTicketData] = useState(null);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
    currentLocation: "",
    newLocation: "",
    expectedCapacityKW: "",
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets({
        customerId: customerProfile?._id,
      });
      setTickets(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [customerProfile?._id]);

  useEffect(() => {
    if (customerProfile?._id) {
      fetchTickets();
    }
  }, [customerProfile?._id, fetchTickets]);

  const handleAddResponse = async () => {
    if (!responseMessage.trim()) return;
    try {
      await ticketService.addResponse(
        selectedTicket._id,
        responseMessage,
        true
      );
      setResponseMessage("");
      const updated = await ticketService.getTicketById(selectedTicket._id);
      setSelectedTicket(updated);
      setSuccess("Response added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add response");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      pending: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return badges[priority] || "bg-gray-100 text-gray-800";
  };

  const fetchLocationSuggestions = useCallback(async (field, query) => {
    if (!query || query.trim().length < 3) {
      setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    if (suggestionAbortRef.current[field]) {
      suggestionAbortRef.current[field].abort();
    }

    const controller = new AbortController();
    suggestionAbortRef.current[field] = controller;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
          query.trim()
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }

      const data = await response.json();
      const formattedSuggestions = Array.isArray(data)
        ? data.map((item) => ({
            id: String(item.place_id),
            label: item.display_name,
          }))
        : [];

      setLocationSuggestions((prev) => ({
        ...prev,
        [field]: formattedSuggestions,
      }));
      setMapsError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
      setMapsError("Location suggestions are currently unavailable. You can still enter location manually.");
    }
  }, []);

  const handleLocationInputChange = (field, value) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));

    if (suggestionTimerRef.current[field]) {
      clearTimeout(suggestionTimerRef.current[field]);
    }

    if (!value.trim() || value.trim().length < 3) {
      setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    suggestionTimerRef.current[field] = setTimeout(() => {
      fetchLocationSuggestions(field, value);
    }, 300);
  };

  const handleLocationSuggestionSelect = (field, suggestion) => {
    const selectedAddress = suggestion?.label || "";
    setNewTicket((prev) => ({ ...prev, [field]: selectedAddress }));
    setLocationSuggestions((prev) => ({ ...prev, [field]: [] }));
  };

  useEffect(() => {
    return () => {
      ["currentLocation", "newLocation"].forEach((field) => {
        if (suggestionTimerRef.current[field]) {
          clearTimeout(suggestionTimerRef.current[field]);
        }
        if (suggestionAbortRef.current[field]) {
          suggestionAbortRef.current[field].abort();
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎫 Support & Help</h1>
              <p className="text-gray-600 mt-1">
                Create tickets and track your support requests
              </p>
            </div>
            <button
              onClick={() => setShowChatModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              ➕ New Ticket
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Tickets</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tickets yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Ticket #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {ticket.ticketNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{ticket.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {ticket.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowDetailModal(true);
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-semibold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chat Support Modal */}
        {showChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
              {!chatTicketData ? (
                // Chat with form to create ticket
                <div className="flex flex-col h-full min-h-0">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 flex justify-between items-center gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">💬 Chat Support</h2>
                      <p className="text-green-100 text-xs sm:text-sm">
                        Describe your issue and our team will help
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowChatModal(false);
                        setChatTicketData(null);
                      }}
                      className="text-white hover:bg-green-700 px-3 py-1.5 rounded-lg font-semibold transition shrink-0"
                    >
                      ×
                    </button>
                  </div>

                  {/* Form */}
                  <div className="flex-grow min-h-0 overflow-y-auto p-4 sm:p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => {
                            const selectedCategory = e.target.value;
                            setNewTicket({
                              ...newTicket,
                              category: selectedCategory,
                              currentLocation:
                                selectedCategory === "solar_upgrade" || selectedCategory === "solar_relocation"
                                  ? newTicket.currentLocation
                                  : "",
                              newLocation:
                                selectedCategory === "solar_relocation" ? newTicket.newLocation : "",
                              expectedCapacityKW:
                                selectedCategory === "solar_upgrade" ? newTicket.expectedCapacityKW : "",
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="general">General Question</option>
                          <option value="technical">Technical Issue</option>
                          <option value="installation">Installation Problem</option>
                          <option value="maintenance">Maintenance Question</option>
                          <option value="solar_upgrade">Solar Upgrade Request</option>
                          <option value="solar_relocation">Solar Relocation Request</option>
                          <option value="billing">Billing Issue</option>
                          <option value="warranty">Warranty Question</option>
                          <option value="complaint">Complaint</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {(newTicket.category === "solar_upgrade" ||
                        newTicket.category === "solar_relocation") && (
                        <div className="space-y-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-sm font-semibold text-amber-800">
                              This is a chargeable service request.
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Our team will inspect your site and share quotation before execution.
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                              OpenStreetMap suggestions are enabled. Type at least 3 characters.
                            </p>
                            {mapsError && (
                              <p className="text-xs text-amber-800 mt-1">{mapsError}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="relative">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Current Solar Location *
                              </label>
                              <input
                                type="text"
                                value={newTicket.currentLocation}
                                onChange={(e) =>
                                  handleLocationInputChange("currentLocation", e.target.value)
                                }
                                onBlur={() =>
                                  setTimeout(
                                    () =>
                                      setLocationSuggestions((prev) => ({
                                        ...prev,
                                        currentLocation: [],
                                      })),
                                    120
                                  )
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Current installation city/address"
                              />
                              {locationSuggestions.currentLocation.length > 0 && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                                  {locationSuggestions.currentLocation.map((suggestion) => (
                                    <button
                                      key={suggestion.id}
                                      type="button"
                                      onMouseDown={() =>
                                        handleLocationSuggestionSelect("currentLocation", suggestion)
                                      }
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                    >
                                      {suggestion.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {newTicket.category === "solar_relocation" && (
                              <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  New Installation Location *
                                </label>
                                <input
                                  type="text"
                                  value={newTicket.newLocation}
                                  onChange={(e) =>
                                    handleLocationInputChange("newLocation", e.target.value)
                                  }
                                  onBlur={() =>
                                    setTimeout(
                                      () =>
                                        setLocationSuggestions((prev) => ({
                                          ...prev,
                                          newLocation: [],
                                        })),
                                      120
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="New city/address where system will be shifted"
                                />
                                {locationSuggestions.newLocation.length > 0 && (
                                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                                    {locationSuggestions.newLocation.map((suggestion) => (
                                      <button
                                        key={suggestion.id}
                                        type="button"
                                        onMouseDown={() =>
                                          handleLocationSuggestionSelect("newLocation", suggestion)
                                        }
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                      >
                                        {suggestion.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {newTicket.category === "solar_upgrade" && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Expected Capacity After Upgrade (kW) *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={newTicket.expectedCapacityKW}
                                  onChange={(e) =>
                                    setNewTicket({ ...newTicket, expectedCapacityKW: e.target.value })
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="e.g. 8.5"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {newTicket.category === "other" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            value={newTicket.subject}
                            onChange={(e) =>
                              setNewTicket({ ...newTicket, subject: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Brief description of your issue"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) =>
                            setNewTicket({ ...newTicket, priority: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Describe Your Issue *
                        </label>
                        <textarea
                          value={newTicket.description}
                          onChange={(e) =>
                            setNewTicket({ ...newTicket, description: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          rows="5"
                          placeholder="Please provide as much detail as possible about your issue..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 shrink-0 sticky bottom-0">
                    <button
                      onClick={async () => {
                        // Validate subject only when category is "other"
                        if (newTicket.category === "other" && !newTicket.subject.trim()) {
                          setError("Please fill in all required fields");
                          return;
                        }
                        // Always validate description
                        if (!newTicket.description.trim()) {
                          setError("Please fill in all required fields");
                          return;
                        }

                        if (
                          (newTicket.category === "solar_upgrade" ||
                            newTicket.category === "solar_relocation") &&
                          !newTicket.currentLocation.trim()
                        ) {
                          setError("Please provide current solar location");
                          return;
                        }

                        if (
                          newTicket.category === "solar_relocation" &&
                          !newTicket.newLocation.trim()
                        ) {
                          setError("Please provide new installation location");
                          return;
                        }

                        if (
                          newTicket.category === "solar_upgrade" &&
                          (!newTicket.expectedCapacityKW || Number(newTicket.expectedCapacityKW) <= 0)
                        ) {
                          setError("Please provide expected upgraded capacity in kW");
                          return;
                        }

                        try {
                          // Generate default subject based on category if not provided
                          const categoryLabels = {
                            general: "General Question",
                            technical: "Technical Issue",
                            installation: "Installation Problem",
                            maintenance: "Maintenance Question",
                            solar_upgrade: "Solar Upgrade Request",
                            solar_relocation: "Solar Relocation Request",
                            billing: "Billing Issue",
                            warranty: "Warranty Question",
                            complaint: "Complaint",
                            feedback: "Feedback",
                          };
                          
                          const ticketToSubmit = {
                            customerId: customerProfile._id,
                            ...newTicket,
                            description:
                              newTicket.category === "solar_upgrade"
                                ? `${newTicket.description}\n\n--- Service Details ---\nCurrent Location: ${newTicket.currentLocation}\nExpected Capacity (kW): ${newTicket.expectedCapacityKW}`
                                : newTicket.category === "solar_relocation"
                                ? `${newTicket.description}\n\n--- Service Details ---\nCurrent Location: ${newTicket.currentLocation}\nNew Location: ${newTicket.newLocation}`
                                : newTicket.description,
                            subject: newTicket.subject || categoryLabels[newTicket.category] || newTicket.category,
                          };
                          
                          await ticketService.createTicket(ticketToSubmit);
                          setNewTicket({
                            subject: "",
                            category: "general",
                            priority: "medium",
                            description: "",
                            currentLocation: "",
                            newLocation: "",
                            expectedCapacityKW: "",
                          });
                          setLocationSuggestions({
                            currentLocation: [],
                            newLocation: [],
                          });
                          setSuccess("Ticket created successfully!");
                          setShowChatModal(false);
                          fetchTickets(); // Refresh tickets list
                          setTimeout(() => setSuccess(""), 3000);
                        } catch (err) {
                          setError(err.response?.data?.message || "Failed to create ticket");
                        }
                      }}
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-lg font-semibold transition shadow-sm"
                    >
                      Submit Ticket
                    </button>
                    <button
                      onClick={() => {
                        setShowChatModal(false);
                        setChatTicketData(null);
                        setLocationSuggestions({
                          currentLocation: [],
                          newLocation: [],
                        });
                      }}
                      className="flex-1 h-12 bg-white border border-gray-300 text-gray-700 px-6 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Chat interface
                <ChatBoard
                  ticketId={chatTicketData._id}
                  ticketData={chatTicketData}
                  customerProfile={customerProfile}
                  onBack={() => {
                    setShowChatModal(false);
                    setChatTicketData(null);
                    fetchTickets();
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {showDetailModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-8 max-w-3xl w-full max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedTicket.ticketNumber}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-2xl text-gray-500 hover:text-gray-700 shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Status & Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        selectedTicket.status
                      )}`}
                    >
                      {selectedTicket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </p>
                  <p className="text-gray-900">{selectedTicket.description}</p>
                </div>

                {/* Conversation */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Conversation
                    </h3>
                    <div className="space-y-4">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            response.isCustomerResponse
                              ? "bg-blue-50 ml-8"
                              : "bg-gray-50 mr-8"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-gray-900">
                              {response.responderName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(response.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-gray-900">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Response */}
                {selectedTicket.status !== "closed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Add Response
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="3"
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={handleAddResponse}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Send Response
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full mt-6 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
