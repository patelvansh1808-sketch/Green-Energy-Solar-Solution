import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 animate-slideUp">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
          Forgot Password
        </h2>

        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your registered email address. We will send you a reset link.
        </p>

        {message && (
          <p className="text-center text-sm text-green-700 mb-4">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={submitHandler}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-green-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
