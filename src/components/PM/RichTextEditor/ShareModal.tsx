import React, { useState } from 'react';
// Import các icon cần thiết
import { IoClose } from 'react-icons/io5';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { FaCrown } from 'react-icons/fa';
import { useAuth } from '../../../services/AuthContext';
import { useShareDocumentToEmailsMutation } from '../../../services/Document/documentAPI';
import { useSearchParams } from 'react-router-dom';
import { useDocumentId } from '../../context/DocumentContext';
import toast from 'react-hot-toast';

// Component nhận vào 2 props: isOpen để biết có hiển thị hay không, và onClose là hàm để đóng modal
const ShareModal = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState('');
  const [shareDocument, { isLoading, isSuccess, isError }] = useShareDocumentToEmailsMutation();
  const documentId = useDocumentId();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');
  console.log('Project Key:', projectKey);

  if (!isOpen) return null;
  const { user } = useAuth();

  const handleShare = async () => {
    if (!emails) {
      toast.error('Please enter at least one email.');
      return;
    }

    const emailArray = emails.split(',').map((email) => email.trim());

    try {
      await shareDocument({
        documentId,
        emails: emailArray,
        projectKey,
      }).unwrap();

      toast.success(' Document shared successfully!');
      setEmails('');
      onClose();
    } catch (error) {
      console.error('Failed to share document:', error);
      toast.error('❌ Failed to share document. Please try again.');
    }
  };

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-lg p-8 mx-4 bg-white rounded-xl shadow-lg transition-all'
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
        >
          <IoClose size={24} />
        </button>

        <div className='flex flex-col space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>Invite to this doc</h2>

          <div className='flex items-center space-x-2'>
            <input
              type='email'
              placeholder='Enter emails, separated by commas'
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className='flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              disabled={isLoading}
            />
            <button
              onClick={handleShare}
              disabled={isLoading}
              className='px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Sending...' : 'Invite'}
            </button>
          </div>

          <div className='flex items-center space-x-3 text-gray-600'>
            <HiOutlineBuildingOffice2 size={22} />
            <span>Anyone at {user?.username}'s Team can access this doc</span>
          </div>

          <div className='flex items-center justify-between p-2 rounded-md'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold'>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className='font-medium text-gray-800'>{user?.username} (You)</span>
            </div>
            <div className='flex items-center space-x-4'>
              <FaCrown className='text-blue-600' />
            </div>
          </div>

          <hr />

          <div className='flex items-center justify-between'>
            <label htmlFor='access-level' className='text-sm text-gray-600'>
              Choose who can edit this doc
            </label>
            <select
              id='access-level'
              className='px-3 py-2 text-sm border border-gray-300 rounded-md bg-white'
            >
              <option>Everyone with access to this doc</option>
              <option>Only specific people</option>
            </select>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-800'>Share public link</p>
              <p className='text-sm text-gray-500'>Create a public link for view-only access.</p>
            </div>

            <label className='relative inline-flex items-center cursor-pointer'>
              <input type='checkbox' value='' className='sr-only peer' />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
