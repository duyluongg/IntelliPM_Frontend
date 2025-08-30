import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi';
import EpicPopup from '../../WorkItem/EpicPopup';

// Define User type
interface User {
  id: number;
  role: string;
  [key: string]: any; // For additional properties
}

interface Epic {
  id: string;
  name: string;
  owner: string | null;
  color: string | null;
  progress: {
    done: number;
    inProgress: number;
    toDo: number;
  };
  startDate: string;
  dueDate: string;
}

interface EpicColumnProps {
  epics: EpicWithStatsResponseDTO[];
  onCreateEpic: () => void;
}

// Tooltip Component (copied from SprintColumn.tsx for consistency)
const Tooltip: React.FC<{
  children: React.ReactNode;
  message: string;
  show: boolean;
}> = ({ children, message, show }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {show && isVisible && (
        <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {message}
        </div>
      )}
    </div>
  );
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const calculateProgress = (
  totalTasks: number,
  toDo: number,
  inProgress: number,
  done: number
): { done: number; inProgress: number; toDo: number } => {
  if (totalTasks === 0) return { done: 0, inProgress: 0, toDo: 100 };
  return {
    done: Math.round((done / totalTasks) * 100),
    inProgress: Math.round((inProgress / totalTasks) * 100),
    toDo: Math.round((toDo / totalTasks) * 100),
  };
};

const EpicColumn: React.FC<EpicColumnProps> = ({ epics, onCreateEpic }) => {
  const [expandedEpicId, setExpandedEpicId] = useState<string | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null); // State for WorkItem popup

  // Check user role
  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const isLeaderOrManager = user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER';

  const mappedEpics: Epic[] = epics.map((epic) => {
    const progress = calculateProgress(
      epic.totalTasks,
      epic.totalToDoTasks,
      epic.totalInProgressTasks,
      epic.totalDoneTasks
    );

    return {
      id: epic.id,
      name: epic.name,
      owner: epic.reporterFullname || epic.assignedByFullname || 'Unknown',
      color: epic.sprintId ? '#6b7280' : '#c97cf4',
      progress,
      startDate: formatDate(epic.startDate || epic.createdAt),
      dueDate: formatDate(epic.endDate || epic.updatedAt),
    };
  });

  const handleOpenWorkItem = (epicId: string) => {
    setSelectedEpicId(epicId); // Open WorkItem with the selected epic's ID
  };

  const handleCloseWorkItem = () => {
    setSelectedEpicId(null); // Close WorkItem
  };

  return (
    <div className="w-full min-w-[250px] sm:w-1/3 md:w-1/4 p-4 bg-white border rounded shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Epic</h3>
        {/* <button className="text-xl text-gray-600 hover:text-gray-800">×</button> */}
      </div>

      {/* Epic List */}
      <div className="space-y-3 overflow-y-auto max-h-[80vh] pr-1">
        {mappedEpics.map((epic) => {
          const isExpanded = expandedEpicId === epic.id;
          return (
            <div
              key={epic.id}
              className="border rounded p-3 space-y-2 bg-white hover:bg-gray-50 transition shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() =>
                    setExpandedEpicId(isExpanded ? null : epic.id)
                  }
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  )}
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: epic.color || '#c97cf4' }}
                  />
                  <span
                    className="capitalize font-medium truncate max-w-[120px] hover:text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent expanding/collapsing when clicking title
                      handleOpenWorkItem(epic.id);
                    }}
                  >
                    {epic.name}
                  </span>
                </div>
              </div>

              <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="bg-green-500"
                  style={{ width: `${epic.progress.done}%` }}
                  title={`Done: ${epic.progress.done}%`}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${epic.progress.inProgress}%` }}
                  title={`In Progress: ${epic.progress.inProgress}%`}
                />
                <div
                  className="bg-gray-300"
                  style={{ width: `${epic.progress.toDo}%` }}
                  title={`To Do: ${epic.progress.toDo}%`}
                />
              </div>

              {isExpanded && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-semibold">Start date</span>
                    <br />
                    {epic.startDate}
                  </div>
                  <div>
                    <span className="font-semibold">Due date</span>
                    <br />
                    {epic.dueDate}
                  </div>
                  <div>
                    <span className="font-semibold">Owner</span>
                    <br />
                    {epic.owner}
                  </div>
                  <button className="w-full mt-2 border rounded py-1 text-sm text-center hover:bg-gray-100 transition">
                    View all details
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Epic */}
      <Tooltip
        message="You are not authorized to use this feature."
        show={!isLeaderOrManager}
      >
        <button
          onClick={() => isLeaderOrManager && onCreateEpic()}
          className={`flex items-center gap-2 mt-4 text-sm ${
            isLeaderOrManager
              ? 'text-blue-600 hover:underline'
              : 'text-gray-400 cursor-not-allowed opacity-50'
          }`}
          disabled={!isLeaderOrManager}
        >
          <Plus className="w-4 h-4" />
          Create epic
        </button>
      </Tooltip>

      {selectedEpicId && (
        <EpicPopup
          onClose={handleCloseWorkItem}
          id={selectedEpicId}
        />
      )}
    </div>
  );
};

export default EpicColumn;