import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAiResponseHistoryByIdQuery } from '../../../services/aiResponseHistoryApi';
import { ImageOff, Copy, X, Check, Expand, ChevronLeft } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AiResponseHistoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: history, isLoading, error } = useGetAiResponseHistoryByIdQuery(Number(id));
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupCopied, setPopupCopied] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const handleCopy = () => {
    if (history?.responseJson) {
      navigator.clipboard.writeText(history.responseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePopupCopy = () => {
    if (history?.responseJson) {
      navigator.clipboard.writeText(history.responseJson);
      setPopupCopied(true);
      setTimeout(() => setPopupCopied(false), 2000);
    }
  };

  let formattedJson = '';
  if (history?.responseJson) {
    try {
      formattedJson = JSON.stringify(JSON.parse(history.responseJson), null, 2);
    } catch {
      formattedJson = history.responseJson;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load response</h2>
        <p className="text-gray-600 mb-6 text-center">
          We couldn't retrieve the AI response details. Please try again later.
        </p>
        <button
          onClick={() => navigate('/admin/ai-responses')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Responses
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/admin/ai-responses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Responses</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 text-center">AI Response Details</h1>
          <div className="w-32"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {history.createdByPicture ? (
                  <img
                    src={history.createdByPicture}
                    alt={`${history.createdByFullname}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white"
                    loading="lazy"
                    onError={(e) => {
                      const imgElement = e.currentTarget;
                      const parentElement = imgElement.parentElement;
                      if (parentElement) {
                        const fallbackElement = parentElement.querySelector('.fallback-icon') as HTMLElement | null;
                        if (fallbackElement) {
                          imgElement.style.display = 'none';
                          fallbackElement.style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center fallback-icon ${
                    history.createdByPicture ? 'hidden' : 'flex'
                  }`}
                >
                  <ImageOff className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{history.createdByFullname}</h2>
                  <p className="text-blue-100">{history.aiFeature}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-white bg-opacity-30 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                  {history.status}
                </span>
                <p className="text-blue-100 text-sm">{formatDate(history.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Project ID</h3>
                <p className="text-lg font-semibold text-gray-900">{history.projectId ?? 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
                <p className="text-lg font-semibold text-gray-900">GPT-4</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Response JSON</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPopupOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Expand className="w-4 h-4" />
                    <span>View in Popup</span>
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Expand className="w-4 h-4" />
                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`border border-gray-200 rounded-xl overflow-hidden ${
                  isExpanded ? 'h-[70vh]' : 'h-[40vh]'
                } transition-all duration-300`}
              >
                <SyntaxHighlighter
                  language="json"
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '0.9rem',
                    backgroundColor: '#282C34',
                    height: '100%',
                    overflow: 'auto'
                  }}
                  wrapLongLines={false}
                  showLineNumbers
                >
                  {formattedJson}
                </SyntaxHighlighter>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {history.responseJson?.length || 0} characters • {formattedJson.split('\n').length} lines
              </p>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isPopupOpen}
          onRequestClose={() => setIsPopupOpen(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: '800px',
              maxHeight: '80vh',
              padding: '2rem',
              borderRadius: '12px',
              overflow: 'hidden',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)', // Thêm hiệu ứng làm mờ
              WebkitBackdropFilter: 'blur(4px)', // Hỗ trợ cho Safari
            },
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">JSON Response</h2>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex justify-end mb-3">
            <button
              onClick={handlePopupCopy}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                popupCopied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {popupCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden h-[60vh]">
            <SyntaxHighlighter
              language="json"
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                fontSize: '0.9rem',
                backgroundColor: '#282C34',
                height: '100%',
                overflow: 'auto',
              }}
              wrapLongLines={false}
              showLineNumbers
            >
              {formattedJson}
            </SyntaxHighlighter>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {history.responseJson?.length || 0} characters • {formattedJson.split('\n').length} lines
          </p>
        </Modal>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>AI Response ID: {id}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AiResponseHistoryDetail;