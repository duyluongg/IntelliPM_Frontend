import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetProjectItemsByKeyQuery } from '../../services/projectApi';
import {
  useGetTaskDependenciesByLinkedFromQuery,
  useCreateTaskDependenciesMutation,
  useDeleteTaskDependencyByIdMutation,
} from '../../services/taskDependencyApi';
import { useGetCategoriesByGroupQuery } from '../../services/dynamicCategoryApi';
import { Trash2, Loader2 } from 'lucide-react';

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
  const { projectKey: paramProjectKey } = useParams();
  const [searchParams] = useSearchParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';

  const { data: projectItems } = useGetProjectItemsByKeyQuery(projectKey);
  const { data: taskDepsData, refetch } = useGetTaskDependenciesByLinkedFromQuery(workItemId, {
    skip: !open || !workItemId,
  });

  const { data: categoryData, isLoading: isCategoryLoading } = useGetCategoriesByGroupQuery('task_dependency_type');

  const [nextId, setNextId] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dependencyToDelete, setDependencyToDelete] = useState<Dependency | null>(null);

  const [createTaskDependencies] = useCreateTaskDependenciesMutation();
  const [deleteTaskDependency] = useDeleteTaskDependencyByIdMutation();

  // Mock data cho task_dependency_type từ dynamic_category (thay bằng API call thực tế)
  // const dependencyTypes = [
  //   { name: 'FINISH_START', label: 'Finish-to-Start' },
  //   { name: 'START_START', label: 'Start-to-Start' },
  //   { name: 'FINISH_FINISH', label: 'Finish-to-Finish' },
  //   { name: 'START_FINISH', label: 'Start-to-Finish' },
  // ];

  const dependencyTypes = categoryData?.data.map((item) => ({
    name: item.name,
    label: item.label || item.name, // Use label if available, fallback to name
  })) || [];

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
    setIsLoading(true);
    const payload = dependencies
      .filter((dep) => isNaN(Number(dep.id)))
      .map((dep) => ({
        id: dep.key,
        fromType: type,
        linkedFrom: workItemId,
        toType: projectItems?.data.find((i) => i.id === dep.id)?.type || '',
        linkedTo: dep.id,
        type: dep.type,
      }));
    console.log('📤 Payload gửi về API:', payload);

    if (payload.length === 0) {
      setIsLoading(false);
      onClose();
      return;
    }

    try {
      await createTaskDependencies({ dependencies: payload }).unwrap();
      console.log('✅ Created/Updated:', payload);
      await refetch();
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('❌ Error creating dependencies:', error);
      alert('Lỗi khi lưu task dependency');
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (dep: Dependency, index: number) => {
    setDependencyToDelete(dep);
    setSelectedIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (dependencyToDelete && selectedIndex !== null) {
      setIsLoading(true);
      if (!isNaN(Number(dependencyToDelete.key)) && Number(dependencyToDelete.key) > 0) {
        try {
          await deleteTaskDependency(Number(dependencyToDelete.key)).unwrap();
          console.log('🗑️ Deleted dependency with id:', dependencyToDelete.key);
          await refetch();
        } catch (error) {
          console.error('❌ Lỗi xoá dependency:', error);
          alert('Lỗi khi xoá task dependency');
        }
      }

      const updated = [...dependencies];
      updated.splice(selectedIndex, 1);
      setDependencies(updated);
      setSelectedIndex(null);
      setShowDeleteModal(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{workItemId} Dependencies</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            onClick={() => {
              setDependencies((prev) => [
                ...prev,
                { key: 0, id: nextId.toString(), name: '', type: dependencyTypes[0].name, lag: 0 },
              ]);
              setNextId((prev) => prev + 1);
            }}
            disabled={isLoading}
          >
            + Add Dependency
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
            onClick={() => {
              if (selectedIndex !== null) {
                handleDeleteClick(dependencies[selectedIndex], selectedIndex);
              }
            }}
            disabled={selectedIndex === null || isLoading}
            title="Delete selected"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-sm font-medium text-gray-700">#</th>
                <th className="p-3 text-sm font-medium text-gray-700">Link to</th>
                <th className="p-3 text-sm font-medium text-gray-700">Type</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3">
                    <select
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dep.id}
                      onChange={(e) => {
                        const selected = projectItems?.data.find((item) => item.id === e.target.value);
                        const updated = [...dependencies];
                        updated[index] = {
                          ...updated[index],
                          id: selected?.id || '',
                          name: selected?.name || '',
                        };
                        setDependencies(updated);
                      }}
                      disabled={isLoading}
                    >
                      <option value="">-- Select Item --</option>
                      {projectItems?.data
                        .filter((item) => item.id !== workItemId)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            [{item.type}] {item.id} - {item.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dep.type}
                      onChange={(e) => {
                        const updated = [...dependencies];
                        updated[index].type = e.target.value;
                        setDependencies(updated);
                      }}
                      disabled={isLoading}
                    >
                      {dependencyTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : '✔'} OK
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            ✖ Cancel
          </button>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the dependency "
                {dependencyToDelete?.name || dependencyToDelete?.id}"?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={confirmDelete}
                  disabled={isLoading}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDependency;
