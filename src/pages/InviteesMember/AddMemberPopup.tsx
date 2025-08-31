import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { UserPlus, X, ChevronDown } from 'lucide-react';
import { useGetAccountsQuery } from '../../services/adminApi';
import { useCreateProjectMemberMutation, useGetProjectMembersWithPositionsQuery } from '../../services/projectMemberApi';
import { useGetProjectsByAccountIdQuery } from '../../services/accountApi';
import { addInvitee } from './InviteesMemberPage'; // Adjust path as needed

// Define interface for project member to resolve TS7006
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
      navigate('/team-management'); // Adjust route as needed
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <UserPlus className="w-5 h-5 text-green-600 mr-2" />
            Add New Member
            {selectedProject && (
              <span className="ml-2 text-sm text-gray-500">to {selectedProject.projectName}</span>
            )}
          </h2>
          <button
            onClick={() => navigate('/team-management')} // Adjust route as needed
            className="text-gray-500 hover:text-gray-700"
            aria-label="Back to team management"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Team Member</label>
            {accountsLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 text-sm">Loading members...</span>
              </div>
            ) : accountsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                Error loading members.
              </div>
            ) : availableAccounts.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedAccountId || ''}
                  onChange={(e) => setSelectedAccountId(Number(e.target.value) || null)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none disabled:opacity-50"
                  disabled={createLoading || accountsLoading}
                  aria-label="Select team member"
                >
                  <option value="">Choose a team member</option>
                  {availableAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.fullName} • {account.email || 'No email'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-sm">
                All available members are already added to this project.
              </div>
            )}
            {emailError && (
              <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-2 text-red-700 text-sm rounded">
                {emailError}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors"
            disabled={createLoading || accountsLoading || !selectedProjectId || availableAccounts.length === 0}
            aria-label="Add member to project"
          >
            {createLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Member...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Member to Team
              </div>
            )}
          </button>
        </form>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <strong>Note:</strong> After adding a member, assign positions using the position manager in the members list.
        </div>
      </div>
    </div>
  );
};

export default AddMemberPopup;