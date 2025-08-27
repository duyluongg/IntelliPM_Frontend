import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUpdateMutation } from '../../../services/dynamicCategoryApi';
import { type DynamicCategory, type DynamicCategoryRequest } from '../../../services/dynamicCategoryApi';

interface DetailUpdateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: DynamicCategory | null;
}

const DetailUpdateCategoryModal: React.FC<DetailUpdateCategoryModalProps> = ({ isOpen, onClose, category }) => {
  const [updateCategory] = useUpdateMutation();
  const [formData, setFormData] = useState<DynamicCategoryRequest | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryGroup: category.categoryGroup,
        name: category.name,
        label: category.label,
        description: category.description,
        isActive: category.isActive,
        orderIndex: category.orderIndex,
        iconLink: category.iconLink,
        color: category.color,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !formData) return;
    try {
      await updateCategory({ id: category.id, request: formData }).unwrap();
      alert('Category updated successfully');
      onClose();
    } catch (err) {
      alert('Failed to update category');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => (prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === '' ? null : value,
    } : prev));
  };

  if (!isOpen || !category || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          type="button"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 pr-8">Update Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Group</label>
              <input
                type="text"
                name="categoryGroup"
                value={formData.categoryGroup || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                name="label"
                value={formData.label || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
              <input
                type="number"
                name="orderIndex"
                value={formData.orderIndex || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Link</label>
              <input
                type="text"
                name="iconLink"
                value={formData.iconLink || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>Is Active</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DetailUpdateCategoryModal;