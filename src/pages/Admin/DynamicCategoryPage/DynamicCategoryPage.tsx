import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useGetAllQuery } from '../../../services/dynamicCategoryApi';
import DynamicCategoryList from './DynamicCategoryList';

const DynamicCategoryPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllQuery();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Filter categories based on searchTerm
  const filteredCategories = useMemo(() => {
    if (!data?.data) return [];
    const categories = Array.isArray(data.data) ? data.data : [data.data];
    return searchTerm
      ? categories.filter(
          (category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.categoryGroup.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : categories;
  }, [data, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-white min-h-screen"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dynamic Categories</h1>
        <button
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/admin/categories/create')}
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name or Category Group..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <DynamicCategoryList
        categories={filteredCategories}
        isLoading={isLoading}
        error={error}
      />
    </motion.div>
  );
};

export default DynamicCategoryPage;