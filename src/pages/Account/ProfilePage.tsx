import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  Calendar,
  Mail,
  UserCircle,
} from "lucide-react";
import { useGetProfileByEmailQuery } from "../../services/accountApi";

const formatPosition = (position: string) => {
  return position
    ?.replace(/_/g, " ")
    ?.split(" ")
    ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    ?.join(" ");
};

const ProfilePage: React.FC = () => {
  const email = localStorage.getItem("email") || "";
  const { data: profileData, isLoading, isError } = useGetProfileByEmailQuery(
    email,
    { skip: !email }
  );

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (isError || !profileData?.data) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load profile.
      </div>
    );
  }

  const profile = profileData.data;

  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 border-b pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-20 h-20 rounded-full bg-[#e6f0fd] flex items-center justify-center shadow-md overflow-hidden">
            {profile.picture ? (
              <img
                src={profile.picture}
                alt={profile.fullName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="text-[#1c73fd]" size={40} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1c73fd]">
              {profile.fullName}
            </h1>
            <p className="text-sm text-gray-500">
              {formatPosition(profile.role)}
            </p>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          className="bg-white rounded-xl shadow p-6 space-y-4 border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-[#1c73fd]">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#1c73fd]" /> {profile.email}
            </div>
            <div className="flex items-center gap-2">
              <UserCircle size={16} className="text-[#1c73fd]" />{" "}
              {profile.gender}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#1c73fd]" />{" "}
              {profile.dateOfBirth || "Not provided"}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[#1c73fd]" />{" "}
              {profile.status}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: "Total Projects", value: profile.totalProjects },
            { label: "Completed", value: profile.completedProjects },
            { label: "In Progress", value: profile.inProgressProjects },
            { label: "Upcoming", value: profile.upcomingProjects },
            { label: "Active", value: profile.activeProjects },
            { label: "Cancelled", value: profile.cancelledProjects },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white p-4 rounded-lg shadow text-center border hover:shadow-lg transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
            >
              <p className="text-xl font-bold text-[#1c73fd]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Project List */}
        <motion.div
          className="bg-white rounded-xl shadow p-6 space-y-4 border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-[#1c73fd]">Projects</h2>
          {profile.projectList.length > 0 ? (
            <ul className="divide-y">
              {profile.projectList.map((project, index) => (
                <motion.li
                  key={project.projectId}
                  className="py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 transition"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                >
                  {project.iconUrl ? (
                    <img
                      src={project.iconUrl}
                      alt={project.projectName}
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <Briefcase className="text-[#1c73fd]" size={20} />
                  )}
                  <div>
                    <p className="font-medium">{project.projectName}</p>
                    <p className="text-xs text-gray-500">
                      {project.projectStatus}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No projects found.</p>
          )}
        </motion.div>

        {/* Recent Positions */}
        <motion.div
          className="bg-white rounded-xl shadow p-6 space-y-4 border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-[#1c73fd]">
            Recent Positions
          </h2>
          {profile.recentPositions.length > 0 ? (
            <ul className="divide-y">
              {profile.recentPositions.map((pos, index) => (
                <motion.li
                  key={pos.id}
                  className="py-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                >
                  {formatPosition(pos.position)}{" "}
                  <span className="text-xs text-gray-400">
                    ({new Date(pos.assignedAt).toLocaleDateString()})
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No recent positions found.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
