import React from 'react';

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

interface Position {
  id: number;
  name: string;
  label: string;
}

interface InviteesTableProps {
  invitees: Invitee[];
  positionData?: Position[];
  isPositionLoading: boolean;
  expandedMember: string | null;
  setExpandedMember: (email: string | null) => void;
  newPosition: string;
  setNewPosition: (position: string) => void;
  viewDetailsMember: string | null;
  setViewDetailsMember: (email: string | null) => void;
  handleAddPosition: (email: string, position: string) => void;
  handleRemovePosition: (email: string, position: string) => void;
  getFullnameFromEmail: (email: string) => string;
}

const InviteesTable: React.FC<InviteesTableProps> = ({
  invitees,
  positionData,
  isPositionLoading,
  expandedMember,
  setExpandedMember,
  newPosition,
  setNewPosition,
  viewDetailsMember,
  setViewDetailsMember,
  handleAddPosition,
  handleRemovePosition,
  getFullnameFromEmail,
}) => {
  const projectManagers = invitees.filter((inv) => inv.role === 'Project Manager');
  const teamMembers = invitees.filter((inv) => inv.role === 'Team Member');
  const clients = invitees.filter((inv) => inv.role === 'Client');

  return (
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
                                {positionData?.map((pos) => (
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
  );
};

export default InviteesTable;