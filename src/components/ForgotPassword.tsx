import React, { useState } from 'react';
import { useForgotPasswordMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [forgotPasswordAPI, { isLoading, error }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPasswordAPI({ email }).unwrap();
      
      if (result.isSuccess) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      }
    } catch (err) {
      console.error('Forgot password failed:', err);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to reset password page...
          </p>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter your email address"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Reset Code
              </>
            )}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {(error as any)?.data?.message || 'Failed to send reset code. Please try again.'}
            </div>
          )}
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline flex items-center gap-2 mx-auto text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;