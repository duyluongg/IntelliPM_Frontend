// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\ProjectDetail\BacklogPage\BacklogBody.tsx
import React from 'react';
import EpicColumn from './EpicColumn';
import SprintColumn from './SprintColumn';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi'; // Import kiểu mới

// Định nghĩa Task và Sprint phù hợp với SprintColumn
interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
}

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

// Gỡ bỏ định nghĩa EpicResponseDTO ở đây để tránh xung đột
// Sử dụng EpicWithStatsResponseDTO thay vì EpicResponseDTO
interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: Sprint[];
  epics: EpicWithStatsResponseDTO[];
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
          <SprintColumn sprints={sprints} backlogTasks={sprints.length > 0 ? [] : sprints.flatMap(s => s.tasks)} />
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;