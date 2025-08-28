import React, { useState } from 'react';
import { useResetPasswordMutation } from '../services/authApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Shield, Check } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPasswordAPI, { isLoading, error }] = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmNewPassword && newPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      return;
    }
    
    if (!passwordsMatch) {
      return;
    }

    try {
      const result = await resetPasswordAPI({
        otp,
        newPassword,
        confirmNewPassword,
        email
      }).unwrap();
      
      if (result.isSuccess) {
        setIsSuccess(true);
        // Chuyển về trang login sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Reset password failed:', err);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Password Reset Successfully!</h2>
          <p className="text-gray-600">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter the verification code sent to <strong>{email}</strong> and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* OTP field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          {/* New Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password requirements */}
            {newPassword && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasUpper ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One uppercase letter
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasLower ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One lowercase letter
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One number
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasSpecial ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  One special character
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 pr-10"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {confirmNewPassword && (
              <div className={`mt-2 text-xs flex items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Reset Password
              </>
            )}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {(error as any)?.data?.message || 'Failed to reset password. Please try again.'}
            </div>
          )}
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-blue-600 hover:underline flex items-center gap-2 mx-auto text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forgot Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;