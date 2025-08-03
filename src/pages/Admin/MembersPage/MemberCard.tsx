// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\components\Admin\MemberCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MemberCardProps {
  member: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    gender: string;
    position: string;
    dateOfBirth: string | null;
    status: string;
    role: string;
    picture: string;
  };
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <img
          src={member.picture}
          alt={`${member.fullName}'s avatar`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{member.fullName}</h3>
          <p className="text-sm text-gray-600">{member.username}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-700"><span className="font-medium">Role:</span> {member.role}</p>
        <p className="text-sm text-gray-700"><span className="font-medium">Position:</span> {member.position}</p>
        <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {member.email}</p>
        <p className="text-sm text-gray-700"><span className="font-medium">Status:</span> {member.status}</p>
      </div>
    </motion.div>
  );
};

export default MemberCard;