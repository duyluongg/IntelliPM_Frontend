import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { FaCrown } from 'react-icons/fa';
import { useAuth } from '../../../services/AuthContext';
import { useShareDocumentByEmailsMutation } from '../../../services/Document/documentAPI';
import { useSearchParams } from 'react-router-dom';
import { useDocumentId } from '../../context/DocumentContext';
import toast from 'react-hot-toast';

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
};


const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState('');
  const [permissionType, setPermissionType] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [shareDocument, { isLoading }] = useShareDocumentByEmailsMutation();
  const documentId = useDocumentId();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') ?? 'DEFAULTKEY';
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleShare = async () => {
    const emailArray = emails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    if (emailArray.length === 0) {
      toast.error('❌ Please enter at least one valid email.');
      return;
    }

    try {
      const response = await shareDocument({
        documentId,
        permissionType,
        emails: emailArray,
        projectKey,
      }).unwrap();

      if (response.failedEmails.length > 0) {
        toast.error(`❌ Failed to share with: ${response.failedEmails.join(', ')}`);
      } else {
        toast.success(` Shared with ${permissionType} permission.`);
      }

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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-lg p-8 mx-4 bg-white rounded-xl shadow-lg'
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
        >
          <IoClose size={24} />
        </button>

        <div className='flex flex-col space-y-6'>
          <h2 className='text-xl font-semibold text-gray-800'>Invite to this doc</h2>

          <input
            type='text'
            placeholder='Enter emails, separated by commas'
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-md w-full'
            disabled={isLoading}
          />

          <div className='flex items-center justify-between'>
            <label htmlFor='access-level' className='text-sm text-gray-600'>
              Permission level
            </label>
            <select
              id='access-level'
              value={permissionType}
              onChange={(e) => setPermissionType(e.target.value as 'VIEW' | 'EDIT')}
              className='px-3 py-2 text-sm border border-gray-300 rounded-md bg-white'
              disabled={isLoading}
            >
              <option value='VIEW'>View only</option>
              <option value='EDIT'>Can edit</option>
            </select>
          </div>

          <button
            onClick={handleShare}
            disabled={isLoading}
            className='w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Sending...' : 'Invite'}
          </button>

          <div className='flex items-center space-x-3 text-gray-600 mt-2'>
            <HiOutlineBuildingOffice2 size={22} />
            <span>Anyone at {user?.username}'s team can access this doc</span>
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
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
