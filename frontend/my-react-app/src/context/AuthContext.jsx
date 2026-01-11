// frontend/my-react-app/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // { id, name, email, role }
  const [token, setToken] = useState(null); // string

  useEffect(() => {
    const stored = localStorage.getItem("archeride_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        localStorage.removeItem("archeride_auth");
      }
    }
  }, []);

  // backend must send: { token, user: { id, name, email, role } }
  const login = (data) => {
    const authState = {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      },
      token: data.token,
    };

    setUser(authState.user);
    setToken(authState.token);
    localStorage.setItem("archeride_auth", JSON.stringify(authState));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("archeride_auth");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
