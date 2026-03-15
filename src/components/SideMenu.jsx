import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, LogOut, Users, UserPlus, ClipboardList, 
  LayoutDashboard, Key, Menu, X, ChevronRight, 
  Home, Settings, Bell, User as UserIcon
} from 'lucide-react';

export default function SideMenu({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [userName, setUserName] = useState('');

  // Get user data from session storage
  useEffect(() => {
    // You can store the username during login
    const storedUserName = sessionStorage.getItem('userName');
    const storedUserRole = sessionStorage.getItem('userRole');
    
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Fallback if name not stored
      setUserName(storedUserRole === 'doctor' ? 'Dr. John' : 
                 storedUserRole === 'admin' ? 'Admin User' : 'Patient');
    }
  }, []);

  // Set active item based on current path
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName'); // Clear username
      navigate('/login');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = {
    patient: [
      { 
        icon: <Calendar className="w-5 h-5" />, 
        label: 'Book Appointment', 
        path: '/patient/doctors',
      },
      { 
        icon: <ClipboardList className="w-5 h-5" />, 
        label: 'My Appointments', 
        path: '/patient/appointments',
      },
    ],
    doctor: [
      { 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        label: 'Dashboard', 
        path: '/doctor/dashboard',
      },
      { 
        icon: <Users className="w-5 h-5" />, 
        label: 'Patient Appointments', 
        path: '/doctor/appointments',
      },
    ],
    admin: [
      { 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        label: 'Dashboard', 
        path: '/admin/dashboard',
      },
      { 
        icon: <UserPlus className="w-5 h-5" />, 
        label: 'Add Doctor', 
        path: '/admin/add-doctor',
      },
      { 
        icon: <Users className="w-5 h-5" />, 
        label: 'View Doctors', 
        path: '/admin/doctors',
      },
      { 
        icon: <ClipboardList className="w-5 h-5" />, 
        label: 'All Appointments', 
        path: '/admin/appointments',
      },
    ],
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Side Menu */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          bg-white shadow-2xl lg:shadow-lg
          flex flex-col h-screen
        `}
      >
        {/* Header with Collapse Toggle */}
        <div className={`
          flex items-center justify-between p-4 border-b border-gray-200
          ${isCollapsed ? 'lg:px-2' : 'lg:px-4'}
        `}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {role.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 capitalize">{role} Dashboard</h2>
                <p className="text-xs text-gray-500">{getGreeting()}, <span className="font-medium text-gray-700">{userName}</span></p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {role.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:block p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Info Card (when collapsed) */}
        {isCollapsed && (
          <div className="px-2 py-4 text-center">
            <div className="text-xs font-medium text-gray-500 truncate">{userName}</div>
            <div className="text-[10px] text-gray-400">{getGreeting()}</div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="space-y-1">
            {/* Role-specific menu items */}
            {menuItems[role]?.map((item, index) => {
              const isActive = activeItem === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center group relative
                    ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    px-3 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={`
                    ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}
                    transition-colors
                  `}>
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.description}
                      </span>
                    </>
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-4 border-t border-gray-200" />

            {/* Change Password */}
            <Link
              to={`/${role}/change-password`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center group relative
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
                px-3 py-3 rounded-xl
                transition-all duration-200
                text-gray-600 hover:bg-gray-50 hover:text-blue-600
                ${activeItem === `/${role}/change-password` ? 'bg-gray-50' : ''}
              `}
              title={isCollapsed ? 'Change Password' : ''}
            >
              <Key className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              {!isCollapsed && <span className="font-medium">Change Password</span>}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  Change Password
                </div>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className={`
          border-t border-gray-200 p-4
          ${isCollapsed ? 'lg:px-2' : 'lg:px-4'}
        `}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center group relative
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
              px-3 py-3 rounded-xl
              transition-all duration-200
              text-red-600 hover:bg-red-50
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            
            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>

          {/* Version info (when expanded) */}
          {!isCollapsed && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">Version 2.0.0</p>
              <p className="text-[10px] text-gray-300">© 2026 ABC Hospital</p>
            </div>
          )}
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}