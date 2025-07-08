import React from 'react';
import { useGetProjectDetailsByIdQuery } from '../../../services/projectApi';
import { useSelector } from 'react-redux';
import { selectProjectId } from '../../../components/slices/Project/projectCreationSlice';
import { CheckCircle, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectOverview: React.FC = () => {
  const projectId = useSelector(selectProjectId);
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetProjectDetailsByIdQuery(projectId || 0, {
    skip: !projectId,
  });

  if (isLoading) return <div className="text-center py-10 text-gray-600">Loading...</div>;
  if (error || !data?.isSuccess) return <div className="text-center py-10 text-red-500">Error loading project details.</div>;
  if (!data.data) return <div className="text-center py-10 text-gray-600">No project data available.</div>;

  const {
    name,
    projectKey,
    description,
    budget,
    projectType,
    startDate,
    endDate,
    status,
    requirements,
    projectMembers
  } = data.data;

  const groupedMembers = {
    Manager: [] as typeof projectMembers,
    Leader: [] as typeof projectMembers,
    Client: [] as typeof projectMembers,
    Member: [] as typeof projectMembers,
  };

  projectMembers.forEach((member) => {
    const roles = member.projectPositions.map(p => p.position.toUpperCase());
    if (roles.includes('PROJECT_MANAGER')) groupedMembers.Manager.push(member);
    else if (roles.includes('TEAM_LEADER')) groupedMembers.Leader.push(member);
    else if (roles.includes('CLIENT')) groupedMembers.Client.push(member);
    else groupedMembers.Member.push(member);
  });

  const functionalReqs = requirements.filter(r => r.type === 'FUNCTIONAL');
  const nonFunctionalReqs = requirements.filter(r => r.type === 'NON_FUNCTIONAL');

  const renderRequirements = (title: string, reqs: typeof requirements) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-[#1c73fd] mb-3 border-l-4 border-[#1c73fd] pl-3">
        {title} ({reqs.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reqs.map((req) => (
          <div key={req.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
            <p><strong className="text-[#1c73fd]">Title:</strong> {req.title}</p>
            <p><strong className="text-[#1c73fd]">Type:</strong> {req.type}</p>
            <p><strong className="text-[#1c73fd]">Description:</strong> {req.description}</p>
            <p><strong className="text-[#1c73fd]">Priority:</strong> {req.priority}</p>
            <p><strong className="text-[#1c73fd]">Created:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSingleRowMembers = (title: string, members: typeof projectMembers) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#1c73fd] mb-2 border-l-4 border-[#1c73fd] pl-3">
        {title} ({members.length})
      </h3>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition w-full sm:w-auto">
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col">
              <p className="font-medium text-gray-800">{member.fullName} <span className="text-sm text-gray-500">(@{member.username})</span></p>
              <p className="text-sm text-[#1c73fd]">{member.projectPositions.map(pos => pos.position).join(', ')}</p>
              <p className="text-sm text-gray-600">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridMembers = (title: string, members: typeof projectMembers) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-[#1c73fd] mb-3 border-l-4 border-[#1c73fd] pl-3">
        {title} ({members.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all">
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col gap-1">
              <p><span className="font-medium text-gray-900">{member.fullName}</span> <span className="text-sm text-gray-500">(@{member.username})</span></p>
              <p className="text-sm">
                <span className="inline-block bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium">
                  {member.projectPositions.map(pos => pos.position).join(', ') || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-600">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Handle Save and Exit with confirmation
  const handleSaveAndExit = () => {
    const confirmExit = window.confirm('Are you sure you want to exit?');
    if (confirmExit) {
      window.history.back();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <h1 className="text-4xl font-bold text-[#1c73fd] mb-4">🎯 Project Overview</h1>
      <p className="text-gray-600 mb-10 text-lg leading-relaxed">
        Let’s make sure everything looks sharp before the official launch.<br />
        👥 Project Members ({projectMembers.length}) | 🧩 Requirements ({requirements.length})
      </p>

      {/* Section: Project Info */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📁 <span className="border-b-2 border-[#1c73fd] pb-1">Project Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f0f6ff] border border-[#d0e3ff] p-6 rounded-2xl shadow-md space-y-3">
            <p><strong className="text-[#1c73fd]">📌 Name:</strong> <span className="text-gray-800">{name}</span></p>
            <p><strong className="text-[#1c73fd]">🆔 Key:</strong> <span className="text-gray-800">{projectKey}</span></p>
            <p><strong className="text-[#1c73fd]">📝 Description:</strong> <span className="text-gray-800">{description}</span></p>
          </div>
          <div className="bg-[#f0f6ff] border border-[#d0e3ff] p-6 rounded-2xl shadow-md space-y-3">
            <p><strong className="text-[#1c73fd]">💰 Budget:</strong> <span className="text-gray-800">{budget.toLocaleString()} VND</span></p>
            <p><strong className="text-[#1c73fd]">📂 Type:</strong> <span className="text-gray-800">{projectType}</span></p>
            <p><strong className="text-[#1c73fd]">📅 Start Date:</strong> <span className="text-gray-800">{new Date(startDate).toLocaleDateString()}</span></p>
            <p><strong className="text-[#1c73fd]">📅 End Date:</strong> <span className="text-gray-800">{new Date(endDate).toLocaleDateString()}</span></p>
            <p><strong className="text-[#1c73fd]">📌 Status:</strong> <span className="text-gray-800">{status}</span></p>
          </div>
        </div>
      </section>

      {/* Section: Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1c73fd]/30">🧩 Requirements ({requirements.length})</h2>
        {renderRequirements('Functional Requirements', functionalReqs)}
        {renderRequirements('Non-Functional Requirements', nonFunctionalReqs)}
      </section>

      {/* Section: Members */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1c73fd]/30">👥 Project Members ({projectMembers.length})</h2>
        {renderSingleRowMembers('Project Manager', groupedMembers.Manager)}
        {renderSingleRowMembers('Team Leader', groupedMembers.Leader)}
        {renderSingleRowMembers('Client(s)', groupedMembers.Client)}
        {renderGridMembers('Team Member(s)', groupedMembers.Member)}
      </section>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={() => navigate(`/project/${projectKey}/task-setup`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl text-base font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Create Task
        </button>

        <button
          onClick={handleSaveAndExit}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-xl hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-300 shadow-md hover:shadow-xl text-base font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          Save and Exit
        </button>
      </div>
    </div>
  );
};

export default ProjectOverview;