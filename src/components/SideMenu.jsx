import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Users, UserPlus, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function SideMenu({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const menuItems = {
    patient: [
      { icon: <Calendar />, label: 'Book Appointment', path: '/patient/doctors' },
      { icon: <ClipboardList />, label: 'My Appointments', path: '/patient/appointments' },
    ],
    doctor: [
      { icon: <LayoutDashboard />, label: 'Dashboard', path: '/doctor/dashboard' },
      { icon: <Users />, label: 'Patient Appointments', path: '/doctor/appointments' },
    ],
    admin: [
      { icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: <UserPlus />, label: 'Add Doctor', path: '/admin/add-doctor' },
      { icon: <Users />, label: 'View Doctors', path: '/admin/doctors' },
      { icon: <ClipboardList />, label: 'All Appointments', path: '/admin/appointments' },
    ],
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 capitalize">{role} Dashboard</h2>
      </div>

      <nav className="space-y-2">
        {menuItems[role]?.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}