// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\ProjectCreation\ProjectOverview\ActionButtons.tsx
import React from 'react';
import { PlusCircle } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-10">
      {/* Save and Exit - Nút phụ */}
      <button
        onClick={handleSaveAndExit}
        disabled={!isFormValid}
        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-600 rounded-xl 
        hover:border-gray-400 hover:text-gray-800 transition-all duration-300 ease-in-out text-sm font-medium 
        disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save and Exit
      </button>

      {/* Create Task - Nút chính (màu xanh dương) */}
      <button
        onClick={() => navigate(`/project/${projectKey}/task-setup`)}
        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] 
        text-white text-sm font-medium rounded-xl shadow-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] 
        hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Create Task
      </button>
    </div>
  );
};

export default ActionButtons;
