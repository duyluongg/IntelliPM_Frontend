
import React, { useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useGetAllProjectsQuery, type ProjectDetails } from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery, type DynamicCategory } from '../../../services/dynamicCategoryApi';

interface StatusFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  const { data: projectsData } = useGetAllProjectsQuery();
  const { data: statusData } = useGetCategoriesByGroupQuery('project_status');

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = { null: projectsData?.data?.length || 0 };
    if (projectsData?.data) {
      projectsData.data.forEach((project: ProjectDetails) => {
        const status = project.status.toUpperCase();
        counts[status] = (counts[status] || 0) + 1;
      });
    }
    return counts;
  }, [projectsData]);

  // Define color palette for status styles
  const colorPalette = [
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', ring: 'ring-blue-200' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-600', ring: 'ring-green-200' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-200' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', ring: 'ring-purple-200' },
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', ring: 'ring-teal-200' },
    { bg: 'bg-red-500', hover: 'hover:bg-red-600', ring: 'ring-red-200' },
    { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', ring: 'ring-indigo-200' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', ring: 'ring-pink-200' },
  ];

  // Generate status styles
  const statusStyles = useMemo(() => {
    const styles: { [key: string]: { bg: string; hover: string; text: string; ring: string } } = {
      null: {
        bg: 'bg-gray-400',
        hover: 'hover:bg-gray-500',
        text: 'text-white',
        ring: 'ring-gray-200',
      },
    };
    (statusData?.data || []).forEach((status: DynamicCategory, index: number) => {
      const color = colorPalette[index % colorPalette.length];
      styles[status.name.toUpperCase()] = {
        bg: color.bg,
        hover: color.hover,
        text: 'text-white',
        ring: color.ring,
      };
    });
    return styles;
  }, [statusData]);

  // Format status text
  const formatText = (text: string | null) => {
    if (!text) return 'All Statuses';
    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Generate status buttons
  const statuses = useMemo(() => {
    const activeStatuses = (statusData?.data || []).filter((status: DynamicCategory) => status.isActive);
    return [{ id: 0, name: null, label: 'All Statuses', isActive: true }, ...activeStatuses];
  }, [statusData]);

  // Define button variants with explicit Variants type
  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Status Filters</h2>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {statuses.map((status: any, index: number) => {
            const statusKey = status.name?.toUpperCase() || 'null';
            const count = statusCounts[statusKey] || 0;
            const style = statusStyles[statusKey] || statusStyles['null'];
            const isSelected = selectedStatus === status.name;

            return (
              <motion.button
                key={status.id || 'all'}
                custom={index}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStatusChange(status.name)}
                className={`
                  px-4 py-2 rounded-full font-medium text-sm transition-all duration-300
                  ${isSelected ? `${style.bg} ${style.ring} ring-2 ring-offset-2` : `${style.bg} ${style.hover}`}
                  ${style.text} shadow-md hover:shadow-lg flex items-center justify-center gap-2
                `}
                aria-label={`Filter by ${status.label || formatText(status.name)}`}
                role="button"
              >
                <span>{status.label || formatText(status.name)}</span>
                <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                  {count}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StatusFilter;
