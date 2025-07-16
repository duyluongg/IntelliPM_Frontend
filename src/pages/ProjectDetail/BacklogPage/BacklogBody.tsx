import React from 'react';
import EpicColumn from './EpicColumn';

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

interface EpicResponseDTO {
  id: string;
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  reporterId: number | null;
  assignedBy: number | null;
  assignedByFullname: string | null;
  assignedByPicture: string | null;
  reporterFullname: string | null;
  reporterPicture: string | null;
  sprintId: number | null;
  sprintName: string | null;
  sprintGoal: string | null;
}

interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: Sprint[];
  epics: EpicResponseDTO[];
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics }) => {
  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 min-w-[640px]">
        {/* Epic Column */}
        <div className="w-full sm:w-1/3 md:w-1/4 min-w-[250px]">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>

        {/* Sprint Column */}
        <div className="w-full sm:w-2/3 md:w-3/4">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="mb-6 border border-gray-300 rounded-lg p-3 bg-white shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{sprint.name}</h3>
              <ul className="space-y-2">
                {sprint.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-2 bg-gray-50 rounded-lg flex justify-between items-center text-sm"
                  >
                    <strong className="text-gray-900 truncate max-w-[200px]">{task.title}</strong>
                    <span className="text-gray-600">{task.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;