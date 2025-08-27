import React, { useState, useMemo, Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown } from 'lucide-react';
import { useGetAllQuery, useGetDistinctCategoryGroupsQuery } from '../../../services/dynamicCategoryApi';
import DynamicCategoryList from './DynamicCategoryList';
import CreateCategoryModal from './CreateCategoryModal';
import DetailUpdateCategoryModal from './DetailUpdateCategoryModal';
import { type DynamicCategory } from '../../../services/dynamicCategoryApi';

// ErrorBoundary component to handle runtime errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-500">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const DynamicCategoryPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllQuery();
  const { data: categoryGroupsData } = useGetDistinctCategoryGroupsQuery();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DynamicCategory | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get unique category groups for dropdown
  const categoryGroups = useMemo(() => {
    return categoryGroupsData?.data ? ['All', ...[...categoryGroupsData.data].sort()] : ['All'];
  }, [categoryGroupsData]);

  // Filter categories based on searchTerm and selectedGroup
  const filteredCategories = useMemo(() => {
    if (!data?.data) return [];
    const categories = Array.isArray(data.data) ? data.data : [data.data];
    return categories.filter((category) =>
      (selectedGroup === '' || selectedGroup === 'All' || category.categoryGroup === selectedGroup) &&
      (searchTerm === '' ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.categoryGroup.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm, selectedGroup]);

  // Handle category group selection from dropdown
  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group === 'All' ? '' : group);
    setIsDropdownOpen(false);
  };

  // Handle opening update modal
  const handleOpenUpdate = (category: DynamicCategory) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  return (
    <ErrorBoundary>
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by Name or Category Group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-300 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label={`Select category group, current: ${selectedGroup || 'All'}`}
            >
              <span>{selectedGroup || 'All'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {categoryGroups.map((group) => (
                  <div
                    key={group}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleGroupSelect(group)}
                  >
                    {group}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DynamicCategoryList
          categories={filteredCategories}
          isLoading={isLoading}
          error={error}
          onOpenUpdate={handleOpenUpdate}
        />

        <CreateCategoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        <DetailUpdateCategoryModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          category={selectedCategory}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

export default DynamicCategoryPage;