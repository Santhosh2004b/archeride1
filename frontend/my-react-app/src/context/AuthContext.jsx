
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginTime, setLoginTime] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("ARCHERIDE_AUTH");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        setLoginTime(parsed.loginTime || null);
      } catch {
        localStorage.removeItem("ARCHERIDE_AUTH");
      }
    }
  }, []);

  const login = (data) => {
    const now = new Date().toISOString();
    const authState = {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      },
      token: data.token,
      loginTime: now,
    };

    setUser(authState.user);
    setToken(authState.token);
    setLoginTime(now);
    localStorage.setItem("ARCHERIDE_AUTH", JSON.stringify(authState));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoginTime(null);
    localStorage.removeItem("ARCHERIDE_AUTH");
  };

  // --- Auto Logout Logic (60 Minutes Inactivity) ---
  const timeoutRef = useRef(null);
  const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutes

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (token) {
      timeoutRef.current = setTimeout(() => {
        console.warn("Auto-logging out due to 60 minutes of inactivity.");
        logout();
      }, INACTIVITY_LIMIT);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
      const handleEvent = () => resetTimer();

      events.forEach((event) => document.addEventListener(event, handleEvent));

      resetTimer(); // Initialize timer

      return () => {
        events.forEach((event) => document.removeEventListener(event, handleEvent));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [token, resetTimer]);
  // -------------------------------------------------

  return (
    <AuthContext.Provider value={{ user, token, loginTime, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
