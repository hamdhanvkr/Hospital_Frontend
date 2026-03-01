import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Mail, Phone, Key, Lock, CheckCircle, AlertCircle, User } from 'lucide-react';

export default function ChangePassword({ role }) { // Get role from props
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verifyData, setVerifyData] = useState({
    email: '',
    phone: ''
  });
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Log the role when component mounts
  useEffect(() => {
    console.log('🔍 ChangePassword mounted with role:', role);
  }, [role]);

  // Step 1: Verify Email and Phone
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerifyError('');
    
    // Basic validation
    if (!verifyData.email || !verifyData.phone) {
      setVerifyError('Please enter both email and phone number');
      setLoading(false);
      return;
    }

    if (verifyData.phone.length !== 10) {
      setVerifyError('Phone number must be 10 digits');
      setLoading(false);
      return;
    }

    // Check if role exists
    if (!role) {
      setVerifyError('User role not found. Please go back and try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Sending verification request:', { 
        email: verifyData.email, 
        phone: verifyData.phone, 
        role 
      });
      
      const response = await API.post('/auth/verify-user', {
        email: verifyData.email,
        phone: verifyData.phone,
        role: role
      });
      
      console.log('📥 Verification response:', response.data);
      
      if (response.data.success) {
        setStep(2);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        
        if (error.response.status === 404) {
          setVerifyError('Email and phone number do not match our records');
        } else {
          setVerifyError(error.response?.data?.message || 'Verification failed');
        }
      } else if (error.request) {
        setVerifyError('Server not responding. Please try again later.');
      } else {
        setVerifyError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword.password !== newPassword.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/change-password', {
        email: verifyData.email,
        phone: verifyData.phone,
        newPassword: newPassword.password,
        role: role
      });
      
      alert('Password changed successfully! Please login with new password.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Key className="w-6 h-6 mr-2" />
              Change Password
            </h2>
            <p className="text-blue-100 text-sm mt-1 capitalize">
              {role || 'User'} • Verify Identity
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-6">
            <div className="flex items-center">
              <div className={`flex-1 flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Verify</span>
              </div>
              <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Change</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Verify Email and Phone */}
            {step === 1 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Enter your registered email and phone number to verify your identity
                  </p>
                </div>

                {verifyError && (
                  <div className="bg-red-50 p-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">{verifyError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={verifyData.email}
                      onChange={(e) => setVerifyData({...verifyData, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your registered email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      value={verifyData.phone}
                      onChange={(e) => setVerifyData({...verifyData, phone: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Enter the 10-digit number used during registration</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}

            {/* Step 2: Change Password */}
            {step === 2 && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-green-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Identity verified! You can now change your password.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      required
                      value={newPassword.password}
                      onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                      minLength="6"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      required
                      value={newPassword.confirmPassword}
                      onChange={(e) => setNewPassword({...newPassword, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {newPassword.password && newPassword.confirmPassword && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                    newPassword.password === newPassword.confirmPassword
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {newPassword.password === newPassword.confirmPassword ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {newPassword.password === newPassword.confirmPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || newPassword.password !== newPassword.confirmPassword}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}