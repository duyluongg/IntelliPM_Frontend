import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, ToggleLeft, ToggleRight, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { type DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDeleteMutation, useUpdateStatusMutation } from '../../../services/dynamicCategoryApi';

interface DynamicCategoryListProps {
  categories: DynamicCategory[];
  isLoading: boolean;
  error: any;
  onOpenUpdate: (category: DynamicCategory) => void;
}

const DynamicCategoryList: React.FC<DynamicCategoryListProps> = ({ categories, isLoading, error, onOpenUpdate }) => {
  const [deleteCategory] = useDeleteMutation();
  const [updateStatus] = useUpdateStatusMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        setCurrentPage(1); // Reset to first page after deletion
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

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return categories.slice(startIndex, startIndex + itemsPerPage);
  }, [categories, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate visible page range (e.g., current page ± 2, max 5 pages)
  const getVisiblePages = () => {
    const range = 2; // Show ±2 pages around current page
    let startPage = Math.max(1, currentPage - range);
    let endPage = Math.min(totalPages, currentPage + range);

    const pages = [];
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('…');
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007fd3]"></div>
        <span className="ml-3 text-gray-500">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
        Failed to load categories.
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
        No categories found.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          key={currentPage} // Trigger animation on page change
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
                {paginatedCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.02 }}
                    className="border-b hover:bg-gray-50 transition-colors duration-200 even:bg-gray-50/50"
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
                        onClick={() => onOpenUpdate(category)}
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
                          <ToggleRight className="w-4 h-4 text-[#007fd3]" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                        <span>{category.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button
                          className="text-[#007fd3] hover:text-[#006bb3]"
                          onClick={() => onOpenUpdate(category)}
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

        {categories.length > itemsPerPage && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({categories.length} categories)
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  p-2 rounded-full bg-[#007fd3] text-white hover:bg-[#006bb3] transition-colors
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
                `}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              {getVisiblePages().map((page, index) => (
                <motion.button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${currentPage === page ? 'bg-[#007fd3] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    transition-colors shadow-sm hover:shadow-md
                    ${typeof page !== 'number' ? 'cursor-default' : ''}
                  `}
                  whileHover={{ scale: typeof page === 'number' ? 1.05 : 1 }}
                  whileTap={{ scale: typeof page === 'number' ? 0.95 : 1 }}
                  aria-label={typeof page === 'number' ? `Go to page ${page}` : undefined}
                >
                  {page}
                </motion.button>
              ))}
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  p-2 rounded-full bg-[#007fd3] text-white hover:bg-[#006bb3] transition-colors
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
                `}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DynamicCategoryList;