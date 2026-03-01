import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import SideMenu from "./components/SideMenu";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Auth Pages
import PatientRegister from "./pages/auth/PatientRegister";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword"; // Import Change Password

// Patient Pages
import PatientViewDoctors from "./pages/patient/ViewDoctors";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientDashboard from "./pages/patient/PatientDashboard";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import ViewPatientAppointments from "./pages/doctor/ViewPatientAppointments";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddDoctor from "./pages/admin/AddDoctor";
import AdminViewDoctors from "./pages/admin/ViewDoctors";
import ViewAppointments from "./pages/admin/ViewAppointments";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
            </>
          }
        />

        {/* Auth Routes without Navbar */}
        <Route path="/register" element={<PatientRegister />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />

        {/* Patient Routes with SideMenu */}
        <Route
          path="/patient/*"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <div className="flex">
                <SideMenu role="patient" />
                <div className="flex-1">
                  <Routes>
                    <Route path="doctors" element={<PatientViewDoctors />} />
                    <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
                    <Route path="appointments" element={<PatientDashboard />} />
                    {/* Change Password Route */}
                    <Route path="change-password" element={<ChangePassword role="patient" />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        {/* Doctor Routes with SideMenu */}
        <Route
          path="/doctor/*"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <div className="flex">
                <SideMenu role="doctor" />
                <div className="flex-1">
                  <Routes>
                    <Route path="dashboard" element={<DoctorDashboard />} />
                    <Route path="appointments" element={<ViewPatientAppointments />} />
                    {/* Change Password Route */}
                    <Route path="change-password" element={<ChangePassword role="doctor" />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        {/* Admin Routes with SideMenu */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <div className="flex">
                <SideMenu role="admin" />
                <div className="flex-1">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="add-doctor" element={<AddDoctor />} />
                    <Route path="doctors" element={<AdminViewDoctors />} />
                    <Route path="appointments" element={<ViewAppointments />} />
                    {/* Change Password Route */}
                    <Route path="change-password" element={<ChangePassword role="admin" />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;