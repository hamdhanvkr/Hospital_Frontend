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
import ChangePassword from "./pages/auth/ChangePassword";

// Patient Pages
import PatientViewDoctors from "./pages/patient/ViewDoctors";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientDashboard from "./pages/patient/PatientDashboard";
import ManageAppointment from "./pages/patient/ManageAppointment";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import ViewPatientAppointments from "./pages/doctor/ViewPatientAppointments";
import RescheduleAppointment from "./pages/doctor/RescheduleAppointment";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddDoctor from "./pages/admin/AddDoctor";
import EditDoctor from "./pages/admin/EditDoctor";
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

        {/* Patient Routes with SideMenu - FIXED LAYOUT */}
        <Route
          path="/patient/*"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <SideMenu role="patient" />
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <Routes>
                      <Route path="doctors" element={<PatientViewDoctors />} />
                      <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
                      <Route path="appointments" element={<PatientDashboard />} />
                      <Route path="manage-appointment/:appointmentId" element={<ManageAppointment />} />
                      <Route path="change-password" element={<ChangePassword role="patient" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        {/* Doctor Routes with SideMenu - FIXED LAYOUT */}
        <Route
          path="/doctor/*"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <SideMenu role="doctor" />
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <Routes>
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="appointments" element={<ViewPatientAppointments />} />
                      <Route path="reschedule-appointment/:appointmentId" element={<RescheduleAppointment />} />
                      <Route path="change-password" element={<ChangePassword role="doctor" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        {/* Admin Routes with SideMenu - FIXED LAYOUT */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <div className="flex h-screen overflow-hidden bg-gray-50">
                <SideMenu role="admin" />
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="add-doctor" element={<AddDoctor />} />
                      <Route path="doctors" element={<AdminViewDoctors />} />
                      <Route path="edit-doctor/:id" element={<EditDoctor />} />
                      <Route path="appointments" element={<ViewAppointments />} />
                      <Route path="change-password" element={<ChangePassword role="admin" />} />
                    </Routes>
                  </div>
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