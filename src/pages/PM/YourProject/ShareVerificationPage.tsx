
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVerifyShareTokenMutation } from '../../../services/Document/verifyShareAPI';

// Import icons
import { XCircleIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

const ShareVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [verifyToken, { isLoading, isError, error, isSuccess, data }] = useVerifyShareTokenMutation();

  useEffect(() => {
    const shareToken = searchParams.get('token');
    if (shareToken) {
      verifyToken(shareToken);
    }
  }, [searchParams, verifyToken]);

  useEffect(() => {
    if (isSuccess && data) {
      // Add a short delay so the user can see the success state before redirecting
      const timer = setTimeout(() => {
        navigate(data.redirectUrl, { replace: true });
      }, 1500); // 1.5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isSuccess, data, navigate]);

  // Child component for the Loading state
  const LoadingState = () => (
    <>
      <div className="relative flex justify-center items-center mb-6">
        <div className="absolute h-20 w-20 bg-blue-100 rounded-full animate-ping"></div>
        <ArrowPathIcon className="h-16 w-16 text-blue-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Verifying Link...</h1>
      <p className="text-gray-500">Please wait a moment while we check the validity of your shared link.</p>
    </>
  );

  // Child component for the Success state (before redirect)
  const SuccessState = () => (
    <>
       <div className="flex justify-center items-center mb-4">
         <ShieldCheckIcon className="h-20 w-20 text-green-500" />
       </div>
       <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h1>
       <p className="text-gray-500">Redirecting you to the document...</p>
    </>
  );

  // Child component for the Error state
  const ErrorState = () => {
    let errorMessage = 'The share link is invalid or has expired.';
    let buttonText = 'Return to Homepage';
    let buttonLink = '/';

    if (!searchParams.get('token')) {
      errorMessage = 'No token found in the URL.';
    } else if (error) {
      if (error.status === 401) {
        errorMessage = 'Please log in to access this link.';
        buttonText = 'Go to Login';
        buttonLink = '/login';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this document.';
      }
    }

    return (
      <>
        <div className="flex justify-center items-center mb-4">
          <XCircleIcon className="h-20 w-20 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
        <p className="text-gray-500 mb-8">{errorMessage}</p>
        <Link
          to={buttonLink}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {buttonText}
        </Link>
      </>
    );
  };

  // Function to render main content based on state
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (isSuccess) {
      return <SuccessState />;
    }
    // Default to showing an error if there's no token or an API error
    return <ErrorState />;
  };

  return (
    // Use a gradient for the background to create depth
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      {/* Add an animation effect when the component appears */}
      <div className="w-full max-w-md p-8 md:p-10 bg-white rounded-2xl shadow-2xl text-center transform transition-all duration-500 ease-in-out scale-95 animate-fade-in-up">
        {renderContent()}
      </div>
    </div>
  );
};

export default ShareVerificationPage;