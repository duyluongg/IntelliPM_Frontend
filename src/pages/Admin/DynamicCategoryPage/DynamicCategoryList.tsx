import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDeleteMutation, useUpdateStatusMutation } from '../../../services/dynamicCategoryApi';

interface DynamicCategoryListProps {
  categories: DynamicCategory[];
  isLoading: boolean;
  error: any;
}

const DynamicCategoryList: React.FC<DynamicCategoryListProps> = ({ categories, isLoading, error }) => {
  const navigate = useNavigate();
  const [deleteCategory] = useDeleteMutation();
  const [updateStatus] = useUpdateStatusMutation();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Handle delete category
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        alert('Category deleted successfully');
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateStatus({ id, isActive: !currentStatus }).unwrap();
      alert('Category status updated successfully');
    } catch (err) {
      alert('Failed to update category status');
    }
  };

  // Handle image error to show fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.currentTarget;
    const parentElement = imgElement.parentElement;
    if (parentElement) {
      const fallbackElement = parentElement.querySelector('.fallback-icon') as HTMLElement | null;
      if (fallbackElement) {
        imgElement.style.display = 'none';
        fallbackElement.style.display = 'flex';
      }
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load categories.</div>;
  }

  if (!categories.length) {
    return <div className="text-center text-gray-500">No categories found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-x-auto mt-6"
    >
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Icon</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Category Group</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Label</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Order Index</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Color</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Created At</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.tr
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.02 }}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-4 flex items-center">
                  {category.iconLink ? (
                    <img
                      src={category.iconLink}
                      alt={`${category.name}'s icon`}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center fallback-icon"
                    style={{ display: category.iconLink ? 'none' : 'flex' }}
                  >
                    <ImageOff className="w-5 h-5 text-gray-400" />
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                    aria-label={`Edit ${category.categoryGroup}`}
                  >
                    {category.categoryGroup}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{category.name}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{category.label}</td>
                <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={category.description}>
                  {category.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{category.orderIndex}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#000000' }}
                    />
                    <span>{category.color || '-'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(category.createdAt)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <button
                    className="flex items-center space-x-2"
                    onClick={() => handleStatusToggle(category.id, category.isActive)}
                    aria-label={`Toggle status for ${category.name}`}
                  >
                    {category.isActive ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{category.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                      aria-label={`Edit ${category.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(category.id)}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default DynamicCategoryList;