import React from 'react';
import type { ProjectMember } from '../../../services/projectApi';

interface MembersSectionProps {
  projectMembers: ProjectMember[];
}

const MembersSection: React.FC<MembersSectionProps> = ({ projectMembers }) => {
  const groupedMembers = {
    Manager: [] as ProjectMember[],
    Leader: [] as ProjectMember[],
    Client: [] as ProjectMember[],
    Member: [] as ProjectMember[],
  };

  projectMembers.forEach((member) => {
    const roles = member.projectPositions.map((p) => p.position.toUpperCase());
    if (roles.includes('PROJECT_MANAGER')) groupedMembers.Manager.push(member);
    else if (roles.includes('TEAM_LEADER')) groupedMembers.Leader.push(member);
    else if (roles.includes('CLIENT')) groupedMembers.Client.push(member);
    else groupedMembers.Member.push(member);
  });

  const renderSingleRowMembers = (title: string, members: ProjectMember[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#1c73fd] mb-2 border-l-4 border-[#1c73fd] pl-3">
        {title} ({members.length})
      </h3>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition w-full sm:w-auto"
          >
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col">
              <p className="font-medium text-gray-800">
                {member.fullName}{' '}
                <span className="text-sm text-gray-500">(@{member.username})</span>
              </p>
              <p className="text-sm text-[#1c73fd]">
                {member.projectPositions.map((pos) => pos.position).join(', ')}
              </p>
              <p className="text-sm text-gray-600">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridMembers = (title: string, members: ProjectMember[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-[#1c73fd] mb-3 border-l-4 border-[#1c73fd] pl-3">
        {title} ({members.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all"
          >
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col gap-1">
              <p>
                <span className="font-medium text-gray-900">{member.fullName}</span>{' '}
                <span className="text-sm text-gray-500">(@{member.username})</span>
              </p>
              <p className="text-sm">
                <span className="inline-block bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium">
                  {member.projectPositions.map((pos) => pos.position).join(', ') || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-600">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1c73fd]/30">
        Project Members ({projectMembers.length})
      </h2>
      {renderSingleRowMembers('Project Manager', groupedMembers.Manager)}
      {renderSingleRowMembers('Team Leader', groupedMembers.Leader)}
      {renderSingleRowMembers('Client', groupedMembers.Client)}
      {renderGridMembers('Team Members', groupedMembers.Member)}
    </section>
  );
};

export default MembersSection;