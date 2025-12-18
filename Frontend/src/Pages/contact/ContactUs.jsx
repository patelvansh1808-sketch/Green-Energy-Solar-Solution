import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
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
            <p>📧 support@greenenergy.com</p>
            <p>📞 +91 98765 43210</p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            className="input h-32 resize-none"
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button className="btn w-full">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
