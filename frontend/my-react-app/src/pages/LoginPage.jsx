// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/arche-logo.png";
import loginVideo from "../assets/login-hero.mp4";
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("bm@example.com");
  const [password, setPassword] = useState("password");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await loginApi(email, password);

      if (response.isFirstLogin) {
        setInfo(response.message);
        setLoading(false);
        return;
      }

      login(response.data);
      const role = response.data.user.role;

      if (role === "ADMIN") {
        navigate("/monitoring", { replace: true });
      } else if (role === "BM" || role === "PM") {
        navigate("/modules/risks?mode=edit", { replace: true });
      } else {
        setError("Your role is not authorized for this portal.");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">

      {/* left video only desktop */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="w-4/5 max-w-xl rounded-3xl overflow-hidden bg-white flex flex-col">
          <div className="flex items-center px-6 pt-6 pb-3">
            <img src={logo} alt="Arche" className="h-8 object-contain" />
          </div>

          <div className="flex-1 px-6 pb-6">
            <div className="rounded-2xl overflow-hidden">
              <video
                className="w-full h-full object-cover"
                src={loginVideo}
                autoPlay loop muted playsInline
              />
            </div>
          </div>
        </div>
      </div>

      {/* login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 sm:px-10 text-white">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <img src={logo} alt="Arche logo" className="h-7 object-contain" />
          </div>

          <h1 className="font-marcellus text-xl sm:text-3xl mb-2">
            Welcome to RIDE Tracker
          </h1>

          <p className="font-urbanist text-sm text-gray-400 mb-4">
            Sign in to access your workboard and monitoring views.
          </p>

          {info && (
            <div className="mb-3 rounded-md bg-yellow-900/20 border border-yellow-500/60 px-3 py-2 text-xs sm:text-sm text-yellow-200">
              {info}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-md bg-red-900/20 border border-red-500/60 px-3 py-2 text-xs sm:text-sm text-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-[#050509] rounded-xl shadow-lg border border-gray-800 px-5 py-5"
          >
            {/* email */}
            <div className="space-y-1">
              <label className="block text-xs text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/40"
              />
            </div>

            {/* password with show/hide */}
            <div className="space-y-1">
              <label className="block text-xs text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 pr-9 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/40"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 text-xs"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* login button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                loading ? "opacity-70 animate-pulse" : ""
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* NEW FORGOT PASSWORD LABEL */}
            <p className="text-[11px] text-center mt-1 text-gray-500">
              Forgot your password? Contact your admin for approval to reset access.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
