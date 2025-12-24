import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../Context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ ONLY THIS (AuthContext handles storage & decoding)
      login(res.data.token);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 animate-slideUp">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
          Login to Your Account
        </h2>

        <form className="space-y-4" onSubmit={submitHandler}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <Link
            to="/forgot-password"
            className="text-green-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <p className="text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-700 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
