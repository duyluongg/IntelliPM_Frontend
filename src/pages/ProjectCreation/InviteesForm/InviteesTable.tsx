import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

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
  const [popupMember, setPopupMember] = useState<string | null>(null);

  // Function to format position strings: remove underscores and capitalize first letter of each word
  const formatPosition = (position: string) => {
    return position
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handlePopupOpen = (email: string) => {
    setPopupMember(email);
    setViewDetailsMember(email);
    if (teamMembers.some((member) => member.email === email)) {
      setExpandedMember(email);
    }
  };

  const handlePopupClose = () => {
    setPopupMember(null);
    setViewDetailsMember(null);
    setExpandedMember(null);
  };

  return (
    <div className="mt-6 space-y-6">
      {projectManagers.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-[#e6f0fd] to-white rounded-xl shadow-lg border border-[#d1e0f8]">
          <h3 className="text-xl font-semibold text-[#1c73fd] mb-4">Project Manager</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg border-collapse border border-[#d1e0f8] min-w-[700px] md:min-w-[500px]">
              <thead>
                <tr className="bg-[#e6f0fd] text-left text-sm font-medium text-[#1c73fd]">
                  <th className="px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[100px]">Avatar</th>
                  <th className="px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[200px]">Email</th>
                  <th className="px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[150px]">Fullname</th>
                  <th className="px-6 py-4 border-b-2 border-[#d1e0f8] min-w-[200px]">Positions</th>
                </tr>
              </thead>
              <tbody>
                {projectManagers.map((manager) => (
                  <tr key={manager.email} className="hover:bg-[#e6f0fd] transition-colors">
                    <td className="px-6 py-4">
                      {manager.avatar && (
                        <img
                          src={manager.avatar}
                          alt={`${getFullnameFromEmail(manager.email)} avatar`}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{manager.email}</td>
                    <td className="px-6 py-4 text-sm">{getFullnameFromEmail(manager.email)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {manager.positions.map((position) => (
                          <span
                            key={position}
                            className="bg-[#e6f0fd] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition"
                          >
                            {formatPosition(position)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clients.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-[#eef5ff] to-white rounded-xl shadow-lg border border-[#c2d6f8]">
          <h3 className="text-xl font-semibold text-[#1c73fd] mb-4">Clients</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg border-collapse border border-[#c2d6f8] min-w-[700px] md:min-w-[500px]">
              <thead>
                <tr className="bg-[#eef5ff] text-left text-sm font-medium text-[#1c73fd]">
                  <th className="px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[100px]">Avatar</th>
                  <th className="px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[200px]">Email</th>
                  <th className="px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[150px]">Fullname</th>
                  <th className="px-6 py-4 border-b-2 border-[#c2d6f8] min-w-[200px]">Positions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.email} className="hover:bg-[#eef5ff] transition-colors">
                    <td className="px-6 py-4">
                      {client.avatar && (
                        <img
                          src={client.avatar}
                          alt={`${getFullnameFromEmail(client.email)} avatar`}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{client.email}</td>
                    <td className="px-6 py-4 text-sm">{getFullnameFromEmail(client.email)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {client.positions.map((position) => (
                          <span
                            key={position}
                            className="bg-[#eef5ff] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition"
                          >
                            {formatPosition(position)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {teamMembers.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-[#f5f7fa] to-white rounded-xl shadow-lg border border-[#e0e6ed]">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg border-collapse border border-[#e0e6ed] min-w-[700px] md:min-w-[500px]">
              <thead>
                <tr className="bg-[#f5f7fa] text-left text-sm font-medium text-gray-700">
                  <th className="px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[100px]">Avatar</th>
                  <th className="px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[200px]">Email</th>
                  <th className="px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[150px]">Fullname</th>
                  <th className="px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[200px]">Positions</th>
                  <th className="px-6 py-4 border-b-2 border-[#e0e6ed] min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <React.Fragment key={member.email}>
                    <tr className="hover:bg-[#f5f7fa] transition-colors">
                      <td className="px-6 py-4">
                        {member.avatar && (
                          <img
                            src={member.avatar}
                            alt={`${getFullnameFromEmail(member.email)} avatar`}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{member.email}</td>
                      <td className="px-6 py-4 text-sm">{getFullnameFromEmail(member.email)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {member.positions.map((position) => (
                            <span
                              key={position}
                              className="bg-[#e6f0fd] text-[#1c73fd] text-xs px-3 py-1.5 rounded-full hover:bg-[#d1e0f8] transition"
                            >
                              {formatPosition(position)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center">
                        <button
                          onClick={() => handlePopupOpen(member.email)}
                          className="bg-[#e6f0fd] text-[#1c73fd] hover:bg-[#1c73fd] hover:text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out min-w-[100px] text-center text-sm"
                        >
                          Positions
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {popupMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={handlePopupClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            {invitees.map(
              (invitee) =>
                invitee.email === popupMember &&
                invitee.details && (
                  <div key={invitee.email} className="space-y-6">
                    <div className="space-y-3 text-sm">
                      <h4 className="text-lg font-semibold text-[#1c73fd]">
                        {getFullnameFromEmail(invitee.email)}
                      </h4>
                      <p>
                        <strong>Email:</strong> {invitee.email}
                      </p>
                      <p>
                        <strong>Years of Experience:</strong> {invitee.details.yearsExperience} years
                      </p>
                      <p>
                        <strong>Role:</strong> {formatPosition(invitee.details.role)}
                      </p>
                      <p>
                        <strong>Completed Projects:</strong> {invitee.details.completedProjects}
                      </p>
                      <p>
                        <strong>Ongoing Projects:</strong> {invitee.details.ongoingProjects}
                      </p>
                      <p>
                        <strong>Past Positions:</strong> {invitee.details.pastPositions.map(formatPosition).join(', ')}
                      </p>
                    </div>
                    {teamMembers.some((member) => member.email === invitee.email) && (
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800">Manage Positions</h4>
                        <div className="flex gap-4">
                          <select
                            value={newPosition}
                            onChange={(e) => setNewPosition(e.target.value)}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] transition-all text-sm"
                          >
                            <option value="">Select a position</option>
                            {positionData?.map((pos) => (
                              <option key={pos.id} value={pos.name}>
                                {formatPosition(pos.label)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddPosition(invitee.email, newPosition)}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md text-sm"
                            disabled={!newPosition || isPositionLoading}
                          >
                            {isPositionLoading ? 'Loading...' : 'Add'}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {invitee.positions.map((position) => (
                            <div
                              key={position}
                              className="flex items-center justify-between bg-[#e6f0fd] px-4 py-2 rounded-lg hover:bg-[#d1e0f8] transition"
                            >
                              <span className="text-[#1c73fd] text-sm">{formatPosition(position)}</span>
                              <button
                                onClick={() => handleRemovePosition(invitee.email, position)}
                                className="text-[#1c73fd] hover:text-[#155ac7] text-sm transition"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteesTable;
