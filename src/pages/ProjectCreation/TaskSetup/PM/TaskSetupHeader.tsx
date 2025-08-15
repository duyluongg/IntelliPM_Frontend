import React from 'react';
import { Brain, Plus } from 'lucide-react';
import galaxyaiIcon from '../../../../assets/galaxyai.gif';
import aiIcon from '../../../../assets/icon/ai.png';

interface TaskSetupHeaderProps {
  projectData: any;
  projectKey: string;
  isGenerating: boolean;
  handleAIMode: () => void;
  handleOpenCreateTask: () => void;
  errorMessage: string | null;
  successMessage: string | null;
}

const TaskSetupHeader: React.FC<TaskSetupHeaderProps> = ({
  projectData,
  projectKey,
  isGenerating,
  handleAIMode,
  handleOpenCreateTask,
  errorMessage,
  successMessage,
}) => {
  return (
    <>
      <style>
        {`
          @keyframes scale-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-scale-pulse {
            animation: scale-pulse 1.5s ease-in-out infinite;
          }
          @keyframes gradientLoading {
            0% { background-position: 200% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <h1 className='text-4xl font-extrabold text-[#1c73fd] mb-3 tracking-tight'>
        AI-Powered Task Setup (PM)
      </h1>
      <p className='text-gray-600 mb-8 text-lg font-medium leading-relaxed'>
        Streamline your project planning for{' '}
        <span className='font-semibold'>{projectData?.data?.name}</span> ({projectKey}) with
        AI-generated tasks and epics.
      </p>

      <div className='mb-8 flex gap-4'>
        <div className='flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md'>
          <button
            onClick={handleAIMode}
            className={`w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
            }`}
            disabled={isGenerating}
          >
            <div className='flex items-center gap-2'>
              <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
              <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
            </div>
          </button>
        </div>
        <div className='flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md'>
          <button
            onClick={handleOpenCreateTask}
            className='w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
          >
            <Plus className='w-5 h-5' /> Create Task
          </button>
        </div>
      </div>
      {errorMessage && <p className='text-red-500 mb-4 font-medium'>{errorMessage}</p>}
      {successMessage && <p className='text-green-500 mb-4 font-medium'>{successMessage}</p>}
    </>
  );
};

export default TaskSetupHeader;