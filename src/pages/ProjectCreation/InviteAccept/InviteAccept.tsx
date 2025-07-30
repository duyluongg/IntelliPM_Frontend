import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useUpdateProjectMemberStatusMutation } from '../../../services/projectMemberApi';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteAccept: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectKey = searchParams.get('projectKey');
  const memberId = Number(searchParams.get('memberId'));

  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useGetProjectDetailsByKeyQuery(projectKey || '', { skip: !projectKey });
  const projectId = projectData?.data?.id;

  const [updateStatus, { isLoading, isSuccess, isError }] = useUpdateProjectMemberStatusMutation();
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (submitted && isSuccess && projectKey) {
      // Redirect after 5 seconds
      timer = setTimeout(() => {
        navigate(`/project/${projectKey}/summary`);
      }, 5000);

      // Update countdown every second
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(timer); // Cleanup redirect timer
      clearInterval(interval); // Cleanup countdown interval
    };
  }, [submitted, isSuccess, projectKey, navigate]);

  const handleAccept = async () => {
    if (!projectKey) {
      console.error('Project key is missing');
      setSubmitted(true);
      return;
    }
    if (!projectId) {
      console.error('Project ID is missing');
      setSubmitted(true);
      return;
    }
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
          You have been invited to join project <strong>{projectKey || 'Unknown'}</strong>. Click below to accept and join the team!
        </p>

        {isProjectLoading && (
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <Loader2 className="animate-spin w-4 h-4" /> Loading project details...
          </div>
        )}

        {projectError && (
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-4">
            <XCircle className="w-5 h-5" /> Failed to load project details.
          </div>
        )}

        {!submitted && !isProjectLoading && !projectError && (
          <button
            onClick={handleAccept}
            disabled={isLoading || !projectKey || !projectId}
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
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" /> Successfully joined the project!
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-green-600 text-sm font-medium"
              >
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </motion.div>
            </>
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
