import React from 'react';
interface ConfirmationPopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: React.ReactNode; 
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[340px] transform transition-all duration-300 ease-in-out">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h4>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;