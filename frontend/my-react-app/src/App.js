// frontend/my-react-app/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import KpiCard from "./components/KpiCard";
import DonutChart from "./components/DonutChart";
import StackedColumnChart from "./components/StackedColumnChart";

import ProtectedRoute from "./routes/ProtectedRoute";
import BmNotificationsPage from "./pages/BmNotificationsPage";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import IssuesPage from "./pages/IssuesPage";
import ActionsPage from "./pages/ActionsPage";
import DependenciesPage from "./pages/DependenciesPage";
import AppreciationsPage from "./pages/AppreciationsPage";
import EscalationsPage from "./pages/EscalationsPage";
import CollectionsPage from "./pages/CollectionsPage";
import DashboardPage from "./pages/DashboardPage";
import MonitoringDashboardPage from "./pages/MonitoringDashboardPage";
import MonitoringRisksPage from "./pages/MonitoringRisksPage";
import MonitoringIssuesPage from "./pages/MonitoringIssuesPage";
import MonitoringDependenciesPage from "./pages/MonitoringDependenciesPage";
import MonitoringActionsPage from "./pages/MonitoringActionsPage";
import MonitoringAppreciationsPage from "./pages/MonitoringAppreciationsPage";
import MonitoringCollectionsPage from "./pages/MonitoringCollectionsPage";
import MonitoringEscalationsPage from "./pages/MonitoringEscalationsPage";
import ModuleRoute from "./routes/ModuleRoute";

import MonitoringNotificationsPage from "./pages/MonitoringNotificationsPage";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import CeremonyLaunchPage from "./pages/CeremonyLaunchPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/ceremony" element={<CeremonyLaunchPage />} />

          {/* optional old list pages */}
          
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/dependencies" element={<DependenciesPage />} />
          <Route path="/appreciations" element={<AppreciationsPage />} />
          <Route path="/escalations" element={<EscalationsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />

          {/* protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* monitoring (ADMIN only) */}
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
            path="/monitoring/collections"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <MonitoringCollectionsPage />
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

          {/* BM / PM workboards */}
          <Route
            path="/modules/:moduleKey"
            element={
              <ProtectedRoute allowedRoles={["BM", "PM"]}>
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

          {/* default + 404 */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
