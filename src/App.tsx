import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicPage } from './pages/PublicPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from '../routes/ProtectedRoute/Index';
import { PublicRoute } from '../routes/PublicRoute/Index';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public informative landing page */}
          <Route path="/" element={<PublicPage />} />

          {/* Authentication route - Google sign in only */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/google/callback" element={<AuthCallbackPage />} />
          </Route>

          {/* Authenticated Dashboard inspired by the Reference UI */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
