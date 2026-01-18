// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/arche-logo2.png";
import loginVideo from "../assets/login-hero.mp4";
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        navigate("/modules/risks?mode=view", { replace: true });
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

  const [theme, setTheme] = useState("light"); // light | dark

  const handleInteraction = () => {
    if (theme === "light") {
      setTheme("dark");
    }
  };

  return (
    <div
      onClick={handleInteraction}
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-1000 ${theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
    >

      {/* left video only desktop */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div
          className="w-4/5 max-w-xl rounded-2xl overflow-hidden transition-shadow duration-500"
          style={{
            boxShadow: theme === 'dark'
              ? "rgba(255, 255, 255, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.2) 0px 2px 16px 0px"
              : "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px"
          }}
        >
          <video
            className="w-full h-full object-cover"
            src={loginVideo}
            autoPlay loop muted playsInline
          />
        </div>
      </div>

      {/* login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 sm:px-10">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* mobile logo */}
          <h1 className={`font-cinzel text-2xl sm:text-4xl mb-3 uppercase tracking-wide text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Welcome to ride.arche.global
          </h1>

          <p className={`font-urbanist text-sm mb-6 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Sign in to access your workspace and manage your projects with precision.
          </p>

          {info && (
            <div className="mb-3 rounded bg-yellow-900/20 border border-yellow-500/60 px-3 py-2 text-xs sm:text-sm text-yellow-500">
              {info}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded bg-red-900/20 border border-red-500/60 px-3 py-2 text-xs sm:text-sm text-red-500">
              {error}
            </div>
          )}

          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            className={`space-y-6 rounded-2xl shadow-2xl border px-8 py-10 transition-all duration-700 backdrop-blur-xl ${theme === "dark"
              ? "bg-[#050509]/60 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              : "bg-white/70 border-white/40 shadow-xl"
              }`}
          >
            {/* email */}
            <div className="space-y-2">
              <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Email</label>
              <input
                autoComplete="off"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${theme === "dark"
                  ? "border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-white/10"
                  : "border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400 focus:ring-black/20 hover:bg-white/80"
                  }`}
              />
            </div>

            {/* password with show/hide */}
            <div className="space-y-2">
              <label className={`block text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Password</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-all ${theme === "dark"
                    ? "border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-white/10"
                    : "border-gray-200 bg-white/50 text-gray-900 placeholder:text-gray-400 focus:ring-black/20 hover:bg-white/80"
                    }`}
                />
                <button
                  type="button"
                  className={`absolute right-3 top-3 text-[10px] font-bold tracking-wider hover:text-blue-400 transition-colors ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* login button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 ${loading ? "opacity-70 cursor-wait" : ""
                } ${theme === "dark"
                  ? "bg-white text-black hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-lg"}`}
            >
              {loading ? "Accessing..." : "Login"}
            </button>

            {/* RESTRICTED ACCESS - PRO VISION STYLE */}
            <div className="mt-8 flex justify-center">
              <div className={`
                relative px-5 py-2 rounded-full overflow-hidden group cursor-default
                transition-all duration-500 ease-out border backdrop-blur-2xl
                ${theme === 'dark'
                  ? 'bg-white/5 border-white/5 shadow-lg'
                  : 'bg-black/5 border-black/5 shadow-sm'}
                hover:border-blue-400/30 hover:bg-white/10
              `}>
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-blue-400/80 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-blue-600'} animate-pulse`}></div>
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase font-urbanist ${theme === 'dark' ? 'text-gray-400 group-hover:text-blue-200' : 'text-gray-600 group-hover:text-blue-800'} transition-colors duration-300`}>
                    Restricted Access
                  </span>
                </div>

                {/* Horizontal Light Scan */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:animate-[shimmer_1s_infinite]"></div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
}

export default LoginPage;
