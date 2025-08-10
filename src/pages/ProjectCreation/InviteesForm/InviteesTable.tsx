import React, { useState } from 'react';
import { BookUser } from 'lucide-react';
import ProfilePopup from './ProfilePopup';
import PositionPopup from './PositionPopup';

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
  handleAddPosition: (email: string, position: string) => void;
  handleRemovePosition: (email: string, position: string) => void;
  viewDetailsMember: string | null;
  setViewDetailsMember: (email: string | null) => void;
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
  handleAddPosition,
  handleRemovePosition,
  viewDetailsMember,
  setViewDetailsMember,
  getFullnameFromEmail,
}) => {
  const projectManagers = invitees.filter((inv) => inv.role === 'Project Manager');
  const teamMembers = invitees.filter((inv) => inv.role === 'Team Member');
  const clients = invitees.filter((inv) => inv.role === 'Client');
  const [profilePopupMember, setProfilePopupMember] = useState<string | null>(null);
  const [positionPopupMember, setPositionPopupMember] = useState<string | null>(null);

  // Function to format position strings: remove underscores and capitalize first letter of each word
  const formatPosition = (position: string) => {
    return position
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleProfilePopupOpen = (email: string) => {
    setProfilePopupMember(email);
    setViewDetailsMember(email);
  };

  const handleProfilePopupClose = () => {
    setProfilePopupMember(null);
    setViewDetailsMember(null);
  };

  const handlePositionPopupOpen = (email: string) => {
    setPositionPopupMember(email);
    setExpandedMember(email);
  };

  const handlePositionPopupClose = () => {
    setPositionPopupMember(null);
    setExpandedMember(null);
  };

  return (
    <div className='mt-6 space-y-6'>
      {projectManagers.length > 0 && (
        <div className='p-6 bg-gradient-to-br from-[#e6f0fd] to-white rounded-xl shadow-lg border border-[#d1e0f8]'>
          <h3 className='text-xl font-semibold text-[#1c73fd] mb-4'>Project Manager</h3>
          <div className='overflow-x-auto'>
            <table className='w-full bg-white rounded-lg border-collapse border border-[#d1e0f8] min-w-[700px] md:min-w-[500px]'>
              <thead>
                <tr className='bg-[#e6f0fd] text-left text-sm font-medium text-[#1c73fd]'>
                  <th className='px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[100px]'>Avatar</th>
                  <th className='px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[200px]'>Email</th>
                  <th className='px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[150px]'>Fullname</th>
                  <th className='px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[200px]'>Positions</th>
                  <th className='px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[150px] text-center'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectManagers.map((manager) => (
                  <tr key={manager.email} className='hover:bg-[#e6f0fd] transition-colors'>
                    <td className='px-6 py-4'>
                      {manager.avatar && (
                        <img
                          src={manager.avatar}
                          alt={`${getFullnameFromEmail(manager.email)} avatar`}
                          className='w-10 h-10 rounded-full'
                        />
                      )}
                    </td>
                    <td className='px-6 py-4 text-sm'>{manager.email}</td>
                    <td className='px-6 py-4 text-sm'>{getFullnameFromEmail(manager.email)}</td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        {manager.positions.map((position) => (
                          <span
                            key={position}
                            className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition'
                          >
                            {formatPosition(position)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4 flex items-center justify-center'>
                      <button
                        onClick={() => handleProfilePopupOpen(manager.email)}
                        className='bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white p-2 rounded-lg transition duration-200 ease-in-out'
                        aria-label='View profile'
                      >
                        <BookUser size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clients.length > 0 && (
        <div className='p-6 bg-gradient-to-br from-[#eef5ff] to-white rounded-xl shadow-lg border border-[#c2d6f8]'>
          <h3 className='text-xl font-semibold text-[#1c73fd] mb-4'>Clients</h3>
          <div className='overflow-x-auto'>
            <table className='w-full bg-white rounded-lg border-collapse border border-[#c2d6f8] min-w-[700px] md:min-w-[500px]'>
              <thead>
                <tr className='bg-[#eef5ff] text-left text-sm font-medium text-[#1c73fd]'>
                  <th className='px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[100px]'>Avatar</th>
                  <th className='px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[200px]'>Email</th>
                  <th className='px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[150px]'>Fullname</th>
                  <th className='px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[200px]'>Positions</th>
                  <th className='px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[150px] text-center'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.email} className='hover:bg-[#eef5ff] transition-colors'>
                    <td className='px-6 py-4'>
                      {client.avatar && (
                        <img
                          src={client.avatar}
                          alt={`${getFullnameFromEmail(client.email)} avatar`}
                          className='w-10 h-10 rounded-full'
                        />
                      )}
                    </td>
                    <td className='px-6 py-4 text-sm'>{client.email}</td>
                    <td className='px-6 py-4 text-sm'>{getFullnameFromEmail(client.email)}</td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        {client.positions.map((position) => (
                          <span
                            key={position}
                            className='bg-[#eef5ff] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition'
                          >
                            {formatPosition(position)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4 flex items-center justify-center'>
                      <button
                        onClick={() => handleProfilePopupOpen(client.email)}
                        className='bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white p-2 rounded-lg transition duration-200 ease-in-out'
                        aria-label='View profile'
                      >
                        <BookUser size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {teamMembers.length > 0 && (
        <div className='p-6 bg-gradient-to-br from-[#f5f7fa] to-white rounded-xl shadow-lg border border-[#e0e6ed]'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Team Members</h3>
          <div className='overflow-x-auto'>
            <table className='w-full bg-white rounded-lg border-collapse border border-[#e0e6ed] min-w-[700px] md:min-w-[500px]'>
              <thead>
                <tr className='bg-[#f5f7fa] text-left text-sm font-medium text-gray-700'>
                  <th className='px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[100px]'>Avatar</th>
                  <th className='px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[200px]'>Email</th>
                  <th className='px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[150px]'>Fullname</th>
                  <th className='px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[200px]'>Positions</th>
                  <th className='px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[150px] text-center'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <React.Fragment key={member.email}>
                    <tr className='hover:bg-[#f5f7fa] transition-colors'>
                      <td className='px-6 py-4'>
                        {member.avatar && (
                          <img
                            src={member.avatar}
                            alt={`${getFullnameFromEmail(member.email)} avatar`}
                            className='w-10 h-10 rounded-full'
                          />
                        )}
                      </td>
                      <td className='px-6 py-4 text-sm'>{member.email}</td>
                      <td className='px-6 py-4 text-sm'>{getFullnameFromEmail(member.email)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-2'>
                          {member.positions.map((position) => (
                            <span
                              key={position}
                              className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition'
                            >
                              {formatPosition(position)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 flex items-center justify-center gap-3'>
                        <button
                          onClick={() => handlePositionPopupOpen(member.email)}
                          className='flex items-center gap-2 bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white px-3 py-2 rounded-lg transition duration-200 ease-in-out text-sm font-medium'
                          aria-label='Manage positions'
                        >
                          <span className='text-lg font-bold'>+</span>
                          Positions
                        </button>

                        <button
                          onClick={() => handleProfilePopupOpen(member.email)}
                          className='bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white p-2 rounded-lg transition duration-200 ease-in-out'
                          aria-label='View profile'
                        >
                          <BookUser size={20} />
                        </button>
                      </td>
                    </tr>
                    {expandedMember === member.email && (
                      <tr>
                        <td colSpan={5} className='p-0'>
                          <div
                            className='overflow-hidden transition-all duration-300 ease-in-out bg-white shadow-md'
                            style={{
                              maxHeight: expandedMember === member.email ? '300px' : '0',
                            }}
                          >
                            <div className='p-5'>
                              <div className='flex gap-4 mb-4'>
                                <select
                                  value={newPosition}
                                  onChange={(e) => setNewPosition(e.target.value)}
                                  className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all text-sm'
                                >
                                  <option value=''>Select a position</option>
                                  {positionData?.map((pos) => (
                                    <option key={pos.id} value={pos.name}>
                                      {formatPosition(pos.label)}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAddPosition(member.email, newPosition)}
                                  className='px-4 py-2.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md text-sm'
                                  disabled={!newPosition || isPositionLoading}
                                >
                                  {isPositionLoading ? 'Loading...' : 'Add'}
                                </button>
                              </div>
                              <div className='space-y-2'>
                                {member.positions.map((position) => (
                                  <div
                                    key={position}
                                    className='flex items-center justify-between bg-[#e6f0fd] px-4 py-2 rounded-lg hover:bg-[#d1e0f8] transition'
                                  >
                                    <span className='text-[#1c73fd] text-sm'>
                                      {formatPosition(position)}
                                    </span>
                                    <button
                                      onClick={() => handleRemovePosition(member.email, position)}
                                      className='text-[#1c73fd] hover:text-[#155ac7] text-sm transition'
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {profilePopupMember && (
        <ProfilePopup
          email={profilePopupMember}
          onClose={handleProfilePopupClose}
          getFullnameFromEmail={getFullnameFromEmail}
        />
      )}

      {positionPopupMember && (
        <PositionPopup
          invitee={invitees.find((inv) => inv.email === positionPopupMember)!}
          positionData={positionData}
          isPositionLoading={isPositionLoading}
          newPosition={newPosition}
          setNewPosition={setNewPosition}
          handleAddPosition={handleAddPosition}
          handleRemovePosition={handleRemovePosition}
          getFullnameFromEmail={getFullnameFromEmail}
          onClose={handlePositionPopupClose}
        />
      )}
    </div>
  );
};

export default InviteesTable;
