
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import BmNotificationsPage from "./pages/BmNotificationsPage";


import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import IssuesPage from "./pages/IssuesPage";
import ActionsPage from "./pages/ActionsPage";
import DependenciesPage from "./pages/DependenciesPage";
import AppreciationsPage from "./pages/AppreciationsPage";
import EscalationsPage from "./pages/EscalationsPage";
import DashboardPage from "./pages/DashboardPage";
import MonitoringDashboardPage from "./pages/MonitoringDashboardPage";
import MonitoringRisksPage from "./pages/MonitoringRisksPage";
import MonitoringIssuesPage from "./pages/MonitoringIssuesPage";
import MonitoringDependenciesPage from "./pages/MonitoringDependenciesPage";
import MonitoringActionsPage from "./pages/MonitoringActionsPage";
import MonitoringAppreciationsPage from "./pages/MonitoringAppreciationsPage";
import MonitoringEscalationsPage from "./pages/MonitoringEscalationsPage";
import ModuleRoute from "./routes/ModuleRoute";

import MonitoringNotificationsPage from "./pages/MonitoringNotificationsPage";
import UsersMonitoringPage from "./pages/UsersMonitoringPage";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import { FilterProvider } from "./context/FilterContext";
import ManagersAdminPage from "./pages/ManagersAdminPage";
import GuidePage from "./pages/GuidePage";



function App() {

  return (
    <AuthProvider>
      <FilterProvider>

      <Router>
        <Routes>
          {}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />


          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/dependencies" element={<DependenciesPage />} />
          <Route path="/appreciations" element={<AppreciationsPage />} />
          <Route path="/escalations" element={<EscalationsPage />} />

          {}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringDashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/risks"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringRisksPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/issues"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringIssuesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/dependencies"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringDependenciesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/escalations"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringEscalationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/actions"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringActionsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/appreciations"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringAppreciationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/notifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringNotificationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <UsersMonitoringPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/managers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <ManagersAdminPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GuidePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/modules/:moduleKey"
            element={
              <ProtectedRoute allowedRoles={["BM", "PM", "ADMIN"]}>
                <MainLayout>
                  <ModuleRoute />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bm/notifications"
            element={
              <ProtectedRoute allowedRoles={["BM", "PM"]}>
                <MainLayout>
                  <BmNotificationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />


          {}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      </FilterProvider>
    </AuthProvider>
  );
}
export default App;
