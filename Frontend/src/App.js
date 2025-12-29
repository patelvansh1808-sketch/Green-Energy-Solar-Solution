import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { useEffect, useState } from "react";

/* ===== PUBLIC PAGES ===== */
import LandingPage from "./Pages/Landing/LandingPage";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ContactUs from "./Pages/contact/ContactUs";

/* ===== USER PAGES ===== */
import UserDashboard from "./Pages/User/UserDashboard";
import SolarAnalytics from "./Pages/User/SolarAnalytics";
import PowerPrediction from "./Pages/User/PowerPrediction";
import WeatherForecast from "./Pages/User/WeatherForecast";
import CarbonFootprint from "./Pages/User/CarbonFootprint";
import Booking from "./Pages/User/Booking";
import SubsidyEligibility from "./Pages/User/SubsidyEligibility";
import CostROI from "./Pages/User/CostROI";
import Alerts from "./Pages/User/Alerts";
import Notifications from "./Pages/User/Notifications";
import Reports from "./Pages/User/Reports";
import Profile from "./Pages/User/Profile";
import WeatherImpact from "./Pages/User/WeatherImpact";
import Recommendations from "./Pages/User/Recommendations";
/* ===== ADMIN PAGES ===== */
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ManageUsers from "./Pages/Admin/ManageUsers";
import ManageBookings from "./Pages/Admin/ManageBookings";
import SubsidyRules from "./Pages/Admin/SubsidyRules";
import SystemAnalytics from "./Pages/Admin/SystemAnalytics";

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
        <Route path="/contact" element={<ContactUs />} />
        


        {/* ===== USER PROTECTED ROUTES ===== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <SolarAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prediction"
          element={
            <ProtectedRoute>
              <PowerPrediction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <WeatherForecast />
            </ProtectedRoute>
          }
        />

        <Route
          path="/carbon"
          element={
            <ProtectedRoute>
              <CarbonFootprint />
            </ProtectedRoute>
          }
        />

        <Route
  path="/weather-impact"
  element={
    <ProtectedRoute>
      <WeatherImpact />
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
          path="/subsidy"
          element={
            <ProtectedRoute>
              <SubsidyEligibility />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cost-roi"
          element={
            <ProtectedRoute>
              <CostROI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
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
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
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

        {/* ===== USER PROFILE ===== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ===== ADMIN ROUTES (ROLE BASED) ===== */}
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
      </Routes>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  // App loading animation (slow network UX)
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