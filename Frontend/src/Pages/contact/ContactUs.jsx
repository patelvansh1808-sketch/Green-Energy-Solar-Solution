import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/messages/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        setErrorMessage(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 animate-fade">
      <div className="card max-w-4xl w-full grid md:grid-cols-2 gap-6">
        
        {/* Left Info Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">
            Contact Us
          </h1>
          <p className="text-gray-600">
            Have questions about solar installation, subsidy, or energy
            analytics? Reach out to us anytime.
          </p>

          <div className="space-y-2 text-sm">
            <p>📍 Ahmedabad, India</p>
            <p>📧 teamsuryaurjaa@gmail.com</p>
            <p>📞 +91 98765 43210</p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <input
            className="input"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <textarea
            className="input h-32 resize-none"
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button 
            className="btn w-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
