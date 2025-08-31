import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { motion } from 'framer-motion';
import { Users, Folder, BarChart2, UserPlus, Settings, List, MessageSquare } from 'lucide-react';

const AdminHomePage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }
    setFormError(null);
    console.log('Account creation submitted:', formData);
    alert('Account creation form submitted (placeholder). Please provide API endpoint for full implementation.');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.username || 'Admin'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Your admin dashboard provides tools to manage members, projects, reports, user accounts, system settings, dynamic categories, and AI responses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View All Members Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">Manage Members</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Oversee all user accounts, assign roles, and manage permissions across the platform.
            </p>
            <Link
              to="/admin/members"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Members →
            </Link>
          </motion.div>

          {/* View All Projects Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Folder className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">Manage Projects</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Monitor all projects, track progress, and view detailed project information.
            </p>
            <Link
              to="/admin/projects"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Projects →
            </Link>
          </motion.div>

          {/* Project Reports Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <BarChart2 className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">Project Reports</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Generate and analyze reports to gain insights into project performance and team productivity.
            </p>
            <Link
              to="/admin/reports"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              View Reports →
            </Link>
          </motion.div>

          {/* System Configuration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">System Configuration</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Customize platform settings, such as notifications, themes, and access controls.
            </p>
            <Link
              to="/admin/configurations"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Configuration →
            </Link>
          </motion.div>

          {/* Dynamic Categories Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <List className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">Dynamic Categories</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Define and manage custom categories like project types or task statuses for flexible workflows.
            </p>
            <Link
              to="/admin/categories"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to Categories →
            </Link>
          </motion.div>

          {/* AI Response Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-700">AI Responses</h2>
            </div>
            <p className="mt-3 text-gray-600">
              Configure and review AI-generated responses for automated support and insights.
            </p>
            <Link
              to="/admin/ai-responses"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600 font-medium"
            >
              Go to AI Responses →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;