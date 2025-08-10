import React, { useState, useEffect } from 'react';
import { useLazyGetAccountByEmailQuery, useGetAccountByEmailQuery } from '../../../services/accountApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateBulkProjectMembersWithPositionsMutation } from '../../../services/projectMemberApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjectId, setFormData } from '../../../components/slices/Project/projectCreationSlice';
import InviteesTable from './InviteesTable';
import TeamsPopup from './TeamsPopup';
import type { ProjectMemberWithPositionsResponse } from '../../../services/projectMemberApi';
import { Users } from 'lucide-react';

interface InviteeDetails {
  yearsExperience: number;
  role: string;
  completedProjects: number;
  ongoingProjects: number;
  pastPositions: string[];
  accountId?: number;
}

interface Invitee {
  email: string;
  role: string;
  positions: string[];
  details?: InviteeDetails;
  avatar?: string;
  accountId?: number;
}

interface InviteesFormProps {
  initialData: {
    name: string;
    projectKey: string;
    description: string;
    requirements: Array<{
      id?: number;
      title: string;
      type: string;
      description: string;
      priority: string;
    }>;
    invitees: string[];
  };
  serverData?: ProjectMemberWithPositionsResponse[];
  onNext: () => Promise<void>;
  onBack: () => void;
}

const InviteesForm: React.FC<InviteesFormProps> = ({ initialData, serverData, onNext, onBack }) => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState('');
  const [viewDetailsMember, setViewDetailsMember] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [infoMessages, setInfoMessages] = useState<string[]>([]);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [showTeamsPopup, setShowTeamsPopup] = useState(false);
  const emailCurrent = localStorage.getItem('email') || '';

  const { data: currentAccount, isLoading: isAccountLoading, isError: isAccountError } = useGetAccountByEmailQuery(emailCurrent, {
    skip: !emailCurrent,
  });
  const { data: positionData, isLoading: isPositionLoading } = useGetCategoriesByGroupQuery('account_position');
  const projectId = useSelector(selectProjectId);
  const dispatch = useDispatch();
  const [createBulkProjectMembers, { isLoading: isBulkCreating }] = useCreateBulkProjectMembersWithPositionsMutation();
  const [checkAccountByEmail] = useLazyGetAccountByEmailQuery();

  // Debugging logs
  useEffect(() => {
    console.log('emailCurrent:', emailCurrent);
    console.log('currentAccount:', currentAccount);
    console.log('isAccountLoading:', isAccountLoading);
    console.log('isAccountError:', isAccountError);
    console.log('showTeamsPopup:', showTeamsPopup);
    console.log('positionData:', positionData);
  }, [emailCurrent, currentAccount, isAccountLoading, isAccountError, showTeamsPopup, positionData]);

  // Function to format position strings: remove underscores and capitalize first letter of each word
  const formatPosition = (position: string) => {
    return position
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Validate position against positionData
  const isValidPosition = (position: string) => {
    return positionData?.data?.some((pos) => pos.name === position) || false;
  };

  useEffect(() => {
    if (serverData && serverData.length > 0) {
      setInvitees(
        serverData.map((member, index) => ({
          email: member.email || `unknown${index}@example.com`,
          role: member.status === 'PENDING' ? 'Team Member' : member.status || 'Team Member',
          positions: member.projectPositions?.map((pos) => pos.position) || [],
          details: member.accountId
            ? {
                yearsExperience: member.accountId === 5 ? 5 : 3,
                role: member.status || 'Junior Developer',
                completedProjects: member.accountId === 5 ? 8 : 2,
                ongoingProjects: 0,
                pastPositions: ['Developer'],
                accountId: member.accountId,
              }
            : undefined,
          avatar: member.picture || `https://i.pravatar.cc/40?img=${index + 1}`,
          accountId: member.accountId,
        }))
      );
      setShowTable(true);
    } else if (initialData?.invitees && initialData.invitees.length > 0) {
      setInvitees(
        initialData.invitees.map((email, index) => ({
          email,
          role: 'Team Member',
          positions: [],
          details: undefined,
          avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
          accountId: undefined,
        }))
      );
      setShowTable(true);
    }
  }, [serverData, initialData]);

  useEffect(() => {
    dispatch(
      setFormData({
        invitees: invitees.map((inv) => ({
          email: inv.email,
          role: inv.role,
          positions: inv.positions,
          accountId: inv.accountId,
        })),
      })
    );
    localStorage.setItem(
      'projectFormData',
      JSON.stringify({
        ...localStorage.getItem('projectFormData') ? JSON.parse(localStorage.getItem('projectFormData')!) : {},
        invitees: invitees.map((inv) => ({
          email: inv.email,
          role: inv.role,
          positions: inv.positions,
          accountId: inv.accountId,
        })),
      })
    );
  }, [invitees, dispatch]);

  const handleAddInvitee = async () => {
    if (!inputValue.trim()) return;

    const emails = inputValue.split(',').map((email) => email.trim()).filter((email) => email);
    const uniqueEmails = emails.filter((email) => !invitees.some((inv) => inv.email.toLowerCase() === email.toLowerCase()));

    if (uniqueEmails.length === 0) {
      setIsInvalidEmail(true);
      setEmailErrors(['All emails are either empty or already added.']);
      setInputValue('');
      return;
    }

    const newInvitees: Invitee[] = [];
    const errors: string[] = [];
    const infos: string[] = [];

    for (const email of uniqueEmails) {
      if (email.toLowerCase() === emailCurrent.toLowerCase()) {
        infos.push(`Your email '${email}' is automatically included.`);
        continue;
      }

      try {
        const response = await checkAccountByEmail(email).unwrap();
        if (!response?.isSuccess || !response?.data) {
          errors.push(`Email '${email}' does not exist.`);
          continue;
        }

        const position = response.data.position && isValidPosition(response.data.position) ? [response.data.position] : [];
        const newInvitee: Invitee = {
          email,
          role: response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : response.data.role === 'CLIENT' ? 'Client' : 'Team Member',
          positions: position,
          details: {
            yearsExperience: response.data.id === 5 ? 5 : 3,
            role: response.data.position || 'Junior Developer',
            completedProjects: response.data.id === 5 ? 8 : 2,
            ongoingProjects: 0,
            pastPositions: response.data.position ? [response.data.position] : ['Developer'],
            accountId: response.data.id,
          },
          avatar: response.data?.picture || `https://i.pravatar.cc/40?img=${invitees.length + newInvitees.length + 1}`,
          accountId: response.data.id,
        };
        newInvitees.push(newInvitee);
      } catch (err) {
        errors.push(`Email '${email}' does not exist or could not be validated.`);
      }
    }

    if (newInvitees.length > 0) {
      setInvitees([...invitees, ...newInvitees]);
    }

    setInputValue('');
    setIsInvalidEmail(errors.length > 0);
    setEmailErrors(errors);
    setInfoMessages(infos);
  };

  const handleRemoveInvitee = (email: string) => {
    setInvitees(invitees.filter((inv) => inv.email.toLowerCase() !== email.toLowerCase()));
    setEmailErrors(emailErrors.filter((err) => !err.includes(`'${email}'`)));
    setInfoMessages(infoMessages.filter((msg) => !msg.includes(`'${email}'`)));
  };

  const handleAddPosition = (email: string, position: string) => {
    if (position && !invitees.find((inv) => inv.email === email)?.positions.includes(position)) {
      setInvitees(
        invitees.map((inv) =>
          inv.email === email ? { ...inv, positions: [...inv.positions, position] } : inv
        )
      );
      setNewPosition('');
      setExpandedMember(null);
    }
  };

  const handleRemovePosition = (email: string, position: string) => {
    setInvitees(
      invitees.map((inv) =>
        inv.email === email ? { ...inv, positions: inv.positions.filter((p) => p !== position) } : inv
      )
    );
  };

  const handleRoleChange = (email: string, role: string) => {
    setInvitees(
      invitees.map((inv) =>
        inv.email === email ? { ...inv, role } : inv
      )
    );
  };

  const handleAddTeamMembers = async (selectedMembers: { accountId: number; accountEmail: string; accountPicture: string; accountName: string; accountPosition?: string }[]) => {
    console.log('Selected members:', selectedMembers);
    const newInvitees: Invitee[] = [];

    for (const member of selectedMembers) {
      if (!invitees.some((inv) => inv.email.toLowerCase() === member.accountEmail.toLowerCase())) {
        let position: string[] = [];
        if (member.accountPosition && isValidPosition(member.accountPosition)) {
          position = [member.accountPosition];
        } else {
          // Fallback to fetching position if not provided
          try {
            const response = await checkAccountByEmail(member.accountEmail).unwrap();
            if (response?.isSuccess && response.data?.position && isValidPosition(response.data.position)) {
              position = [response.data.position];
            }
          } catch (err) {
            console.log(`Failed to fetch position for ${member.accountEmail}:`, err);
          }
        }

        const newInvitee: Invitee = {
          email: member.accountEmail,
          role: 'Team Member',
          positions: position,
          details: {
            yearsExperience: 3,
            role: member.accountPosition || 'Junior Developer',
            completedProjects: 2,
            ongoingProjects: 0,
            pastPositions: member.accountPosition ? [member.accountPosition] : ['Developer'],
            accountId: member.accountId,
          },
          avatar: member.accountPicture,
          accountId: member.accountId,
        };
        newInvitees.push(newInvitee);
      }
    }

    if (newInvitees.length > 0) {
      setInvitees([...invitees, ...newInvitees]);
      setInfoMessages([...infoMessages, `Added ${newInvitees.length} members from previous teams.`]);
    }
  };

  const handleContinue = async () => {
    if (!projectId) {
      console.error('Project ID is not available');
      setEmailErrors(['Project ID is not available. Please create the project first.']);
      return;
    }

    let uniqueInvitees = invitees.filter(
      (invitee) =>
        invitee.accountId !== undefined &&
        !invitees.some((inv) => inv.accountId === invitee.accountId && inv.email.toLowerCase() !== invitee.email.toLowerCase())
    );

    let requests = uniqueInvitees.map((invitee) => ({
      accountId: invitee.accountId || 0,
      positions: invitee.positions,
    }));

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        const response = await createBulkProjectMembers({ projectId, requests }).unwrap();
        console.log('Bulk create success:', response);
        if (response.isSuccess) {
          dispatch(
            setFormData({
              invitees: uniqueInvitees.map((inv) => ({
                email: inv.email,
                role: inv.role,
                positions: inv.positions,
                accountId: inv.accountId,
              })),
            })
          );
          setEmailErrors([]);
          setInfoMessages([]);
          await onNext();
          break;
        } else {
          setEmailErrors([response.message || 'Failed to invite members.']);
          break;
        }
      } catch (err: any) {
        console.error('Bulk create failed:', err);
        if ('status' in err && err.status === 400 && err.data?.message?.includes('already a member')) {
          const match = err.data.message.match(/Account ID (\d+)/);
          if (match && match[1]) {
            const duplicateAccountId = parseInt(match[1], 10);
            uniqueInvitees = uniqueInvitees.filter((inv) => inv.accountId !== duplicateAccountId);
            requests = uniqueInvitees.map((invitee) => ({
              accountId: invitee.accountId || 0,
              positions: invitee.positions,
            }));
            setInvitees(uniqueInvitees);
            setEmailErrors([`Removed duplicate Account ID ${duplicateAccountId}. Retrying...`]);
          } else {
            setEmailErrors(['Failed to parse duplicate account error.']);
            break;
          }
        } else if ('status' in err && err.status === 401) {
          setEmailErrors(['Authentication failed. Please log in again or check your token.']);
          break;
        } else if (err instanceof Error && err.message.includes('Unexpected end of JSON input')) {
          setEmailErrors(['Server returned an invalid response. Please check your authentication or contact support.']);
          break;
        } else if ('status' in err && err.status === 403) {
          setEmailErrors(['You do not have permission to perform this action.']);
          break;
        } else {
          setEmailErrors(['Failed to invite members. Please try again.']);
          break;
        }
        attempt++;
      }
    }

    if (attempt === maxAttempts) {
      setEmailErrors(['Maximum retry attempts reached. Please check your invitees.']);
    }
  };

  const getFullnameFromEmail = (email: string) => {
    const serverMember = serverData?.find((member) => member.email && member.email.toLowerCase() === email.toLowerCase());
    if (serverMember) {
      return serverMember.accountName || email.split('@')[0];
    }
    return email.split('@')[0];
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-sm">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent">
          Bring the Team with You
        </h1>
        <button
          onClick={() => {
            console.log('Opening TeamsPopup, showTeamsPopup:', showTeamsPopup, 'accountId:', currentAccount?.data?.id);
            setShowTeamsPopup(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white rounded-lg transition duration-200 ease-in-out"
          aria-label="View previous teams"
          disabled={isAccountLoading || isAccountError || !emailCurrent}
        >
          <Users size={20} />
          Previous Teams
        </button>
      </div>
      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        Invite your teammates to collaborate on this project and achieve greatness together. Enter one email or a comma-separated list (e.g., email1@example.com, email2@example.com). Your email is automatically included.
      </p>
      {isAccountError && (
        <div className="text-red-500 text-sm mb-4">
          <p>Error loading account information. Please ensure you are logged in.</p>
        </div>
      )}
      {!emailCurrent && (
        <div className="text-red-500 text-sm mb-4">
          <p>No email found in localStorage. Please log in to view previous teams.</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inputValue}
            placeholder="Enter name, email, or comma-separated emails"
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsInvalidEmail(false);
              setEmailErrors([]);
              setInfoMessages([]);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInvitee()}
            className={`flex-1 px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 transition-all placeholder-gray-400 ${
              isInvalidEmail ? 'border-red-500' : 'border-gray-200 focus:border-[#1c73fd]'
            }`}
          />
          <button
            onClick={handleAddInvitee}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl"
            disabled={isBulkCreating}
          >
            Add Invitee
          </button>
        </div>
        {(emailErrors.length > 0 || infoMessages.length > 0) && (
          <div className="mt-4 space-y-2">
            {emailErrors.length > 0 && (
              <div className="text-red-500 text-sm">
                {emailErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            {infoMessages.length > 0 && (
              <div className="text-[#1c73fd] text-sm">
                {infoMessages.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {invitees.map((invitee) => (
            <span
              key={invitee.email}
              className="bg-[#e6f0fd] text-[#1c73fd] text-xs px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md"
            >
              {invitee.avatar && (
                <img
                  src={invitee.avatar}
                  alt={`${getFullnameFromEmail(invitee.email)} avatar`}
                  className="w-6 h-6 rounded-full"
                />
              )}
              {invitee.email}
              <button
                onClick={() => handleRemoveInvitee(invitee.email)}
                className="text-base font-bold text-[#1c73fd] hover:text-[#155ac7] transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full mt-5 px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl"
        >
          {showTable ? 'Hide Table' : 'Show Table'}
        </button>

        {showTable && (
          <InviteesTable
            invitees={invitees}
            positionData={positionData?.data}
            isPositionLoading={isPositionLoading}
            expandedMember={expandedMember}
            setExpandedMember={setExpandedMember}
            newPosition={newPosition}
            setNewPosition={setNewPosition}
            viewDetailsMember={viewDetailsMember}
            setViewDetailsMember={setViewDetailsMember}
            handleAddPosition={handleAddPosition}
            handleRemovePosition={handleRemovePosition}
            getFullnameFromEmail={getFullnameFromEmail}
          />
        )}

        <div className="mt-10 flex justify-end text-xs">
          <button
            onClick={() => {
              localStorage.removeItem('projectFormData');
              localStorage.removeItem('projectCreationStep');
              localStorage.removeItem('projectCreationId');
              onBack();
            }}
            className="mr-4 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl"
            disabled={isBulkCreating || !projectId}
          >
            {isBulkCreating ? 'Inviting...' : 'Invite and Continue'}
          </button>
        </div>
      </div>

      {showTeamsPopup && currentAccount?.data?.id && (
        <TeamsPopup
          accountId={currentAccount.data.id}
          onClose={() => setShowTeamsPopup(false)}
          onAddSelected={handleAddTeamMembers}
          existingEmails={invitees.map((inv) => inv.email)}
        />
      )}
    </div>
  );
};

export default InviteesForm;
