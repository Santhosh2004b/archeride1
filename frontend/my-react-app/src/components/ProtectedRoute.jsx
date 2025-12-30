// frontend/my-react-app/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user.role;
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/landing" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
