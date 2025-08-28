import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw, X, ChevronDown } from 'lucide-react';
import {
  useGetAllAiResponseHistoriesQuery,
} from '../../../services/aiResponseHistoryApi';
import { useGetAllAiResponseEvaluationsQuery } from '../../../services/aiResponseEvaluationApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi'; // Adjust import path
import AiResponseHistoryList from './AiResponseHistoryList';
import AiResponseEvaluationList from './AiResponseEvaluationList';

const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill='none'
    viewBox='0 0 16 16'
    role='presentation'
    {...props}
    style={{ color: 'var(--ds-icon, #44546F)' }}
  >
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7'
      clipRule='evenodd'
    />
  </svg>
);

const AiResponsePage: React.FC = () => {
  const [selectedAiFeature, setSelectedAiFeature] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch AI features from categories
  const {
    data: aiFeatures,
    isLoading: isLoadingFeatures,
    error: errorFeatures,
  } = useGetCategoriesByGroupQuery('ai_feature');

  const {
    data: histories,
    isLoading: isLoadingHistories,
    error: errorHistories,
    refetch: refetchHistories,
  } = useGetAllAiResponseHistoriesQuery();

  const {
    data: evaluations,
    isLoading: isLoadingEvaluations,
    error: errorEvaluations,
    refetch: refetchEvaluations,
  } = useGetAllAiResponseEvaluationsQuery();

  // Filter histories based on selected AI feature and search term
  const filteredHistories = useMemo(() => {
    if (!histories) return [];
    
    let filtered = histories;
    
    // Filter by AI feature
    if (selectedAiFeature) {
      filtered = filtered.filter(history => 
        history.aiFeature === selectedAiFeature
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(history =>
        history.createdByFullname?.toLowerCase().includes(search) ||
        history.aiFeature?.toLowerCase().includes(search) ||
        history.status?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [histories, selectedAiFeature, searchTerm]);

  const handleRefresh = () => {
    refetchHistories();
    refetchEvaluations();
  };

  const clearFilters = () => {
    setSelectedAiFeature('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedAiFeature || searchTerm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Response Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and analyze AI response histories and evaluations
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Filters</span>
                  {hasActiveFilters && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                    >
                      Active
                    </motion.span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Input */}
                <div className='flex items-center border border-gray-300 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white'>
                  <CustomSearchIcon className='w-4 h-4 text-gray-400 mr-2' />
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Search by name, feature, or status...'
                    className='flex-1 bg-white border-none outline-none appearance-none text-sm text-gray-700 placeholder-gray-400'
                    style={{ all: 'unset', width: '100%' }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* AI Feature Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <span className={selectedAiFeature ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedAiFeature || 'Select AI Feature'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isFilterOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        <button
                          onClick={() => {
                            setSelectedAiFeature('');
                            setIsFilterOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150"
                        >
                          <span className="text-gray-500">All Features</span>
                        </button>
                        {isLoadingFeatures ? (
                          <div className="px-4 py-2 text-gray-500">Loading...</div>
                        ) : errorFeatures ? (
                          <div className="px-4 py-2 text-red-500">Error loading features</div>
                        ) : (
                          aiFeatures?.data?.map((feature: any) => (
                            <button
                              key={feature.id}
                              onClick={() => {
                                setSelectedAiFeature(feature.name);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                                selectedAiFeature === feature.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              {feature.name}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredHistories.length} of {histories?.length || 0} histories
                </span>
                {selectedAiFeature && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {selectedAiFeature}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Response History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <h2 className="text-xl font-semibold text-white">AI Response History</h2>
              <p className="text-blue-100 text-sm mt-1">
                Track and manage AI response interactions
              </p>
            </div>
            <div className="p-6">
              <AiResponseHistoryList
                histories={filteredHistories}
                isLoading={isLoadingHistories}
                error={errorHistories}
              />
            </div>
          </div>
        </motion.div>

        {/* AI Response Evaluations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600">
              <h2 className="text-xl font-semibold text-white">AI Response Evaluations</h2>
              <p className="text-purple-100 text-sm mt-1">
                Review feedback and ratings from users
              </p>
            </div>
            <div className="p-6">
              <AiResponseEvaluationList
                evaluations={evaluations ?? []}
                isLoading={isLoadingEvaluations}
                error={errorEvaluations}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AiResponsePage;