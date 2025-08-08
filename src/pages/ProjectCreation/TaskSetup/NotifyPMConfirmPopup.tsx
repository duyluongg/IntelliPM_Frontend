import React from 'react';
import { X } from 'lucide-react';

interface NotifyPMConfirmPopupProps {
  handleConfirmNotifyPM: () => void;
  setIsNotifyPMConfirmOpen: (open: boolean) => void;
}

const NotifyPMConfirmPopup: React.FC<NotifyPMConfirmPopupProps> = ({
  handleConfirmNotifyPM,
  setIsNotifyPMConfirmOpen,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-xl font-bold text-[#1c73fd]'>Confirm Notification</h3>
          <button
            onClick={() => setIsNotifyPMConfirmOpen(false)}
            className='p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <p className='text-gray-600 mb-6'>
          Are you sure you want to save and notify the Project Manager via email?
        </p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={() => setIsNotifyPMConfirmOpen(false)}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmNotifyPM}
            className='px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifyPMConfirmPopup;