import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { useEffect, useState } from "react";

/* ===== PUBLIC PAGES ===== */
import LandingPage from "./Pages/Landing/LandingPage";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";
import GoogleAuthSuccess from "./Pages/Auth/GoogleAuthSuccess";
import ContactUs from "./Pages/contact/ContactUs";

/* ===== USER PAGES ===== */
import Dashboard from "./Pages/User/Dashboard";
import Alerts from "./Pages/User/Alerts";
import Booking from "./Pages/User/Booking";
import BookingStatus from "./Pages/User/BookingStatus";
import SubsidyEligibility from "./Pages/User/SubsidyEligibility";
import ApplyForSubsidy from "./Pages/User/ApplyForSubsidy";
import SubsidyStatus from "./Pages/User/SubsidyStatus";
import Profile from "./Pages/User/Profile";
import Recommendations from "./Pages/User/Recommendations";
import Notifications from "./Pages/User/Notifications";
import Messages from "./Pages/User/Messages";
import Support from "./Pages/User/Support";

/* ===== ADMIN PAGES ===== */
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ManageUsers from "./Pages/Admin/ManageUsers";
import ManageBookings from "./Pages/Admin/ManageBookings";
import ManageSubsidyApplications from "./Pages/Admin/ManageSubsidyApplications";
import SubsidyRules from "./Pages/Admin/SubsidyRules";
import SystemAnalytics from "./Pages/Admin/SystemAnalytics";
import ManageCustomers from "./Pages/Admin/ManageCustomers";
import CreateCustomer from "./Pages/Admin/CreateCustomer";
import EditCustomer from "./Pages/Admin/EditCustomer";
import RoleManagement from "./Pages/Admin/RoleManagement";
import ProjectTracking from "./Pages/Admin/ProjectTracking";
import TicketManagement from "./Pages/Admin/TicketManagement";
import FinancialAnalytics from "./Pages/Admin/FinancialAnalytics";
import InventoryManagement from "./Pages/Admin/InventoryManagement";

/* ===== CRM PAGES ===== */
import LeadManagement from "./Pages/LeadManagement";
import LeadAnalytics from "./Pages/LeadAnalytics";
import CRMDashboard from "./Pages/CRMDashboard";
import SalesDashboard from "./Pages/SalesDashboard";
import TeamMemberDashboard from "./Pages/TeamMemberDashboard";

/* ===== ENGINEER PAGES ===== */
import EngineerDashboard from "./Pages/EngineerDashboard";

/* ===== COMPONENTS ===== */
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import LoadingScreen from "./Components/LoadingScreen";

/* ===== PAGE TRANSITION WRAPPER ===== */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade animate-slideUp">
      <Routes location={location}>

        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* ===== USER ROUTES ===== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-status"
          element={
            <ProtectedRoute>
              <BookingStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subsidy"
          element={
            <ProtectedRoute>
              <SubsidyEligibility />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-subsidy"
          element={
            <ProtectedRoute>
              <ApplyForSubsidy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subsidy-status"
          element={
            <ProtectedRoute>
              <SubsidyStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        {/* ===== ADMIN ROUTES ===== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute role="admin">
              <ManageBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/subsidy-applications"
          element={
            <ProtectedRoute role="admin">
              <ManageSubsidyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute role="admin">
              <ManageCustomers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create-customer"
          element={
            <ProtectedRoute role="admin">
              <CreateCustomer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <EditCustomer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/subsidy"
          element={
            <ProtectedRoute role="admin">
              <SubsidyRules />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <SystemAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute role="admin">
              <FinancialAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute role="admin">
              <InventoryManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute role="admin">
              <RoleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute role="admin">
              <ProjectTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute role={["admin", "support"]}>
              <TicketManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/engineer/dashboard"
          element={
            <ProtectedRoute role="engineer">
              <EngineerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard"
          element={
            <ProtectedRoute role="admin">
              <CRMDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm/sales-dashboard"
          element={
            <ProtectedRoute role="admin">
              <SalesDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm/leads"
          element={
            <ProtectedRoute role="admin">
              <LeadManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm/analytics"
          element={
            <ProtectedRoute role="admin">
              <LeadAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/my-leads"
          element={
            <ProtectedRoute>
              <TeamMemberDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
