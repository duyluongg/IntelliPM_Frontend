import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUpdateProjectMemberStatusMutation } from '../../../services/projectMemberApi';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteAccept: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = Number(searchParams.get('projectId'));
  const memberId = Number(searchParams.get('memberId'));

  const [updateStatus, { isLoading, isSuccess, isError }] = useUpdateProjectMemberStatusMutation();
  const [submitted, setSubmitted] = useState(false);

  const handleAccept = async () => {
    try {
      await updateStatus({ projectId, memberId, status: 'ACTIVE' }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Invitation</h1>
        <p className="text-gray-600 mb-6">
          You have been invited to join project <strong>#{projectId}</strong>. Click below to accept and join the team!
        </p>

        {!submitted && (
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Accepting...
              </span>
            ) : (
              'Accept Invitation'
            )}
          </button>
        )}

        <AnimatePresence>
          {submitted && isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold"
            >
              <CheckCircle2 className="w-5 h-5" /> Successfully joined the project!
            </motion.div>
          )}

          {submitted && isError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-600 font-semibold"
            >
              <XCircle className="w-5 h-5" /> Something went wrong. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InviteAccept;
