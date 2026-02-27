// import React, { useState, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import API from '../../api/axios';

// export default function VerifyOTP() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { phone } = location.state || {};
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const inputRefs = useRef([]);

//   const handleChange = (index, value) => {
//     if (isNaN(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Move to next input
//     if (value !== '' && index < 5) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const otpValue = otp.join('');
//     if (otpValue.length !== 6) return;

//     setLoading(true);
//     try {
//       await API.post('/auth/verify-otp', { phone, otp: otpValue });
//       navigate('/login');
//     } catch (error) {
//       alert(error.response?.data?.message || 'Invalid OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800">Verify OTP</h2>
//           <p className="text-slate-500 mt-2">Enter the 6-digit code sent to {phone}</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="flex justify-between gap-2 mb-8">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 ref={(el) => (inputRefs.current[index] = el)}
//                 type="text"
//                 maxLength="1"
//                 value={digit}
//                 onChange={(e) => handleChange(index, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(index, e)}
//                 className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//               />
//             ))}
//           </div>

//           <button
//             type="submit"
//             disabled={loading || otp.join('').length !== 6}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
//           >
//             {loading ? 'Verifying...' : 'Verify OTP'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }




import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, devOTP } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-fill OTP in development mode
    if (devOTP && devOTP.length === 6) {
      const otpArray = devOTP.split('');
      setOtp(otpArray);
    }
  }, [devOTP]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1].focus();
      } else if (otp[index] !== '') {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      const newOtp = [...otp];
      otpArray.forEach((value, index) => {
        if (index < 6) newOtp[index] = value;
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const lastIndex = Math.min(otpArray.length, 5);
      if (lastIndex < 6) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone, otp: otpValue });
      alert('OTP verified successfully! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await API.post('/auth/resend-otp', { phone });
      setTimer(60);
      setCanResend(false);
      alert('OTP resent successfully!');
      
      // In development, show the OTP
      if (response.data.devOTP) {
        const otpArray = response.data.devOTP.split('');
        setOtp(otpArray);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Verify OTP</h2>
          <p className="text-slate-500 mt-2">
            Enter the 6-digit code sent to <br />
            <span className="font-semibold text-blue-600">{phone}</span>
          </p>
          {devOTP && (
            <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
              ⚡ Development Mode: OTP is {devOTP}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300 mb-4"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-blue-300"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <p className="text-slate-500">
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}