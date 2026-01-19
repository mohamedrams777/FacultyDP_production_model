import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyFDPs from "./pages/FacultyFDPs";
import FacultyFDPAttended from "./pages/FacultyFDPAttended";
import FacultyFDPOrganized from "./pages/FacultyFDPOrganized";
import FacultyABL from "./pages/FacultyABL";
import FacultyAdjunctFaculty from "./pages/FacultyAdjunctFaculty";
import FacultyJointTeaching from "./pages/FacultyJointTeaching";
import FacultySeminars from "./pages/FacultySeminars";
import FacultyEvents from "./pages/FacultyEvents";
import FacultyNotifications from "./pages/FacultyNotifications";
import AdminDashboard from './pages/AdminDashboard';
import AdminFaculty from './pages/AdminFaculty';
import AdminFDPAttended from './pages/AdminFDPAttended';
import AdminFDPOrganized from './pages/AdminFDPOrganized';
import AdminSeminars from './pages/AdminSeminars';
import AdminABL from './pages/AdminABL';
import AdminAdjunctFaculty from './pages/AdminAdjunctFaculty';
import AdminJointTeaching from './pages/AdminJointTeaching';
import AdminNotifications from './pages/AdminNotifications';
import AdminSettings from './pages/AdminSettings';
import HODDashboard from "./pages/HODDashboard";
import HODFaculty from "./pages/HODFaculty";
import HODAnalytics from "./pages/HODAnalytics";
import HODRecords from "./pages/HODRecords";
import HODNotifications from "./pages/HODNotifications";
import FacultyFDPReimbursement from "./pages/FacultyFDPReimbursement";
import FacultyAchievements from "./pages/FacultyAchievements";
import FacultyInternships from "./pages/FacultyInternships";
import AdminReimbursements from "./pages/AdminReimbursements";
import AdminAchievements from "./pages/AdminAchievements";
import AdminInternships from "./pages/AdminInternships";
import AuditReports from "./pages/AuditReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<DashboardLayout />}>
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/fdps"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyFDPs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/fdp/attended"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyFDPAttended />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/fdp/organized"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyFDPOrganized />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/abl"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyABL />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/adjunct"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyAdjunctFaculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/joint-teaching"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyJointTeaching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/seminars"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultySeminars />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/events"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/notifications"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/reimbursements"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyFDPReimbursement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/achievements"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyAchievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/internships"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyInternships />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faculty"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminFaculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fdp/attended"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminFDPAttended />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fdp/organized"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminFDPOrganized />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/seminars"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSeminars />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/abl"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminABL />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/adjunct"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAdjunctFaculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/joint-teaching"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminJointTeaching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reimbursements"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReimbursements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/achievements"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAchievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/internships"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminInternships />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AuditReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/faculty"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODFaculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/analytics"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/records"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/notifications"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/audit"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <AuditReports />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
