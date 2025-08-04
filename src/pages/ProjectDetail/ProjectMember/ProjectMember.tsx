import { useState } from 'react';
import React from 'react';

const sampleData = [
  {
    name: 'Hanntnse171332',
    email: 'hanntnse171332@fpt.edu.vn',
    tasks: [
      {
        title: '8. Meeting',
        project: 'IT Project Plan',
        progress: 0
      }
    ]
  },
  {
    name: 'Jennifer Jones',
    email: 'jennifer@example.com',
    tasks: [
      { title: 'Design Phase', project: 'Marketing Campaign', progress: 60 }
    ]
  }
];

const ProjectMember: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState(sampleData[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-full">
      {/* Sidebar */}
      <div className="border-r bg-white p-4">
        <h3 className="font-semibold text-gray-700 mb-2">People</h3>
        <ul>
          {sampleData.map((member) => (
            <li
              key={member.email}
              onClick={() => setSelectedMember(member)}
              className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm ${
                selectedMember.email === member.email ? 'bg-blue-100 font-medium' : ''
              }`}
            >
              {member.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="col-span-2 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {selectedMember.name}&apos;s Tasks
        </h2>
        <div className="grid gap-4">
          {selectedMember.tasks.map((task, idx) => (
            <div
              key={idx}
              className="bg-white shadow rounded-lg p-4 border"
            >
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {task.title}
                </span>
                <span className="text-xs text-gray-500">
                  {task.project}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectMember;