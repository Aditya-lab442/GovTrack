import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminSidebar } from './components/layout/AdminSidebar';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { ServicesPage } from './pages/ServicesPage';
import { TrackRequestPage } from './pages/TrackRequestPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ApplyPage } from './pages/citizen/ApplyPage';
import { CitizenRequestsPage } from './pages/citizen/CitizenRequestsPage';
import { CitizenRequestDetailPage } from './pages/citizen/CitizenRequestDetailPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';
import { CitizenNotificationsPage } from './pages/citizen/CitizenNotificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminRequestProcessPage } from './pages/admin/AdminRequestProcessPage';
import { AdminDocumentTypesPage } from './pages/admin/AdminDocumentTypesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Checking credentials...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Verifying authorization...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/citizen/dashboard" replace />;
  }
  return <>{children}</>;
};

// Admin Console Layout Container
const AdminConsoleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Standard Public / Citizen Layout Container
const StandardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StandardLayout><LandingPage /></StandardLayout>} />
          <Route path="/services" element={<StandardLayout><ServicesPage /></StandardLayout>} />
          <Route path="/track-request" element={<StandardLayout><TrackRequestPage /></StandardLayout>} />
          <Route path="/login" element={<StandardLayout><LoginPage /></StandardLayout>} />
          <Route path="/register" element={<StandardLayout><RegisterPage /></StandardLayout>} />

          {/* Citizen Routes */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute>
                <StandardLayout><CitizenDashboard /></StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/apply"
            element={
              <ProtectedRoute>
                <StandardLayout><ApplyPage /></StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/requests"
            element={
              <ProtectedRoute>
                <StandardLayout><CitizenRequestsPage /></StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/requests/:id"
            element={
              <ProtectedRoute>
                <StandardLayout><CitizenRequestDetailPage /></StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute>
                <StandardLayout><CitizenProfilePage /></StandardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/notifications"
            element={
              <ProtectedRoute>
                <StandardLayout><CitizenNotificationsPage /></StandardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminDashboard /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminRequestsPage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/requests/:id"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminRequestProcessPage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/document-types"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminDocumentTypesPage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminUsersPage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminAuditLogsPage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminConsoleLayout><AdminProfilePage /></AdminConsoleLayout>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
