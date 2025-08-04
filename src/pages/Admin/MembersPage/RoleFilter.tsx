// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\components\Admin\RoleFilter.tsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { useGetAccountsQuery } from '../../../services/adminApi';

interface RoleFilterProps {
  selectedRole: string | null;
  onRoleChange: (role: string | null) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({ selectedRole, onRoleChange }) => {
  const { data } = useGetAccountsQuery();

  // Đếm số lượng thành viên theo role
  const roleCounts = useMemo(() => {
    if (!data?.data) return {};
    return data.data.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }, [data]);

  const roles = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER', 'CLIENT', null];

  // Màu sắc chuyên nghiệp với gradient
  const roleStyles: { [key: string]: { bg: string; hover: string; text: string } } & {
    PROJECT_MANAGER: { bg: string; hover: string; text: string };
    TEAM_MEMBER: { bg: string; hover: string; text: string };
    TEAM_LEADER: { bg: string; hover: string; text: string };
    CLIENT: { bg: string; hover: string; text: string };
    null: { bg: string; hover: string; text: string };
  } = {
    PROJECT_MANAGER: { bg: 'bg-gradient-to-r from-blue-600 to-blue-700', hover: 'hover:from-blue-700 hover:to-blue-800', text: 'text-white' },
    TEAM_MEMBER: { bg: 'bg-gradient-to-r from-green-600 to-green-700', hover: 'hover:from-green-700 hover:to-green-800', text: 'text-white' },
    TEAM_LEADER: { bg: 'bg-gradient-to-r from-purple-600 to-purple-700', hover: 'hover:from-purple-700 hover:to-purple-800', text: 'text-white' },
    CLIENT: { bg: 'bg-gradient-to-r from-yellow-600 to-yellow-700', hover: 'hover:from-yellow-700 hover:to-yellow-800', text: 'text-white' },
    null: { bg: 'bg-gradient-to-r from-gray-600 to-gray-700', hover: 'hover:from-gray-700 hover:to-gray-800', text: 'text-white' },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: easeInOut,
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Role Filters</h2>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {roles.map((role, index) => {
            const count = role ? roleCounts[role] || 0 : (data?.data?.length || 0);
            const style = roleStyles[role || 'null'];
            return (
              <motion.button
                key={role || 'all'}
                custom={index}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover={{ scale: 1.05 }}
                onClick={() => onRoleChange(role)}
                className={`
                  px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300
                  ${selectedRole === role ? `${style.bg} ${style.text}` : `${style.bg} ${style.hover}`}
                  ${style.text} shadow-md
                `}
              >
                {role || 'All Roles'} <span className="ml-2 bg-white bg-opacity-30 px-2.5 py-0.5 rounded-full text-xs">{count}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RoleFilter;