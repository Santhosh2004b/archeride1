
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MonitoringDashboardPage from '../pages/MonitoringDashboardPage';
import ModuleListPage from '../pages/ModuleListPage';
import ProtectedRoute from '../components/ProtectedRoute';
import MonitoringNotificationsPage from "../pages/MonitoringNotificationsPage";

const MonitoringRoute = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <MainLayout>
      <Routes>
        <Route path="" element={<MonitoringDashboardPage />} />
        <Route path="risks" element={<ModuleListPage moduleKey="risks" mode="view" />} />
        <Route path="issues" element={<ModuleListPage moduleKey="issues" mode="view" />} />
        <Route path="dependencies" element={<ModuleListPage moduleKey="dependencies" mode="view" />} />
        <Route path="escalations" element={<ModuleListPage moduleKey="escalations" mode="view" />} />
        <Route path="actions" element={<ModuleListPage moduleKey="actions" mode="view" />} />
        <Route path="appreciations" element={<ModuleListPage moduleKey="appreciations" mode="view" />} />
        <Route path="/monitoring/notifications" element={<MonitoringNotificationsPage />} />

        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </MainLayout>
  </ProtectedRoute>
);

export default MonitoringRoute;
