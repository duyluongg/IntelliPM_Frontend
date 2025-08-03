import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TaskDependency.css';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectItemsByKeyQuery } from '../../services/projectApi';
import {
  useGetTaskDependenciesByLinkedFromQuery,
  useCreateTaskDependenciesMutation,
  useDeleteTaskDependencyByIdMutation,
} from '../../services/taskDependencyApi';
import { Trash2 } from 'lucide-react';

interface Dependency {
  key: number;
  id: string;
  name: string;
  type: string;
  lag: number;
}

interface TaskDependencyProps {
  open: boolean;
  onClose: () => void;
  workItemId: string;
  type: string;
}

const TaskDependency: React.FC<TaskDependencyProps> = ({ open, onClose, workItemId, type }) => {
  // const [searchParams] = useSearchParams();
  // const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchParams] = useSearchParams();
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';

  const { data: projectItems } = useGetProjectItemsByKeyQuery(projectKey);
  const { data: taskDepsData, refetch } = useGetTaskDependenciesByLinkedFromQuery(workItemId, {
    skip: !open || !workItemId,
  });

  const [nextId, setNextId] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  const [createTaskDependencies] = useCreateTaskDependenciesMutation();
  const [deleteTaskDependency] = useDeleteTaskDependencyByIdMutation();

  useEffect(() => {
    if (open && taskDepsData) {
      console.log('📥 Dữ liệu từ DB:', taskDepsData);
      const mapped = taskDepsData.map((item) => ({
        key: item.id,
        id: item.linkedTo,
        name: projectItems?.data.find((i) => i.id === item.linkedTo)?.name || item.linkedTo,
        type: item.type,
        lag: 0,
      }));
      setDependencies(mapped);
    }
  }, [open, taskDepsData, projectItems]);

  if (!open) return null;

  const handleSubmit = async () => {
    const payload = dependencies
      .filter((dep) => isNaN(Number(dep.id)))
      .map((dep) => ({
        id: dep.key, // Nếu = 0 hoặc không có nghĩa là tạo mới
        fromType: type,
        linkedFrom: workItemId,
        toType: projectItems?.data.find((i) => i.id === dep.id)?.type || '',
        linkedTo: dep.id,
        type: dep.type,
      }));
    console.log('📤 Payload gửi về API:', payload);

    if (payload.length === 0) {
      onClose();
      return;
    }

    try {
      const response = await createTaskDependencies({ dependencies: payload }).unwrap();
      console.log('✅ Created/Updated:', response);
      await refetch();
      onClose();
    } catch (error) {
      console.error('❌ Error creating dependencies:', error);
      alert('Lỗi khi lưu task dependency');
    }
  };

  return (
    <div className='overlay'>
      <div className='popup'>
        <div className='popup-header'>
          <span className='popup-title'>{workItemId}</span>
          <button className='close-btn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='content'>
          <div className='toolbar'>
            <button
              className='add-btn'
              onClick={() => {
                setDependencies((prev) => [
                  ...prev,
                  { key: 0, id: nextId.toString(), name: '', type: 'START_START', lag: 0 },
                ]);
                setNextId((prev) => prev + 1);
              }}
            >
              + ADD
            </button>

            <button
              className='icon-btn'
              onClick={async () => {
                if (selectedIndex !== null) {
                  const selectedDep = dependencies[selectedIndex];

                  const confirmed = window.confirm(
                    `Are you sure you want to delete this dependency? "${
                      selectedDep.name || selectedDep.id
                    }" không?`
                  );

                  if (!confirmed) return;

                  if (!isNaN(Number(selectedDep.key)) && Number(selectedDep.key) > 0) {
                    try {
                      await deleteTaskDependency(Number(selectedDep.key)).unwrap();
                      console.log('🗑️ Deleted dependency with id:', selectedDep.key);
                      await refetch();
                    } catch (error) {
                      console.error('❌ Lỗi xoá dependency:', error);
                      alert('Lỗi khi xoá task dependency');
                    }
                  }

                  // Cập nhật UI sau khi xoá
                  const updated = [...dependencies];
                  updated.splice(selectedIndex, 1);
                  setDependencies(updated);
                  setSelectedIndex(null);
                }
              }}
              disabled={selectedIndex === null}
              title='Delete selected'
            >
              <Trash2 size={18} />
            </button>
          </div>

          <table className='dependency-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Link to</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep, index) => (
                <tr
                  key={index}
                  className={selectedIndex === index ? 'selected-row' : ''}
                  onClick={() => {
                    setSelectedIndex(index);
                    console.log('Selected dependency ID:', dep.key);
                    console.log('Selected dependency linkto id:', dep.id);
                  }}
                >
                  <td>{index + 1}</td>
                  <td>
                    <select
                      value={dep.id}
                      onChange={(e) => {
                        const selected = projectItems?.data.find(
                          (item) => item.id === e.target.value
                        );
                        const updated = [...dependencies];
                        updated[index] = {
                          ...updated[index],
                          id: selected?.id || '',
                          name: selected?.name || '',
                        };
                        setDependencies(updated);
                      }}
                    >
                      <option value=''>-- Select Item --</option>
                      {/* {projectItems?.data.map((item) => (
                        <option key={item.id} value={item.id}>
                          [{item.type}] {item.id} - {item.name}
                        </option>
                      ))} */}
                      {projectItems?.data
                        .filter((item) => item.id !== workItemId)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            [{item.type}] {item.id} - {item.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={dep.type}
                      onChange={(e) => {
                        const updated = [...dependencies];
                        updated[index].type = e.target.value;
                        setDependencies(updated);
                      }}
                    >
                      <option value='START_START'>START-START</option>
                      <option value='START_FINISH'>START-FINISH</option>
                      <option value='FINISH_START'>FINISH-START</option>
                      <option value='FINISH_FINISH'>FINISH-FINISH</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='popup-footer'>
          <button className='ok-btn' onClick={handleSubmit}>
            ✔ OK
          </button>
          <button className='cancel-btn' onClick={onClose}>
            ✖ CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDependency;
