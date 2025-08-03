import React, { useState } from 'react';
import { XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSendInvitationsMutation, useSendEmailRejectToLeaderMutation } from '../../../services/projectApi';

interface ActionButtonsProps {
  projectKey: string;
  projectId: number;
  isFormValid: boolean;
}

const ActionButtonsPM: React.FC<ActionButtonsProps> = ({ projectKey, projectId, isFormValid }) => {
  const navigate = useNavigate();
  const [sendInvitations, { isLoading: isSending, error: sendError }] = useSendInvitationsMutation();
  const [sendEmailRejectToLeader, { isLoading: isSendingRejection, error: rejectionSendError }] = useSendEmailRejectToLeaderMutation();
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  // Predefined rejection reasons
  const predefinedReasons = [
    'Insufficient budget allocated.',
    'Project scope not feasible.',
    'The technology produced is not suitable or sufficient to carry out the project.',
    'Lack of available resources.',
    'Timeline not realistic.',
  ];

  const handleReject = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setRejectionReason('');
    setCustomReason('');
    setIsRejectConfirmOpen(true);
  };

  const handleConfirmReject = async () => {
    const reason = rejectionReason === 'Other' ? customReason : rejectionReason;
    if (!reason.trim()) {
      setErrorMessage('Please select a reason or provide a custom reason for rejection.');
      return;
    }
    try {
      await sendEmailRejectToLeader({ projectId, reason }).unwrap();
      setSuccessMessage('Team Leader notified of rejection successfully.');
      setIsRejectConfirmOpen(false);
      setTimeout(() => navigate('/project/list'), 1000);
    } catch (error: any) {
      console.error('Error notifying Team Leader:', error);
      setErrorMessage(error.data?.message || 'Failed to notify Team Leader. Please try again.');
      setIsRejectConfirmOpen(false);
    }
  };

  const handleAcceptAndSend = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAcceptConfirmOpen(true);
  };

  const handleConfirmAccept = async () => {
    try {
      await sendInvitations(projectId).unwrap();
      setSuccessMessage('Project accepted and team members notified successfully.');
      setIsAcceptConfirmOpen(false);
      setTimeout(() => navigate('/project/list'), 1000);
    } catch (error: any) {
      console.error('Error accepting project or sending invitations:', error);
      setErrorMessage(error.data?.message || 'Failed to accept project or notify team members. Please try again.');
      setIsAcceptConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-10">
      {errorMessage && <p className="text-red-500 mb-4 font-medium">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mb-4 font-medium">{successMessage}</p>}

      {/* Reject Button */}
      <button
        onClick={handleReject}
        disabled={!isFormValid || isSending || isSendingRejection}
        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#ff6b6b] to-[#e63946] 
        text-white text-sm font-medium rounded-xl shadow-lg hover:from-[#e63946] hover:to-[#d32f2f] 
        hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <XCircle className="w-4 h-4 mr-2" />
        {isSendingRejection ? 'Processing...' : 'Reject Send to Team Leader'}
      </button>

      {/* Accept and Send Button */}
      <button
        onClick={handleAcceptAndSend}
        disabled={!isFormValid || isSending || isSendingRejection}
        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] 
        text-white text-sm font-medium rounded-xl shadow-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] 
        hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {isSending ? 'Sending...' : 'Accept and Send to Team Members'}
      </button>

      {/* Reject Confirmation Popup */}
      {isRejectConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Confirm Rejection</h3>
              <button
                onClick={() => setIsRejectConfirmOpen(false)}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this project and notify the Team Leader? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <select
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
              >
                <option value="">Select a reason...</option>
                {predefinedReasons.map((reason, index) => (
                  <option key={index} value={reason}>
                    {reason}
                  </option>
                ))}
                <option value="Other">Other (please specify)</option>
              </select>
            </div>
            {rejectionReason === 'Other' && (
              <div className="mb-4">
                <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Reason
                </label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] resize-y"
                  rows={4}
                  placeholder="Enter your custom reason for rejecting the project..."
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRejectConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={(!rejectionReason || (rejectionReason === 'Other' && !customReason.trim()))}
                className="px-4 py-2 bg-gradient-to-r from-[#ff6b6b] to-[#e63946] text-white rounded-lg hover:from-[#e63946] hover:to-[#d32f2f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Popup */}
      {isAcceptConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Confirm Acceptance</h3>
              <button
                onClick={() => setIsAcceptConfirmOpen(false)}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this project and send invitations to all team members? This action will notify all team members.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAcceptConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtonsPM;