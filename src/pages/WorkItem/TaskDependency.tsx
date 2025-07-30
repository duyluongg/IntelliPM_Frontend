import React, { useEffect, useState } from 'react';
import './TaskDependency.css';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectItemsByKeyQuery } from '../../services/projectApi';
import {
  useGetTaskDependenciesByLinkedFromQuery,
  useCreateTaskDependenciesMutation,
} from '../../services/taskDependencyApi';

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
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const { data: projectItems } = useGetProjectItemsByKeyQuery(projectKey);
  const { data: taskDepsData, refetch } = useGetTaskDependenciesByLinkedFromQuery(workItemId, {
    skip: !open || !workItemId,
  });

  const [nextId, setNextId] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  const [createTaskDependencies] = useCreateTaskDependenciesMutation();

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
      // .filter((dep) => typeof dep.id === 'string') // chỉ giữ lại các id là string
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

    try {
      // const response = await createTaskDependencies(payload).unwrap();
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
              className='delete-btn'
              onClick={() => {
                if (selectedIndex !== null) {
                  const updated = [...dependencies];
                  updated.splice(selectedIndex, 1);
                  setDependencies(updated);
                  setSelectedIndex(null);
                }
              }}
              disabled={selectedIndex === null}
            >
              DELETE
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
                      {projectItems?.data.map((item) => (
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
