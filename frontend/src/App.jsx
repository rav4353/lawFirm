import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import AuditLogsPage from './pages/AuditLogsPage';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from 'sonner';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated && !loading ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated && !loading ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <DocumentsPage />
        </ProtectedRoute>
      } />
      <Route path="/workflows" element={
        <ProtectedRoute>
          <WorkflowsPage />
        </ProtectedRoute>
      } />
      <Route path="/workflows/builder" element={
        <ProtectedRoute>
          <WorkflowBuilderPage />
        </ProtectedRoute>
      } />
      <Route path="/audit-logs" element={
        <ProtectedRoute requiredPermission={{ resource: 'audit_logs', action: 'view_own' }}>
          <AuditLogsPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
