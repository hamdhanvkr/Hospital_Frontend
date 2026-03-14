import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { User, Lock, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/auth/login', formData);
      const { token, user } = response.data;

      // Use sessionStorage instead of localStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userId', user.id);

      // Navigate based on role
      switch (user.role) {
        case 'patient':
          navigate('/patient/doctors');
          break;
        case 'doctor':
          navigate('/doctor/appointments');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Double-click on lock icon to reveal/hide admin option
  const toggleAdminOption = () => {
    setShowAdminOption(!showAdminOption);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Login to access your dashboard</p>
          
          {/* Secret admin toggle - double click on lock icon */}
          <div 
            className="mt-2 text-xs text-slate-400 cursor-pointer inline-flex items-center space-x-1 hover:text-blue-600 transition-colors"
            onDoubleClick={toggleAdminOption}
            title={showAdminOption ? "Double-click to hide admin option" : "Double-click for admin access"}
          >
            <Lock className="w-3 h-3" />
            <span>Secure login</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              {/* Admin option only shown when double-clicked */}
              {showAdminOption && (
                <option value="admin" className="bg-purple-50 text-purple-700 font-medium">
                  Admin
                </option>
              )}
            </select>
          
            {/* Admin mode indicator */}
            {showAdminOption && (
              <div className="mt-2 p-2 bg-purple-50 rounded-lg flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-700 font-medium">
                  Admin mode active - Admin option visible
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}



























// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import API from '../../api/axios';
// import { User, Lock } from 'lucide-react';

// export default function Login() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     role: 'patient'
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await API.post('/auth/login', formData);
//       const { token, user } = response.data;

//       localStorage.setItem('token', token);
//       localStorage.setItem('userRole', user.role);
//       localStorage.setItem('userId', user.id);

//       // Navigate based on role
//       switch (user.role) {
//         case 'patient':
//           navigate('/patient/doctors');
//           break;
//         case 'doctor':
//           navigate('/doctor/appointments');
//           break;
//         case 'admin':
//           navigate('/admin/dashboard');
//           break;
//         default:
//           navigate('/');
//       }
//     } catch (error) {
//       alert(error.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Login to access your dashboard</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">Select Role</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="patient">Patient</option>
//               <option value="doctor">Doctor</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//               <input
//                 type="text"
//                 name="username"
//                 required
//                 value={formData.username}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter username"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//               <input
//                 type="password"
//                 name="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter password"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-slate-600">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-blue-600 font-semibold hover:underline">
//             Register as Patient
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }