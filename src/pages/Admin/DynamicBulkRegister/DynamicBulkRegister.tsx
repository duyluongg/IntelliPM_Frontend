import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  UserCheck,
  Badge,
  Briefcase
} from 'lucide-react';
import { useRegisterAccountsMutation } from '../../../services/adminApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetAccountByEmailQuery } from '../../../services/accountApi';
import { useDebounce } from 'use-debounce';

interface AccountForm {
  email: string;
  position: string;
  role: string;
}

const DynamicBulkRegister: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [debouncedEmail] = useDebounce(emailInput, 500);
  const [accounts, setAccounts] = useState<AccountForm[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [registerAccounts, { isLoading: isRegisterLoading, error: registerError, data: registerData }] = useRegisterAccountsMutation();
  const { data: rolesData, isLoading: rolesLoading } = useGetCategoriesByGroupQuery('account_role');
  const { data: positionsData, isLoading: positionsLoading } = useGetCategoriesByGroupQuery('account_position');

  const roles = rolesData?.data.filter(category => category.isActive) || [];
  const positions = positionsData?.data.filter(category => category.isActive) || [];

  const { data: emailCheckData, isFetching: isEmailChecking } = useGetAccountByEmailQuery(debouncedEmail, {
    skip: !debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail),
  });

  const getDefaultPosition = (role: string): string => {
    switch (role) {
      case 'PROJECT_MANAGER':
        return positions.find(pos => pos.name === 'PROJECT_MANAGER')?.name || positions[0]?.name || '';
      case 'TEAMLEADER':
        return positions.find(pos => pos.name === 'TEAM_LEADER')?.name || positions[0]?.name || '';
      case 'CLIENT':
        return positions.find(pos => pos.name === 'CLIENT')?.name || positions[0]?.name || '';
      default:
        return positions[0]?.name || '';
    }
  };

  const addAccount = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    if (emailCheckData?.data) {
      setErrorMessage('This email is already registered');
      return;
    }

    if (accounts.some(account => account.email === emailInput)) {
      setErrorMessage('This email is already added to the list');
      return;
    }

    if (roles.length === 0 || positions.length === 0) {
      setErrorMessage('No roles or positions available. Please configure them in the system.');
      return;
    }

    const defaultRole = roles[0]?.name || 'USER';
    const defaultPosition = getDefaultPosition(defaultRole);

    setAccounts([...accounts, { email: emailInput, position: defaultPosition, role: defaultRole }]);
    setEmailInput('');
  };

  const handleChange = (index: number, field: keyof AccountForm, value: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const newAccounts = [...accounts];
    newAccounts[index][field] = value;

    if (field === 'role') {
      newAccounts[index].position = getDefaultPosition(value);
    }

    setAccounts(newAccounts);
  };

  const removeAccount = (index: number) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (accounts.length === 0) {
      setErrorMessage('Please add at least one account');
      return;
    }

    try {
      const response = await registerAccounts(accounts).unwrap();
      setSuccessMessage(`Accounts processed: ${response.data.successful.length} successful, ${response.data.failed.length} failed`);
      if (response.data.successful.length > 0) {
        setAccounts([]);
      }
    } catch (err) {
      setErrorMessage('Registration failed. Please try again.');
      console.error('Bulk registration failed:', err);
    }
  };

  const getEmailStatus = () => {
    if (!emailInput) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) return 'invalid';
    if (isEmailChecking) return 'checking';
    if (emailCheckData?.data) return 'exists';
    if (accounts.some(account => account.email === emailInput)) return 'duplicate';
    return 'valid';
  };

  const emailStatus = getEmailStatus();

  const getFilteredPositions = (role: string) => {
    if (role === 'TEAMMEMBER') {
      return positions.filter(pos => !['PROJECT_MANAGER', 'TEAM_LEADER', 'CLIENT'].includes(pos.name));
    }
    return positions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Members</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add multiple team members to your organization with customizable roles and positions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Add Member</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                        emailStatus === 'invalid' ? 'border-red-300 focus:ring-red-200' :
                        emailStatus === 'exists' || emailStatus === 'duplicate' ? 'border-orange-300 focus:ring-orange-200' :
                        emailStatus === 'valid' ? 'border-blue-300 focus:ring-blue-200' :
                        'border-gray-300 focus:ring-blue-200'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailStatus === 'checking' && (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                      {emailStatus === 'valid' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {(emailStatus === 'invalid' || emailStatus === 'exists' || emailStatus === 'duplicate') && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {emailStatus && emailStatus !== 'valid' && emailStatus !== 'checking' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {emailStatus === 'invalid' && 'Please enter a valid email address'}
                      {emailStatus === 'exists' && 'This email is already registered'}
                      {emailStatus === 'duplicate' && 'This email is already in your list'}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={addAccount}
                  disabled={isEmailChecking || emailStatus !== 'valid'}
                  whileHover={{ scale: emailStatus === 'valid' ? 1.02 : 1 }}
                  whileTap={{ scale: emailStatus === 'valid' ? 0.98 : 1 }}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    emailStatus === 'valid'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isEmailChecking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {isEmailChecking ? 'Checking...' : 'Add Member'}
                </motion.button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{accounts.length}</div>
                    <div className="text-sm text-gray-500">Members Added</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {roles.length}
                    </div>
                    <div className="text-sm text-gray-500">Available Roles</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Members List</h2>
                  </div>
                  {accounts.length > 0 && (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isRegisterLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                      {isRegisterLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      {isRegisterLoading ? 'Registering...' : 'Register All'}
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto" style={{ 
                overflowY: 'auto',
                overflowX: 'visible',
                position: 'relative',
                zIndex: 1
              }}>
                <AnimatePresence>
                  {accounts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 text-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No members added yet</h3>
                      <p className="text-gray-500">Start by adding email addresses to build your team</p>
                    </motion.div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {accounts.map((account, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="p-6 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <p className="text-sm font-medium text-gray-900 truncate">{account.email}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <div className="relative z-50">
                                  <select
                                    value={account.role}
                                    onChange={(e) => handleChange(index, 'role', e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none bg-white focus:z-50"
                                    disabled={rolesLoading || roles.length === 0}
                                    style={{ zIndex: 50 }}
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
                                  <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                                <div className="relative z-50">
                                  <select
                                    value={account.position}
                                    onChange={(e) => handleChange(index, 'position', e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none bg-white focus:z-50"
                                    disabled={positionsLoading || positions.length === 0}
                                    style={{ zIndex: 50 }}
                                  >
                                    {getFilteredPositions(account.role).length > 0 ? (
                                      getFilteredPositions(account.role).map((position) => (
                                        <option key={position.id} value={position.name}>
                                          {position.label}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="">No positions available</option>
                                    )}
                                  </select>
                                  <Briefcase className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                </div>
                              </div>
                            </div>
                            <motion.button
                              type="button"
                              onClick={() => removeAccount(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {(errorMessage || successMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4"
                >
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700 text-sm">{successMessage}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {registerData && registerData.data.failed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <h3 className="font-medium text-orange-900">Registration Issues</h3>
                    </div>
                    <div className="space-y-2">
                      {registerData.data.failed.map((failure, index) => (
                        <p key={index} className="text-sm text-orange-700">
                          <span className="font-medium">{failure.email}:</span> {failure.errorMessage}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DynamicBulkRegister;