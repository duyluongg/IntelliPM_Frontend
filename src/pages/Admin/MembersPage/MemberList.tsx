import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Edit3, Check, X, ChevronDown } from 'lucide-react';
import { 
  useChangeAccountStatusMutation, 
  useChangeAccountRoleMutation, 
  useChangeAccountPositionMutation,
  type ChangeAccountPositionRequest,
  type ChangeAccountRoleRequest,
  type ChangeAccountStatusRequest
} from '../../../services/accountApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

interface MemberListProps {
  members: any[];
  isLoading: boolean;
  error: any;
  refetch: () => void; // Add refetch prop
}

interface EditState {
  memberId: number | null;
  field: 'role' | 'position' | 'status' | null;
  value: string;
}

const MemberList: React.FC<MemberListProps> = ({ members, isLoading, error, refetch }) => {
  const [editState, setEditState] = useState<EditState>({ memberId: null, field: null, value: '' });
  const [dropdownOpen, setDropdownOpen] = useState<{ memberId: number; field: string } | null>(null);
  
  const [changeStatus] = useChangeAccountStatusMutation();
  const [changeRole] = useChangeAccountRoleMutation();
  const [changePosition] = useChangeAccountPositionMutation();

  // Fetch dynamic categories for role, status, and position
  const { data: roleData, isLoading: isLoadingRoles } = useGetCategoriesByGroupQuery('account_role');
  const { data: statusData, isLoading: isLoadingStatuses } = useGetCategoriesByGroupQuery('account_status');
  const { data: positionData, isLoading: isLoadingPositions } = useGetCategoriesByGroupQuery('account_position');

  // Extract options from API data
  const roleOptions = roleData?.data?.map(category => ({
    value: category.name,
    label: category.label,
    color: category.color
  })) || [];
  const statusOptions = statusData?.data?.map(category => ({
    value: category.name,
    label: category.label,
    color: category.color
  })) || [];
  const positionOptions = positionData?.data?.map(category => ({
    value: category.name,
    label: category.label,
    color: category.color
  })) || [];

  if (isLoading || isLoadingRoles || isLoadingStatuses || isLoadingPositions) {
    return <div className="text-center text-gray-500">Loading members...</div>;
  }
  if (error) return <div className="text-center text-red-500">Failed to load members.</div>;
  if (!members.length) return <div className="text-center text-gray-500">No members found.</div>;

  const handleEmailClick = (email: string) => {
    if (isValidEmail(email)) {
      try {
        window.open(`mailto:${email}`, '_blank');
      } catch (err) {
        console.error('Failed to open email:', err);
        alert('Could not open email client. Please copy the email and send manually.');
      }
    } else {
      alert('Invalid email address');
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const startEdit = (memberId: number, field: 'role' | 'position' | 'status', currentValue: string) => {
    setEditState({ memberId, field, value: currentValue });
    setDropdownOpen({ memberId, field });
  };

  const cancelEdit = () => {
    setEditState({ memberId: null, field: null, value: '' });
    setDropdownOpen(null);
  };

  const saveEdit = async () => {
    if (!editState.memberId || !editState.field) return;

    try {
      switch (editState.field) {
        case 'status': {
          const payload: ChangeAccountStatusRequest & { accountId: number } = {
            accountId: editState.memberId,
            newStatus: editState.value
          };
          await changeStatus(payload).unwrap();
          break;
        }
        case 'role': {
          const payload: ChangeAccountRoleRequest & { accountId: number } = {
            accountId: editState.memberId,
            newRole: editState.value
          };
          await changeRole(payload).unwrap();
          break;
        }
        case 'position': {
          const payload: ChangeAccountPositionRequest & { accountId: number } = {
            accountId: editState.memberId,
            newPosition: editState.value
          };
          await changePosition(payload).unwrap();
          break;
        }
      }
      
      // Success - reset state and refetch data
      setEditState({ memberId: null, field: null, value: '' });
      setDropdownOpen(null);
      refetch(); // Trigger refetch after successful edit
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update. Please try again.');
    }
  };

  const selectValue = (value: string) => {
    setEditState(prev => ({ ...prev, value }));
    setDropdownOpen(null);
  };

  const getFieldOptions = (field: string) => {
    switch (field) {
      case 'role': return roleOptions;
      case 'status': return statusOptions;
      case 'position': return positionOptions;
      default: return [];
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status.toUpperCase());
    if (statusOption?.color) {
      return `text-[${statusOption.color}] bg-[${statusOption.color}20]`;
    }
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-gray-600 bg-gray-100';
      case 'VERIFIED': return 'text-blue-600 bg-blue-100';
      case 'UNVERIFIED': return 'text-yellow-600 bg-yellow-100';
      case 'BANNED': return 'text-red-600 bg-red-100';
      case 'DELETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    if (roleOption?.color) {
      return `text-[${roleOption.color}] bg-[${roleOption.color}20]`;
    }
    switch (role) {
      case 'ADMIN': return 'text-red-600 bg-red-100';
      case 'PROJECT_MANAGER': return 'text-blue-600 bg-blue-100';
      case 'TEAM_LEADER': return 'text-purple-600 bg-purple-100';
      case 'TEAM_MEMBER': return 'text-green-600 bg-green-100';
      case 'CLIENT': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPositionColor = (position: string) => {
    const positionOption = positionOptions.find(opt => opt.value === position);
    if (positionOption?.color) {
      return `text-[${positionOption.color}] bg-[${positionOption.color}20]`;
    }
    return 'text-gray-700 bg-gray-100';
  };

  const renderEditableField = (member: any, field: 'role' | 'position' | 'status', value: string) => {
    const isEditing = editState.memberId === member.id && editState.field === field;
    const isDropdownOpen = dropdownOpen?.memberId === member.id && dropdownOpen?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen({ memberId: member.id, field })}
              className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm min-w-32"
            >
              <span className="truncate">{editState.value}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                {getFieldOptions(field).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => selectValue(option.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={saveEdit}
            className="p-1 text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          field === 'status' ? getStatusColor(value) : 
          field === 'role' ? getRoleColor(value) : 
          getPositionColor(value)
        }`}>
          {getFieldOptions(field).find(opt => opt.value === value)?.label || value}
        </span>
        <button
          onClick={() => startEdit(member.id, field, value)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      </div>
    );
  };

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
                  {member.picture ? (
                    <img
                      src={member.picture}
                      alt={`${member.fullName}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full">
                      {member.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{member.fullName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{member.username}</td>
                <td className="py-3 px-4 text-sm">
                  {renderEditableField(member, 'role', member.role)}
                </td>
                <td className="py-3 px-4 text-sm">
                  {renderEditableField(member, 'position', member.position)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <button
                    onClick={() => handleEmailClick(member.email)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </button>
                </td>
                <td className="py-3 px-4 text-sm">
                  {renderEditableField(member, 'status', member.status)}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default MemberList;