import React, { type Dispatch, type SetStateAction } from 'react';
import { Calendar, Pencil, Plus, Minus, Trash2 } from 'lucide-react';
import { type TaskState } from '../../../services/aiApi';
import galaxyaiIcon from '../../../assets/galaxyai.gif';

interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
  backendEpicId?: string;
}

interface EpicDisplayProps {
  epics: EpicState[];
  isGenerating: boolean;
  membersData: any;
  dropdownTaskId: string | null;
  setDropdownTaskId: (id: string | null) => void;
  handleOpenEditEpic: Dispatch<SetStateAction<EpicState | null>>;
  handleOpenEditPopup: Dispatch<SetStateAction<{ epicId: string; task: TaskState } | null>>;
  handleOpenDatePopup: Dispatch<
    SetStateAction<{ epicId: string; task: TaskState; field: 'startDate' | 'endDate' } | null>
  >;
  handleAddMember: (epicId: string, taskId: string, accountId: number) => void;
  handleRemoveMember: (epicId: string, taskId: string, accountId: number) => void;
  handleDeleteTask: (epicId: string, taskId: string) => void;
}

const EpicDisplay: React.FC<EpicDisplayProps> = ({
  epics,
  isGenerating,
  membersData,
  dropdownTaskId,
  setDropdownTaskId,
  handleOpenEditEpic,
  handleOpenEditPopup,
  handleOpenDatePopup,
  handleAddMember,
  handleRemoveMember,
  handleDeleteTask,
}) => {
  return (
    <div className='mb-8'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-5'>Epics & Tasks</h2>
      {epics.length === 0 ? (
        isGenerating ? (
          <div className='flex justify-center items-center py-8 bg-white/50 rounded-2xl shadow-md'>
            <div className='flex flex-col items-center gap-4'>
              <img src={galaxyaiIcon} alt='AI Processing' className='w-8 h-8' />
              <div className='flex items-center gap-2'>
                <span
                  style={{
                    background:
                      'linear-gradient(90deg, #1c73fd 0%, #4a90e2 25%, #00d4ff 50%, #4a90e2 75%, #1c73fd 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    animation: 'gradientLoading 1.8s ease-in-out infinite',
                  }}
                  className='text-2xl font-semibold'
                >
                  Processing with AI
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className='text-gray-500 italic'>
            No epics or tasks generated yet. Click "Generate with AI" or "Create Task" to start.
          </p>
        )
      ) : (
        epics.map((epic) => (
          <div key={epic.epicId} className='mb-8'>
            <div className='bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] p-5 rounded-2xl text-white shadow-lg flex justify-between items-center'>
              <div>
                <h3 className='text-xl font-bold'>
                  {epic.title}{' '}
                  <span className='text-sm font-normal'>
                    ({epic.backendEpicId || epic.epicId})
                  </span>
                </h3>
                <p className='text-sm mt-2 font-light'>{epic.description}</p>
                <div className='flex gap-4 mt-3 text-sm'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />{' '}
                    {new Date(epic.startDate).toLocaleDateString('en-GB')}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />{' '}
                    {new Date(epic.endDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleOpenEditEpic(epic)}
                className='p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200'
              >
                <Pencil className='w-5 h-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5'>
              {epic.tasks.map((task) => (
                <div
                  key={task.id}
                  className='bg-white border border-gray-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300'
                >
                  <h4 className='font-semibold text-lg text-[#1c73fd] mb-2'>{task.title}</h4>
                  <p className='text-sm text-gray-600 mb-2'>
                    <span className='font-medium'>Task ID:</span> {task.taskId || 'Not assigned'}
                  </p>
                  <p className='text-sm text-gray-600 mb-2'>
                    <span className='font-medium'>Description:</span> {task.description}
                  </p>
                  <div className='text-sm text-gray-600 mb-2'>
                    <span className='font-medium'>Start Date: </span>
                    <span
                      onClick={() => handleOpenDatePopup({ epicId: epic.epicId, task, field: 'startDate' })}
                      className='inline-flex items-center gap-1 cursor-pointer text-[#1c73fd] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors duration-200'
                    >
                      <Calendar className='w-4 h-4' />{' '}
                      {new Date(task.startDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className='text-sm text-gray-600 mb-2'>
                    <span className='font-medium'>End Date: </span>
                    <span
                      onClick={() => handleOpenDatePopup({ epicId: epic.epicId, task, field: 'endDate' })}
                      className='inline-flex items-center gap-1 cursor-pointer text-[#1c73fd] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors duration-200'
                    >
                      <Calendar className='w-4 h-4' />{' '}
                      {new Date(task.endDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mb-3'>
                    <span className='font-medium'>Suggested Role:</span> {task.suggestedRole}
                  </p>
                  <div className='relative'>
                    <div className='text-sm text-gray-600 flex items-center gap-2 mb-2'>
                      <span className='font-medium'>Assigned Members:</span>
                      <button
                        onClick={() =>
                          setDropdownTaskId(dropdownTaskId === task.id ? null : task.id)
                        }
                        className='text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200'
                      >
                        <Plus className='w-5 h-5' />
                      </button>
                    </div>
                    {dropdownTaskId === task.id && (
                      <div className='absolute z-10 top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto transition-all duration-200'>
                        <div className='px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50'>
                          Select Members
                        </div>
                        {membersData?.data?.map((member: any) => {
                          const isAssigned = task.assignedMembers.some(
                            (m: any) => m.accountId === member.accountId
                          );
                          return (
                            <div
                              key={member.accountId}
                              className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                                isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              onClick={() =>
                                !isAssigned &&
                                handleAddMember(epic.epicId, task.id, member.accountId)
                              }
                            >
                              <img
                                src={member.picture || 'https://i.pravatar.cc/40'}
                                alt={member.fullName}
                                className='w-6 h-6 rounded-full object-cover'
                                onError={(e) => {
                                  e.currentTarget.src = 'https://i.pravatar.cc/40';
                                }}
                              />
                              <span className='truncate'>
                                {member.fullName} (
                                {member.projectPositions[0]?.position || 'No Position'})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-3 mt-2'>
                    {task.assignedMembers.length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>No members assigned</p>
                    ) : (
                      task.assignedMembers.map((member: any) => (
                        <div
                          key={member.accountId}
                          className='flex items-center gap-2 relative group'
                        >
                          <button
                            onClick={() =>
                              handleRemoveMember(epic.epicId, task.id, member.accountId)
                            }
                            className='absolute -top-1 -left-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                          >
                            <Minus className='w-4 h-4' />
                          </button>
                          <img
                            src={member.picture}
                            alt={member.fullName}
                            className='w-7 h-7 rounded-full object-cover'
                            onError={(e) => {
                              e.currentTarget.src = 'https://i.pravatar.cc/40';
                            }}
                          />
                          <span className='text-sm text-gray-600 truncate'>
                            {member.fullName}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className='mt-4 flex justify-end gap-2'>
                    <button
                      onClick={() => handleOpenEditPopup({ epicId: epic.epicId, task })}
                      className='p-2 text-[#1c73fd] hover:bg-blue-50 rounded-full transition-colors duration-200'
                    >
                      <Pencil className='w-5 h-5' />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(epic.epicId, task.id)}
                      className='p-2 text-[#1c73fd] hover:bg-blue-50 rounded-full transition-colors duration-200'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EpicDisplay;