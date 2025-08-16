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
  const [showTable, setShowTable] = useState(() => {
    const saved = localStorage.getItem('projectCreationShowTable');
    return saved ? JSON.parse(saved) : false;
  });
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
    console.log('showTable:', showTable);
    console.log('invitees:', invitees);
  }, [emailCurrent, currentAccount, isAccountLoading, isAccountError, showTeamsPopup, positionData, showTable, invitees]);

  // Persist showTable to localStorage
  useEffect(() => {
    localStorage.setItem('projectCreationShowTable', JSON.stringify(showTable));
  }, [showTable]);

  // Function to validate position against positionData
  const isValidPosition = (position: string) => {
    return positionData?.data?.some((pos) => pos.name === position) || false;
  };

  // Initialize invitees
  useEffect(() => {
    console.log('--- useEffect for invitees initialization ---');
    console.log('serverData:', serverData);
    console.log('initialData.invitees:', initialData?.invitees);
    console.log('localStorage.projectFormData:', localStorage.getItem('projectFormData'));

    // Map serverData status to valid InviteesTable roles
    const mapRole = (status: string | undefined) => {
      if (status === 'PENDING') return 'Team Member';
      if (status === 'ACTIVE') return 'Project Manager';
      if (status === 'CREATED') return 'Team Member';
      return 'Team Member'; // Default to Team Member if status is undefined or unrecognized
    };

    // Function to map a single member to an Invitee
    const mapMemberToInvitee = async (member: ProjectMemberWithPositionsResponse, index: number): Promise<Invitee> => {
      let role = mapRole(member.status);
      let position: string[] = member.projectPositions?.map((pos) => pos.position) || [];

      // Fetch role from API if accountId exists
      if (member.accountId && member.email) {
        try {
          const response = await checkAccountByEmail(member.email).unwrap();
          if (response?.isSuccess && response.data) {
            role = response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : 
                   response.data.role === 'TEAM_LEADER' ? 'Team Leader' :
                   response.data.role === 'CLIENT' ? 'Client' : 'Team Member';
            if (response.data.position && isValidPosition(response.data.position) && !position.includes(response.data.position)) {
              position = [response.data.position];
            }
          }
        } catch (err) {
          console.log(`Failed to fetch role for ${member.email}:`, err);
        }
      }

      return {
        email: member.email || `unknown${index}@example.com`,
        role,
        positions: position,
        details: member.accountId
          ? {
              yearsExperience: member.accountId === 5 ? 5 : 3,
              role: position[0] || 'Junior Developer',
              completedProjects: member.accountId === 5 ? 8 : 2,
              ongoingProjects: 0,
              pastPositions: position.length > 0 ? position : ['Developer'],
              accountId: member.accountId,
            }
          : undefined,
        avatar: member.picture || `https://i.pravatar.cc/40?img=${index + 1}`,
        accountId: member.accountId,
      };
    };

    // Function to map a single localStorage invitee to an Invitee
    const mapLocalInvitee = async (inv: any, index: number): Promise<Invitee> => {
      let role = inv.role || 'Team Member';
      let position: string[] = inv.positions || [];

      // Fetch role from API if accountId exists
      if (inv.accountId && inv.email) {
        try {
          const response = await checkAccountByEmail(inv.email).unwrap();
          if (response?.isSuccess && response.data) {
            role = response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : 
                   response.data.role === 'TEAM_LEADER' ? 'Team Leader' :
                   response.data.role === 'CLIENT' ? 'Client' : 'Team Member';
            if (response.data.position && isValidPosition(response.data.position) && !position.includes(response.data.position)) {
              position = [response.data.position];
            }
          }
        } catch (err) {
          console.log(`Failed to fetch role for ${inv.email}:`, err);
        }
      }

      return {
        email: inv.email,
        role,
        positions: position,
        details: inv.accountId
          ? {
              yearsExperience: inv.accountId === 5 ? 5 : 3,
              role: position[0] || 'Junior Developer',
              completedProjects: inv.accountId === 5 ? 8 : 2,
              ongoingProjects: 0,
              pastPositions: position.length ? position : ['Developer'],
              accountId: inv.accountId,
            }
          : undefined,
        avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
        accountId: inv.accountId,
      };
    };

    // Initialize invitees
    const initializeInvitees = async () => {
      let newInvitees: Invitee[] = [];

      // Prioritize serverData
      if (serverData && serverData.length > 0) {
        console.log('Populating invitees from serverData');
        newInvitees = await Promise.all(serverData.map((member, index) => mapMemberToInvitee(member, index)));
      }
      // Fallback to initialData.invitees
      else if (initialData?.invitees && initialData.invitees.length > 0) {
        console.log('Populating invitees from initialData.invitees');
        newInvitees = initialData.invitees
          .filter((email) => email.toLowerCase() !== emailCurrent.toLowerCase())
          .map((email, index) => ({
            email,
            role: 'Team Member',
            positions: [],
            details: undefined,
            avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
            accountId: undefined,
          }));
      }
      // Fallback to localStorage projectFormData
      else {
        const savedFormData = localStorage.getItem('projectFormData');
        if (savedFormData) {
          const parsedFormData = JSON.parse(savedFormData);
          if (parsedFormData.invitees && parsedFormData.invitees.length > 0) {
            console.log('Populating invitees from localStorage.projectFormData');
            newInvitees = await Promise.all(
              parsedFormData.invitees
                .filter((inv: any) => inv.email.toLowerCase() !== emailCurrent.toLowerCase())
                .map((inv: any, index: number) => mapLocalInvitee(inv, index))
            );
          }
        }
      }

      console.log('Setting invitees:', newInvitees);
      setInvitees(newInvitees);
    };

    initializeInvitees();
  }, [serverData, initialData, emailCurrent, checkAccountByEmail, positionData]);

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
    const uniqueEmails = emails.filter(
      (email) => !invitees.some((inv) => inv.email.toLowerCase() === email.toLowerCase()) && email.toLowerCase() !== emailCurrent.toLowerCase()
    );

    if (uniqueEmails.length === 0) {
      setIsInvalidEmail(true);
      setEmailErrors(['All emails are either empty, already added, or belong to the current user.']);
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
          role: response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : 
                response.data.role === 'TEAM_LEADER' ? 'Team Leader' :
                response.data.role === 'CLIENT' ? 'Client' : 'Team Member',
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

  const handleAddTeamMembers = async (selectedMembers: { accountId: number; accountEmail: string; accountPicture: string; accountName: string; accountPosition?: string }[]) => {
    console.log('Selected members:', selectedMembers);
    const newInvitees: Invitee[] = [];
    const errors: string[] = [];

    for (const member of selectedMembers) {
      if (!invitees.some((inv) => inv.email.toLowerCase() === member.accountEmail.toLowerCase()) && member.accountEmail.toLowerCase() !== emailCurrent.toLowerCase()) {
        let position: string[] = [];
        let role = 'Team Member';
        try {
          const response = await checkAccountByEmail(member.accountEmail).unwrap();
          if (response?.isSuccess && response.data) {
            if (response.data.position && isValidPosition(response.data.position)) {
              position = [response.data.position];
            }
            role = response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : 
                   response.data.role === 'TEAM_LEADER' ? 'Team Leader' :
                   response.data.role === 'CLIENT' ? 'Client' : 'Team Member';
          } else {
            errors.push(`No valid account data for '${member.accountEmail}'. Added as Team Member.`);
          }
        } catch (err) {
          console.log(`Failed to fetch details for ${member.accountEmail}:`, err);
          errors.push(`Failed to fetch details for '${member.accountEmail}'. Added as Team Member.`);
        }

        const newInvitee: Invitee = {
          email: member.accountEmail,
          role,
          positions: position.length > 0 ? position : member.accountPosition && isValidPosition(member.accountPosition) ? [member.accountPosition] : [],
          details: {
            yearsExperience: member.accountId === 5 ? 5 : 3,
            role: member.accountPosition || 'Junior Developer',
            completedProjects: member.accountId === 5 ? 8 : 2,
            ongoingProjects: 0,
            pastPositions: member.accountPosition ? [member.accountPosition] : ['Developer'],
            accountId: member.accountId,
          },
          avatar: member.accountPicture || `https://i.pravatar.cc/40?img=${invitees.length + newInvitees.length + 1}`,
          accountId: member.accountId,
        };
        newInvitees.push(newInvitee);
      }
    }

    if (newInvitees.length > 0) {
      setInvitees([...invitees, ...newInvitees]);
      setInfoMessages([...infoMessages, `Added ${newInvitees.length} members from previous teams.`]);
    }
    if (errors.length > 0) {
      setEmailErrors([...emailErrors, ...errors]);
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
          onClick={() => {
            console.log('Toggling showTable, current value:', showTable, 'invitees:', invitees);
            setShowTable(!showTable);
          }}
          className="w-full mt-5 px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl"
        >
          {showTable ? 'Hide Table' : 'Show Table'}
        </button>

        {showTable && (
          <div key={`table-${invitees.length}-${showTable}`} style={{ display: 'block', minHeight: '200px', visibility: 'visible', opacity: 1, position: 'relative' }}>
            <>
              {console.log('Rendering InviteesTable, invitees:', invitees, 'showTable:', showTable)}
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
            </>
          </div>
        )}

        <div className="mt-10 flex justify-end text-xs">
          <button
            onClick={() => {
              console.log('Clearing localStorage and going back');
              localStorage.removeItem('projectFormData');
              localStorage.removeItem('projectCreationStep');
              localStorage.removeItem('projectCreationId');
              localStorage.removeItem('projectCreationShowTable');
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
          existingEmails={[...invitees.map((inv) => inv.email), emailCurrent]}
        />
      )}
    </div>
  );
};

export default InviteesForm;