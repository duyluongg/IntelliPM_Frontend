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
      {/* Header */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          AI-Powered Task Setup
        </h1>
        <p className='text-gray-600 text-base'>
          Create tasks and epics for{' '}
          <span className='font-semibold text-blue-600'>{projectData?.data?.name}</span> ({projectKey})
        </p>
      </div>

      {/* Buttons */}
      <div className='mb-6 flex gap-4'>
        <button
          onClick={handleAIMode}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
            isGenerating
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
          }`}
          disabled={isGenerating}
        >
          <div className='flex items-center justify-center gap-3'>
            <img 
              src={isGenerating ? aiIcon : aiIcon} 
              alt="Galaxy AI" 
              className={`w-6 h-6 ${!isGenerating ? 'opacity-90' : ''}`}
            />
            <span className='text-lg'>
              {isGenerating ? 'Generating Magic...' : 'Generate with AI'}
            </span>
          </div>
        </button>
        
        <button
          onClick={handleOpenCreateTask}
          className='flex-1 px-6 py-4 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all duration-200'
        >
          <div className='flex items-center justify-center gap-2'>
            <Plus className='w-5 h-5' />
            <span>Create Manual</span>
          </div>
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className='text-red-700 text-sm'>{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className='text-green-700 text-sm'>{successMessage}</p>
        </div>
      )}
    </>
  );
};

export default TaskSetupHeader;