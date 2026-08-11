import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/clients/Clients';
import Cases from './pages/cases/Cases';
import Tasks from './pages/tasks/Tasks';
import Communications from './pages/communications/Communications';
import Documents from './pages/documents/Documents';
import LegalResearch from './pages/research/LegalResearch';
import CalendarView from './pages/calendar/CalendarView';
import Billing from './pages/billing/Billing';
import BusinessDev from './pages/businessDev/BusinessDev';
import Compliance from './pages/compliance/Compliance';
import Reports from './pages/reports/Reports';
import ClientPortal from './pages/portal/ClientPortal';
import Settings from './pages/settings/Settings';
import CaseFilings from './pages/filings/CaseFilings';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white text-sm">
        Loading LexOS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !hasRole(allowedRoles)) {
    return user.role === 'CLIENT' ? <Navigate to="/portal" replace /> : <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={user?.role === 'CLIENT' ? '/portal' : '/dashboard'} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="cases" element={<Cases />} />
        <Route path="filings" element={<CaseFilings />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="communications" element={<Communications />} />
        <Route path="documents" element={<Documents />} />
        <Route path="research" element={<LegalResearch />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="billing" element={<Billing />} />
        <Route path="business-dev" element={<BusinessDev />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="portal" element={<ClientPortal />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
