import React, { useState, useEffect } from 'react';
import { useGenerateEpicsMutation, useCreateEpicMutation } from '../../../services/epicApi';
import { toast } from 'react-toastify';
import type { EpicResponseDTO } from '../../../services/epicApi';
import aiIcon from '../../../assets/icon/ai.png';
import { useAuth, type Role } from '../../../services/AuthContext';

interface CreateEpicRequest {
  projectId: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  reporterId: number;
  assignedBy: number;
  createdBy: number;
}

interface GenerateEpicByAIProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  refetchWorkItems: () => void;
}

const GenerateEpicByAI: React.FC<GenerateEpicByAIProps> = ({
  isOpen,
  onClose,
  projectId,
  refetchWorkItems,
}) => {
  const [aiEpics, setAIEpics] = useState<EpicResponseDTO[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [generateEpics, { isLoading: isGeneratingEpics }] = useGenerateEpicsMutation();
  const [createEpic, { isLoading: isSavingEpics }] = useCreateEpicMutation();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const { user } = useAuth();
  const canCreate = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

  useEffect(() => {
    if (isOpen) {
      fetchAIEpics();
    }
  }, [isOpen, projectId]);

  const fetchAIEpics = async () => {
    try {
      const response = await generateEpics(projectId).unwrap();
      setAIEpics(response);
    } catch (error) {
      toast.error('Error generating epics: ' + (error as any)?.data?.message || 'Unknown error');
    }
  };

  const handleEpicSelect = (name: string) => {
    setSelectedEpics((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSaveEpics = async () => {
    const epicsToSave: CreateEpicRequest[] = aiEpics
      .filter((epic) => selectedEpics.includes(epic.name))
      .map((epic) => {
        // Validate epic name length (3-65 characters, per backend validation)
        if (epic.name.length > 65) {
          throw new Error(`Epic name "${epic.name}" exceeds 65 characters.`);
        }
        if (epic.name.length < 3) {
          throw new Error(`Epic name "${epic.name}" must be at least 3 characters.`);
        }
        return {
          projectId,
          name: epic.name,
          description: epic.description,
          status: epic.status.replace(' ', '_').toUpperCase() as 'TO_DO' | 'IN_PROGRESS' | 'DONE',
          startDate: epic.startDate || new Date().toISOString(),
          endDate: epic.endDate || new Date().toISOString(),
          reporterId: accountId,
          assignedBy: accountId,
          createdBy: accountId,
        };
      });

    try {
      if (epicsToSave.length === 0) {
        toast.error('Please select at least one epic to save.');
        return;
      }
      for (const epic of epicsToSave) {
        await createEpic(epic).unwrap();
      }
      toast.success('Selected epics saved successfully!');
      refetchWorkItems();
      setSelectedEpics([]); // Reset selection after saving
      onClose();
    } catch (error) {
      toast.error('Error saving epics: ' + (error as any)?.data?.message || (error as any)?.message || 'Unknown error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
        <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
          <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
          <h2 className='text-2xl font-bold text-white'>AI-Suggested Epics</h2>
        </div>
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {isGeneratingEpics ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <svg
                className='animate-spin w-10 h-10 text-purple-600'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                />
              </svg>
              <p className='mt-4 text-gray-600 text-lg'>AI is generating your epics...</p>
            </div>
          ) : aiEpics.length === 0 ? (
            <div className='text-center py-8 text-gray-500 text-lg'>
              No AI-suggested epics available. Try again later!
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full border-separate border-spacing-0'>
                <thead className='sticky top-0 bg-gray-50 shadow-sm'>
                  <tr>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700 w-16'>
                      Select
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700'>Name</th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700'>
                      Description
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700 w-24'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aiEpics.map((epic, index) => (
                    <tr
                      key={epic.name}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-purple-50 transition-colors duration-200`}
                    >
                      <td className='p-4 border-b border-gray-200'>
                        <input
                          type='checkbox'
                          checked={selectedEpics.includes(epic.name)}
                          onChange={() => handleEpicSelect(epic.name)}
                          className='h-5 w-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer'
                        />
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {epic.name}
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {epic.description}
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {epic.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
          >
            Cancel
          </button>
          {canCreate ? (
            <button
              onClick={handleSaveEpics}
              disabled={selectedEpics.length === 0 || isSavingEpics}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 ${selectedEpics.length === 0 || isSavingEpics
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'
                }`}
            >
              {isSavingEpics ? 'Saving...' : 'Save Selected Epics'}
            </button>
          ) : (
            <div className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'>
              Only Team Leader, Project Manager can create epics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateEpicByAI;