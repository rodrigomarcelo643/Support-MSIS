import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketsProvider } from './context/TicketsContext';
import { PublicPage } from './pages/PublicPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProtectedRoute } from '../routes/ProtectedRoute/Index';
import { PublicRoute } from '../routes/PublicRoute/Index';
import { RoleGuard } from './routes/RoleGuard';
import { RoleRedirect } from './routes/RoleRedirect';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSubmitTicketPage } from './pages/admin/AdminSubmitTicketPage';
import { AdminTrackTicketsPage } from './pages/admin/AdminTrackTicketsPage';
import { AdminActivityPage } from './pages/admin/AdminActivityPage';

// Faculty Pages
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultySubmitTicketPage } from './pages/faculty/FacultySubmitTicketPage';
import { FacultyTrackTicketsPage } from './pages/faculty/FacultyTrackTicketsPage';
import { FacultyActivityPage } from './pages/faculty/FacultyActivityPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentSubmitTicketPage } from './pages/student/StudentSubmitTicketPage';
import { StudentTrackTicketsPage } from './pages/student/StudentTrackTicketsPage';
import { StudentActivityPage } from './pages/student/StudentActivityPage';

// Secretary Pages
import { SecretaryDashboardPage } from './pages/secretary/SecretaryDashboardPage';
import { SecretarySubmitTicketPage } from './pages/secretary/SecretarySubmitTicketPage';
import { SecretaryTrackTicketsPage } from './pages/secretary/SecretaryTrackTicketsPage';
import { SecretaryActivityPage } from './pages/secretary/SecretaryActivityPage';

// Super Admin Pages
import { SuperAdminDashboardPage } from './pages/super-admin/SuperAdminDashboardPage';
import { SuperAdminTicketsPage } from './pages/super-admin/SuperAdminTicketsPage';
import { SuperAdminActivityPage } from './pages/super-admin/SuperAdminActivityPage';

// Settings Page
import { RoleSettingsPage } from './pages/settings/RoleSettingsPage';
import { LogoutConfirmModal } from './components/ui/LogoutConfirmModal';

function App() {
  return (
    <AuthProvider>
      <TicketsProvider>
        <Router>
          {/* Global Logout Confirmation Modal */}
          <LogoutConfirmModal />
          <Routes>
            {/* Public informative landing page */}
            <Route path="/" element={<PublicPage />} />

            {/* Authentication routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/google/callback" element={<AuthCallbackPage />} />
            </Route>

            {/* Authenticated Role-Based Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Dynamic Redirect to user's assigned role dashboard */}
              <Route path="/dashboard" element={<RoleRedirect />} />

              <Route element={<DashboardLayout />}>
                {/* Admin Role Routes */}
                <Route element={<RoleGuard allowedRoles={['Admin', 'Super Admin']} />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/submit" element={<AdminSubmitTicketPage />} />
                  <Route path="/admin/tickets" element={<AdminTrackTicketsPage />} />
                  <Route path="/admin/activity" element={<AdminActivityPage />} />
                  <Route path="/admin/settings" element={<RoleSettingsPage />} />
                </Route>

                {/* Faculty Role Routes */}
                <Route element={<RoleGuard allowedRoles={['Faculty', 'Super Admin']} />}>
                  <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
                  <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
                  <Route path="/faculty/submit" element={<FacultySubmitTicketPage />} />
                  <Route path="/faculty/tickets" element={<FacultyTrackTicketsPage />} />
                  <Route path="/faculty/activity" element={<FacultyActivityPage />} />
                  <Route path="/faculty/settings" element={<RoleSettingsPage />} />
                </Route>

                {/* Student Role Routes */}
                <Route element={<RoleGuard allowedRoles={['Student', 'Super Admin']} />}>
                  <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                  <Route path="/student/submit" element={<StudentSubmitTicketPage />} />
                  <Route path="/student/tickets" element={<StudentTrackTicketsPage />} />
                  <Route path="/student/activity" element={<StudentActivityPage />} />
                  <Route path="/student/settings" element={<RoleSettingsPage />} />
                </Route>

                {/* Secretary Role Routes */}
                <Route element={<RoleGuard allowedRoles={['Secretary', 'Super Admin']} />}>
                  <Route path="/secretary" element={<Navigate to="/secretary/dashboard" replace />} />
                  <Route path="/secretary/dashboard" element={<SecretaryDashboardPage />} />
                  <Route path="/secretary/submit" element={<SecretarySubmitTicketPage />} />
                  <Route path="/secretary/tickets" element={<SecretaryTrackTicketsPage />} />
                  <Route path="/secretary/activity" element={<SecretaryActivityPage />} />
                  <Route path="/secretary/settings" element={<RoleSettingsPage />} />
                </Route>

                {/* Super Admin Role Routes */}
                <Route element={<RoleGuard allowedRoles={['Super Admin']} />}>
                  <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
                  <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
                  <Route path="/super-admin/tickets" element={<SuperAdminTicketsPage />} />
                  <Route path="/super-admin/activity" element={<SuperAdminActivityPage />} />
                  <Route path="/super-admin/settings" element={<RoleSettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TicketsProvider>
    </AuthProvider>
  );
}

export default App;
