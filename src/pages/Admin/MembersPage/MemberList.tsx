// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\components\Admin\MemberList.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberListProps {
  members: any[];
  isLoading: boolean;
  error: any;
}

const MemberList: React.FC<MemberListProps> = ({ members, isLoading, error }) => {
  if (isLoading) return <div className="text-center text-gray-500">Loading members...</div>;
  if (error) return <div className="text-center text-red-500">Failed to load members.</div>;
  if (!members.length) return <div className="text-center text-gray-500">No members found.</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="overflow-x-auto mt-6"
    >
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Avatar</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Full Name</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Username</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Position</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {members.map((member, index) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeInOut' }}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-4">
                  <img
                    src={member.picture}
                    alt={`${member.fullName}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{member.fullName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{member.username}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{member.role}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{member.position}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{member.email}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{member.status}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default MemberList;