import React, { useState, useEffect } from 'react';

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
}

interface Invitee {
  email: string;
  role: string;
  positions: string[];
  details?: InviteeDetails; // Thêm thông tin chi tiết (tùy chọn)
}

const InviteesForm: React.FC<InviteesFormProps> = ({ initialData, onNext, onBack }) => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null); // Theo dõi thành viên đang mở
  const [newPosition, setNewPosition] = useState(''); // Thêm state cho newPosition
  const [viewDetailsMember, setViewDetailsMember] = useState<string | null>(null); // Thêm state để xem thông tin chi tiết

  // Initialize invitees from initialData with roles, default positions, and sample details
  useEffect(() => {
    if (initialData.invitees && initialData.invitees.length > 0) {
      const updatedInvitees = initialData.invitees.map((email, index) => ({
        email,
        role: index === 0 ? 'Manager' : 'Team Member',
        positions: index === 0 ? ['Project Lead'] : ['Developer'],
        details: {
          yearsExperience: index === 0 ? 10 : 5,
          role: index === 0 ? 'Senior Manager' : 'Junior Developer',
          completedProjects: index === 0 ? 15 : 8,
          ongoingProjects: index === 0 ? 2 : 1,
          pastPositions: index === 0 ? ['Project Lead', 'Senior Developer'] : ['Developer', 'Tester'],
        },
      }));
      setInvitees(updatedInvitees);
    }
  }, [initialData.invitees]);

  const handleAddInvitee = () => {
    if (inputValue.trim() && !invitees.some((inv) => inv.email === inputValue.trim())) {
      setInvitees([
        ...invitees,
        {
          email: inputValue.trim(),
          role: 'Team Member',
          positions: ['Developer'],
          details: {
            yearsExperience: 3,
            role: 'Junior Developer',
            completedProjects: 2,
            ongoingProjects: 0,
            pastPositions: ['Developer'],
          },
        },
      ]);
      setInputValue('');
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
    await onNext();
  };

  const getFullnameFromEmail = (email: string) => {
    return email.split('@')[0] || email;
  };

  const manager = invitees.find((inv) => inv.role === 'Manager');
  const teamMembers = invitees.filter((inv) => inv.role !== 'Manager');

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
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInvitee()}
            className='flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all placeholder-gray-400'
          />
          <button
            onClick={handleAddInvitee}
            className='w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-lg hover:shadow-xl'
          >
            Add Invitee
          </button>
        </div>

        <div className='flex flex-wrap gap-3'>
          {invitees.map((invitee) => (
            <span
              key={invitee.email}
              className='bg-[#e6f0fd] text-[#1c73fd] text-xs px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md'
            >
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
            {manager && (
              <div className='p-5 bg-gradient-to-br from-[#e6f0fd] to-white rounded-xl shadow-xl border border-[#d1e0f8]'>
                <h3 className='text-lg font-semibold text-[#1c73fd] mb-4'>Project Manager</h3>
                <table className='w-full bg-white rounded-lg'>
                  <thead>
                    <tr className='bg-[#e6f0fd] text-left text-xs font-medium text-[#1c73fd]'>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Email</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Fullname</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Positions</th>
                      <th className='px-5 py-3 border-b-2 border-[#d1e0f8]'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='hover:bg-[#e6f0fd] transition-colors'>
                      <td className='px-5 py-3 border-b border-[#d1e0f8]'>{manager.email}</td>
                      <td className='px-5 py-3 border-b border-[#d1e0f8]'>{getFullnameFromEmail(manager.email)}</td>
                      <td className='px-5 py-3 border-b border-[#d1e0f8]'>
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
                      <td className='px-5 py-3 border-b border-[#d1e0f8] flex items-center gap-2'>
                        <button
                          onClick={() => setExpandedMember(expandedMember === manager.email ? null : manager.email)}
                          className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out'
                          title={expandedMember === manager.email ? 'Hide' : 'Edit Positions'}
                        >
                          {expandedMember === manager.email ? 'Hide' : 'Positions'}
                        </button>
                        <button
                          onClick={() => setViewDetailsMember(viewDetailsMember === manager.email ? null : manager.email)}
                          className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out'
                          title={viewDetailsMember === manager.email ? 'Hide Details' : 'View Details'}
                        >
                          {viewDetailsMember === manager.email ? 'Hide' : 'Profile'}
                        </button>
                      </td>
                    </tr>
                    {expandedMember === manager.email && (
                      <tr>
                        <td colSpan={4} className='p-0'>
                          <div
                            className='overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-[#d1e0f8]'
                            style={{ maxHeight: expandedMember === manager.email ? '250px' : '0' }}
                          >
                            <div className='p-4'>
                              <div className='flex gap-4 mb-4'>
                                <select
                                  value={newPosition}
                                  onChange={(e) => setNewPosition(e.target.value)}
                                  className='flex-1 px-3.5 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all'
                                >
                                  <option value=''>Select a position</option>
                                  <option value='Developer'>Developer</option>
                                  <option value='Tester'>Tester</option>
                                  <option value='Designer'>Designer</option>
                                  <option value='Analyst'>Analyst</option>
                                </select>
                                <button
                                  onClick={() => handleAddPosition(manager.email, newPosition)}
                                  className='px-3.5 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md'
                                  disabled={!newPosition}
                                >
                                  Add
                                </button>
                              </div>
                              <div className='space-y-2'>
                                {manager.positions.map((position) => (
                                  <div
                                    key={position}
                                    className='flex items-center justify-between bg-[#e6f0fd] px-3.5 py-1.5 rounded-lg'
                                  >
                                    <span className='text-[#1c73fd]'>{position}</span>
                                    <button
                                      onClick={() => handleRemovePosition(manager.email, position)}
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
                    {viewDetailsMember === manager.email && manager.details && (
                      <tr>
                        <td colSpan={4} className='p-4 bg-[#f5f7fa] border-t border-[#d1e0f8]'>
                          <div className='space-y-2'>
                            <p><strong>Years of Experience:</strong> {manager.details.yearsExperience} years</p>
                            <p><strong>Role:</strong> {manager.details.role}</p>
                            <p><strong>Completed Projects:</strong> {manager.details.completedProjects}</p>
                            <p><strong>Ongoing Projects:</strong> {manager.details.ongoingProjects}</p>
                            <p><strong>Past Positions:</strong> {manager.details.pastPositions.join(', ')}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {teamMembers.length > 0 && (
              <div className='p-5 bg-gradient-to-br from-[#f5f7fa] to-white rounded-xl shadow-xl border border-[#e0e6ed]'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Team Members</h3>
                <table className='w-full bg-white rounded-lg'>
                  <thead>
                    <tr className='bg-[#f5f7fa] text-left text-xs font-medium text-gray-700'>
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
                          <td className='px-5 py-3 border-b border-[#e0e6ed]'>{member.email}</td>
                          <td className='px-5 py-3 border-b border-[#e0e6ed]'>{getFullnameFromEmail(member.email)}</td>
                          <td className='px-5 py-3 border-b border-[#e0e6ed]'>
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
                          <td className='px-5 py-3 border-b border-[#e0e6ed] flex items-center gap-2'>
                            <button
                              onClick={() => setExpandedMember(expandedMember === member.email ? null : member.email)}
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out'
                              title={expandedMember === member.email ? 'Hide' : 'Edit Positions'}
                            >
                              {expandedMember === member.email ? 'Hide' : 'Positions'}
                            </button>
                            <button
                              onClick={() => setViewDetailsMember(viewDetailsMember === member.email ? null : member.email)}
                              className='text-[#1c73fd] hover:text-[#155ac7] px-2 py-1 rounded transition duration-200 ease-in-out'
                              title={viewDetailsMember === member.email ? 'Hide Details' : 'View Details'}
                            >
                              {viewDetailsMember === member.email ? 'Hide' : 'Profile'}
                            </button>
                          </td>
                        </tr>
                        {expandedMember === member.email && (
                          <tr>
                            <td colSpan={4} className='p-0'>
                              <div
                                className='overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-[#e0e6ed]'
                                style={{ maxHeight: expandedMember === member.email ? '250px' : '0' }}
                              >
                                <div className='p-4'>
                                  <div className='flex gap-4 mb-4'>
                                    <select
                                      value={newPosition}
                                      onChange={(e) => setNewPosition(e.target.value)}
                                      className='flex-1 px-3.5 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/20 focus:border-[#1c73fd] transition-all'
                                    >
                                      <option value=''>Select a position</option>
                                      <option value='Developer'>Developer</option>
                                      <option value='Tester'>Tester</option>
                                      <option value='Designer'>Designer</option>
                                      <option value='Analyst'>Analyst</option>
                                    </select>
                                    <button
                                      onClick={() => handleAddPosition(member.email, newPosition)}
                                      className='px-3.5 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all shadow-md'
                                      disabled={!newPosition}
                                    >
                                      Add
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
                                          onClick={() => handleRemovePosition(member.email, position)}
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
                            <td colSpan={4} className='p-4 bg-[#f5f7fa] border-t border-[#e0e6ed]'>
                              <div className='space-y-2'>
                                <p><strong>Years of Experience:</strong> {member.details.yearsExperience} years</p>
                                <p><strong>Role:</strong> {member.details.role}</p>
                                <p><strong>Completed Projects:</strong> {member.details.completedProjects}</p>
                                <p><strong>Ongoing Projects:</strong> {member.details.ongoingProjects}</p>
                                <p><strong>Past Positions:</strong> {member.details.pastPositions.join(', ')}</p>
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
          >
            Invite and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteesForm;