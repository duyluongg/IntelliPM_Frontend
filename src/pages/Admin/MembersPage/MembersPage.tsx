// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\Admin\MembersPage.tsx
import React, { useState, useEffect } from 'react';
import { useGetAccountsQuery } from '../../../services/adminApi';
import MemberList from './MemberList';
import RoleFilter from './RoleFilter';
import { motion } from 'framer-motion';

const MembersPage: React.FC = () => {
  const { data, isLoading, error } = useGetAccountsQuery();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);

  // Lọc dữ liệu khi data hoặc selectedRole thay đổi
  useEffect(() => {
    if (data?.data) {
      setFilteredMembers(
        !selectedRole ? data.data : data.data.filter((member) => member.role === selectedRole)
      );
    }
  }, [data, selectedRole]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-white min-h-screen"
    >
      <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      <MemberList
        members={filteredMembers}
        isLoading={isLoading}
        error={error}
      />
    </motion.div>
  );
};

export default MembersPage;