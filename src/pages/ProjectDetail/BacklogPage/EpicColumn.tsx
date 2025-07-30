import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi';

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

  return (
    <div className="w-full min-w-[250px] sm:w-1/3 md:w-1/4 p-4 bg-white border rounded shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Epic</h3>
        <button className="text-xl text-gray-600 hover:text-gray-800">×</button>
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
                    <ChevronDown className="w-4 h-4 text--700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  )}
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: epic.color || '#c97cf4' }}
                  />
                  <span className="capitalize font-medium truncate max-w-[120px]">
                    {epic.name}
                  </span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
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
      <button
        onClick={onCreateEpic}
        className="flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
      >
        <Plus className="w-4 h-4" />
        Create epic
      </button>
    </div>
  );
};

export default EpicColumn;
