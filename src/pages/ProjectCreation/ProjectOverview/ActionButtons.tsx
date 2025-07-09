// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\ProjectCreation\ProjectOverview\ActionButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  projectKey: string;
  isFormValid: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ projectKey, isFormValid }) => {
  const navigate = useNavigate();

  const handleSaveAndExit = () => {
    const confirmExit = window.confirm('Are you sure you want to exit?');
    if (confirmExit) {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-end">
      <button
        onClick={() => navigate(`/project/${projectKey}/task-setup`)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl text-sm font-medium"
      >
        Create Task
      </button>
      <button
        onClick={handleSaveAndExit}
        disabled={!isFormValid}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-300 shadow-md hover:shadow-xl disabled:bg-gray-300 disabled:opacity-50 text-sm font-medium"
      >
        Save and Exit
      </button>
    </div>
  );
};

export default ActionButtons;