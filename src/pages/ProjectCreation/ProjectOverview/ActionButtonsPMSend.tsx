import React, { useState } from 'react';
import { CheckCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSendInvitationsMutation } from '../../../services/projectApi';

interface ActionButtonsProps {
  projectKey: string;
  projectId: number;
  isFormValid: boolean;
  onBack: () => Promise<void>;
  onNotifyMembers: () => Promise<void>;
  onSave: () => Promise<void>;
}

const ActionButtonsPMSend: React.FC<ActionButtonsProps> = ({
  projectKey,
  projectId,
  isFormValid,
  onBack,
  onNotifyMembers,
  onSave,
}) => {
  const navigate = useNavigate();
  const [sendInvitations, { isLoading: isSending, error: sendError }] = useSendInvitationsMutation();
  const [isAcceptConfirmOpen, setIsAcceptConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      await onNotifyMembers();
      setTimeout(() => navigate('/project/list'), 1000);
    } catch (error: any) {
      console.error('Error accepting project or sending invitations:', error);
      setErrorMessage(
        error.data?.message || 'Failed to accept project or notify team members. Please try again.'
      );
      setIsAcceptConfirmOpen(false);
    }
  };

  const handleSave = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      await onSave();
      setSuccessMessage('Project saved successfully.');
      setTimeout(() => navigate('/project/list'), 1000); // Navigate to /project/list after 1-second delay
    } catch (error: any) {
      console.error('Error saving project:', error);
      setErrorMessage('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-10">
      {errorMessage && <p className="text-red-500 mb-4 font-medium">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mb-4 font-medium">{successMessage}</p>}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 text-sm font-medium rounded-xl shadow-lg hover:bg-gray-300 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out"
      >
        Back
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isFormValid || isSending}
        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#28a745] to-[#34c759] 
        text-white text-sm font-medium rounded-xl shadow-lg hover:from-[#218838] hover:to-[#2db350] 
        hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Save className="w-4 h-4 mr-2" />
        Save
      </button>

      {/* Send to Team Members Button */}
      <button
        onClick={handleAcceptAndSend}
        disabled={!isFormValid || isSending}
        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] 
        text-white text-sm font-medium rounded-xl shadow-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] 
        hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {isSending ? 'Sending...' : 'Send to Team Members'}
      </button>

      {/* Accept Confirmation Popup */}
      {isAcceptConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Confirm Sending</h3>
              <button
                onClick={() => setIsAcceptConfirmOpen(false)}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send invitations to all team members for this project?
              This action will notify all team members.
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
                disabled={isSending}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtonsPMSend;