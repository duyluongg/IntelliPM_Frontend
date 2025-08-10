import React from "react";
import { motion } from "framer-motion";
import { Users, User, Mail, Calendar } from "lucide-react";
import { useGetTeamsByAccountIdQuery } from "../../services/accountApi";

const TeamsHistoryPage: React.FC = () => {
  const accountId = Number(localStorage.getItem("accountId") || 0);

  const { data: teamsData, isLoading, isError } = useGetTeamsByAccountIdQuery(accountId, {
    skip: !accountId,
  });

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">Loading teams...</div>;
  }

  if (isError || !teamsData?.data) {
    return <div className="p-6 text-center text-red-500">Failed to load team history.</div>;
  }

  const { teams } = teamsData.data;

  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-[#1c73fd] flex items-center gap-2">
          <Users size={24} /> Teams History
        </h1>

        {teams.length > 0 ? (
          teams.map((team, index) => (
            <motion.div
              key={team.projectId}
              className="bg-white rounded-xl shadow p-6 border space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Project Info */}
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-lg font-semibold text-[#1c73fd]">{team.projectName}</h2>
                  <p className="text-sm text-gray-500">Project Key: {team.projectKey}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Total Members: <span className="font-bold">{team.totalMembers}</span>
                </p>
              </div>

              {/* Members List */}
              {team.members.length > 0 ? (
                <ul className="divide-y">
                  {team.members.map((member) => (
                    <li key={member.id} className="py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e6f0fd] flex items-center justify-center overflow-hidden">
                        {member.accountPicture ? (
                          <img
                            src={member.accountPicture}
                            alt={member.accountName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="text-[#1c73fd]" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.accountName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {member.accountEmail}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 flex flex-col items-end">
                        {member.joinedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> Joined:{" "}
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                        )}
                        {member.invitedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> Invited:{" "}
                            {new Date(member.invitedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No members found.</p>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No team history available.</p>
        )}
      </motion.div>
    </div>
  );
};

export default TeamsHistoryPage;
