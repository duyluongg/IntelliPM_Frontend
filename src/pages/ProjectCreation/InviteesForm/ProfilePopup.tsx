import React from 'react';
import ReactDOM from 'react-dom';
import { X, User, Mail, Calendar, Award, Folder } from 'lucide-react';
import { useGetProfileByEmailQuery } from '../../../services/accountApi';
import type { Profile } from '../../../services/accountApi';

interface ProfilePopupProps {
  email: string;
  onClose: () => void;
  getFullnameFromEmail: (email: string) => string;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ email, onClose, getFullnameFromEmail }) => {
  const { data: profileData, isLoading, isError } = useGetProfileByEmailQuery(email, { skip: !email });

  const formatPosition = (position: string) =>
    position
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const popupContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <X size={24} />
        </button>

        {isLoading && <p className="text-center text-gray-500 py-6">Loading profile...</p>}
        {isError && <p className="text-center text-red-500 py-6">Error loading profile</p>}

        {profileData?.isSuccess && profileData.data ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-16 h-16 rounded-full bg-[#e6f0fd] flex items-center justify-center shadow-md overflow-hidden">
                {profileData.data.picture ? (
                  <img
                    src={profileData.data.picture}
                    alt={profileData.data.fullName}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <User className="text-[#1c73fd]" size={32} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1c73fd]">{profileData.data.fullName}</h2>
                <p className="text-sm text-gray-500">{formatPosition(profileData.data.role)}</p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <span>{profileData.data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span>
                  {profileData.data.dateOfBirth
                    ? new Date(profileData.data.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-gray-500" />
                <span>{profileData.data.status}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex justify-between bg-[#f9fbff] rounded-lg p-4 text-center text-sm shadow-sm">
              <div>
                <p className="font-bold text-lg text-[#1c73fd]">{profileData.data.totalProjects}</p>
                <p className="text-gray-500">Total Projects</p>
              </div>
              <div>
                <p className="font-bold text-lg text-green-500">{profileData.data.completedProjects}</p>
                <p className="text-gray-500">Completed</p>
              </div>
              <div>
                <p className="font-bold text-lg text-orange-500">{profileData.data.inProgressProjects}</p>
                <p className="text-gray-500">Ongoing</p>
              </div>
            </div>

            {/* Past positions */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Past Positions</h4>
              <div className="bg-gray-50 rounded-lg p-3 shadow-inner">
                <p className="text-sm text-gray-600">
                  {profileData.data.positionsList.length > 0
                    ? profileData.data.positionsList.map(formatPosition).join(', ')
                    : 'No past positions'}
                </p>
              </div>
            </div>

            {/* Projects */}
            {profileData.data.projectList.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Folder size={18} /> Projects
                </h4>
                <ul className="space-y-3">
                  {profileData.data.projectList.map((project) => (
                    <li
                      key={project.projectId}
                      className="bg-gray-50 rounded-lg p-3 shadow-sm border hover:shadow-md transition"
                    >
                      <p className="font-medium text-[#1c73fd]">{project.projectName}</p>
                      <p className="text-xs text-gray-500">{project.projectStatus}</p>
                      <div className="text-xs mt-1 text-gray-600">
                        <p>Joined: {new Date(project.joinedAt).toLocaleDateString()}</p>
                        <p>Invited: {new Date(project.invitedAt).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          !isLoading && <p className="text-center text-gray-500 py-6">No profile data available</p>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );

  return ReactDOM.createPortal(popupContent, document.body);
};

export default ProfilePopup;
