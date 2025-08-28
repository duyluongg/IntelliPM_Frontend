import React, { useState, useEffect } from 'react';
import { useGetAccountsQuery } from '../../../services/adminApi';
import MemberList from './MemberList';
import RoleFilter from './RoleFilter';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const MembersPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetAccountsQuery();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);

  // Filter data when data or selectedRole changes
  useEffect(() => {
    if (data?.data) {
      setFilteredMembers(
        !selectedRole ? data.data : data.data.filter((member) => member.role === selectedRole)
      );
    }
  }, [data, selectedRole]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!data?.data) return { total: 0, active: 0, inactive: 0, pending: 0 };
    
    const total = data.data.length;
    const active = data.data.filter(m => m.status === 'ACTIVE' || m.status === 'VERIFIED').length;
    const inactive = data.data.filter(m => m.status === 'INACTIVE' || m.status === 'BANNED').length;
    const pending = data.data.filter(m => m.status === 'UNVERIFIED').length;
    
    return { total, active, inactive, pending };
  }, [data]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-8 h-8 ${color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Members"
            value={stats.total}
            color="border-l-blue-500"
          />
          <StatCard
            icon={UserCheck}
            label="Active Members"
            value={stats.active}
            color="border-l-green-500"
          />
          <StatCard
            icon={UserX}
            label="Inactive Members"
            value={stats.inactive}
            color="border-l-red-500"
          />
          <StatCard
            icon={Clock}
            label="Pending Members"
            value={stats.pending}
            color="border-l-yellow-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <RoleFilter selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        <MemberList
          members={filteredMembers}
          isLoading={isLoading}
          error={error}
          refetch={refetch} // Pass refetch to MemberList
        />
      </div>
    </motion.div>
  );
};

export default MembersPage;