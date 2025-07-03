import React, { useState, useEffect } from 'react';
import { useGetAccountByEmailQuery } from '../../../services/accountApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateBulkProjectMembersWithPositionsMutation } from '../../../services/projectMemberApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjectId, setFormData } from '../../../components/slices/Project/projectCreationSlice';

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
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: positionData, isLoading: isPositionLoading } = useGetCategoriesByGroupQuery('account_position');
  const projectId = useSelector(selectProjectId);
  const dispatch = useDispatch();
  const [createBulkProjectMembers, { isLoading: isBulkCreating, error: bulkError }] = useCreateBulkProjectMembersWithPositionsMutation();

  useEffect(() => {
    if (initialData.invitees && initialData.invitees.length > 0) {
      const updatedInvitees = initialData.invitees.map((email, index) => ({
        email,
        role: index === 0 ? 'Project Manager' : index === 1 ? 'Client' : 'Team Member',
        positions: index === 0 ? ['Project Lead', 'Coordinator'] : index === 1 ? ['Client Lead'] : ['Developer', 'Tester'],
        details: {
          yearsExperience: index === 0 ? 10 : index === 1 ? 8 : 5,
          role: index === 0 ? 'Senior Manager' : index === 1 ? 'Client Representative' : 'Junior Developer',
          completedProjects: index === 0 ? 15 : index === 1 ? 10 : 8,
          ongoingProjects: index === 0 ? 2 : index === 1 ? 1 : 1,
          pastPositions: index === 0 ? ['Project Lead', 'Senior Developer'] : index === 1 ? ['Client Lead'] : ['Developer', 'Tester'],
          accountId: index === 0 ? 4 : index === 1 ? 3 : 5,
        },
        avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
      }));
      setInvitees(updatedInvitees);
    }
  }, [initialData.invitees]);

  const { data: accountData, isLoading, isError } = useGetAccountByEmailQuery(inputValue.trim(), {
    skip: !inputValue.trim() || invitees.some((inv) => inv.email === inputValue.trim()),
  });

  const handleAddInvitee = () => {
    if (inputValue.trim() && !invitees.some((inv) => inv.email === inputValue.trim())) {
      if (!isError && accountData?.data) {
        const newRole = accountData.data.role === 'PROJECT_MANAGER' ? 'Project Manager' : accountData.data.role === 'CLIENT' ? 'Client' : 'Team Member';
        const initialPosition = accountData.data.position || 'Developer';
        const newInvitee: Invitee = {
          email: inputValue.trim(),
          role: newRole,
          positions: [initialPosition],
          details: {
            yearsExperience: accountData.data.id === 5 ? 5 : 3,
            role: accountData.data.position || 'Junior Developer',
            completedProjects: accountData.data.id === 5 ? 8 : 2,
            ongoingProjects: 0,
            pastPositions: ['Developer'],
            accountId: accountData.data.id,
          },
          avatar: accountData.data?.picture || `https://i.pravatar.cc/40?img=${invitees.length + 1}`,
        };
        setInvitees([...invitees, newInvitee]);
        setInputValue('');
        setIsInvalidEmail(false);
      } else {
        setIsInvalidEmail(true);
      }
    }
  };

  const handleRemoveInvitee = (email: string) => {
    setInvitees(invitees.filter((inv) => inv.email !== email));
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
      setErrorMessage('Project ID is not available. Please create the project first.');
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
          setErrorMessage(null);
          await onNext();
          break;
        } else {
          setErrorMessage(response.message || 'Failed to invite members.');
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
            setErrorMessage(`Removed duplicate Account ID ${duplicateAccountId}. Retrying...`);
          } else {
            setErrorMessage('Failed to parse duplicate account error.');
            break;
          }
        } else if ('status' in err && err.status === 401) {
          setErrorMessage('Authentication failed. Please log in again or check your token.');
          break;
        } else if (err instanceof Error && err.message.includes('Unexpected end of JSON input')) {
          setErrorMessage('Server returned an invalid response. Please check your authentication or contact support.');
          break;
        } else if ('status' in err && err.status === 403) {
          setErrorMessage('You do not have permission to perform this action.');
          break;
        } else {
          setErrorMessage('Failed to invite members. Please try again.');
          break;
        }
        attempt++;
      }
    }

    if (attempt === maxAttempts) {
      setErrorMessage('Maximum retry attempts reached. Please check your invitees.');
    }
  };

  const getFullnameFromEmail = (email: string) => {
    return email.split('@')[0] || email;
  };

  const projectManagers = invitees.filter((inv) => inv.role === 'Project Manager');
  const teamMembers = invitees.filter((inv) => inv.role === 'Team Member');
  const clients = invitees.filter((inv) => inv.role === 'Client');

  return (
    <div className='bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-sm'>
      <h1 className='text-3xl font-extrabold text-gray-900 mb-5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] bg-clip-text text-transparent'>
        Bring the Team with You
      </h1>
      <p className='text-gray-600 mb-8 text-base leading-relaxed'>
        Invite your teammates to collaborate on this project and achieve greatness together.
      </p>

      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <input
            type='text'
            value={inputValue}
            placeholder='Enter name or email'
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsInvalidEmail(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInvitee()}
            className={`flex-1 px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 transition-all placeholder-gray-400 ${
              isInvalidEmail ? 'border-red-500' : 'border-gray-200 focus:border-[#1c73fd]'
            }`}
          />
          <button
            onClick={handleAddInvitee}
            className='w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Add Invitee'}
          </button>
        </div>
        {isInvalidEmail && (
          <div className='text-red-500 text-sm mt-2'>
            Email '{inputValue.trim()}' does not exist or is already added.
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
          <div className='mt-6 space-y-6'>
            {projectManagers.length > 0 && (
              <div className='p-5 bg-gradient-to-br from-[#e6f0fd] to-white rounded-xl shadow-xl border border-[#d1e0f8]'>
                <h3 className='text-lg font-semibold text-[#1c73fd] mb-4'>Project Manager</h3>
                <table className='w-full bg-white rounded-lg border-collapse border border-[#d1e0f8]'>
                  <thead>
                    <tr className='bg-[#e6f0fd] text-left text-xs font-medium text-[#1c73fd]'>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Avatar</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Email</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Fullname</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Positions</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectManagers.map((manager) => (
                      <React.Fragment key={manager.email}>
                        <tr className='hover:bg-[#e6f0fd] transition-colors'>
                          <td className='px-5 py-3'>
                            {manager.avatar && (
                              <img
                                src={manager.avatar}
                                alt={`${getFullnameFromEmail(manager.email)} avatar`}
                                className='w-10 h-10 rounded-full'
                              />
                            )}
                          </td>
                          <td className='px-5 py-3'>{manager.email}</td>
                          <td className='px-5 py-3'>{getFullnameFromEmail(manager.email)}</td>
                          <td className='px-5 py-3'>
                            <div className='flex flex-wrap gap-2'>
                              {manager.positions.map((position) => (
                                <span
                                  key={position}
                                  className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-2.5 py-1 rounded-full'
                                >
                                  {position}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className='px-5 py-3 items-center'>
                            <button
                              onClick={() =>
                                setViewDetailsMember(
                                  viewDetailsMember === manager.email ? null : manager.email
                                )
                              }
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out min-w-[60px] text-center'
                            >
                              {viewDetailsMember === manager.email ? 'Hide' : 'Profile'}
                            </button>
                          </td>
                        </tr>
                        {viewDetailsMember === manager.email && manager.details && (
                          <tr>
                            <td colSpan={5} className='p-4 bg-[#f5f7fa]'>
                              <div className='space-y-2'>
                                <p>
                                  <strong>Years of Experience:</strong>{' '}
                                  {manager.details.yearsExperience} years
                                </p>
                                <p>
                                  <strong>Role:</strong> {manager.details.role}
                                </p>
                                <p>
                                  <strong>Completed Projects:</strong>{' '}
                                  {manager.details.completedProjects}
                                </p>
                                <p>
                                  <strong>Ongoing Projects:</strong>{' '}
                                  {manager.details.ongoingProjects}
                                </p>
                                <p>
                                  <strong>Past Positions:</strong>{' '}
                                  {manager.details.pastPositions.join(', ')}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {clients.length > 0 && (
              <div className='p-5 bg-gradient-to-br from-[#eef5ff] to-white rounded-xl shadow-xl border border-[#c2d6f8]'>
                <h3 className='text-lg font-semibold text-[#1c73fd] mb-4'>Clients</h3>
                <table className='w-full bg-white rounded-lg border-collapse border border-[#c2d6f8]'>
                  <thead>
                    <tr className='bg-[#eef5ff] text-left text-xs font-medium text-[#1c73fd]'>
                      <th className='px-5 py-3 border-b-2 border-[#c2d6f8]'>Avatar</th>
                      <th className='px-5 py-3 border-b-2 border-[#c2d6f8]'>Email</th>
                      <th className='px-5 py-3 border-b-2 border-[#c2d6f8]'>Fullname</th>
                      <th className='px-5 py-3 border-b-2 border-[#c2d6f8]'>Positions</th>
                      <th className='px-5 py-3 border-b-2 border-[#c2d6f8]'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <React.Fragment key={client.email}>
                        <tr className='hover:bg-[#eef5ff] transition-colors'>
                          <td className='px-5 py-3'>
                            {client.avatar && (
                              <img
                                src={client.avatar}
                                alt={`${getFullnameFromEmail(client.email)} avatar`}
                                className='w-10 h-10 rounded-full'
                              />
                            )}
                          </td>
                          <td className='px-5 py-3'>{client.email}</td>
                          <td className='px-5 py-3'>{getFullnameFromEmail(client.email)}</td>
                          <td className='px-5 py-3'>
                            <div className='flex flex-wrap gap-2'>
                              {client.positions.map((position) => (
                                <span
                                  key={position}
                                  className='bg-[#eef5ff] text-[#1c73fd] text-xs px-2.5 py-1 rounded-full'
                                >
                                  {position}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className='px-5 py-3 items-center'>
                            <button
                              onClick={() =>
                                setViewDetailsMember(
                                  viewDetailsMember === client.email ? null : client.email
                                )
                              }
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out min-w-[60px] text-center'
                            >
                              {viewDetailsMember === client.email ? 'Hide' : 'Profile'}
                            </button>
                          </td>
                        </tr>
                        {viewDetailsMember === client.email && client.details && (
                          <tr>
                            <td colSpan={5} className='p-4 bg-[#f5f7fa]'>
                              <div className='space-y-2'>
                                <p>
                                  <strong>Years of Experience:</strong>{' '}
                                  {client.details.yearsExperience} years
                                </p>
                                <p>
                                  <strong>Role:</strong> {client.details.role}
                                </p>
                                <p>
                                  <strong>Completed Projects:</strong>{' '}
                                  {client.details.completedProjects}
                                </p>
                                <p>
                                  <strong>Ongoing Projects:</strong>{' '}
                                  {client.details.ongoingProjects}
                                </p>
                                <p>
                                  <strong>Past Positions:</strong>{' '}
                                  {client.details.pastPositions.join(', ')}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {teamMembers.length > 0 && (
              <div className='p-5 bg-gradient-to-br from-[#f5f7fa] to-white rounded-xl shadow-xl border border-[#e0e6ed]'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Team Members</h3>
                <table className='w-full bg-white rounded-lg border-collapse border border-[#e0e6ed]'>
                  <thead>
                    <tr className='bg-[#f5f7fa] text-left text-xs font-medium text-gray-700'>
                      <th className='px-5 py-3 border-b-2 border-[#e0e6ed]'>Avatar</th>
                      <th className='px-5 py-3 border-b-2 border-[#e0e6ed]'>Email</th>
                      <th className='px-5 py-3 border-b-2 border-[#e0e6ed]'>Fullname</th>
                      <th className='px-5 py-3 border-b-2 border-[#e0e6ed]'>Positions</th>
                      <th className='px-5 py-3 border-b-2 border-[#e0e6ed]'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <React.Fragment key={member.email}>
                        <tr className='hover:bg-[#f5f7fa] transition-colors'>
                          <td className='px-5 py-3'>
                            {member.avatar && (
                              <img
                                src={member.avatar}
                                alt={`${getFullnameFromEmail(member.email)} avatar`}
                                className='w-10 h-10 rounded-full'
                              />
                            )}
                          </td>
                          <td className='px-5 py-3'>{member.email}</td>
                          <td className='px-5 py-3'>{getFullnameFromEmail(member.email)}</td>
                          <td className='px-5 py-3'>
                            <div className='flex flex-wrap gap-2'>
                              {member.positions.map((position) => (
                                <span
                                  key={position}
                                  className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-2.5 py-1 rounded-full'
                                >
                                  {position}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className='px-5 py-3 flex items-center justify-center gap-2'>
                            <button
                              onClick={() =>
                                setExpandedMember(
                                  expandedMember === member.email ? null : member.email
                                )
                              }
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out min-w-[60px] text-center'
                            >
                              {expandedMember === member.email ? 'Hide' : 'Positions'}
                            </button>
                            <button
                              onClick={() =>
                                setViewDetailsMember(
                                  viewDetailsMember === member.email ? null : member.email
                                )
                              }
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out min-w-[60px] text-center'
                            >
                              {viewDetailsMember === member.email ? 'Hide' : 'Profile'}
                            </button>
                          </td>
                        </tr>
                        {expandedMember === member.email && (
                          <tr>
                            <td colSpan={5} className='p-0'>
                              <div
                                className='overflow-hidden transition-all duration-300 ease-in-out bg-white'
                                style={{
                                  maxHeight: expandedMember === member.email ? '250px' : '0',
                                }}
                              >
                                <div className='p-4'>
                                  <div className='flex gap-4 mb-4'>
                                    <select
                                      value={newPosition}
                                      onChange={(e) => setNewPosition(e.target.value)}
                                      className='flex-1 px-3.5 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all'
                                    >
                                      <option value=''>Select a position</option>
                                      {positionData?.data?.map((pos) => (
                                        <option key={pos.id} value={pos.name}>
                                          {pos.label}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAddPosition(member.email, newPosition)}
                                      className='px-3.5 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md'
                                      disabled={!newPosition || isPositionLoading}
                                    >
                                      {isPositionLoading ? 'Loading...' : 'Add'}
                                    </button>
                                  </div>
                                  <div className='space-y-2'>
                                    {member.positions.map((position) => (
                                      <div
                                        key={position}
                                        className='flex items-center justify-between bg-[#e6f0fd] px-3.5 py-1.5 rounded-lg'
                                      >
                                        <span className='text-[#1c73fd]'>{position}</span>
                                        <button
                                          onClick={() =>
                                            handleRemovePosition(member.email, position)
                                          }
                                          className='text-[#1c73fd] hover:text-[#155ac7] transition'
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {viewDetailsMember === member.email && member.details && (
                          <tr>
                            <td colSpan={5} className='p-4 bg-[#f5f7fa]'>
                              <div className='space-y-2'>
                                <p>
                                  <strong>Years of Experience:</strong>{' '}
                                  {member.details.yearsExperience} years
                                </p>
                                <p>
                                  <strong>Role:</strong> {member.details.role}
                                </p>
                                <p>
                                  <strong>Completed Projects:</strong>{' '}
                                  {member.details.completedProjects}
                                </p>
                                <p>
                                  <strong>Ongoing Projects:</strong>{' '}
                                  {member.details.ongoingProjects}
                                </p>
                                <p>
                                  <strong>Past Positions:</strong>{' '}
                                  {member.details.pastPositions.join(', ')}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className='text-red-500 text-sm mt-4'>{errorMessage}</div>
      )}

      <div className='mt-10 flex justify-between items-center text-xs'>
        <span className='text-gray-600 font-semibold'>Step 2 of 2</span>
        <div className='flex gap-5'>
          <button
            onClick={onBack}
            className='text-gray-600 hover:text-gray-800 font-medium underline transition'
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className='px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
            disabled={isBulkCreating || !projectId}
          >
            {isBulkCreating ? 'Inviting...' : 'Invite and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteesForm;