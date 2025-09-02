import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { UserPlus, X, ChevronDown } from 'lucide-react';
import { useGetAccountsQuery } from '../../services/adminApi';
import { useCreateProjectMemberMutation, useGetProjectMembersWithPositionsQuery } from '../../services/projectMemberApi';
import { useGetProjectsByAccountIdQuery } from '../../services/accountApi';
import { addInvitee } from './InviteesMemberPage';

interface ProjectMember {
  id: number;
  accountId: number;
  fullName: string;
  email: string | null;
  status: string;
  projectPositions: { id: number; position: string }[];
}

const AddMemberPopup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedProjectId = Number(queryParams.get('projectId')) || null;

  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: projectsData } = useGetProjectsByAccountIdQuery(accountId);
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useGetAccountsQuery();
  const { data: membersData } = useGetProjectMembersWithPositionsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });
  const [createProjectMember, { isLoading: createLoading }] = useCreateProjectMemberMutation();

  const availableAccounts = accountsData?.data.filter(account => 
    !membersData?.data.some((member: ProjectMember) => member.accountId === account.id)
  ) || [];

  const selectedProject = projectsData?.data.find((p) => p.projectId === selectedProjectId);

  const accountOptions = availableAccounts.map((account) => ({
    value: account.id,
    label: `${account.fullName} • ${account.email || 'No email'}`,
  }));

  // Filter accounts based on search term
  const filteredAccounts = availableAccounts.filter(account => 
    account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedAccount = accountsData?.data.find(account => account.id === selectedAccountId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectAccount = (accountId: number) => {
    setSelectedAccountId(accountId);
    setIsDropdownOpen(false);
    setSearchTerm('');
    setEmailError('');
  };

  // Debug số lượng mục
  console.log('Number of accountOptions:', accountOptions.length);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Project Selected',
        text: 'Please select a project first.',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    if (!selectedAccountId) {
      setEmailError('Please select a member.');
      return;
    }

    const selectedAccount = accountsData?.data.find((a) => a.id === selectedAccountId);
    
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Member Addition',
      html: `
        <div class="text-left text-sm">
          <p class="mb-2"><strong>Member:</strong> ${selectedAccount?.fullName}</p>
          <p class="mb-2"><strong>Project:</strong> ${selectedProject?.projectName}</p>
          <p class="text-gray-600">You can assign positions after adding the member.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Add Member',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await createProjectMember({
        projectId: selectedProjectId,
        request: { accountId: selectedAccountId },
      }).unwrap();
      
      dispatch(
        addInvitee({
          email: selectedAccount?.email || '',
          fullName: selectedAccount?.fullName || '',
          position: 'No position assigned',
        })
      );
      
      setSelectedAccountId(null);
      setEmailError('');
      navigate('/team-management');
      
      Swal.fire({
        icon: 'success',
        title: 'Member Added',
        text: `${selectedAccount?.fullName} has been added to ${selectedProject?.projectName}`,
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      setEmailError('Error adding member. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center p-4 pt-2 pb-48 overflow-y-auto">
      <div className="bg-white p-3 rounded-lg shadow-xl max-w-xs w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center">
            <UserPlus className="w-3 h-3 text-green-600 mr-1" />
            Add New Member
            {selectedProject && (
              <span className="ml-1 text-xs text-gray-500">to {selectedProject.projectName}</span>
            )}
          </h2>
          <button
            onClick={() => navigate('/team-management')}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Back to team management"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <form onSubmit={handleAddMember} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Select Team Member</label>
            {accountsLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="ml-1 text-gray-600 text-xs">Loading members...</span>
              </div>
            ) : accountsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-1 text-red-600 text-xs">
                Error loading members.
              </div>
            ) : availableAccounts.length > 0 ? (
              <div className="relative" ref={dropdownRef}>
                {/* Custom Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white text-left flex items-center justify-between disabled:opacity-50"
                  disabled={createLoading || accountsLoading}
                >
                  <span className={selectedAccount ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedAccount 
                      ? `${selectedAccount.fullName} • ${selectedAccount.email || 'No email'}`
                      : 'Choose a team member'
                    }
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {/* Search Input */}
                    <div className="p-1 border-b border-gray-100">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search members..."
                        className="w-full p-0.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    
                    {/* Options List */}
                    <div className="overflow-y-auto" style={{ maxHeight: '100px' }}>
                      {filteredAccounts.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => handleSelectAccount(account.id)}
                          className="w-full p-0.5 text-left text-xs hover:bg-blue-50 flex items-center space-x-1 border-b border-gray-50 last:border-b-0"
                          style={{ minHeight: '20px', maxHeight: '20px' }}
                        >
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs">
                            {account.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {account.fullName}
                            </div>
                            <div className="text-gray-500 truncate text-[0.6rem]">
                              {account.email || 'No email'}
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredAccounts.length === 0 && (
                        <div className="p-1 text-xs text-gray-500 text-center">
                          No members found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1 text-yellow-700 text-xs">
                All available members are already added to this project.
              </div>
            )}
            {emailError && (
              <div className="mt-1 bg-red-50 border-l-4 border-red-400 p-1 text-red-700 text-xs rounded">
                {emailError}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-xs transition-colors"
            disabled={createLoading || accountsLoading || !selectedProjectId || availableAccounts.length === 0}
            aria-label="Add member to project"
          >
            {createLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Adding Member...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus className="w-3 h-3 mr-1" />
                Add Member to Team
              </div>
            )}
          </button>
        </form>
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-1 text-xs text-blue-700">
          <strong>Note:</strong> After adding a member, assign positions using the position manager in the members list.
        </div>
      </div>
    </div>
  );
};

export default AddMemberPopup;