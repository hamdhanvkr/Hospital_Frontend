import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Calendar, X, CheckCircle } from 'lucide-react';

export default function AppointmentTerms({ onAccept, onClose, appointmentDate }) {
  const [accepted, setAccepted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    if (appointmentDate) {
      const appointmentTime = new Date(appointmentDate).getTime();
      const now = new Date().getTime();
      const diffHours = Math.floor((appointmentTime - now) / (1000 * 60 * 60));
      
      if (diffHours > 48) {
        setTimeRemaining(`${Math.floor(diffHours / 24)} days ${diffHours % 24} hours`);
      } else {
        setTimeRemaining(`${diffHours} hours`);
      }
    }
  }, [appointmentDate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            Appointment Terms & Conditions
          </h2>
          <button onClick={onClose} className="text-white hover:text-blue-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Change Policy Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Change & Cancellation Policy
            </h3>
            <p className="text-sm text-blue-700">
              You can change or cancel your appointment up to 2 days (48 hours) before the scheduled time.
            </p>
            {appointmentDate && (
              <div className="mt-2 p-2 bg-white rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Time until appointment:</span> {timeRemaining}
                </p>
              </div>
            )}
          </div>

          {/* Terms List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Terms & Conditions:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Change Window:</span> You may change your appointment date or time up to 48 hours before the scheduled appointment. No changes allowed within 48 hours of the appointment.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">One Change Only:</span> You are allowed to change your appointment only once. Please choose your new date and time carefully.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Cancellation Fees:</span> 
                  <ul className="ml-4 mt-1 list-disc">
                    <li>Free cancellation if cancelled more than 48 hours before appointment</li>
                    <li>₹50 fee if cancelled between 24-48 hours before appointment</li>
                    <li>₹100 fee if cancelled within 24 hours of appointment</li>
                  </ul>
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">4</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">No-Show Policy:</span> If you miss your appointment without cancellation, full consultation fee will be charged and future bookings may be restricted.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">5</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Doctor Availability:</span> When changing your appointment, the new date and time must be within the doctor's available days and working hours.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                I have read and agree to the appointment terms and conditions
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => accepted && onAccept()}
              disabled={!accepted}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}