import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

// Public
import LandingPage from "./Pages/Landing/LandingPage";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";

// User
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

import ContactUs from "./Pages/contact/ContactUs";


// Admin
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ManageUsers from "./Pages/Admin/ManageUsers";
import ManageBookings from "./Pages/Admin/ManageBookings";
import SubsidyRules from "./Pages/Admin/SubsidyRules";
import SystemAnalytics from "./Pages/Admin/SystemAnalytics";

// Components
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/analytics" element={<SolarAnalytics />} />
          <Route path="/prediction" element={<PowerPrediction />} />
          <Route path="/weather" element={<WeatherForecast />} />
          <Route path="/carbon" element={<CarbonFootprint />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/subsidy" element={<SubsidyEligibility />} />
          <Route path="/cost-roi" element={<CostROI />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/contact" element={<ContactUs />} />


          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />
          <Route path="/admin/subsidy" element={<SubsidyRules />} />
          <Route path="/admin/analytics" element={<SystemAnalytics />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
