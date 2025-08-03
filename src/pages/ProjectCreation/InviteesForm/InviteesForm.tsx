import React, { useState, useEffect } from 'react';
import { useLazyGetAccountByEmailQuery } from '../../../services/accountApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateBulkProjectMembersWithPositionsMutation } from '../../../services/projectMemberApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjectId, setFormData } from '../../../components/slices/Project/projectCreationSlice';
import InviteesTable from './InviteesTable';

interface InviteesFormProps {
  initialData: {
    name: string;
    projectKey: string;
    description: string;
    requirements: string[];
    invitees: string[];
  };
  onNext: () => Promise<void>;
  onBack: () => void;
}

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
}

const InviteesForm: React.FC<InviteesFormProps> = ({ initialData, onNext, onBack }) => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [newPosition, setNewPosition] = useState('');
  const [viewDetailsMember, setViewDetailsMember] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [infoMessages, setInfoMessages] = useState<string[]>([]);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const emailCurrent = localStorage.getItem('email') || '';

  const { data: positionData, isLoading: isPositionLoading } = useGetCategoriesByGroupQuery('account_position');
  const projectId = useSelector(selectProjectId);
  const dispatch = useDispatch();
  const [createBulkProjectMembers, { isLoading: isBulkCreating }] = useCreateBulkProjectMembersWithPositionsMutation();
  const [checkAccountByEmail] = useLazyGetAccountByEmailQuery();

  const handleAddInvitee = async () => {
    if (!inputValue.trim()) return;

    // Split input by commas and trim each email
    const emails = inputValue.split(',').map(email => email.trim()).filter(email => email);
    const uniqueEmails = emails.filter(email => !invitees.some(inv => inv.email === email));

    if (uniqueEmails.length === 0) {
      setIsInvalidEmail(true);
      setEmailErrors(['All emails are either empty or already added.']);
      setInputValue('');
      return;
    }

    const newInvitees: Invitee[] = [];
    const errors: string[] = [];
    const infos: string[] = [];

    // Validate each email
    for (const email of uniqueEmails) {
      if (email === emailCurrent) {
        infos.push(`Your email '${email}' is automatically included.`);
        continue;
      }

      try {
        const response = await checkAccountByEmail(email).unwrap();
        if (!response?.isSuccess || !response?.data) {
          errors.push(`Email '${email}' does not exist.`);
          continue;
        }

        const newRole = response.data.role === 'PROJECT_MANAGER' ? 'Project Manager' :
                        response.data.role === 'CLIENT' ? 'Client' : 'Team Member';
        const initialPosition = response.data.position || 'Developer';
        const newInvitee: Invitee = {
          email,
          role: newRole,
          positions: [initialPosition],
          details: {
            yearsExperience: response.data.id === 5 ? 5 : 3,
            role: response.data.position || 'Junior Developer',
            completedProjects: response.data.id === 5 ? 8 : 2,
            ongoingProjects: 0,
            pastPositions: ['Developer'],
            accountId: response.data.id,
          },
          avatar: response.data?.picture || `https://i.pravatar.cc/40?img=${invitees.length + newInvitees.length + 1}`,
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
    setInvitees(invitees.filter((inv) => inv.email !== email));
    setEmailErrors(emailErrors.filter(err => !err.includes(`'${email}'`)));
    setInfoMessages(infoMessages.filter(msg => !msg.includes(`'${email}'`)));
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

  const handleContinue = async () => {
    if (!projectId) {
      console.error('Project ID is not available');
      setEmailErrors(['Project ID is not available. Please create the project first.']);
      return;
    }

    let uniqueInvitees = invitees.filter((invitee) => 
      invitee.details?.accountId !== undefined && 
      !invitees.some((inv) => inv.details?.accountId === invitee.details?.accountId && inv.email !== invitee.email)
    );

    let requests = uniqueInvitees.map((invitee) => ({
      accountId: invitee.details?.accountId || 0,
      positions: invitee.positions,
    }));

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        const response = await createBulkProjectMembers({ projectId, requests }).unwrap();
        console.log('Bulk create success:', response);
        if (response.isSuccess) {
          dispatch(setFormData({ invitees: uniqueInvitees.map((inv) => inv.email) }));
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
            uniqueInvitees = uniqueInvitees.filter((inv) => inv.details?.accountId !== duplicateAccountId);
            requests = uniqueInvitees.map((invitee) => ({
              accountId: invitee.details?.accountId || 0,
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
    return email.split('@')[0] || email;
  };

  return (
    <div className='bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-sm'>
      <h1 className='text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent'>
        Bring the Team with You
      </h1>
      <p className='text-gray-600 mb-8 text-base leading-relaxed'>
        Invite your teammates to collaborate on this project and achieve greatness together. Enter one email or a comma-separated list (e.g., email1@example.com, email2@example.com). Your email is automatically included.
      </p>

      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <input
            type='text'
            value={inputValue}
            placeholder='Enter name, email, or comma-separated emails'
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
            className='w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
            disabled={false}
          >
            Add Invitee
          </button>
        </div>
        {emailErrors.length > 0 && (
          <div className='text-red-500 text-sm mt-2'>
            {emailErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        {infoMessages.length > 0 && (
          <div className='text-[#1c73fd] text-sm mt-2'>
            {infoMessages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
        )}

        <div className='flex flex-wrap gap-3'>
          {invitees.map((invitee) => (
            <span
              key={invitee.email}
              className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md'
            >
              {invitee.avatar && (
                <img
                  src={invitee.avatar}
                  alt={`${getFullnameFromEmail(invitee.email)} avatar`}
                  className='w-6 h-6 rounded-full'
                />
              )}
              {invitee.email}
              <button
                onClick={() => handleRemoveInvitee(invitee.email)}
                className='text-base font-bold text-[#1c73fd] hover:text-[#155ac7] transition'
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className='w-full mt-5 px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
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
      </div>

      {(emailErrors.length > 0 || infoMessages.length > 0) && (
        <div className='mt-4 space-y-2'>
          {emailErrors.length > 0 && (
            <div className='text-red-500 text-sm'>
              {emailErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          {infoMessages.length > 0 && (
            <div className='text-[#1c73fd] text-sm'>
              {infoMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className='mt-10 flex justify-end text-xs'>
        <button
          onClick={() => {
            localStorage.removeItem('projectFormData');
            localStorage.removeItem('projectCreationStep');
            localStorage.removeItem('projectCreationId');
            onBack();
          }}
          className='mr-4 px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl'
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className='px-6 py-4 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
          disabled={isBulkCreating || !projectId}
        >
          {isBulkCreating ? 'Inviting...' : 'Invite and Continue'}
        </button>
      </div>
    </div>
  );
};

export default InviteesForm;