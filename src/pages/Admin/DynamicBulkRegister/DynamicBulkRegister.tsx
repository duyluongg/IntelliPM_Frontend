import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRegisterAccountsMutation } from '../../../services/adminApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

interface AccountForm {
  email: string;
  position: string;
  role: string;
}

const DynamicBulkRegister: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [accounts, setAccounts] = useState<AccountForm[]>([]);
  const [registerAccounts, { isLoading, error, data }] = useRegisterAccountsMutation();

  // Fetch roles and positions from dynamicCategoryApi
  const { data: rolesData, isLoading: rolesLoading } = useGetCategoriesByGroupQuery('account_role');
  const { data: positionsData, isLoading: positionsLoading } = useGetCategoriesByGroupQuery('account_position');

  const roles = rolesData?.data.filter(category => category.isActive) || [];
  const positions = positionsData?.data.filter(category => category.isActive) || [];

  const addAccount = () => {
    if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      alert('Please enter a valid email');
      return;
    }
    setAccounts([...accounts, { email: emailInput, position: positions[0]?.name || '', role: roles[0]?.name || 'USER' }]);
    setEmailInput('');
  };

  const handleChange = (index: number, field: keyof AccountForm, value: string) => {
    const newAccounts = [...accounts];
    newAccounts[index][field] = value;
    setAccounts(newAccounts);
  };

  const removeAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accounts.length === 0) {
      alert('Please add at least one account');
      return;
    }
    try {
      const response = await registerAccounts(accounts).unwrap();
      alert(`Accounts processed: ${response.data.successful.length} successful, ${response.data.failed.length} failed`);
      setAccounts([]); // Clear form on success
    } catch (err) {
      console.error('Bulk registration failed:', err);
      alert('Registration failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4 py-8"
    >
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Dynamic Bulk Register</h2>
        {/* Header: Email Input and Add Button */}
        <div className="flex space-x-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addAccount}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
        {/* Loading State for Categories */}
        {(rolesLoading || positionsLoading) && (
          <div className="text-center">
            <svg className="animate-spin h-5 w-5 mx-auto text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        {/* Account Cards */}
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={account.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={account.role}
                  onChange={(e) => handleChange(index, 'role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={rolesLoading || roles.length === 0}
                >
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No roles available</option>
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={account.position}
                  onChange={(e) => handleChange(index, 'position', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={positionsLoading || positions.length === 0}
                >
                  {positions.length > 0 ? (
                    positions.map((position) => (
                      <option key={position.id} value={position.name}>
                        {position.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No positions available</option>
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeAccount(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || accounts.length === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Register Accounts'}
        </button>
        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error && 'data' in error ? (error.data as { message?: string })?.message || 'Registration failed' : 'Registration failed'}
          </div>
        )}
        {data && (
          <div className="text-sm text-center">
            <p className="text-green-600">Successful: {data.data.successful.join(', ')}</p>
            {data.data.failed.length > 0 && (
              <p className="text-red-600">
                Failed: {data.data.failed.map(f => `${f.email}: ${f.errorMessage}`).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DynamicBulkRegister;