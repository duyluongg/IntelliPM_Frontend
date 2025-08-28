// import { useSearchParams } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './RiskDetail.css';
// import {
//   MessageSquare,
//   Paperclip,
//   CalendarDays,
//   UserPlus,
//   Trash2,
//   SendHorizontal,
// } from 'lucide-react';
// import {
//   useUpdateRiskTitleMutation,
//   useUpdateRiskStatusMutation,
//   useUpdateRiskResponsibleMutation,
//   useUpdateRiskDueDateMutation,
//   useUpdateRiskDescriptionMutation,
//   useUpdateRiskImpactLevelMutation,
//   useUpdateRiskProbabilityMutation,
// } from '../../../services/riskApi';
// import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetRiskSolutionByRiskIdQuery,
//   useCreateRiskSolutionMutation,
//   useUpdateRiskMitigationPlanMutation,
//   useUpdateRiskContigencyPlanMutation,
//   useDeleteRiskSolutionMutation,
//   useDeleteRiskContingencyPlanMutation,
//   useDeleteRiskMitigationPlanMutation,
// } from '../../../services/riskSolutionApi';
// import {
//   useGetRiskFilesByRiskIdQuery,
//   useUploadRiskFileMutation,
//   useDeleteRiskFileMutation,
// } from '../../../services/riskFileApi';
// import {
//   useGetCommentsByRiskIdQuery,
//   useCreateRiskCommentMutation,
//   useUpdateRiskCommentMutation,
//   useDeleteRiskCommentMutation,
// } from '../../../services/riskCommentApi';
// import deleteIcon from '../../../assets/delete.png';
// import accountIcon from '../../../assets/account.png';
// import { useParams } from 'react-router-dom';
// import { useGetActivityLogsByRiskKeyQuery } from '../../../services/activityLogApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

// export interface Risk {
//   id: number;
//   riskKey: string;
//   title: string;
//   description?: string;
//   impactLevel?: string;
//   probability?: string;
//   severityLevel?: string;
//   status?: string;
//   type?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   dueDate?: string;
//   responsibleId?: number | null;
//   responsibleFullName?: string;
//   responsibleUserName?: string;
//   responsiblePicture?: string;
//   creatorFullName?: string;
//   creatorUserName?: string;
//   creatorPicture?: string;
//   resolution?: string;
// }

// interface RiskDetailProps {
//   risk: Risk;
//   onClose: () => void;
//   isPage?: boolean;
// }

// function getSeverityColor(level?: string) {
//   switch (level) {
//     case 'LOW':
//       return 'bg-green-500';
//     case 'MEDIUM':
//       return 'bg-yellow-500';
//     case 'HIGH':
//       return 'bg-red-500';
//     default:
//       return 'bg-gray-500';
//   }
// }

// function calculateSeverityLevel(impactLevel?: string, probability?: string): string {
//   const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
//   const i = levels[impactLevel as keyof typeof levels] || 0;
//   const p = levels[probability as keyof typeof levels] || 0;
//   const score = i * p;
//   if (score >= 6) return 'HIGH';
//   if (score >= 3) return 'MEDIUM';
//   return 'LOW';
// }

// type Assignee = {
//   id: number;
//   fullName: string | null;
//   userName: string;
//   picture?: string | null;
// };

// const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose, isPage }) => {
//   const navigate = useNavigate();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
//   const [searchParams] = useSearchParams();
//   const { projectKey: paramProjectKey } = useParams();
//   const queryProjectKey = searchParams.get('projectKey');
//   const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const { data: riskSolutionRes, isLoading, refetch } = useGetRiskSolutionByRiskIdQuery(risk.id);
//   const { data: attachments = [], refetch: refetchAttachments } = useGetRiskFilesByRiskIdQuery(
//     risk.id
//   );
//   console.log('Attachments:', attachments);
//   const {
//     data: comments = [],
//     isLoading: isCommentsLoading,
//     refetch: refetchComments,
//   } = useGetCommentsByRiskIdQuery(risk.id);

//   const {
//     data: activityLogs = [],
//     isLoading: isActivityLogsLoading,
//     refetch: refetchActivityLogs,
//   } = useGetActivityLogsByRiskKeyQuery(risk.riskKey, {
//     skip: !risk.riskKey,
//   });

//   const { data: impactCategoriesData, isLoading: isImpactLoading } =
//     useGetCategoriesByGroupQuery('risk_impact_level');

//   const impactCategories = impactCategoriesData?.data?.filter((cat) => cat.isActive);

//   const { data: probabilityCategoriesData, isLoading: isProbabilityLoading } =
//     useGetCategoriesByGroupQuery('risk_probability_level');

//   const probabilityCategories = probabilityCategoriesData?.data?.filter((cat) => cat.isActive);

//   useEffect(() => {
//     setEditableRisk({
//       ...risk,
//       impactLevel: risk.impactLevel?.toUpperCase(),
//       probability: risk.probability?.toUpperCase(),
//       severityLevel: calculateSeverityLevel(
//         risk.impactLevel?.toUpperCase(),
//         risk.probability?.toUpperCase()
//       ),
//     });
//   }, [risk]);

//   useEffect(() => {
//     setEditableRisk((prev) => ({
//       ...prev,
//       severityLevel: calculateSeverityLevel(prev.impactLevel, prev.probability),
//     }));
//   }, [editableRisk.impactLevel, editableRisk.probability]);

//   useEffect(() => {
//     refetchActivityLogs();
//   }, [refetchActivityLogs]);

//   const projectId = projectData?.data?.id;
//   const skipMembers = !projectId;

//   const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
//     skip: skipMembers,
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropdownRef = useRef<HTMLSelectElement | null>(null);

//   const assignees =
//     membersData?.data?.map((m) => ({
//       id: m.accountId,
//       fullName: m.fullName,
//       userName: m.username,
//       picture: m.picture,
//     })) || [];

//   const attachmentCount = attachments?.length ?? 0;
//   const commentCount = comments?.length ?? 0;

//   const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

//   const [updateRiskTitle] = useUpdateRiskTitleMutation();
//   const [updateRiskStatus] = useUpdateRiskStatusMutation();
//   const [updateResponsible] = useUpdateRiskResponsibleMutation();
//   const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
//   const [updateRiskDescription] = useUpdateRiskDescriptionMutation();
//   const [updateRiskImpactLevel] = useUpdateRiskImpactLevelMutation();
//   const [updateRiskProbability] = useUpdateRiskProbabilityMutation();
//   const [createRiskSolution] = useCreateRiskSolutionMutation();
//   const [updateMitigation] = useUpdateRiskMitigationPlanMutation();
//   const [updateContingency] = useUpdateRiskContigencyPlanMutation();
//   const [deleteRiskSolution] = useDeleteRiskSolutionMutation();
//   const [deleteMitigationPlan] = useDeleteRiskMitigationPlanMutation();
//   const [deleteContingencyPlan] = useDeleteRiskContingencyPlanMutation();
//   const [uploadRiskFile] = useUploadRiskFileMutation();
//   const [deleteRiskFile] = useDeleteRiskFileMutation();
//   const [updateRiskComment] = useUpdateRiskCommentMutation();
//   const [deleteRiskComment] = useDeleteRiskCommentMutation();
//   const [createComment] = useCreateRiskCommentMutation();

//   const [contingencyList, setContingencyList] = useState<{ id: number; text: string }[]>([]);
//   const [mitigationList, setMitigationList] = useState<{ id: number; text: string }[]>([]);
//   const [newContingency, setNewContingency] = useState('');
//   const [newMitigation, setNewMitigation] = useState('');

//   const [editIndexContingency, setEditIndexContingency] = useState<number>(-1);
//   const [editedTextContingency, setEditedTextContingency] = useState<string>('');
//   const [editIndexMitigation, setEditIndexMitigation] = useState<number>(-1);
//   const [editedTextMitigation, setEditedTextMitigation] = useState<string>('');

//   const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
//   const [editedContent, setEditedContent] = useState('');

//   const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

//   const [newComment, setNewComment] = useState('');

//   useEffect(() => {
//     if (riskSolutionRes?.isSuccess && riskSolutionRes.data) {
//       const dataArray = Array.isArray(riskSolutionRes.data)
//         ? riskSolutionRes.data
//         : [riskSolutionRes.data];

//       const allContingencyItems = dataArray.flatMap((solution) =>
//         solution.contingencyPlan
//           ? solution.contingencyPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       const allMitigationItems = dataArray.flatMap((solution) =>
//         solution.mitigationPlan
//           ? solution.mitigationPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       setContingencyList(allContingencyItems);
//       setMitigationList(allMitigationItems);
//     }
//   }, [riskSolutionRes]);

//   useEffect(() => {
//     if (showResponsibleDropdown && dropdownRef.current) {
//       dropdownRef.current.focus();
//     }
//   }, [showResponsibleDropdown]);

//   const handleContingencyChange = async (id: number, newText: string, index: number) => {
//     try {
//       await updateContingency({ id, contigencyPlan: newText, createdBy: accountId });
//       const updated = [...contingencyList];
//       updated[index].text = newText;
//       setContingencyList(updated);
//       setEditIndexContingency(-1);
//       refetch();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('Update failed', error);
//       setErrorMessage('Failed to update contingency plan');
//     }
//   };

//   const handleMitigationChange = async (id: number, newText: string, index: number) => {
//     try {
//       await updateMitigation({ id, mitigationPlan: newText, createdBy: accountId });
//       const updated = [...mitigationList];
//       updated[index].text = newText;
//       setMitigationList(updated);
//       setEditIndexMitigation(-1);
//       refetch();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('Update failed', error);
//       setErrorMessage('Failed to update mitigation plan');
//     }
//   };

//   const handleAddContigency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newContingency.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: newContingency.trim(),
//         mitigationPlan: null,
//         createdBy: accountId,
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.contingencyPlan ?? '',
//         };

//         setContingencyList((prev) => [...prev, newItem]);
//         setNewContingency('');
//         refetch();
//         refetchActivityLogs();
//       }
//     }
//   };

//   const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newMitigation.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: null,
//         mitigationPlan: newMitigation.trim(),
//         createdBy: accountId,
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.mitigationPlan ?? '',
//         };

//         setMitigationList((prev) => [...prev, newItem]);
//         setNewMitigation('');
//         refetch();
//         refetchActivityLogs();
//       }
//     }
//   };

//   const handleChange = (field: keyof Risk, value: any) => {
//     setEditableRisk((prev) => ({ ...prev, [field]: value }));
//     setErrorMessage('');
//   };

//   const renderAvatar = () => {
//     if (editableRisk.responsiblePicture) {
//       return (
//         <img
//           src={editableRisk.responsiblePicture}
//           alt='avatar'
//           className='responsible-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'
//         />
//       );
//     }
//     const initials =
//       editableRisk.responsibleFullName
//         ?.split(' ')
//         .map((n) => n[0])
//         .join('') ||
//       editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
//       '?';
//     return <div className='responsible-avatar-placeholder bg-gray-300 text-white'>{initials}</div>;
//   };

//   const RiskStatusDropdown = ({
//     status,
//     onChange,
//   }: {
//     status: string;
//     onChange: (newStatus: string) => void;
//   }) => {
//     const {
//       data: categoriesData,
//       isLoading,
//       isError,
//     } = useGetCategoriesByGroupQuery('risk_status');

//     const categories = categoriesData?.data?.filter((cat) => cat.isActive);

//     const getStyle = (categoryName: string) => {
//       const category = categories?.find((cat) => cat.name === categoryName);
//       if (!category?.color) return 'bg-gray-100 text-gray-700';
//       const [bgColor, textColor] = category.color.includes(',')
//         ? category.color.split(',')
//         : [category.color, category.color];
//       return `bg-${bgColor} text-${textColor}`;
//     };

//     return (
//       <select
//         className={`risk-detail-status-select ${getStyle(status)}`}
//         value={status}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={isLoading}
//         style={{
//           border: 'none',
//           borderRadius: '6px',
//           padding: '6px 12px',
//           fontWeight: 600,
//           fontSize: '14px',
//           cursor: 'pointer',
//         }}
//       >
//         {isLoading ? (
//           <option value=''>Loading...</option>
//         ) : (
//           categories?.map((category) => (
//             <option key={category.name} value={category.name}>
//               {category.label}
//             </option>
//           ))
//         )}
//       </select>
//     );
//   };

//   const ResponsibleDropdown = ({
//     assignees,
//     selectedId,
//     onChange,
//   }: {
//     assignees: Assignee[];
//     selectedId: number | null;
//     onChange: (id: number | null) => void;
//   }) => {
//     const getInitials = (name?: string | null) => {
//       if (!name) return '';
//       const parts = name.trim().split(' ');
//       if (parts.length === 1) return parts[0][0].toUpperCase();
//       return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
//     };

//     return (
//       <select
//         className='responsible-dropdown p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
//         ref={dropdownRef}
//         value={selectedId?.toString() ?? ''}
//         onChange={(e) => {
//           const selectedValue = e.target.value;
//           onChange(selectedValue === '' ? null : Number(selectedValue));
//         }}
//         style={{
//           padding: '6px 12px',
//           borderRadius: '6px',
//           fontSize: '14px',
//           cursor: 'pointer',
//           backgroundColor: '#f9fafb',
//           border: '1px solid #d1d5db',
//         }}
//       >
//         <option value=''>No Assignee</option>
//         {assignees.map((user) => (
//           <option key={user.id} value={user.id}>
//             {user.fullName || user.userName}
//           </option>
//         ))}
//       </select>
//     );
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !risk) return;

//     try {
//       await uploadRiskFile({
//         riskId: risk.id,
//         fileName: file.name,
//         uploadedBy: accountId,
//         file,
//       }).unwrap();

//       alert(`✅ Uploaded file "${file.name}" successfully!`);
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Upload failed:', error);
//       alert('❌ Upload failed!');
//     }
//   };

//   const handleDeleteFile = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this file?')) return;
//     try {
//       await deleteRiskFile({ id: id, createdBy: accountId }).unwrap();
//       alert('✅ File deleted!');
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Delete failed:', error);
//       alert('❌ Delete failed!');
//     }
//   };

//   return (
//     <div className={isPage ? 'risk-page-container' : 'risk-detail-container'}>
//       {/* {errorMessage && (
//         <div className='error-message bg-red-100 text-red-700 p-3 rounded-lg mb-4'>
//           {errorMessage}
//         </div>
//       )} */}
//       <div className='risk-detail-panel relative bg-white rounded-lg p-6'>
//         <div className='detail-header border-b-2 flex justify-between items-center mb-6 border-b pb-4'>
//           <div className='detail-title-section space-y-2'>
//             <div className='risk-path text-gray-600 text-sm mb-2'>
//               <div>
//                 {projectKey} /{' '}
//                 <span
//                   className='risk-code font-medium text-blue-600 hover:underline cursor-pointer'
//                   onClick={() =>
//                     navigate(
//                       `/project/${projectKey}/risk/${
//                         editableRisk.riskKey || `R-${editableRisk.id}`
//                       }`
//                     )
//                   }
//                 >
//                   {editableRisk.riskKey || `R-${editableRisk.id}`}
//                 </span>
//               </div>
//               <div className='reporter-meta-block flex items-center gap-2 mt-2'>
//                 <div className='reporter-icons flex items-center gap-2'>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <MessageSquare size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{commentCount}</span>
//                   </div>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <Paperclip size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{attachmentCount}</span>
//                   </div>
//                 </div>
//                 <div
//                   className='reporter-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm bg-gray-200'
//                   title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'System'}
//                 >
//                   {editableRisk.creatorPicture ? (
//                     <img
//                       src={editableRisk.creatorPicture}
//                       alt='reporter avatar'
//                       className='w-full h-full object-cover'
//                     />
//                   ) : (
//                     <div className='avatar-placeholder bg-gray-300 text-white flex items-center justify-center w-full h-full'>
//                       ⚙️
//                     </div>
//                     // <div className='avatar-placeholder bg-gray-300 text-white'>
//                     //   {editableRisk.creatorFullName
//                     //     ?.split(' ')
//                     //     .map((n) => n[0])
//                     //     .join('') ||
//                     //     editableRisk.creatorUserName?.slice(0, 2)?.toUpperCase() ||
//                     //     '?'}
//                     // </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className='title-and-status flex items-center gap-4'>
//               <div className='title-input-container w-full'>
//                 <input
//                   className='editable-title-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold'
//                   value={editableRisk.title}
//                   onChange={(e) => handleChange('title', e.target.value)}
//                   onBlur={async (e) => {
//                     const newTitle = e.target.value.trim();
//                     if (newTitle && newTitle !== risk.title) {
//                       try {
//                         await updateRiskTitle({
//                           id: editableRisk.id,
//                           title: newTitle,
//                           createdBy: accountId,
//                         }).unwrap();
//                         refetchActivityLogs();
//                       } catch (err: any) {
//                         setErrorMessage(err.data?.message || 'Failed to update title');
//                         if (err.data?.message.includes('exceeds maximum length')) {
//                           setErrorMessage(
//                             `Title exceeds maximum length of ${
//                               err.data?.message.match(/\d+/)[0]
//                             } characters`
//                           );
//                         }
//                       }
//                     } else if (!newTitle) {
//                       setErrorMessage('Risk title is required');
//                       setEditableRisk((prev) => ({ ...prev, title: risk.title }));
//                     }
//                   }}
//                   placeholder='Enter risk title'
//                 />
//                 {errorMessage && errorMessage.includes('title') && (
//                   <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                 )}
//               </div>
//               <RiskStatusDropdown
//                 status={editableRisk.status || 'OPEN'}
//                 onChange={async (newStatus) => {
//                   try {
//                     await updateRiskStatus({
//                       id: editableRisk.id,
//                       status: newStatus,
//                       createdBy: accountId,
//                     }).unwrap();
//                     handleChange('status', newStatus);
//                     refetchActivityLogs();
//                     console.log(`Updated status to ${newStatus}`);
//                   } catch (err) {
//                     console.error('Failed to update status:', err);
//                   }
//                 }}
//               />
//             </div>
//             <div className='meta-inline flex items-center gap-2 mt-2 text-sm text-gray-500'>
//               <span className='meta-item'>Risk</span>
//               <span className='meta-separator'>·</span>
//               <span className='meta-item with-icon flex items-center gap-1'>
//                 <CalendarDays size={16} />
//                 <input
//                   type='date'
//                   value={editableRisk.dueDate?.split('T')[0] || ''}
//                   onChange={async (e) => {
//                     const newDate = e.target.value + 'T00:00:00Z';
//                     try {
//                       await updateRiskDueDate({
//                         id: editableRisk.id,
//                         dueDate: newDate,
//                         createdBy: accountId,
//                       }).unwrap();
//                       setEditableRisk((prev) => ({
//                         ...prev,
//                         dueDate: newDate,
//                       }));
//                       refetchActivityLogs();
//                     } catch (err: any) {
//                       setErrorMessage(err.data?.message || 'Failed to update due date');
//                     }
//                   }}
//                   className='due-date-input p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
//                 />
//                 {errorMessage && errorMessage.includes('due date') && (
//                   <div className='error-message text-red-600 text-sm mt-1 absolute top-full left-0'>
//                     {errorMessage}
//                   </div>
//                 )}
//               </span>
//               <span className='meta-separator'>·</span>
//               <div className='meta-value responsible-info flex items-center gap-2 cursor-pointer'>
//                 {editableRisk.responsibleId ? (
//                   <>
//                     {renderAvatar()}
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={editableRisk.responsibleId ?? null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();

//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                   </>
//                 ) : (
//                   <>
//                     <div
//                       className='unassigned-avatar flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'
//                       onClick={() => setShowResponsibleDropdown(true)}
//                     >
//                       <UserPlus size={14} className='text-gray-600' />
//                     </div>
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();

//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));

//                           setShowResponsibleDropdown(false);
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           <button
//             className='close-btn absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition'
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>DESCRIPTION</div>
//           <textarea
//             value={editableRisk.description || ''}
//             onChange={async (e) => {
//               const newDescription = e.target.value;
//               try {
//                 await updateRiskDescription({
//                   id: editableRisk.id,
//                   description: newDescription,
//                   createdBy: accountId,
//                 }).unwrap();
//                 setEditableRisk((prev) => ({ ...prev, description: newDescription }));
//                 refetchActivityLogs();
//               } catch (error: any) {
//                 setErrorMessage(error.data?.message || 'Failed to update description');
//               }
//             }}
//             rows={4}
//             className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             CONTINGENCY PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {contingencyList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexContingency === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextContingency}
//                     onBlur={() => handleContingencyChange(item.id, editedTextContingency, index)}
//                     onChange={(e) => setEditedTextContingency(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleContingencyChange(item.id, editedTextContingency, index);
//                       if (e.key === 'Escape') setEditIndexContingency(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexContingency(index);
//                       setEditedTextContingency(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteContingencyPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = contingencyList.filter((_, i) => i !== index);
//                       setContingencyList(updated);
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                       setErrorMessage('Failed to delete contingency plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Contingency Plan'
//                 value={newContingency}
//                 onChange={(e) => setNewContingency(e.target.value)}
//                 onKeyDown={handleAddContigency}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             MITIGATION PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {mitigationList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexMitigation === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextMitigation}
//                     onBlur={() => handleMitigationChange(item.id, editedTextMitigation, index)}
//                     onChange={(e) => setEditedTextMitigation(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleMitigationChange(item.id, editedTextMitigation, index);
//                       if (e.key === 'Escape') setEditIndexMitigation(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexMitigation(index);
//                       setEditedTextMitigation(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteMitigationPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = mitigationList.filter((_, i) => i !== index);
//                       setMitigationList(updated);
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                       setErrorMessage('Failed to delete mitigation plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Mitigation Plan'
//                 value={newMitigation}
//                 onChange={(e) => setNewMitigation(e.target.value)}
//                 onKeyDown={handleAddMitigation}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section triple-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>IMPACT</div>
//             <ul className='radio-button-list space-y-2'>
//               {isImpactLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 impactCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.impactLevel === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='impact'
//                         value={category.name}
//                         checked={editableRisk.impactLevel === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskImpactLevel({
//                               id: editableRisk.id,
//                               impactLevel: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('impactLevel', category.name);
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update impact level:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update impact level');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//           </div>

//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LIKELIHOOD</div>
//             <ul className='radio-button-list space-y-2'>
//               {isProbabilityLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 probabilityCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.probability === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='probability'
//                         value={category.name}
//                         checked={editableRisk.probability === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskProbability({
//                               id: editableRisk.id,
//                               probability: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('probability', category.name);
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update probability:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update probability');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//           </div>

//           <div className='levelWrapper'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LEVEL</div>
//             <div
//               className={`semi-gauge w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold ${getSeverityColor(
//                 editableRisk.severityLevel
//               )}`}
//             >
//               {editableRisk.severityLevel
//                 ? editableRisk.severityLevel.charAt(0).toUpperCase() +
//                   editableRisk.severityLevel.slice(1).toLowerCase()
//                 : 'Unknown'}
//             </div>
//           </div>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>Attachments</div>
//           {Array.isArray(attachments) && attachments.length > 0 ? (
//             <div className='attachments-section mt-2'>
//               <div className='attachments-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//                 {attachments.map((file) => (
//                   <div
//                     className='attachment-card relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition'
//                     key={file.id}
//                     onMouseEnter={() => setHoveredFileId(file.id)}
//                     onMouseLeave={() => setHoveredFileId(null)}
//                   >
//                     <a
//                       href={file.fileUrl}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       className='block'
//                     >
//                       <div className='thumbnail w-full h-32 overflow-hidden rounded-md'>
//                         {file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img
//                             src={file.fileUrl}
//                             alt={file.fileName}
//                             className='w-full h-full object-cover'
//                           />
//                         ) : (
//                           <div className='doc-thumbnail flex items-center justify-center w-full h-32 overflow-hidden rounded-md bg-gray-100'>
//                             <span className='doc-text text-gray-700'>
//                               {file.fileName?.length > 15
//                                 ? file.fileName.slice(0, 15) + '...'
//                                 : file.fileName}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <div className='file-meta mt-2 text-sm text-gray-600'>
//                         <div className='file-name font-medium' title={file.fileName}>
//                           {file.fileName}
//                         </div>
//                         <div className='file-date'>
//                           {new Date(file.uploadedAt).toLocaleString('vi-VN', { hour12: false })}
//                         </div>
//                       </div>
//                     </a>
//                     {hoveredFileId === file.id && (
//                       <button
//                         onClick={() => handleDeleteFile(file.id)}
//                         className='delete-file-btn absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition'
//                         title='Delete file'
//                       >
//                         {/* <img
//                           src={deleteIcon}
//                           alt='Delete'
//                           style={{ width: '20px', height: '20px' }}
//                         /> */}
//                         <Trash2 size={20} className='text-white' />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <div
//                   className='upload-box bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer'
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <div className='plus-icon text-3xl text-gray-500'>＋</div>
//                   <div className='upload-text text-center text-gray-600 text-sm'>
//                     Drag and
//                     <br />
//                     drop or
//                     <br />
//                     <span className='upload-browse text-blue-500'>browse</span>
//                   </div>
//                 </div>
//                 <input
//                   type='file'
//                   ref={fileInputRef}
//                   style={{ display: 'none' }}
//                   onChange={handleFileUpload}
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className='attachment-upload flex justify-center'>
//               <div
//                 className='upload-box bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer w-full max-w-xs'
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <div className='plus-icon text-4xl text-gray-500'>＋</div>
//                 <div className='upload-text text-center text-gray-600 text-sm'>
//                   Drag and
//                   <br />
//                   drop or
//                   <br />
//                   <span className='upload-browse text-blue-500'>browse</span>
//                 </div>
//               </div>
//               <input
//                 type='file'
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileUpload}
//               />
//             </div>
//           )}
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>ACTIVITY LOG</div>
//           <div className='activity-log-list space-y-4 max-h-80 overflow-y-auto'>
//             {isActivityLogsLoading ? (
//               <p className='activity-log-loading text-gray-500 italic'>Loading activity logs...</p>
//             ) : activityLogs.length === 0 ? (
//               <p className='activity-log-empty text-gray-500 italic'>No activity logs available.</p>
//             ) : (
//               activityLogs.map((log) => (
//                 <div key={log.id} className='activity-log-item bg-white p-3 rounded-lg shadow'>
//                   <div className='activity-log-header flex justify-between items-center text-sm'>
//                     <span className='activity-log-user font-semibold text-gray-800'>
//                       {log.createdByName || `User #${log.createdBy}`}
//                     </span>
//                     <span className='activity-log-time text-gray-500'>
//                       {new Date(log.createdAt).toLocaleString('vi-VN', { hour12: false })}
//                     </span>
//                   </div>
//                   <div className='activity-log-message mt-1 text-gray-700'>{log.message}</div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       <div className='risk-comments-panel mt-6 p-4 bg-gray-50 rounded-lg shadow-md'>
//         <div className='comments-header text-lg font-semibold text-gray-800 mb-4 border-b pb-2'>
//           COMMENTS
//         </div>
//         <div className='comments-body'>
//           <div className='comment-list space-y-4'>
//             {isCommentsLoading ? (
//               <p className='text-gray-500 italic'>Loading comments...</p>
//             ) : comments.length === 0 ? (
//               <p className='text-gray-500 italic'>No comments yet.</p>
//             ) : (
//               comments
//                 .slice()
//                 .reverse()
//                 .map((comment) => (
//                   <div
//                     key={comment.id}
//                     className='simple-comment flex gap-3 bg-white p-3 rounded-lg shadow'
//                   >
//                     <div className='avatar-circle w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'>
//                       <img
//                         src={comment.accountPicture || accountIcon}
//                         alt='avatar'
//                         className='w-full h-full object-cover'
//                       />
//                     </div>
//                     <div className='comment-content flex-1'>
//                       <div className='comment-header flex justify-between items-center text-sm'>
//                         <strong className='text-gray-800'>
//                           {comment.accountFullname ||
//                             comment.accountUsername ||
//                             `User #${comment.accountId}`}
//                         </strong>
//                         <span className='text-gray-500 text-xs'>
//                           {new Date(comment.createdAt).toLocaleString('vi-VN')}
//                         </span>
//                       </div>
//                       <div className='comment-text mt-1 text-gray-700'>
//                         {editingCommentId === comment.id ? (
//                           <>
//                             <input
//                               type='text'
//                               value={editedContent}
//                               onChange={(e) => setEditedContent(e.target.value)}
//                               className='border border-gray-300 rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             />
//                             <div className='flex gap-2'>
//                               <button
//                                 className='text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-100 transition'
//                                 onClick={async () => {
//                                   try {
//                                     await updateRiskComment({
//                                       id: comment.id,
//                                       riskId: risk.id,
//                                       accountId,
//                                       comment: editedContent,
//                                     }).unwrap();
//                                     alert('✅ Comment updated');
//                                     setEditingCommentId(null);
//                                     setEditedContent('');
//                                     await refetchComments();
//                                     await refetchActivityLogs();
//                                   } catch (err: any) {
//                                     console.error('❌ Failed to update comment', err);
//                                     //alert('❌ Update failed');
//                                     setErrorMessage(
//                                       err.data?.message || 'Failed to update comment'
//                                     );
//                                   }
//                                 }}
//                               >
//                                 ✅ Save
//                               </button>
//                               <button
//                                 className='text-red-500 font-semibold px-2 py-1 rounded hover:bg-red-100 transition'
//                                 onClick={() => {
//                                   setEditingCommentId(null);
//                                   setEditedContent('');
//                                 }}
//                               >
//                                 ❌ Cancel
//                               </button>
//                             </div>
//                           </>
//                         ) : (
//                           comment.comment
//                         )}
//                       </div>
//                       {comment.accountId === accountId && (
//                         <div className='comment-actions flex gap-2 mt-2'>
//                           <button
//                             className='edit-btn text-blue-600 hover:text-blue-800 transition'
//                             onClick={() => {
//                               setEditingCommentId(comment.id);
//                               setEditedContent(comment.comment);
//                             }}
//                           >
//                             ✏ Edit
//                           </button>
//                           <button
//                             className='delete-btn text-red-500 hover:text-red-700 transition'
//                             onClick={async () => {
//                               if (
//                                 window.confirm('🗑️ Are you sure you want to delete this comment?')
//                               ) {
//                                 try {
//                                   await deleteRiskComment({
//                                     id: comment.id,
//                                     createdBy: accountId,
//                                   }).unwrap();
//                                   alert('🗑️ Deleted successfully');
//                                   await refetchComments();
//                                   await refetchActivityLogs();
//                                 } catch (err: any) {
//                                   console.error('❌ Failed to delete comment', err);
//                                   //alert('❌ Delete failed');
//                                   setErrorMessage(err.data?.message || 'Failed to delete comment');
//                                 }
//                               }
//                             }}
//                           >
//                             🗑 Delete
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>
//         <div className='comment-input mt-4 relative w-full'>
//           <input
//             type='text'
//             placeholder='Add a comment'
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//           {newComment.trim() && (
//             <button
//               className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition'
//               onClick={async () => {
//                 try {
//                   await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
//                   setNewComment('');
//                   await refetchComments();
//                   await refetchActivityLogs();
//                 } catch (err: any) {
//                   console.error('❌ Failed to send comment', err);
//                   //alert('❌ Send failed');
//                   setErrorMessage(err.data?.message || 'Failed to send comment');
//                 }
//               }}
//             >
//               <SendHorizontal size={20} />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiskDetail;

//---
// import { useSearchParams } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './RiskDetail.css';
// import {
//   MessageSquare,
//   Paperclip,
//   CalendarDays,
//   UserPlus,
//   Trash2,
//   SendHorizontal,
// } from 'lucide-react';
// import {
//   useUpdateRiskTitleMutation,
//   useUpdateRiskStatusMutation,
//   useUpdateRiskResponsibleMutation,
//   useUpdateRiskDueDateMutation,
//   useUpdateRiskDescriptionMutation,
//   useUpdateRiskImpactLevelMutation,
//   useUpdateRiskProbabilityMutation,
// } from '../../../services/riskApi';
// import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetRiskSolutionByRiskIdQuery,
//   useCreateRiskSolutionMutation,
//   useUpdateRiskMitigationPlanMutation,
//   useUpdateRiskContigencyPlanMutation,
//   useDeleteRiskSolutionMutation,
//   useDeleteRiskContingencyPlanMutation,
//   useDeleteRiskMitigationPlanMutation,
// } from '../../../services/riskSolutionApi';
// import {
//   useGetRiskFilesByRiskIdQuery,
//   useUploadRiskFileMutation,
//   useDeleteRiskFileMutation,
// } from '../../../services/riskFileApi';
// import {
//   useGetCommentsByRiskIdQuery,
//   useCreateRiskCommentMutation,
//   useUpdateRiskCommentMutation,
//   useDeleteRiskCommentMutation,
// } from '../../../services/riskCommentApi';
// import deleteIcon from '../../../assets/delete.png';
// import accountIcon from '../../../assets/account.png';
// import { useParams } from 'react-router-dom';
// import { useGetActivityLogsByRiskKeyQuery } from '../../../services/activityLogApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

// export interface Risk {
//   id: number;
//   riskKey: string;
//   title: string;
//   description?: string;
//   impactLevel?: string;
//   probability?: string;
//   severityLevel?: string;
//   status?: string;
//   type?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   dueDate?: string;
//   responsibleId?: number | null;
//   responsibleFullName?: string;
//   responsibleUserName?: string;
//   responsiblePicture?: string;
//   creatorFullName?: string;
//   creatorUserName?: string;
//   creatorPicture?: string;
//   resolution?: string;
// }

// interface RiskDetailProps {
//   risk: Risk;
//   onClose: () => void;
//   isPage?: boolean;
// }

// function getSeverityColor(level?: string) {
//   switch (level) {
//     case 'LOW':
//       return 'bg-green-500';
//     case 'MEDIUM':
//       return 'bg-yellow-500';
//     case 'HIGH':
//       return 'bg-red-500';
//     default:
//       return 'bg-gray-500';
//   }
// }

// function calculateSeverityLevel(impactLevel?: string, probability?: string): string {
//   const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
//   const i = levels[impactLevel as keyof typeof levels] || 0;
//   const p = levels[probability as keyof typeof levels] || 0;
//   const score = i * p;
//   if (score >= 6) return 'HIGH';
//   if (score >= 3) return 'MEDIUM';
//   return 'LOW';
// }

// type Assignee = {
//   id: number;
//   fullName: string | null;
//   userName: string;
//   picture?: string | null;
// };

// const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose, isPage }) => {
//   const navigate = useNavigate();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
//   const [searchParams] = useSearchParams();
//   const { projectKey: paramProjectKey } = useParams();
//   const queryProjectKey = searchParams.get('projectKey');
//   const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const { data: riskSolutionRes, isLoading, refetch } = useGetRiskSolutionByRiskIdQuery(risk.id);
//   const { data: attachments = [], refetch: refetchAttachments } = useGetRiskFilesByRiskIdQuery(
//     risk.id
//   );
//   const {
//     data: comments = [],
//     isLoading: isCommentsLoading,
//     refetch: refetchComments,
//   } = useGetCommentsByRiskIdQuery(risk.id);

//   const {
//     data: activityLogs = [],
//     isLoading: isActivityLogsLoading,
//     refetch: refetchActivityLogs,
//   } = useGetActivityLogsByRiskKeyQuery(risk.riskKey, {
//     skip: !risk.riskKey,
//   });

//   const { data: impactCategoriesData, isLoading: isImpactLoading } =
//     useGetCategoriesByGroupQuery('risk_impact_level');

//   const impactCategories = impactCategoriesData?.data?.filter((cat) => cat.isActive);

//   const { data: probabilityCategoriesData, isLoading: isProbabilityLoading } =
//     useGetCategoriesByGroupQuery('risk_probability_level');

//   const probabilityCategories = probabilityCategoriesData?.data?.filter((cat) => cat.isActive);

//   useEffect(() => {
//     setEditableRisk({
//       ...risk,
//       impactLevel: risk.impactLevel?.toUpperCase(),
//       probability: risk.probability?.toUpperCase(),
//       severityLevel: calculateSeverityLevel(
//         risk.impactLevel?.toUpperCase(),
//         risk.probability?.toUpperCase()
//       ),
//     });
//   }, [risk]);

//   useEffect(() => {
//     setEditableRisk((prev) => ({
//       ...prev,
//       severityLevel: calculateSeverityLevel(prev.impactLevel, prev.probability),
//     }));
//   }, [editableRisk.impactLevel, editableRisk.probability]);

//   useEffect(() => {
//     refetchActivityLogs();
//   }, [refetchActivityLogs]);

//   const projectId = projectData?.data?.id;
//   const skipMembers = !projectId;

//   const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
//     skip: skipMembers,
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropdownRef = useRef<HTMLSelectElement | null>(null);

//   const assignees =
//     membersData?.data?.map((m) => ({
//       id: m.accountId,
//       fullName: m.fullName,
//       userName: m.username,
//       picture: m.picture,
//     })) || [];

//   const attachmentCount = attachments?.length ?? 0;
//   const commentCount = comments?.length ?? 0;

//   const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

//   const [updateRiskTitle] = useUpdateRiskTitleMutation();
//   const [updateRiskStatus] = useUpdateRiskStatusMutation();
//   const [updateResponsible] = useUpdateRiskResponsibleMutation();
//   const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
//   const [updateRiskDescription] = useUpdateRiskDescriptionMutation();
//   const [updateRiskImpactLevel] = useUpdateRiskImpactLevelMutation();
//   const [updateRiskProbability] = useUpdateRiskProbabilityMutation();
//   const [createRiskSolution] = useCreateRiskSolutionMutation();
//   const [updateMitigation] = useUpdateRiskMitigationPlanMutation();
//   const [updateContingency] = useUpdateRiskContigencyPlanMutation();
//   const [deleteRiskSolution] = useDeleteRiskSolutionMutation();
//   const [deleteMitigationPlan] = useDeleteRiskMitigationPlanMutation();
//   const [deleteContingencyPlan] = useDeleteRiskContingencyPlanMutation();
//   const [uploadRiskFile] = useUploadRiskFileMutation();
//   const [deleteRiskFile] = useDeleteRiskFileMutation();
//   const [updateRiskComment] = useUpdateRiskCommentMutation();
//   const [deleteRiskComment] = useDeleteRiskCommentMutation();
//   const [createComment] = useCreateRiskCommentMutation();

//   const [contingencyList, setContingencyList] = useState<{ id: number; text: string }[]>([]);
//   const [mitigationList, setMitigationList] = useState<{ id: number; text: string }[]>([]);
//   const [newContingency, setNewContingency] = useState('');
//   const [newMitigation, setNewMitigation] = useState('');

//   const [editIndexContingency, setEditIndexContingency] = useState<number>(-1);
//   const [editedTextContingency, setEditedTextContingency] = useState<string>('');
//   const [editIndexMitigation, setEditIndexMitigation] = useState<number>(-1);
//   const [editedTextMitigation, setEditedTextMitigation] = useState<string>('');

//   const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
//   const [editedContent, setEditedContent] = useState('');

//   const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

//   const [newComment, setNewComment] = useState('');

//   useEffect(() => {
//     if (riskSolutionRes?.isSuccess && riskSolutionRes.data) {
//       const dataArray = Array.isArray(riskSolutionRes.data)
//         ? riskSolutionRes.data
//         : [riskSolutionRes.data];

//       const allContingencyItems = dataArray.flatMap((solution) =>
//         solution.contingencyPlan
//           ? solution.contingencyPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       const allMitigationItems = dataArray.flatMap((solution) =>
//         solution.mitigationPlan
//           ? solution.mitigationPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       setContingencyList(allContingencyItems);
//       setMitigationList(allMitigationItems);
//     }
//   }, [riskSolutionRes]);

//   useEffect(() => {
//     if (showResponsibleDropdown && dropdownRef.current) {
//       dropdownRef.current.focus();
//     }
//   }, [showResponsibleDropdown]);

//   const handleContingencyChange = async (id: number, newText: string, index: number) => {
//     try {
//       await updateContingency({ id, contigencyPlan: newText, createdBy: accountId });
//       const updated = [...contingencyList];
//       updated[index].text = newText;
//       setContingencyList(updated);
//       setEditIndexContingency(-1);
//       refetch();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('Update failed', error);
//       setErrorMessage('Failed to update contingency plan');
//     }
//   };

//   const handleMitigationChange = async (id: number, newText: string, index: number) => {
//     try {
//       await updateMitigation({ id, mitigationPlan: newText, createdBy: accountId });
//       const updated = [...mitigationList];
//       updated[index].text = newText;
//       setMitigationList(updated);
//       setEditIndexMitigation(-1);
//       refetch();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('Update failed', error);
//       setErrorMessage('Failed to update mitigation plan');
//     }
//   };

//   const handleAddContigency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newContingency.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: newContingency.trim(),
//         mitigationPlan: null,
//         createdBy: accountId,
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.contingencyPlan ?? '',
//         };

//         setContingencyList((prev) => [...prev, newItem]);
//         setNewContingency('');
//         refetch();
//         refetchActivityLogs();
//       }
//     }
//   };

//   const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newMitigation.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: null,
//         mitigationPlan: newMitigation.trim(),
//         createdBy: accountId,
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.mitigationPlan ?? '',
//         };

//         setMitigationList((prev) => [...prev, newItem]);
//         setNewMitigation('');
//         refetch();
//         refetchActivityLogs();
//       }
//     }
//   };

//   const handleChange = (field: keyof Risk, value: any) => {
//     setEditableRisk((prev) => ({ ...prev, [field]: value }));
//     setErrorMessage('');
//   };

//   const renderAvatar = () => {
//     if (editableRisk.responsiblePicture) {
//       return (
//         <img
//           src={editableRisk.responsiblePicture}
//           alt='avatar'
//           className='responsible-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'
//         />
//       );
//     }
//     const initials =
//       editableRisk.responsibleFullName
//         ?.split(' ')
//         .map((n) => n[0])
//         .join('') ||
//       editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
//       '?';
//     return <div className='responsible-avatar-placeholder bg-gray-300 text-white'>{initials}</div>;
//   };

//   const RiskStatusDropdown = ({
//     status,
//     onChange,
//   }: {
//     status: string;
//     onChange: (newStatus: string) => void;
//   }) => {
//     const {
//       data: categoriesData,
//       isLoading,
//       isError,
//     } = useGetCategoriesByGroupQuery('risk_status');

//     const categories = categoriesData?.data?.filter((cat) => cat.isActive);

//     const getStyle = (categoryName: string) => {
//       const category = categories?.find((cat) => cat.name === categoryName);
//       if (!category?.color) return 'bg-gray-100 text-gray-700';
//       const [bgColor, textColor] = category.color.includes(',')
//         ? category.color.split(',')
//         : [category.color, category.color];
//       return `bg-${bgColor} text-${textColor}`;
//     };

//     return (
//       <select
//         className={`risk-detail-status-select ${getStyle(status)}`}
//         value={status}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={isLoading}
//         style={{
//           border: 'none',
//           borderRadius: '6px',
//           padding: '6px 12px',
//           fontWeight: 600,
//           fontSize: '14px',
//           cursor: 'pointer',
//         }}
//       >
//         {isLoading ? (
//           <option value=''>Loading...</option>
//         ) : (
//           categories?.map((category) => (
//             <option key={category.name} value={category.name}>
//               {category.label}
//             </option>
//           ))
//         )}
//       </select>
//     );
//   };

//   const ResponsibleDropdown = ({
//     assignees,
//     selectedId,
//     onChange,
//   }: {
//     assignees: Assignee[];
//     selectedId: number | null;
//     onChange: (id: number | null) => void;
//   }) => {
//     return (
//       <select
//         className='responsible-dropdown p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
//         ref={dropdownRef}
//         value={selectedId?.toString() ?? ''}
//         onChange={(e) => {
//           const selectedValue = e.target.value;
//           onChange(selectedValue === '' ? null : Number(selectedValue));
//         }}
//         style={{
//           padding: '6px 12px',
//           borderRadius: '6px',
//           fontSize: '14px',
//           cursor: 'pointer',
//           backgroundColor: '#f9fafb',
//           border: '1px solid #d1d5db',
//         }}
//       >
//         <option value=''>No Assignee</option>
//         {assignees.map((user) => (
//           <option key={user.id} value={user.id}>
//             {user.fullName || user.userName}
//           </option>
//         ))}
//       </select>
//     );
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !risk) return;

//     try {
//       await uploadRiskFile({
//         riskId: risk.id,
//         fileName: file.name,
//         uploadedBy: accountId,
//         file,
//       }).unwrap();

//       alert(`✅ Uploaded file "${file.name}" successfully!`);
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Upload failed:', error);
//       alert('❌ Upload failed!');
//     }
//   };

//   const handleDeleteFile = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this file?')) return;
//     try {
//       await deleteRiskFile({ id: id, createdBy: accountId }).unwrap();
//       alert('✅ File deleted!');
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Delete failed:', error);
//       alert('❌ Delete failed!');
//     }
//   };

//   return (
//     <div className={isPage ? 'risk-page-container' : 'risk-detail-container'}>
//       <div className='risk-detail-panel relative bg-white rounded-lg p-6'>
//         <div className='detail-header border-b-2 flex justify-between items-center mb-6 border-b pb-4'>
//           <div className='detail-title-section space-y-2'>
//             <div className='risk-path text-gray-600 text-sm mb-2'>
//               <div>
//                 {projectKey} /{' '}
//                 <span
//                   className='risk-code font-medium text-blue-600 hover:underline cursor-pointer'
//                   onClick={() =>
//                     navigate(
//                       `/project/${projectKey}/risk/${
//                         editableRisk.riskKey || `R-${editableRisk.id}`
//                       }`
//                     )
//                   }
//                 >
//                   {editableRisk.riskKey || `R-${editableRisk.id}`}
//                 </span>
//               </div>
//               <div className='reporter-meta-block flex items-center gap-2 mt-2'>
//                 <div className='reporter-icons flex items-center gap-2'>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <MessageSquare size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{commentCount}</span>
//                   </div>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <Paperclip size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{attachmentCount}</span>
//                   </div>
//                 </div>
//                 <div
//                   className='reporter-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm bg-gray-200'
//                   title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'System'}
//                 >
//                   {editableRisk.creatorPicture ? (
//                     <img
//                       src={editableRisk.creatorPicture}
//                       alt='reporter avatar'
//                       className='w-full h-full object-cover'
//                     />
//                   ) : (
//                     <div className='avatar-placeholder bg-gray-300 text-white flex items-center justify-center w-full h-full'>
//                       ⚙️
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className='title-and-status flex items-center gap-4 relative'>
//               <div className='title-input-container w-full'>
//                 <input
//                   className='editable-title-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold'
//                   value={editableRisk.title}
//                   onChange={(e) => handleChange('title', e.target.value)}
//                   onBlur={async (e) => {
//                     const newTitle = e.target.value.trim();
//                     if (newTitle && newTitle !== risk.title) {
//                       try {
//                         await updateRiskTitle({
//                           id: editableRisk.id,
//                           title: newTitle,
//                           createdBy: accountId,
//                         }).unwrap();
//                         refetchActivityLogs();
//                       } catch (err: any) {
//                         console.error('Failed to update title:', err);
//                         setErrorMessage(err.data?.message || 'Failed to update title');
//                         if (err.data?.message.includes('exceeds maximum length')) {
//                           setErrorMessage(
//                             `Title exceeds maximum length of ${
//                               err.data?.message.match(/\d+/)[0]
//                             } characters`
//                           );
//                         }
//                       }
//                     } else if (!newTitle) {
//                       setErrorMessage('Risk title is required');
//                       setEditableRisk((prev) => ({ ...prev, title: risk.title }));
//                     }
//                   }}
//                   placeholder='Enter risk title'
//                 />
//                 {errorMessage && errorMessage.includes('title') && (
//                   <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                 )}
//               </div>
//               <RiskStatusDropdown
//                 status={editableRisk.status || 'OPEN'}
//                 onChange={async (newStatus) => {
//                   try {
//                     await updateRiskStatus({
//                       id: editableRisk.id,
//                       status: newStatus,
//                       createdBy: accountId,
//                     }).unwrap();
//                     handleChange('status', newStatus);
//                     refetchActivityLogs();
//                   } catch (err: any) {
//                     console.error('Failed to update status:', err);
//                     setErrorMessage(err.data?.message || 'Failed to update status');
//                   }
//                 }}
//               />
//             </div>
//             <div className='meta-inline flex items-center gap-2 mt-2 text-sm text-gray-500'>
//               <span className='meta-item'>Risk</span>
//               <span className='meta-separator'>·</span>
//               <span className='meta-item with-icon flex items-center gap-1 relative'>
//                 <CalendarDays size={16} />
//                 <input
//                   type='date'
//                   value={editableRisk.dueDate?.split('T')[0] || ''}
//                   onChange={async (e) => {
//                     const newDate = e.target.value + 'T00:00:00Z';
//                     try {
//                       await updateRiskDueDate({
//                         id: editableRisk.id,
//                         dueDate: newDate,
//                         createdBy: accountId,
//                       }).unwrap();
//                       setEditableRisk((prev) => ({
//                         ...prev,
//                         dueDate: newDate,
//                       }));
//                       setErrorMessage('');
//                       refetchActivityLogs();
//                     } catch (err: any) {
//                       console.error('Failed to update due date:', err);
//                       const errorMsg = err.data || 'Failed to update due date';
//                       if (errorMsg.includes('past')) {
//                         setErrorMessage('Due date cannot be in the past');
//                       } else if (errorMsg.includes('project end date')) {
//                         setErrorMessage('Due date cannot be later than project end date');
//                       } else {
//                         setErrorMessage(errorMsg);
//                       }
//                     }
//                   }}
//                   className='due-date-input p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
//                 />
//               </span>
//               <span className='meta-separator'>·</span>
//               <div className='meta-value responsible-info flex items-center gap-2 cursor-pointer relative'>
//                 {editableRisk.responsibleId ? (
//                   <>
//                     {renderAvatar()}
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={editableRisk.responsibleId ?? null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();
//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                           setErrorMessage('');
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           console.error('Failed to update responsible:', err);
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                     {errorMessage && errorMessage.includes('responsible user') && (
//                       <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <div
//                       className='unassigned-avatar flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'
//                       onClick={() => setShowResponsibleDropdown(true)}
//                     >
//                       <UserPlus size={14} className='text-gray-600' />
//                     </div>
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();
//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                           setShowResponsibleDropdown(false);
//                           setErrorMessage('');
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           console.error('Failed to update responsible:', err);
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                     {errorMessage && errorMessage.includes('responsible user') && (
//                       <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//             {errorMessage && errorMessage.includes('due date') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>
//           <button
//             className='close-btn absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition'
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>DESCRIPTION</div>
//           <textarea
//             value={editableRisk.description || ''}
//             onChange={async (e) => {
//               const newDescription = e.target.value;
//               try {
//                 await updateRiskDescription({
//                   id: editableRisk.id,
//                   description: newDescription,
//                   createdBy: accountId,
//                 }).unwrap();
//                 setEditableRisk((prev) => ({ ...prev, description: newDescription }));
//                 setErrorMessage('');
//                 refetchActivityLogs();
//               } catch (error: any) {
//                 console.error('Failed to update description:', error);
//                 setErrorMessage(error.data?.message || 'Failed to update description');
//               }
//             }}
//             rows={4}
//             className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//           {errorMessage && errorMessage.includes('description') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             CONTINGENCY PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {contingencyList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexContingency === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextContingency}
//                     onBlur={() => handleContingencyChange(item.id, editedTextContingency, index)}
//                     onChange={(e) => setEditedTextContingency(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleContingencyChange(item.id, editedTextContingency, index);
//                       if (e.key === 'Escape') setEditIndexContingency(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexContingency(index);
//                       setEditedTextContingency(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteContingencyPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = contingencyList.filter((_, i) => i !== index);
//                       setContingencyList(updated);
//                       setErrorMessage('');
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                       setErrorMessage('Failed to delete contingency plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Contingency Plan'
//                 value={newContingency}
//                 onChange={(e) => setNewContingency(e.target.value)}
//                 onKeyDown={handleAddContigency}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//               {errorMessage && errorMessage.includes('contingency plan') && (
//                 <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//               )}
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             MITIGATION PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {mitigationList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexMitigation === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextMitigation}
//                     onBlur={() => handleMitigationChange(item.id, editedTextMitigation, index)}
//                     onChange={(e) => setEditedTextMitigation(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleMitigationChange(item.id, editedTextMitigation, index);
//                       if (e.key === 'Escape') setEditIndexMitigation(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexMitigation(index);
//                       setEditedTextMitigation(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteMitigationPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = mitigationList.filter((_, i) => i !== index);
//                       setMitigationList(updated);
//                       setErrorMessage('');
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                       setErrorMessage('Failed to delete mitigation plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Mitigation Plan'
//                 value={newMitigation}
//                 onChange={(e) => setNewMitigation(e.target.value)}
//                 onKeyDown={handleAddMitigation}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//               {errorMessage && errorMessage.includes('mitigation plan') && (
//                 <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//               )}
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section triple-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>IMPACT</div>
//             <ul className='radio-button-list space-y-2'>
//               {isImpactLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 impactCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.impactLevel === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='impact'
//                         value={category.name}
//                         checked={editableRisk.impactLevel === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskImpactLevel({
//                               id: editableRisk.id,
//                               impactLevel: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('impactLevel', category.name);
//                             setErrorMessage('');
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update impact level:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update impact level');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//             {errorMessage && errorMessage.includes('impact level') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>

//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LIKELIHOOD</div>
//             <ul className='radio-button-list space-y-2'>
//               {isProbabilityLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 probabilityCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.probability === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='probability'
//                         value={category.name}
//                         checked={editableRisk.probability === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskProbability({
//                               id: editableRisk.id,
//                               probability: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('probability', category.name);
//                             setErrorMessage('');
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update probability:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update probability');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//             {errorMessage && errorMessage.includes('probability') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>

//           <div className='levelWrapper'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LEVEL</div>
//             <div
//               className={`semi-gauge w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold ${getSeverityColor(
//                 editableRisk.severityLevel
//               )}`}
//             >
//               {editableRisk.severityLevel
//                 ? editableRisk.severityLevel.charAt(0).toUpperCase() +
//                   editableRisk.severityLevel.slice(1).toLowerCase()
//                 : 'Unknown'}
//             </div>
//           </div>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>Attachments</div>
//           {Array.isArray(attachments) && attachments.length > 0 ? (
//             <div className='attachments-section mt-2'>
//               <div className='attachments-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//                 {attachments.map((file) => (
//                   <div
//                     className='attachment-card relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition'
//                     key={file.id}
//                     onMouseEnter={() => setHoveredFileId(file.id)}
//                     onMouseLeave={() => setHoveredFileId(null)}
//                   >
//                     <a
//                       href={file.fileUrl}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       className='block'
//                     >
//                       <div className='thumbnail w-full h-32 overflow-hidden rounded-md'>
//                         {file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img
//                             src={file.fileUrl}
//                             alt={file.fileName}
//                             className='w-full h-full object-cover'
//                           />
//                         ) : (
//                           <div className='doc-thumbnail flex items-center justify-center w-full h-32 overflow-hidden rounded-md bg-gray-100'>
//                             <span className='doc-text text-gray-700'>
//                               {file.fileName?.length > 15
//                                 ? file.fileName.slice(0, 15) + '...'
//                                 : file.fileName}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <div className='file-meta mt-2 text-sm text-gray-600'>
//                         <div className='file-name font-medium' title={file.fileName}>
//                           {file.fileName}
//                         </div>
//                         <div className='file-date'>
//                           {new Date(file.uploadedAt).toLocaleString('vi-VN', { hour12: false })}
//                         </div>
//                       </div>
//                     </a>
//                     {hoveredFileId === file.id && (
//                       <button
//                         onClick={() => handleDeleteFile(file.id)}
//                         className='delete-file-btn absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition'
//                         title='Delete file'
//                       >
//                         <Trash2 size={20} className='text-white' />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <div
//                   className='upload-box bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer'
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <div className='plus-icon text-3xl text-gray-500'>＋</div>
//                   <div className='upload-text text-center text-gray-600 text-sm'>
//                     Drag and
//                     <br />
//                     drop or
//                     <br />
//                     <span className='upload-browse text-blue-500'>browse</span>
//                   </div>
//                 </div>
//                 <input
//                   type='file'
//                   ref={fileInputRef}
//                   style={{ display: 'none' }}
//                   onChange={handleFileUpload}
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className='attachment-upload flex justify-center'>
//               <div
//                 className='upload-box bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer w-full max-w-xs'
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <div className='plus-icon text-4xl text-gray-500'>＋</div>
//                 <div className='upload-text text-center text-gray-600 text-sm'>
//                   Drag and
//                   <br />
//                   drop or
//                   <br />
//                   <span className='upload-browse text-blue-500'>browse</span>
//                 </div>
//               </div>
//               <input
//                 type='file'
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileUpload}
//               />
//             </div>
//           )}
//           {errorMessage && errorMessage.includes('file') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>ACTIVITY LOG</div>
//           <div className='activity-log-list space-y-4 max-h-80 overflow-y-auto'>
//             {isActivityLogsLoading ? (
//               <p className='activity-log-loading text-gray-500 italic'>Loading activity logs...</p>
//             ) : activityLogs.length === 0 ? (
//               <p className='activity-log-empty text-gray-500 italic'>No activity logs available.</p>
//             ) : (
//               activityLogs.map((log) => (
//                 <div key={log.id} className='activity-log-item bg-white p-3 rounded-lg shadow'>
//                   <div
//                     className='

// activity-log-header flex justify-between items-center text-sm'
//                   >
//                     <span className='activity-log-user font-semibold text-gray-800'>
//                       {log.createdByName || `User #${log.createdBy}`}
//                     </span>
//                     <span className='activity-log-time text-gray-500'>
//                       {new Date(log.createdAt).toLocaleString('vi-VN', { hour12: false })}
//                     </span>
//                   </div>
//                   <div className='activity-log-message mt-1 text-gray-700'>{log.message}</div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       <div className='risk-comments-panel mt-6 p-4 bg-gray-50 rounded-lg shadow-md'>
//         <div className='comments-header text-lg font-semibold text-gray-800 mb-4 border-b pb-2'>
//           COMMENTS
//         </div>
//         <div className='comments-body'>
//           <div className='comment-list space-y-4'>
//             {isCommentsLoading ? (
//               <p className='text-gray-500 italic'>Loading comments...</p>
//             ) : comments.length === 0 ? (
//               <p className='text-gray-500 italic'>No comments yet.</p>
//             ) : (
//               comments
//                 .slice()
//                 .reverse()
//                 .map((comment) => (
//                   <div
//                     key={comment.id}
//                     className='simple-comment flex gap-3 bg-white p-3 rounded-lg shadow'
//                   >
//                     <div className='avatar-circle w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'>
//                       <img
//                         src={comment.accountPicture || accountIcon}
//                         alt='avatar'
//                         className='w-full h-full object-cover'
//                       />
//                     </div>
//                     <div className='comment-content flex-1'>
//                       <div className='comment-header flex justify-between items-center text-sm'>
//                         <strong className='text-gray-800'>
//                           {comment.accountFullname ||
//                             comment.accountUsername ||
//                             `User #${comment.accountId}`}
//                         </strong>
//                         <span className='text-gray-500 text-xs'>
//                           {new Date(comment.createdAt).toLocaleString('vi-VN')}
//                         </span>
//                       </div>
//                       <div className='comment-text mt-1 text-gray-700'>
//                         {editingCommentId === comment.id ? (
//                           <>
//                             <input
//                               type='text'
//                               value={editedContent}
//                               onChange={(e) => setEditedContent(e.target.value)}
//                               className='border border-gray-300 rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             />
//                             <div className='flex gap-2'>
//                               <button
//                                 className='text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-100 transition'
//                                 onClick={async () => {
//                                   try {
//                                     await updateRiskComment({
//                                       id: comment.id,
//                                       riskId: risk.id,
//                                       accountId,
//                                       comment: editedContent,
//                                     }).unwrap();
//                                     setEditingCommentId(null);
//                                     setEditedContent('');
//                                     setErrorMessage('');
//                                     await refetchComments();
//                                     await refetchActivityLogs();
//                                   } catch (err: any) {
//                                     console.error('Failed to update comment:', err);
//                                     setErrorMessage(
//                                       err.data?.message || 'Failed to update comment'
//                                     );
//                                   }
//                                 }}
//                               >
//                                 ✅ Save
//                               </button>
//                               <button
//                                 className='text-red-500 font-semibold px-2 py-1 rounded hover:bg-red-100 transition'
//                                 onClick={() => {
//                                   setEditingCommentId(null);
//                                   setEditedContent('');
//                                   setErrorMessage('');
//                                 }}
//                               >
//                                 ❌ Cancel
//                               </button>
//                             </div>
//                           </>
//                         ) : (
//                           comment.comment
//                         )}
//                       </div>
//                       {comment.accountId === accountId && (
//                         <div className='comment-actions flex gap-2 mt-2'>
//                           <button
//                             className='edit-btn text-blue-600 hover:text-blue-800 transition'
//                             onClick={() => {
//                               setEditingCommentId(comment.id);
//                               setEditedContent(comment.comment);
//                             }}
//                           >
//                             ✏ Edit
//                           </button>
//                           <button
//                             className='delete-btn text-red-500 hover:text-red-700 transition'
//                             onClick={async () => {
//                               if (
//                                 window.confirm('🗑️ Are you sure you want to delete this comment?')
//                               ) {
//                                 try {
//                                   await deleteRiskComment({
//                                     id: comment.id,
//                                     createdBy: accountId,
//                                   }).unwrap();
//                                   setErrorMessage('');
//                                   await refetchComments();
//                                   await refetchActivityLogs();
//                                 } catch (err: any) {
//                                   console.error('Failed to delete comment:', err);
//                                   setErrorMessage(err.data?.message || 'Failed to delete comment');
//                                 }
//                               }
//                             }}
//                           >
//                             🗑 Delete
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>
//         <div className='comment-input mt-4 relative w-full'>
//           <input
//             type='text'
//             placeholder='Add a comment'
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//           {newComment.trim() && (
//             <button
//               className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition'
//               onClick={async () => {
//                 try {
//                   await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
//                   setNewComment('');
//                   setErrorMessage('');
//                   await refetchComments();
//                   await refetchActivityLogs();
//                 } catch (err: any) {
//                   console.error('Failed to send comment:', err);
//                   setErrorMessage(err.data?.message || 'Failed to send comment');
//                 }
//               }}
//             >
//               <SendHorizontal size={20} />
//             </button>
//           )}
//           {errorMessage && errorMessage.includes('comment') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiskDetail;

//[new]
// import { useSearchParams } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './RiskDetail.css';
// import {
//   MessageSquare,
//   Paperclip,
//   CalendarDays,
//   UserPlus,
//   Trash2,
//   SendHorizontal,
// } from 'lucide-react';
// import {
//   useUpdateRiskTitleMutation,
//   useUpdateRiskStatusMutation,
//   useUpdateRiskResponsibleMutation,
//   useUpdateRiskDueDateMutation,
//   useUpdateRiskDescriptionMutation,
//   useUpdateRiskImpactLevelMutation,
//   useUpdateRiskProbabilityMutation,
// } from '../../../services/riskApi';
// import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetRiskSolutionByRiskIdQuery,
//   useCreateRiskSolutionMutation,
//   useUpdateRiskMitigationPlanMutation,
//   useUpdateRiskContigencyPlanMutation,
//   useDeleteRiskSolutionMutation,
//   useDeleteRiskContingencyPlanMutation,
//   useDeleteRiskMitigationPlanMutation,
// } from '../../../services/riskSolutionApi';
// import {
//   useGetRiskFilesByRiskIdQuery,
//   useUploadRiskFileMutation,
//   useDeleteRiskFileMutation,
// } from '../../../services/riskFileApi';
// import {
//   useGetCommentsByRiskIdQuery,
//   useCreateRiskCommentMutation,
//   useUpdateRiskCommentMutation,
//   useDeleteRiskCommentMutation,
// } from '../../../services/riskCommentApi';
// import deleteIcon from '../../../assets/delete.png';
// import accountIcon from '../../../assets/account.png';
// import { useParams } from 'react-router-dom';
// import { useGetActivityLogsByRiskKeyQuery } from '../../../services/activityLogApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
// import Swal from 'sweetalert2';

// export interface Risk {
//   id: number;
//   riskKey: string;
//   title: string;
//   description?: string;
//   impactLevel?: string;
//   probability?: string;
//   severityLevel?: string;
//   status?: string;
//   type?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   dueDate?: string;
//   responsibleId?: number | null;
//   responsibleFullName?: string;
//   responsibleUserName?: string;
//   responsiblePicture?: string;
//   creatorFullName?: string;
//   creatorUserName?: string;
//   creatorPicture?: string;
//   resolution?: string;
// }

// interface RiskDetailProps {
//   risk: Risk;
//   onClose: () => void;
//   isPage?: boolean;
// }

// function getSeverityColor(level?: string) {
//   switch (level) {
//     case 'LOW':
//       return 'bg-green-500';
//     case 'MEDIUM':
//       return 'bg-yellow-500';
//     case 'HIGH':
//       return 'bg-red-500';
//     default:
//       return 'bg-gray-500';
//   }
// }

// function calculateSeverityLevel(impactLevel?: string, probability?: string): string {
//   const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
//   const i = levels[impactLevel as keyof typeof levels] || 0;
//   const p = levels[probability as keyof typeof levels] || 0;
//   const score = i * p;
//   if (score >= 6) return 'HIGH';
//   if (score >= 3) return 'MEDIUM';
//   return 'LOW';
// }

// type Assignee = {
//   id: number;
//   fullName: string | null;
//   userName: string;
//   picture?: string | null;
// };

// const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose, isPage }) => {
//   const navigate = useNavigate();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
//   const [searchParams] = useSearchParams();
//   const { projectKey: paramProjectKey } = useParams();
//   const queryProjectKey = searchParams.get('projectKey');
//   const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   const { data: configData, isLoading: isConfigLoading } =
//     useGetByConfigKeyQuery('risk_title_length');
//   const maxTitleLength = configData?.data?.maxValue ? parseInt(configData.data.maxValue) : 200;

//   const { data: riskSolutionRes, isLoading, refetch } = useGetRiskSolutionByRiskIdQuery(risk.id);
//   const { data: attachments = [], refetch: refetchAttachments } = useGetRiskFilesByRiskIdQuery(
//     risk.id
//   );
//   const {
//     data: comments = [],
//     isLoading: isCommentsLoading,
//     refetch: refetchComments,
//   } = useGetCommentsByRiskIdQuery(risk.id);

//   const {
//     data: activityLogs = [],
//     isLoading: isActivityLogsLoading,
//     refetch: refetchActivityLogs,
//   } = useGetActivityLogsByRiskKeyQuery(risk.riskKey, {
//     skip: !risk.riskKey,
//   });

//   const { data: impactCategoriesData, isLoading: isImpactLoading } =
//     useGetCategoriesByGroupQuery('risk_impact_level');

//   const impactCategories = impactCategoriesData?.data?.filter((cat) => cat.isActive);

//   const { data: probabilityCategoriesData, isLoading: isProbabilityLoading } =
//     useGetCategoriesByGroupQuery('risk_probability_level');

//   const probabilityCategories = probabilityCategoriesData?.data?.filter((cat) => cat.isActive);

//   useEffect(() => {
//     setEditableRisk({
//       ...risk,
//       impactLevel: risk.impactLevel?.toUpperCase(),
//       probability: risk.probability?.toUpperCase(),
//       severityLevel: calculateSeverityLevel(
//         risk.impactLevel?.toUpperCase(),
//         risk.probability?.toUpperCase()
//       ),
//     });
//   }, [risk]);

//   useEffect(() => {
//     setEditableRisk((prev) => ({
//       ...prev,
//       severityLevel: calculateSeverityLevel(prev.impactLevel, prev.probability),
//     }));
//   }, [editableRisk.impactLevel, editableRisk.probability]);

//   useEffect(() => {
//     refetchActivityLogs();
//   }, [refetchActivityLogs]);

//   const projectId = projectData?.data?.id;
//   const skipMembers = !projectId;

//   const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
//     skip: skipMembers,
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropdownRef = useRef<HTMLSelectElement | null>(null);

//   const assignees =
//     membersData?.data?.map((m) => ({
//       id: m.accountId,
//       fullName: m.fullName,
//       userName: m.username,
//       picture: m.picture,
//     })) || [];

//   const attachmentCount = attachments?.length ?? 0;
//   const commentCount = comments?.length ?? 0;

//   const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

//   const [updateRiskTitle] = useUpdateRiskTitleMutation();
//   const [updateRiskStatus] = useUpdateRiskStatusMutation();
//   const [updateResponsible] = useUpdateRiskResponsibleMutation();
//   const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
//   const [updateRiskDescription] = useUpdateRiskDescriptionMutation();
//   const [updateRiskImpactLevel] = useUpdateRiskImpactLevelMutation();
//   const [updateRiskProbability] = useUpdateRiskProbabilityMutation();
//   const [createRiskSolution] = useCreateRiskSolutionMutation();
//   const [updateMitigation] = useUpdateRiskMitigationPlanMutation();
//   const [updateContingency] = useUpdateRiskContigencyPlanMutation();
//   const [deleteRiskSolution] = useDeleteRiskSolutionMutation();
//   const [deleteMitigationPlan] = useDeleteRiskMitigationPlanMutation();
//   const [deleteContingencyPlan] = useDeleteRiskContingencyPlanMutation();
//   const [uploadRiskFile] = useUploadRiskFileMutation();
//   const [deleteRiskFile] = useDeleteRiskFileMutation();
//   const [updateRiskComment] = useUpdateRiskCommentMutation();
//   const [deleteRiskComment] = useDeleteRiskCommentMutation();
//   const [createComment] = useCreateRiskCommentMutation();

//   const [contingencyList, setContingencyList] = useState<{ id: number; text: string }[]>([]);
//   const [mitigationList, setMitigationList] = useState<{ id: number; text: string }[]>([]);
//   const [newContingency, setNewContingency] = useState('');
//   const [newMitigation, setNewMitigation] = useState('');

//   const [editIndexContingency, setEditIndexContingency] = useState<number>(-1);
//   const [editedTextContingency, setEditedTextContingency] = useState<string>('');
//   const [editIndexMitigation, setEditIndexMitigation] = useState<number>(-1);
//   const [editedTextMitigation, setEditedTextMitigation] = useState<string>('');

//   const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
//   const [editedContent, setEditedContent] = useState('');

//   const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

//   const [newComment, setNewComment] = useState('');

//   useEffect(() => {
//     if (riskSolutionRes?.isSuccess && riskSolutionRes.data) {
//       const dataArray = Array.isArray(riskSolutionRes.data)
//         ? riskSolutionRes.data
//         : [riskSolutionRes.data];

//       const allContingencyItems = dataArray.flatMap((solution) =>
//         solution.contingencyPlan
//           ? solution.contingencyPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       const allMitigationItems = dataArray.flatMap((solution) =>
//         solution.mitigationPlan
//           ? solution.mitigationPlan
//               .split('\n')
//               .map((line) => line.trim())
//               .filter((line) => line !== '')
//               .map((line) => ({
//                 id: solution.id,
//                 text: line,
//               }))
//           : []
//       );

//       setContingencyList(allContingencyItems);
//       setMitigationList(allMitigationItems);
//     }
//   }, [riskSolutionRes]);

//   useEffect(() => {
//     if (showResponsibleDropdown && dropdownRef.current) {
//       dropdownRef.current.focus();
//     }
//   }, [showResponsibleDropdown]);

//   const handleContingencyChange = async (id: number, newText: string, index: number) => {
//     try {
//       if (newText.trim() === '') {
//         setErrorMessage('Contingency plan cannot be empty');
//         return;
//       }
//       await updateContingency({ id, contigencyPlan: newText, createdBy: accountId }).unwrap();
//       const updated = [...contingencyList];
//       updated[index].text = newText;
//       setContingencyList(updated);
//       setEditIndexContingency(-1);
//       setErrorMessage('');
//       refetch();
//       refetchActivityLogs();
//     } catch (err: any) {
//       console.error('Failed to update contingency plan:', err);
//       setErrorMessage(err.data?.message || 'Failed to update contingency plan');
//     }
//   };

//   const handleMitigationChange = async (id: number, newText: string, index: number) => {
//     try {
//       if (newText.trim() === '') {
//         setErrorMessage('Mitigation plan cannot be empty');
//         return;
//       }
//       await updateMitigation({ id, mitigationPlan: newText, createdBy: accountId }).unwrap();
//       const updated = [...mitigationList];
//       updated[index].text = newText;
//       setMitigationList(updated);
//       setEditIndexMitigation(-1);
//       setErrorMessage('');
//       refetch();
//       refetchActivityLogs();
//     } catch (err: any) {
//       console.error('Failed to update mitigation plan:', err);
//       setErrorMessage(err.data?.message || 'Failed to update mitigation plan');
//     }
//   };

//   const handleAddContingency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newContingency.trim() !== '') {
//       try {
//         const res = await createRiskSolution({
//           riskId: risk.id,
//           contingencyPlan: newContingency.trim(),
//           mitigationPlan: null,
//           createdBy: accountId,
//         }).unwrap();
//         if (res?.data) {
//           const newItem = {
//             id: res.data.id,
//             text: res.data.contingencyPlan ?? '',
//           };
//           setContingencyList((prev) => [...prev, newItem]);
//           setNewContingency('');
//           setErrorMessage('');
//           refetch();
//           refetchActivityLogs();
//         }
//       } catch (err: any) {
//         console.error('Failed to add contingency plan:', err);
//         setErrorMessage(err.data?.message || 'Failed to add contingency plan');
//       }
//     }
//   };

//   const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newMitigation.trim() !== '') {
//       try {
//         const res = await createRiskSolution({
//           riskId: risk.id,
//           contingencyPlan: null,
//           mitigationPlan: newMitigation.trim(),
//           createdBy: accountId,
//         }).unwrap();
//         if (res?.data) {
//           const newItem = {
//             id: res.data.id,
//             text: res.data.mitigationPlan ?? '',
//           };
//           setMitigationList((prev) => [...prev, newItem]);
//           setNewMitigation('');
//           setErrorMessage('');
//           refetch();
//           refetchActivityLogs();
//         }
//       } catch (err: any) {
//         console.error('Failed to add mitigation plan:', err);
//         setErrorMessage(err.data?.message || 'Failed to add mitigation plan');
//       }
//     }
//   };

//   const handleChange = (field: keyof Risk, value: any) => {
//     setEditableRisk((prev) => ({ ...prev, [field]: value }));
//     if (field === 'title') {
//       if (value.length > maxTitleLength) {
//         setErrorMessage(`Title exceeds maximum length of ${maxTitleLength} characters`);
//       } else {
//         setErrorMessage('');
//       }
//     } else if (field === 'dueDate') {
//       const validationError = validateDueDate(value);
//       setErrorMessage(validationError || '');
//     }
//   };

//   const validateDueDate = (newDate: string): string | null => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Normalize to start of day
//     const selectedDate = new Date(newDate);
//     const projectEndDate = projectData?.data?.endDate ? new Date(projectData.data.endDate) : null;

//     if (selectedDate < today) {
//       return 'Due date cannot be in the past';
//     }
//     if (projectEndDate && selectedDate > projectEndDate) {
//       return 'Due date cannot be later than project end date';
//     }
//     return null;
//   };

//   const renderAvatar = () => {
//     if (editableRisk.responsiblePicture) {
//       return (
//         <img
//           src={editableRisk.responsiblePicture}
//           alt='avatar'
//           className='responsible-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'
//         />
//       );
//     }
//     const initials =
//       editableRisk.responsibleFullName
//         ?.split(' ')
//         .map((n) => n[0])
//         .join('') ||
//       editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
//       '?';
//     return <div className='responsible-avatar-placeholder bg-gray-300 text-white'>{initials}</div>;
//   };

//   const RiskStatusDropdown = ({
//     status,
//     onChange,
//   }: {
//     status: string;
//     onChange: (newStatus: string) => void;
//   }) => {
//     const { data: categoriesData, isLoading } = useGetCategoriesByGroupQuery('risk_status');

//     const categories = categoriesData?.data?.filter((cat) => cat.isActive);

//     const getStyle = (categoryName: string) => {
//       const category = categories?.find((cat) => cat.name === categoryName);
//       if (!category?.color) return 'bg-gray-100 text-gray-700';
//       const [bgColor, textColor] = category.color.includes(',')
//         ? category.color.split(',')
//         : [category.color, category.color];
//       return `bg-${bgColor} text-${textColor}`;
//     };

//     return (
//       <select
//         className={`risk-detail-status-select ${getStyle(status)}`}
//         value={status}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={isLoading}
//         style={{
//           border: 'none',
//           borderRadius: '6px',
//           padding: '6px 12px',
//           fontWeight: 600,
//           fontSize: '14px',
//           cursor: 'pointer',
//         }}
//       >
//         {isLoading ? (
//           <option value=''>Loading...</option>
//         ) : (
//           categories?.map((category) => (
//             <option key={category.name} value={category.name}>
//               {category.label}
//             </option>
//           ))
//         )}
//       </select>
//     );
//   };

//   const ResponsibleDropdown = ({
//     assignees,
//     selectedId,
//     onChange,
//   }: {
//     assignees: Assignee[];
//     selectedId: number | null;
//     onChange: (id: number | null) => void;
//   }) => {
//     return (
//       <select
//         className='responsible-dropdown p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
//         ref={dropdownRef}
//         value={selectedId?.toString() ?? ''}
//         onChange={(e) => {
//           const selectedValue = e.target.value;
//           onChange(selectedValue === '' ? null : Number(selectedValue));
//         }}
//         style={{
//           padding: '6px 12px',
//           borderRadius: '6px',
//           fontSize: '14px',
//           cursor: 'pointer',
//           backgroundColor: '#f9fafb',
//           border: '1px solid #d1d5db',
//         }}
//       >
//         <option value=''>No Assignee</option>
//         {assignees.map((user) => (
//           <option key={user.id} value={user.id}>
//             {user.fullName || user.userName}
//           </option>
//         ))}
//       </select>
//     );
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !risk) return;

//     try {
//       await uploadRiskFile({
//         riskId: risk.id,
//         fileName: file.name,
//         uploadedBy: accountId,
//         file,
//       }).unwrap();
//       alert(`✅ Uploaded file "${file.name}" successfully!`);
//       setErrorMessage('');
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (err: any) {
//       console.error('Failed to upload file:', err);
//       setErrorMessage(err.data?.message || 'Failed to upload file');
//       alert(`❌ ${err.data?.message || 'Failed to upload file'}`);
//     }
//   };

//   const handleDeleteFile = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this file?')) return;
//     try {
//       await deleteRiskFile({ id: id, createdBy: accountId }).unwrap();
//       alert('✅ File deleted!');
//       setErrorMessage('');
//       refetchAttachments();
//       refetchActivityLogs();
//     } catch (err: any) {
//       console.error('Failed to delete file:', err);
//       setErrorMessage(err.data?.message || 'Failed to delete file');
//       alert(`❌ ${err.data?.message || 'Failed to delete file'}`);
//     }
//   };

//   return (
//     <div className={isPage ? 'risk-page-container' : 'risk-detail-container'}>
//       <div className='risk-detail-panel relative bg-white rounded-lg p-6'>
//         <div className='detail-header border-b-2 flex justify-between items-center mb-6 border-b pb-4'>
//           <div className='detail-title-section space-y-2'>
//             <div className='risk-path text-gray-600 text-sm mb-2'>
//               <div>
//                 {projectKey} /{' '}
//                 <span
//                   className='risk-code font-medium text-blue-600 hover:underline cursor-pointer'
//                   onClick={() =>
//                     navigate(
//                       `/project/${projectKey}/risk/${
//                         editableRisk.riskKey || `R-${editableRisk.id}`
//                       }`
//                     )
//                   }
//                 >
//                   {editableRisk.riskKey || `R-${editableRisk.id}`}
//                 </span>
//               </div>
//               <div className='reporter-meta-block flex items-center gap-2 mt-2'>
//                 <div className='reporter-icons flex items-center gap-2'>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <MessageSquare size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{commentCount}</span>
//                   </div>
//                   <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
//                     <Paperclip size={16} className='text-gray-600' />
//                     <span className='text-gray-700'>{attachmentCount}</span>
//                   </div>
//                 </div>
//                 <div
//                   className='reporter-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm bg-gray-200'
//                   title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'System'}
//                 >
//                   {editableRisk.creatorPicture ? (
//                     <img
//                       src={editableRisk.creatorPicture}
//                       alt='reporter avatar'
//                       className='w-full h-full object-cover'
//                     />
//                   ) : (
//                     <div className='avatar-placeholder bg-gray-300 text-white flex items-center justify-center w-full h-full'>
//                       ⚙️
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className='title-and-status flex items-center gap-4 relative'>
//               <div className='title-input-container w-full'>
//                 <input
//                   className='editable-title-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold'
//                   value={editableRisk.title}
//                   onChange={(e) => handleChange('title', e.target.value)}
//                   onBlur={async (e) => {
//                     const newTitle = e.target.value.trim();
//                     if (!newTitle) {
//                       setErrorMessage('Risk title is required');
//                       setEditableRisk((prev) => ({ ...prev, title: risk.title }));
//                     } else if (newTitle.length > maxTitleLength) {
//                       setErrorMessage(
//                         `Title exceeds maximum length of ${maxTitleLength} characters`
//                       );
//                       setEditableRisk((prev) => ({ ...prev, title: risk.title }));
//                     } else if (newTitle !== risk.title) {
//                       try {
//                         await updateRiskTitle({
//                           id: editableRisk.id,
//                           title: newTitle,
//                           createdBy: accountId,
//                         }).unwrap();
//                         setErrorMessage('');
//                         refetchActivityLogs();
//                       } catch (err: any) {
//                         console.error('Failed to update title:', err);
//                         setErrorMessage(err.data?.message || 'Failed to update title');
//                       }
//                     }
//                   }}
//                   placeholder='Enter risk title'
//                 />
//                 {errorMessage && errorMessage.toLowerCase().includes('title') && (
//                   <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                 )}
//               </div>
//               <RiskStatusDropdown
//                 status={editableRisk.status || 'OPEN'}
//                 onChange={async (newStatus) => {
//                   try {
//                     await updateRiskStatus({
//                       id: editableRisk.id,
//                       status: newStatus,
//                       createdBy: accountId,
//                     }).unwrap();
//                     handleChange('status', newStatus);
//                     setErrorMessage('');
//                     refetchActivityLogs();
//                   } catch (err: any) {
//                     console.error('Failed to update status:', err);
//                     setErrorMessage(err.data?.message || 'Failed to update status');
//                   }
//                 }}
//               />
//             </div>
//             <div className='meta-inline flex items-center gap-2 mt-2 text-sm text-gray-500'>
//               <span className='meta-item'>Risk</span>
//               <span className='meta-separator'>·</span>
//               <span className='meta-item with-icon flex items-center gap-1 relative'>
//                 <CalendarDays size={16} />
//                 <input
//                   type='date'
//                   value={editableRisk.dueDate?.split('T')[0] || ''}
//                   onChange={(e) => {
//                     const newDate = e.target.value + 'T00:00:00Z';
//                     handleChange('dueDate', newDate);
//                   }}
//                   onBlur={async (e) => {
//                     const newDate = e.target.value + 'T00:00:00Z';
//                     const validationError = validateDueDate(newDate);
//                     if (validationError) {
//                       setErrorMessage(validationError);
//                       setEditableRisk((prev) => ({ ...prev, dueDate: risk.dueDate }));
//                       return;
//                     }
//                     if (newDate !== risk.dueDate) {
//                       try {
//                         await updateRiskDueDate({
//                           id: editableRisk.id,
//                           dueDate: newDate,
//                           createdBy: accountId,
//                         }).unwrap();
//                         setErrorMessage('');
//                         refetchActivityLogs();
//                       } catch (err: any) {
//                         console.error('Failed to update due date:', err);
//                         setErrorMessage(err.data?.message || 'Failed to update due date');
//                       }
//                     }
//                   }}
//                   className='due-date-input p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
//                 />
//               </span>
//               <span className='meta-separator'>·</span>
//               <div className='meta-value responsible-info flex items-center gap-2 cursor-pointer relative'>
//                 {editableRisk.responsibleId ? (
//                   <>
//                     {renderAvatar()}
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={editableRisk.responsibleId ?? null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();
//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                           setErrorMessage('');
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           console.error('Failed to update responsible:', err);
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                     {errorMessage && errorMessage.includes('responsible user') && (
//                       <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <div
//                       className='unassigned-avatar flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'
//                       onClick={() => setShowResponsibleDropdown(true)}
//                     >
//                       <UserPlus size={14} className='text-gray-600' />
//                     </div>
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();
//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                           setShowResponsibleDropdown(false);
//                           setErrorMessage('');
//                           refetchActivityLogs();
//                         } catch (err: any) {
//                           console.error('Failed to update responsible:', err);
//                           setErrorMessage(err.data?.message || 'Failed to update responsible user');
//                         }
//                       }}
//                     />
//                     {errorMessage && errorMessage.includes('responsible user') && (
//                       <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//             {errorMessage && errorMessage.toLowerCase().includes('due date') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>
//           <button
//             className='close-btn absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition'
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>DESCRIPTION</div>
//           <textarea
//             value={editableRisk.description || ''}
//             onChange={async (e) => {
//               const newDescription = e.target.value;
//               try {
//                 await updateRiskDescription({
//                   id: editableRisk.id,
//                   description: newDescription,
//                   createdBy: accountId,
//                 }).unwrap();
//                 setEditableRisk((prev) => ({ ...prev, description: newDescription }));
//                 setErrorMessage('');
//                 refetchActivityLogs();
//               } catch (err: any) {
//                 console.error('Failed to update description:', err);
//                 setErrorMessage(err.data?.message || 'Failed to update description');
//               }
//             }}
//             rows={4}
//             className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//           {errorMessage && errorMessage.includes('description') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             CONTINGENCY PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {contingencyList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexContingency === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextContingency}
//                     onBlur={() => handleContingencyChange(item.id, editedTextContingency, index)}
//                     onChange={(e) => setEditedTextContingency(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleContingencyChange(item.id, editedTextContingency, index);
//                       if (e.key === 'Escape') setEditIndexContingency(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexContingency(index);
//                       setEditedTextContingency(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteContingencyPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = contingencyList.filter((_, i) => i !== index);
//                       setContingencyList(updated);
//                       setErrorMessage('');
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (err: any) {
//                       console.error('Failed to delete contingency plan:', err);
//                       setErrorMessage(err.data?.message || 'Failed to delete contingency plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Contingency Plan'
//                 value={newContingency}
//                 onChange={(e) => setNewContingency(e.target.value)}
//                 onKeyDown={handleAddContingency}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//               {errorMessage && errorMessage.includes('contingency plan') && (
//                 <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//               )}
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
//             MITIGATION PLAN
//           </div>
//           <ul className='todo-list space-y-2'>
//             {mitigationList.map((item, index) => (
//               <li key={index} className='todo-item flex items-center gap-2'>
//                 <span className='todo-index text-gray-500'>{index + 1}.</span>
//                 {editIndexMitigation === index ? (
//                   <input
//                     className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                     value={editedTextMitigation}
//                     onBlur={() => handleMitigationChange(item.id, editedTextMitigation, index)}
//                     onChange={(e) => setEditedTextMitigation(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter')
//                         handleMitigationChange(item.id, editedTextMitigation, index);
//                       if (e.key === 'Escape') setEditIndexMitigation(-1);
//                     }}
//                   />
//                 ) : (
//                   <span
//                     className='cursor-pointer text-gray-700 hover:text-blue-600'
//                     onClick={() => {
//                       setEditIndexMitigation(index);
//                       setEditedTextMitigation(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}
//                 <button
//                   className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
//                   onClick={async () => {
//                     try {
//                       await deleteMitigationPlan({ id: item.id, createdBy: accountId }).unwrap();
//                       const updated = mitigationList.filter((_, i) => i !== index);
//                       setMitigationList(updated);
//                       setErrorMessage('');
//                       refetch();
//                       refetchActivityLogs();
//                     } catch (err: any) {
//                       console.error('Failed to delete mitigation plan:', err);
//                       setErrorMessage(err.data?.message || 'Failed to delete mitigation plan');
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}
//             <li className='todo-item flex items-center gap-2 new'>
//               <input
//                 type='text'
//                 placeholder='Add Mitigation Plan'
//                 value={newMitigation}
//                 onChange={(e) => setNewMitigation(e.target.value)}
//                 onKeyDown={handleAddMitigation}
//                 className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//               />
//               {errorMessage && errorMessage.includes('mitigation plan') && (
//                 <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//               )}
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section triple-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>IMPACT</div>
//             <ul className='radio-button-list space-y-2'>
//               {isImpactLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 impactCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.impactLevel === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='impact'
//                         value={category.name}
//                         checked={editableRisk.impactLevel === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskImpactLevel({
//                               id: editableRisk.id,
//                               impactLevel: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('impactLevel', category.name);
//                             setErrorMessage('');
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update impact level:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update impact level');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//             {errorMessage && errorMessage.includes('impact level') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>

//           <div className='impactLikelihoodWrapper space-y-2'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LIKELIHOOD</div>
//             <ul className='radio-button-list space-y-2'>
//               {isProbabilityLoading ? (
//                 <li>Loading...</li>
//               ) : (
//                 probabilityCategories?.map((category) => (
//                   <li key={category.name}>
//                     <label
//                       className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
//                         editableRisk.probability === category.name
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'text-gray-700'
//                       }`}
//                     >
//                       <input
//                         type='radio'
//                         name='probability'
//                         value={category.name}
//                         checked={editableRisk.probability === category.name}
//                         onChange={async () => {
//                           try {
//                             await updateRiskProbability({
//                               id: editableRisk.id,
//                               probability: category.name,
//                               createdBy: accountId,
//                             }).unwrap();
//                             handleChange('probability', category.name);
//                             setErrorMessage('');
//                             refetchActivityLogs();
//                           } catch (err: any) {
//                             console.error('Failed to update probability:', err);
//                             setErrorMessage(err.data?.message || 'Failed to update probability');
//                           }
//                         }}
//                         className='w-4 h-4 text-blue-600 focus:ring-blue-500'
//                       />
//                       <span className='radio-value text-sm'>{category.label}</span>
//                     </label>
//                   </li>
//                 ))
//               )}
//             </ul>
//             {errorMessage && errorMessage.includes('probability') && (
//               <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//             )}
//           </div>

//           <div className='levelWrapper'>
//             <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LEVEL</div>
//             <div
//               className={`semi-gauge w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold ${getSeverityColor(
//                 editableRisk.severityLevel
//               )}`}
//             >
//               {editableRisk.severityLevel
//                 ? editableRisk.severityLevel.charAt(0).toUpperCase() +
//                   editableRisk.severityLevel.slice(1).toLowerCase()
//                 : 'Unknown'}
//             </div>
//           </div>
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>Attachments</div>
//           {Array.isArray(attachments) && attachments.length > 0 ? (
//             <div className='attachments-section mt-2'>
//               <div className='attachments-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//                 {attachments.map((file) => (
//                   <div
//                     className='attachment-card relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition'
//                     key={file.id}
//                     onMouseEnter={() => setHoveredFileId(file.id)}
//                     onMouseLeave={() => setHoveredFileId(null)}
//                   >
//                     <a
//                       href={file.fileUrl}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       className='block'
//                     >
//                       <div className='thumbnail w-full h-32 overflow-hidden rounded-md'>
//                         {file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img
//                             src={file.fileUrl}
//                             alt={file.fileName}
//                             className='w-full h-full object-cover'
//                           />
//                         ) : (
//                           <div className='doc-thumbnail flex items-center justify-center w-full h-32 overflow-hidden rounded-md bg-gray-100'>
//                             <span className='doc-text text-gray-700'>
//                               {file.fileName?.length > 15
//                                 ? file.fileName.slice(0, 15) + '...'
//                                 : file.fileName}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <div className='file-meta mt-2 text-sm text-gray-600'>
//                         <div className='file-name font-medium' title={file.fileName}>
//                           {file.fileName}
//                         </div>
//                         <div className='file-date'>
//                           {new Date(file.uploadedAt).toLocaleString('vi-VN', { hour12: false })}
//                         </div>
//                       </div>
//                     </a>
//                     {hoveredFileId === file.id && (
//                       <button
//                         onClick={() => handleDeleteFile(file.id)}
//                         className='delete-file-btn absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition'
//                         title='Delete file'
//                       >
//                         <Trash2 size={20} className='text-white' />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <div
//                   className='upload-box bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer'
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <div className='plus-icon text-3xl text-gray-500'>＋</div>
//                   <div className='upload-text text-center text-gray-600 text-sm'>
//                     Drag and
//                     <br />
//                     drop or
//                     <br />
//                     <span className='upload-browse text-blue-500'>browse</span>
//                   </div>
//                 </div>
//                 <input
//                   type='file'
//                   ref={fileInputRef}
//                   style={{ display: 'none' }}
//                   onChange={handleFileUpload}
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className='attachment-upload flex justify-center'>
//               <div
//                 className='upload-box bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer w-full max-w-xs'
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <div className='plus-icon text-4xl text-gray-500'>＋</div>
//                 <div className='upload-text text-center text-gray-600 text-sm'>
//                   Drag and
//                   <br />
//                   drop or
//                   <br />
//                   <span className='upload-browse text-blue-500'>browse</span>
//                 </div>
//               </div>
//               <input
//                 type='file'
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileUpload}
//               />
//             </div>
//           )}
//           {errorMessage && errorMessage.includes('file') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>

//         <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
//           <div className='section-label text-lg font-semibold text-gray-800 mb-2'>ACTIVITY LOG</div>
//           <div className='activity-log-list space-y-4 max-h-80 overflow-y-auto'>
//             {isActivityLogsLoading ? (
//               <p className='activity-log-loading text-gray-500 italic'>Loading activity logs...</p>
//             ) : activityLogs.length === 0 ? (
//               <p className='activity-log-empty text-gray-500 italic'>No activity logs available.</p>
//             ) : (
//               activityLogs.map((log) => (
//                 <div key={log.id} className='activity-log-item bg-white p-3 rounded-lg shadow'>
//                   <div className='activity-log-header flex justify-between items-center text-sm'>
//                     <span className='activity-log-user font-semibold text-gray-800'>
//                       {log.createdByName || `User #${log.createdBy}`}
//                     </span>
//                     <span className='activity-log-time text-gray-500'>
//                       {new Date(log.createdAt).toLocaleString('vi-VN', { hour12: false })}
//                     </span>
//                   </div>
//                   <div className='activity-log-message mt-1 text-gray-700'>{log.message}</div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       <div className='risk-comments-panel mt-6 p-4 bg-gray-50 rounded-lg shadow-md'>
//         <div className='comments-header text-lg font-semibold text-gray-800 mb-4 border-b pb-2'>
//           COMMENTS
//         </div>
//         <div className='comments-body'>
//           <div className='comment-list space-y-4'>
//             {isCommentsLoading ? (
//               <p className='text-gray-500 italic'>Loading comments...</p>
//             ) : comments.length === 0 ? (
//               <p className='text-gray-500 italic'>No comments yet.</p>
//             ) : (
//               comments
//                 .slice()
//                 .reverse()
//                 .map((comment) => (
//                   <div
//                     key={comment.id}
//                     className='simple-comment flex gap-3 bg-white p-3 rounded-lg shadow'
//                   >
//                     <div className='avatar-circle w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'>
//                       <img
//                         src={comment.accountPicture || accountIcon}
//                         alt='avatar'
//                         className='w-full h-full object-cover'
//                       />
//                     </div>
//                     <div className='comment-content flex-1'>
//                       <div className='comment-header flex justify-between items-center text-sm'>
//                         <strong className='text-gray-800'>
//                           {comment.accountFullname ||
//                             comment.accountUsername ||
//                             `User #${comment.accountId}`}
//                         </strong>
//                         <span className='text-gray-500 text-xs'>
//                           {new Date(comment.createdAt).toLocaleString('vi-VN')}
//                         </span>
//                       </div>
//                       <div className='comment-text mt-1 text-gray-700'>
//                         {editingCommentId === comment.id ? (
//                           <>
//                             <input
//                               type='text'
//                               value={editedContent}
//                               onChange={(e) => setEditedContent(e.target.value)}
//                               className='border border-gray-300 rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//                             />
//                             <div className='flex gap-2'>
//                               <button
//                                 className='text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-100 transition'
//                                 onClick={async () => {
//                                   try {
//                                     await updateRiskComment({
//                                       id: comment.id,
//                                       riskId: risk.id,
//                                       accountId,
//                                       comment: editedContent,
//                                     }).unwrap();
//                                     setEditingCommentId(null);
//                                     setEditedContent('');
//                                     setErrorMessage('');
//                                     await refetchComments();
//                                     await refetchActivityLogs();
//                                   } catch (err: any) {
//                                     console.error('Failed to update comment:', err);
//                                     setErrorMessage(
//                                       err.data?.message || 'Failed to update comment'
//                                     );
//                                   }
//                                 }}
//                               >
//                                 ✅ Save
//                               </button>
//                               <button
//                                 className='text-red-500 font-semibold px-2 py-1 rounded hover:bg-red-100 transition'
//                                 onClick={() => {
//                                   setEditingCommentId(null);
//                                   setEditedContent('');
//                                   setErrorMessage('');
//                                 }}
//                               >
//                                 ❌ Cancel
//                               </button>
//                             </div>
//                           </>
//                         ) : (
//                           comment.comment
//                         )}
//                       </div>
//                       {comment.accountId === accountId && (
//                         <div className='comment-actions flex gap-2 mt-2'>
//                           <button
//                             className='edit-btn text-blue-600 hover:text-blue-800 transition'
//                             onClick={() => {
//                               setEditingCommentId(comment.id);
//                               setEditedContent(comment.comment);
//                             }}
//                           >
//                             ✏ Edit
//                           </button>
//                           <button
//                             className='delete-btn text-red-500 hover:text-red-700 transition'
//                             onClick={async () => {
//                               if (
//                                 window.confirm('🗑️ Are you sure you want to delete this comment?')
//                               ) {
//                                 try {
//                                   await deleteRiskComment({
//                                     id: comment.id,
//                                     createdBy: accountId,
//                                   }).unwrap();
//                                   setErrorMessage('');
//                                   await refetchComments();
//                                   await refetchActivityLogs();
//                                 } catch (err: any) {
//                                   console.error('Failed to delete comment:', err);
//                                   setErrorMessage(err.data?.message || 'Failed to delete comment');
//                                 }
//                               }
//                             }}
//                           >
//                             🗑 Delete
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>
//         <div className='comment-input mt-4 relative w-full'>
//           <input
//             type='text'
//             placeholder='Add a comment'
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
//           />
//           {newComment.trim() && (
//             <button
//               className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition'
//               onClick={async () => {
//                 try {
//                   await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
//                   setNewComment('');
//                   setErrorMessage('');
//                   await refetchComments();
//                   await refetchActivityLogs();
//                 } catch (err: any) {
//                   console.error('Failed to send comment:', err);
//                   setErrorMessage(err.data?.message || 'Failed to send comment');
//                 }
//               }}
//             >
//               <SendHorizontal size={20} />
//             </button>
//           )}
//           {errorMessage && errorMessage.includes('comment') && (
//             <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiskDetail;

import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './RiskDetail.css';
import {
  MessageSquare,
  Paperclip,
  CalendarDays,
  UserPlus,
  Trash2,
  SendHorizontal,
} from 'lucide-react';
import {
  useUpdateRiskTitleMutation,
  useUpdateRiskStatusMutation,
  useUpdateRiskResponsibleMutation,
  useUpdateRiskDueDateMutation,
  useUpdateRiskDescriptionMutation,
  useUpdateRiskImpactLevelMutation,
  useUpdateRiskProbabilityMutation,
} from '../../../services/riskApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import {
  useGetRiskSolutionByRiskIdQuery,
  useCreateRiskSolutionMutation,
  useUpdateRiskMitigationPlanMutation,
  useUpdateRiskContigencyPlanMutation,
  useDeleteRiskSolutionMutation,
  useDeleteRiskMitigationPlanMutation,
  useDeleteRiskContingencyPlanMutation,
} from '../../../services/riskSolutionApi';
import {
  useGetRiskFilesByRiskIdQuery,
  useUploadRiskFileMutation,
  useDeleteRiskFileMutation,
} from '../../../services/riskFileApi';
import {
  useGetCommentsByRiskIdQuery,
  useCreateRiskCommentMutation,
  useUpdateRiskCommentMutation,
  useDeleteRiskCommentMutation,
} from '../../../services/riskCommentApi';
import deleteIcon from '../../../assets/delete.png';
import accountIcon from '../../../assets/account.png';
import { useParams } from 'react-router-dom';
import { useGetActivityLogsByRiskKeyQuery } from '../../../services/activityLogApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
import Swal from 'sweetalert2';

// export interface Risk {
//   id: number;
//   riskKey: string;
//   title: string;
//   description?: string;
//   impactLevel?: string;
//   probability?: string;
//   severityLevel?: string;
//   status?: string;
//   type?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   dueDate?: string;
//   responsibleId?: number | null;
//   responsibleFullName?: string;
//   responsibleUserName?: string;
//   responsiblePicture?: string;
//   creatorFullName?: string;
//   creatorUserName?: string;
//   creatorPicture?: string;
//   resolution?: string;
// }

export interface Risk {
  id: number;
  riskKey: string;
  title: string;
  description?: string;
  impactLevel?: string;
  probability?: string;
  severityLevel?: string;
  status?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  responsibleId?: number | null;
  responsibleFullName?: string | null; // Updated to match RiskItem
  responsibleUserName?: string | null; // Updated to match RiskItem
  responsiblePicture?: string | null; // Updated to match RiskItem
  creatorFullName?: string | null; // Updated to match RiskItem
  creatorUserName?: string | null; // Updated to match RiskItem
  creatorPicture?: string | null; // Updated to match RiskItem
  resolution?: string;
  // Additional fields from RiskItem that might be relevant
  projectId?: number; // Added from RiskItem
  taskId?: string | null; // Added from RiskItem
  taskTitle?: string | null; // Added from RiskItem
  riskScope?: string; // Added from RiskItem
  createdBy?: number; // Added from RiskItem
  generatedBy?: string; // Added from RiskItem
  isApproved?: boolean; // Added from RiskItem
}

interface RiskDetailProps {
  risk: Risk;
  onClose: () => void;
  isPage?: boolean;
}

function getSeverityColor(level?: string) {
  switch (level) {
    case 'LOW':
      return 'bg-green-500';
    case 'MEDIUM':
      return 'bg-yellow-500';
    case 'HIGH':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function calculateSeverityLevel(impactLevel?: string, probability?: string): string {
  const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const i = levels[impactLevel as keyof typeof levels] || 0;
  const p = levels[probability as keyof typeof levels] || 0;
  const score = i * p;
  if (score >= 6) return 'HIGH';
  if (score >= 3) return 'MEDIUM';
  return 'LOW';
}

type Assignee = {
  id: number;
  fullName: string | null;
  userName: string;
  picture?: string | null;
};

const RiskDetail: React.FC<RiskDetailProps> = ({
  risk,
  onClose,
  isPage,
}) => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
  const [searchParams] = useSearchParams();
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const { data: projectData, isLoading: isProjectLoading } =
    useGetProjectDetailsByKeyQuery(projectKey);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: configData, isLoading: isConfigLoading } =
    useGetByConfigKeyQuery('risk_title_length');
  const maxTitleLength = configData?.data?.maxValue ? parseInt(configData.data.maxValue) : 200;

  const { data: riskSolutionRes, isLoading, refetch } = useGetRiskSolutionByRiskIdQuery(risk.id);
  const { data: attachments = [], refetch: refetchAttachments } = useGetRiskFilesByRiskIdQuery(
    risk.id
  );
  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetCommentsByRiskIdQuery(risk.id);

  const {
    data: activityLogs = [],
    isLoading: isActivityLogsLoading,
    refetch: refetchActivityLogs,
  } = useGetActivityLogsByRiskKeyQuery(risk.riskKey, {
    skip: !risk.riskKey,
  });

  const { data: impactCategoriesData, isLoading: isImpactLoading } =
    useGetCategoriesByGroupQuery('risk_impact_level');

  const impactCategories = impactCategoriesData?.data?.filter((cat) => cat.isActive);

  const { data: probabilityCategoriesData, isLoading: isProbabilityLoading } =
    useGetCategoriesByGroupQuery('risk_probability_level');

  const probabilityCategories = probabilityCategoriesData?.data?.filter((cat) => cat.isActive);

  useEffect(() => {
    setEditableRisk({
      ...risk,
      impactLevel: risk.impactLevel?.toUpperCase(),
      probability: risk.probability?.toUpperCase(),
      severityLevel: calculateSeverityLevel(
        risk.impactLevel?.toUpperCase(),
        risk.probability?.toUpperCase()
      ),
    });
  }, [risk]);

  useEffect(() => {
    setEditableRisk((prev) => ({
      ...prev,
      severityLevel: calculateSeverityLevel(prev.impactLevel, prev.probability),
    }));
  }, [editableRisk.impactLevel, editableRisk.probability]);

  useEffect(() => {
    refetchActivityLogs();
  }, [refetchActivityLogs]);

  const projectId = projectData?.data?.id;
  const skipMembers = !projectId;

  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
    skip: skipMembers,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLSelectElement | null>(null);

  const assignees =
    membersData?.data?.map((m) => ({
      id: m.accountId,
      fullName: m.fullName,
      userName: m.username,
      picture: m.picture,
    })) || [];

  const attachmentCount = attachments?.length ?? 0;
  const commentCount = comments?.length ?? 0;

  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

  const [updateRiskTitle] = useUpdateRiskTitleMutation();
  const [updateRiskStatus] = useUpdateRiskStatusMutation();
  const [updateResponsible] = useUpdateRiskResponsibleMutation();
  const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
  const [updateRiskDescription] = useUpdateRiskDescriptionMutation();
  const [updateRiskImpactLevel] = useUpdateRiskImpactLevelMutation();
  const [updateRiskProbability] = useUpdateRiskProbabilityMutation();
  const [createRiskSolution] = useCreateRiskSolutionMutation();
  const [updateMitigation] = useUpdateRiskMitigationPlanMutation();
  const [updateContingency] = useUpdateRiskContigencyPlanMutation();
  const [deleteRiskSolution] = useDeleteRiskSolutionMutation();
  const [deleteMitigationPlan] = useDeleteRiskMitigationPlanMutation();
  const [deleteContingencyPlan] = useDeleteRiskContingencyPlanMutation();
  const [uploadRiskFile] = useUploadRiskFileMutation();
  const [deleteRiskFile] = useDeleteRiskFileMutation();
  const [updateRiskComment] = useUpdateRiskCommentMutation();
  const [deleteRiskComment] = useDeleteRiskCommentMutation();
  const [createComment] = useCreateRiskCommentMutation();

  const [contingencyList, setContingencyList] = useState<{ id: number; text: string }[]>([]);
  const [mitigationList, setMitigationList] = useState<{ id: number; text: string }[]>([]);
  const [newContingency, setNewContingency] = useState('');
  const [newMitigation, setNewMitigation] = useState('');

  const [editIndexContingency, setEditIndexContingency] = useState<number>(-1);
  const [editedTextContingency, setEditedTextContingency] = useState<string>('');
  const [editIndexMitigation, setEditIndexMitigation] = useState<number>(-1);
  const [editedTextMitigation, setEditedTextMitigation] = useState<string>('');

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);

  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (riskSolutionRes?.isSuccess && riskSolutionRes.data) {
      const dataArray = Array.isArray(riskSolutionRes.data)
        ? riskSolutionRes.data
        : [riskSolutionRes.data];

      const allContingencyItems = dataArray.flatMap((solution) =>
        solution.contingencyPlan
          ? solution.contingencyPlan
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line !== '')
              .map((line) => ({
                id: solution.id,
                text: line,
              }))
          : []
      );

      const allMitigationItems = dataArray.flatMap((solution) =>
        solution.mitigationPlan
          ? solution.mitigationPlan
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line !== '')
              .map((line) => ({
                id: solution.id,
                text: line,
              }))
          : []
      );

      setContingencyList(allContingencyItems);
      setMitigationList(allMitigationItems);
    }
  }, [riskSolutionRes]);

  useEffect(() => {
    if (showResponsibleDropdown && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [showResponsibleDropdown]);

  const handleContingencyChange = async (id: number, newText: string, index: number) => {
    try {
      if (newText.trim() === '') {
        setErrorMessage('Contingency plan cannot be empty');
        return;
      }
      await updateContingency({ id, contigencyPlan: newText, createdBy: accountId }).unwrap();
      const updated = [...contingencyList];
      updated[index].text = newText;
      setContingencyList(updated);
      setEditIndexContingency(-1);
      setErrorMessage('');
      refetch();
      refetchActivityLogs();
    } catch (err: any) {
      console.error('Failed to update contingency plan:', err);
      setErrorMessage(err.data?.message || 'Failed to update contingency plan');
    }
  };

  const handleMitigationChange = async (id: number, newText: string, index: number) => {
    try {
      if (newText.trim() === '') {
        setErrorMessage('Mitigation plan cannot be empty');
        return;
      }
      await updateMitigation({ id, mitigationPlan: newText, createdBy: accountId }).unwrap();
      const updated = [...mitigationList];
      updated[index].text = newText;
      setMitigationList(updated);
      setEditIndexMitigation(-1);
      setErrorMessage('');
      refetch();
      refetchActivityLogs();
    } catch (err: any) {
      console.error('Failed to update mitigation plan:', err);
      setErrorMessage(err.data?.message || 'Failed to update mitigation plan');
    }
  };

  const handleAddContingency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newContingency.trim() !== '') {
      try {
        const res = await createRiskSolution({
          riskId: risk.id,
          contingencyPlan: newContingency.trim(),
          mitigationPlan: null,
          createdBy: accountId,
        }).unwrap();
        if (res?.data) {
          const newItem = {
            id: res.data.id,
            text: res.data.contingencyPlan ?? '',
          };
          setContingencyList((prev) => [...prev, newItem]);
          setNewContingency('');
          setErrorMessage('');
          refetch();
          refetchActivityLogs();
        }
      } catch (err: any) {
        console.error('Failed to add contingency plan:', err);
        setErrorMessage(err.data?.message || 'Failed to add contingency plan');
      }
    }
  };

  const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMitigation.trim() !== '') {
      try {
        const res = await createRiskSolution({
          riskId: risk.id,
          contingencyPlan: null,
          mitigationPlan: newMitigation.trim(),
          createdBy: accountId,
        }).unwrap();
        if (res?.data) {
          const newItem = {
            id: res.data.id,
            text: res.data.mitigationPlan ?? '',
          };
          setMitigationList((prev) => [...prev, newItem]);
          setNewMitigation('');
          setErrorMessage('');
          refetch();
          refetchActivityLogs();
        }
      } catch (err: any) {
        console.error('Failed to add mitigation plan:', err);
        setErrorMessage(err.data?.message || 'Failed to add mitigation plan');
      }
    }
  };

  const validateDueDate = (newDate: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const selectedDate = new Date(newDate);
    const projectEndDate = projectData?.data?.endDate ? new Date(projectData.data.endDate) : null;

    if (selectedDate < today) {
      return 'Due date cannot be in the past';
    }
    if (projectEndDate && selectedDate > projectEndDate) {
      return 'Due date cannot be later than project end date';
    }
    return null;
  };

  const renderAvatar = () => {
    if (editableRisk.responsiblePicture) {
      return (
        <img
          src={editableRisk.responsiblePicture}
          alt='avatar'
          className='responsible-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'
        />
      );
    }
    const initials =
      editableRisk.responsibleFullName
        ?.split(' ')
        .map((n) => n[0])
        .join('') ||
      editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
      '?';
    return <div className='responsible-avatar-placeholder bg-gray-300 text-white'>{initials}</div>;
  };

  const RiskStatusDropdown = ({
    status,
    onChange,
  }: {
    status: string;
    onChange: (newStatus: string) => void;
  }) => {
    const { data: categoriesData, isLoading } = useGetCategoriesByGroupQuery('risk_status');

    const categories = categoriesData?.data?.filter((cat) => cat.isActive);

    const getStyle = (categoryName: string) => {
      const category = categories?.find((cat) => cat.name === categoryName);
      if (!category?.color) return 'bg-gray-100 text-gray-700';
      const [bgColor, textColor] = category.color.includes(',')
        ? category.color.split(',')
        : [category.color, category.color];
      return `bg-${bgColor} text-${textColor}`;
    };

    return (
      <select
        className={`risk-detail-status-select ${getStyle(status)}`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        style={{
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {isLoading ? (
          <option value=''>Loading...</option>
        ) : (
          categories?.map((category) => (
            <option key={category.name} value={category.name}>
              {category.label}
            </option>
          ))
        )}
      </select>
    );
  };

  const ResponsibleDropdown = ({
    assignees,
    selectedId,
    onChange,
  }: {
    assignees: Assignee[];
    selectedId: number | null;
    onChange: (id: number | null) => void;
  }) => {
    return (
      <select
        className='responsible-dropdown p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
        ref={dropdownRef}
        value={selectedId?.toString() ?? ''}
        onChange={(e) => {
          const selectedValue = e.target.value;
          onChange(selectedValue === '' ? null : Number(selectedValue));
        }}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#f9fafb',
          border: '1px solid #d1d5db',
        }}
      >
        <option value=''>No Assignee</option>
        {assignees.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName || user.userName}
          </option>
        ))}
      </select>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !risk) return;

    try {
      await uploadRiskFile({
        riskId: risk.id,
        fileName: file.name,
        uploadedBy: accountId,
        file,
      }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'File Uploaded',
        text: `File "${file.name}" uploaded successfully!`,
        width: '500px',
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      setErrorMessage('');
      refetchAttachments();
      refetchActivityLogs();
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Upload File',
        text: err.data?.message || 'Failed to upload file',
        width: '500px',
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      setErrorMessage(err.data?.message || 'Failed to upload file');
    }
  };

  const handleDeleteFile = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgba(44, 104, 194, 1)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        title: 'small-title',
        popup: 'small-popup',
        icon: 'small-icon',
        htmlContainer: 'small-html',
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteRiskFile({ id: id, createdBy: accountId }).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'File Deleted',
          text: 'File deleted successfully!',
          width: '500px',
          confirmButtonColor: 'rgba(44, 104, 194, 1)',
          customClass: {
            title: 'small-title',
            popup: 'small-popup',
            icon: 'small-icon',
            htmlContainer: 'small-html',
          },
        });
        setErrorMessage('');
        refetchAttachments();
        refetchActivityLogs();
      } catch (err: any) {
        console.error('Failed to delete file:', err);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Delete File',
          text: err.data?.message || 'Failed to delete file',
          width: '500px',
          confirmButtonColor: 'rgba(44, 104, 194, 1)',
          customClass: {
            title: 'small-title',
            popup: 'small-popup',
            icon: 'small-icon',
            htmlContainer: 'small-html',
          },
        });
        setErrorMessage(err.data?.message || 'Failed to delete file');
      }
    }
  };

  const handleChange = (field: keyof Risk, value: any) => {
    setEditableRisk((prev) => ({ ...prev, [field]: value }));
    if (field === 'title') {
      if (value.length > maxTitleLength) {
        setErrorMessage(`Title exceeds maximum length of ${maxTitleLength} characters`);
      } else {
        setErrorMessage('');
      }
    } else if (field === 'dueDate') {
      const validationError = validateDueDate(value);
      setErrorMessage(validationError || '');
    }
  };

  return (
    <div className={isPage ? 'risk-page-container' : 'risk-detail-container'}>
      <div className='risk-detail-panel relative bg-white rounded-lg p-6'>
        <div className='detail-header border-b-2 flex justify-between items-center mb-6 border-b pb-4'>
          <div className='detail-title-section space-y-2'>
            <div className='risk-path text-gray-600 text-sm mb-2'>
              <div>
                {projectKey} /{' '}
                <span
                  className='risk-code font-medium text-blue-600 hover:underline cursor-pointer'
                  onClick={() =>
                    navigate(
                      `/project/${projectKey}/risk/${
                        editableRisk.riskKey || `R-${editableRisk.id}`
                      }`
                    )
                  }
                >
                  {editableRisk.riskKey || `R-${editableRisk.id}`}
                </span>
              </div>
              <div className='reporter-meta-block flex items-center gap-2 mt-2'>
                <div className='reporter-icons flex items-center gap-2'>
                  <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
                    <MessageSquare size={16} className='text-gray-600' />
                    <span className='text-gray-700'>{commentCount}</span>
                  </div>
                  <div className='icon-with-count flex items-center gap-1 bg-gray-100 p-1 rounded-md'>
                    <Paperclip size={16} className='text-gray-600' />
                    <span className='text-gray-700'>{attachmentCount}</span>
                  </div>
                </div>
                <div
                  className='reporter-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm bg-gray-200'
                  title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'System'}
                >
                  {editableRisk.creatorPicture ? (
                    <img
                      src={editableRisk.creatorPicture}
                      alt='reporter avatar'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='avatar-placeholder bg-gray-300 text-white flex items-center justify-center w-full h-full'>
                      ⚙️
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='title-and-status flex items-center gap-4 relative'>
              <div className='title-input-container w-full'>
                <input
                  className='editable-title-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold'
                  value={editableRisk.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={async (e) => {
                    const newTitle = e.target.value.trim();
                    if (!newTitle) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Invalid Title',
                        text: 'Risk title is required',
                        width: '500px',
                        confirmButtonColor: 'rgba(44, 104, 194, 1)',
                        customClass: {
                          title: 'small-title',
                          popup: 'small-popup',
                          icon: 'small-icon',
                          htmlContainer: 'small-html',
                        },
                      });
                      setEditableRisk((prev) => ({ ...prev, title: risk.title }));
                      setErrorMessage('');
                      return;
                    } else if (newTitle.length > maxTitleLength) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Invalid Title',
                        text: `Title exceeds maximum length of ${maxTitleLength} characters`,
                        width: '500px',
                        confirmButtonColor: 'rgba(44, 104, 194, 1)',
                        customClass: {
                          title: 'small-title',
                          popup: 'small-popup',
                          icon: 'small-icon',
                          htmlContainer: 'small-html',
                        },
                      });
                      setEditableRisk((prev) => ({ ...prev, title: risk.title }));
                      setErrorMessage('');
                      return;
                    } else if (newTitle !== risk.title) {
                      try {
                        await updateRiskTitle({
                          id: editableRisk.id,
                          title: newTitle,
                          createdBy: accountId,
                        }).unwrap();
                        setErrorMessage('');
                        refetchActivityLogs();
                      } catch (err: any) {
                        console.error('Failed to update title:', err);
                        Swal.fire({
                          icon: 'error',
                          title: 'Failed to Update Title',
                          text: err.data?.message || 'Failed to update title',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        setEditableRisk((prev) => ({ ...prev, title: risk.title }));
                        setErrorMessage('');
                      }
                    }
                  }}
                  placeholder='Enter risk title'
                />
                {errorMessage && errorMessage.toLowerCase().includes('title') && (
                  <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
                )}
              </div>
              <RiskStatusDropdown
                status={editableRisk.status || 'OPEN'}
                onChange={async (newStatus) => {
                  try {
                    await updateRiskStatus({
                      id: editableRisk.id,
                      status: newStatus,
                      createdBy: accountId,
                    }).unwrap();
                    handleChange('status', newStatus);
                    setErrorMessage('');
                    refetchActivityLogs();
                  } catch (err: any) {
                    console.error('Failed to update status:', err);
                    Swal.fire({
                      icon: 'error',
                      title: 'Failed to Update Status',
                      text: err.data?.message || 'Failed to update status',
                      width: '500px',
                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                      customClass: {
                        title: 'small-title',
                        popup: 'small-popup',
                        icon: 'small-icon',
                        htmlContainer: 'small-html',
                      },
                    });
                    setErrorMessage('');
                  }
                }}
              />
            </div>
            <div className='meta-inline flex items-center gap-2 mt-2 text-sm text-gray-500'>
              <span className='meta-item'>Risk</span>
              <span className='meta-separator'>·</span>
              <span className='meta-item with-icon flex items-center gap-1 relative'>
                <CalendarDays size={16} />
                <input
                  type='date'
                  value={editableRisk.dueDate?.split('T')[0] || ''}
                  onChange={(e) => {
                    const newDate = e.target.value + 'T00:00:00Z';
                    handleChange('dueDate', newDate);
                  }}
                  onBlur={async (e) => {
                    const newDate = e.target.value + 'T00:00:00Z';
                    const validationError = validateDueDate(newDate);
                    if (validationError) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Invalid Due Date',
                        text: validationError,
                        width: '500px',
                        confirmButtonColor: 'rgba(44, 104, 194, 1)',
                        customClass: {
                          title: 'small-title',
                          popup: 'small-popup',
                          icon: 'small-icon',
                          htmlContainer: 'small-html',
                        },
                      });
                      setEditableRisk((prev) => ({ ...prev, dueDate: risk.dueDate }));
                      setErrorMessage('');
                      return;
                    }
                    if (newDate !== risk.dueDate) {
                      try {
                        await updateRiskDueDate({
                          id: editableRisk.id,
                          dueDate: newDate,
                          createdBy: accountId,
                        }).unwrap();
                        setErrorMessage('');
                        refetchActivityLogs();
                      } catch (err: any) {
                        console.error('Failed to update due date:', err);
                        Swal.fire({
                          icon: 'error',
                          title: 'Failed to Update Due Date',
                          text: err.data?.message || 'Failed to update due date',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        setEditableRisk((prev) => ({ ...prev, dueDate: risk.dueDate }));
                        setErrorMessage('');
                      }
                    }
                  }}
                  className='due-date-input p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </span>
              <span className='meta-separator'>·</span>
              <div className='meta-value responsible-info flex items-center gap-2 cursor-pointer relative'>
                {editableRisk.responsibleId ? (
                  <>
                    {renderAvatar()}
                    <ResponsibleDropdown
                      assignees={assignees}
                      selectedId={editableRisk.responsibleId ?? null}
                      onChange={async (newId) => {
                        try {
                          await updateResponsible({
                            id: editableRisk.id,
                            responsibleId: newId,
                            createdBy: accountId,
                          }).unwrap();
                          const updated = assignees.find((u) => u.id === newId);
                          setEditableRisk((prev) => ({
                            ...prev,
                            responsibleId: newId,
                            responsibleFullName: updated?.fullName || '',
                            responsibleUserName: updated?.userName || '',
                            responsiblePicture: updated?.picture || '',
                          }));
                          setErrorMessage('');
                          refetchActivityLogs();
                        } catch (err: any) {
                          console.error('Failed to update responsible:', err);
                          Swal.fire({
                            icon: 'error',
                            title: 'Failed to Update Responsible',
                            text: err.data?.message || 'Failed to update responsible user',
                            width: '500px',
                            confirmButtonColor: 'rgba(44, 104, 194, 1)',
                            customClass: {
                              title: 'small-title',
                              popup: 'small-popup',
                              icon: 'small-icon',
                              htmlContainer: 'small-html',
                            },
                          });
                          setErrorMessage('');
                        }
                      }}
                    />
                    {/* {errorMessage && errorMessage.includes('responsible user') && (
                      <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
                    )} */}
                  </>
                ) : (
                  <>
                    <div
                      className='unassigned-avatar flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'
                      onClick={() => setShowResponsibleDropdown(true)}
                    >
                      <UserPlus size={14} className='text-gray-600' />
                    </div>
                    <ResponsibleDropdown
                      assignees={assignees}
                      selectedId={null}
                      onChange={async (newId) => {
                        try {
                          await updateResponsible({
                            id: editableRisk.id,
                            responsibleId: newId,
                            createdBy: accountId,
                          }).unwrap();
                          const updated = assignees.find((u) => u.id === newId);
                          setEditableRisk((prev) => ({
                            ...prev,
                            responsibleId: newId,
                            responsibleFullName: updated?.fullName || '',
                            responsibleUserName: updated?.userName || '',
                            responsiblePicture: updated?.picture || '',
                          }));
                          setShowResponsibleDropdown(false);
                          setErrorMessage('');
                          refetchActivityLogs();
                        } catch (err: any) {
                          console.error('Failed to update responsible:', err);
                          Swal.fire({
                            icon: 'error',
                            title: 'Failed to Update Responsible',
                            text: err.data?.message || 'Failed to update responsible user',
                            width: '500px',
                            confirmButtonColor: 'rgba(44, 104, 194, 1)',
                            customClass: {
                              title: 'small-title',
                              popup: 'small-popup',
                              icon: 'small-icon',
                              htmlContainer: 'small-html',
                            },
                          });
                          setErrorMessage('');
                        }
                      }}
                    />
                    {/* {errorMessage && errorMessage.includes('responsible user') && (
                      <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
                    )} */}
                  </>
                )}
              </div>
            </div>
            {/* {errorMessage && errorMessage.toLowerCase().includes('due date') && (
              <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
            )} */}
          </div>
          <button
            className='close-btn absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 transition'
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>DESCRIPTION</div>
          <textarea
            value={editableRisk.description || ''}
            onChange={async (e) => {
              const newDescription = e.target.value;
              try {
                await updateRiskDescription({
                  id: editableRisk.id,
                  description: newDescription,
                  createdBy: accountId,
                }).unwrap();
                setEditableRisk((prev) => ({ ...prev, description: newDescription }));
                setErrorMessage('');
                refetchActivityLogs();
              } catch (err: any) {
                console.error('Failed to update description:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Failed to Update Description',
                  text: err.data?.message || 'Failed to update description',
                  width: '500px',
                  confirmButtonColor: 'rgba(44, 104, 194, 1)',
                  customClass: {
                    title: 'small-title',
                    popup: 'small-popup',
                    icon: 'small-icon',
                    htmlContainer: 'small-html',
                  },
                });
                setErrorMessage('');
              }
            }}
            rows={4}
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
          />
          {errorMessage && errorMessage.includes('description') && (
            <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
          )}
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
            CONTINGENCY PLAN
          </div>
          <ul className='todo-list space-y-2'>
            {contingencyList.map((item, index) => (
              <li key={index} className='todo-item flex items-center gap-2'>
                <span className='todo-index text-gray-500'>{index + 1}.</span>
                {editIndexContingency === index ? (
                  <input
                    className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={editedTextContingency}
                    onBlur={() => handleContingencyChange(item.id, editedTextContingency, index)}
                    onChange={(e) => setEditedTextContingency(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        handleContingencyChange(item.id, editedTextContingency, index);
                      if (e.key === 'Escape') setEditIndexContingency(-1);
                    }}
                  />
                ) : (
                  <span
                    className='cursor-pointer text-gray-700 hover:text-blue-600'
                    onClick={() => {
                      setEditIndexContingency(index);
                      setEditedTextContingency(item.text);
                    }}
                  >
                    {item.text}
                  </span>
                )}
                <button
                  className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: 'Are you sure?',
                      text: 'Do you want to delete this contingency plan?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, delete it!',
                      customClass: {
                        title: 'small-title',
                        popup: 'small-popup',
                        icon: 'small-icon',
                        htmlContainer: 'small-html',
                      },
                    });

                    if (result.isConfirmed) {
                      try {
                        await deleteContingencyPlan({ id: item.id, createdBy: accountId }).unwrap();
                        Swal.fire({
                          icon: 'success',
                          title: 'Contingency Plan Deleted',
                          text: 'Contingency plan deleted successfully!',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        const updated = contingencyList.filter((_, i) => i !== index);
                        setContingencyList(updated);
                        setErrorMessage('');
                        refetch();
                        refetchActivityLogs();
                      } catch (err: any) {
                        console.error('Failed to delete contingency plan:', err);
                        Swal.fire({
                          icon: 'error',
                          title: 'Failed to Delete Contingency Plan',
                          text: err.data?.message || 'Failed to delete contingency plan',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        setErrorMessage('');
                      }
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            <li className='todo-item flex items-center gap-2 new'>
              <input
                type='text'
                placeholder='Add Contingency Plan'
                value={newContingency}
                onChange={(e) => setNewContingency(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newContingency.trim() !== '') {
                    try {
                      const res = await createRiskSolution({
                        riskId: risk.id,
                        contingencyPlan: newContingency.trim(),
                        mitigationPlan: null,
                        createdBy: accountId,
                      }).unwrap();
                      if (res?.data) {
                        Swal.fire({
                          icon: 'success',
                          title: 'Contingency Plan Added',
                          text: 'Contingency plan added successfully!',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        const newItem = {
                          id: res.data.id,
                          text: res.data.contingencyPlan ?? '',
                        };
                        setContingencyList((prev) => [...prev, newItem]);
                        setNewContingency('');
                        setErrorMessage('');
                        refetch();
                        refetchActivityLogs();
                      }
                    } catch (err: any) {
                      console.error('Failed to add contingency plan:', err);
                      Swal.fire({
                        icon: 'error',
                        title: 'Failed to Add Contingency Plan',
                        text: err.data?.message || 'Failed to add contingency plan',
                        width: '500px',
                        confirmButtonColor: 'rgba(44, 104, 194, 1)',
                        customClass: {
                          title: 'small-title',
                          popup: 'small-popup',
                          icon: 'small-icon',
                          htmlContainer: 'small-html',
                        },
                      });
                      setErrorMessage('');
                    }
                  }
                }}
                className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errorMessage && errorMessage.includes('contingency plan') && (
                <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
              )}
            </li>
          </ul>
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>
            MITIGATION PLAN
          </div>
          <ul className='todo-list space-y-2'>
            {mitigationList.map((item, index) => (
              <li key={index} className='todo-item flex items-center gap-2'>
                <span className='todo-index text-gray-500'>{index + 1}.</span>
                {editIndexMitigation === index ? (
                  <input
                    className='edit-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={editedTextMitigation}
                    onBlur={() => handleMitigationChange(item.id, editedTextMitigation, index)}
                    onChange={(e) => setEditedTextMitigation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        handleMitigationChange(item.id, editedTextMitigation, index);
                      if (e.key === 'Escape') setEditIndexMitigation(-1);
                    }}
                  />
                ) : (
                  <span
                    className='cursor-pointer text-gray-700 hover:text-blue-600'
                    onClick={() => {
                      setEditIndexMitigation(index);
                      setEditedTextMitigation(item.text);
                    }}
                  >
                    {item.text}
                  </span>
                )}
                <button
                  className='text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100'
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: 'Are you sure?',
                      text: 'Do you want to delete this mitigation plan?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, delete it!',
                      customClass: {
                        title: 'small-title',
                        popup: 'small-popup',
                        icon: 'small-icon',
                        htmlContainer: 'small-html',
                      },
                    });

                    if (result.isConfirmed) {
                      try {
                        await deleteMitigationPlan({ id: item.id, createdBy: accountId }).unwrap();
                        Swal.fire({
                          icon: 'success',
                          title: 'Mitigation Plan Deleted',
                          text: 'Mitigation plan deleted successfully!',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        const updated = mitigationList.filter((_, i) => i !== index);
                        setMitigationList(updated);
                        setErrorMessage('');
                        refetch();
                        refetchActivityLogs();
                      } catch (err: any) {
                        console.error('Failed to delete mitigation plan:', err);
                        Swal.fire({
                          icon: 'error',
                          title: 'Failed to Delete Mitigation Plan',
                          text: err.data?.message || 'Failed to delete mitigation plan',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        setErrorMessage('');
                      }
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            <li className='todo-item flex items-center gap-2 new'>
              <input
                type='text'
                placeholder='Add Mitigation Plan'
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newMitigation.trim() !== '') {
                    try {
                      const res = await createRiskSolution({
                        riskId: risk.id,
                        contingencyPlan: null,
                        mitigationPlan: newMitigation.trim(),
                        createdBy: accountId,
                      }).unwrap();
                      if (res?.data) {
                        Swal.fire({
                          icon: 'success',
                          title: 'Mitigation Plan Added',
                          text: 'Mitigation plan added successfully!',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        const newItem = {
                          id: res.data.id,
                          text: res.data.mitigationPlan ?? '',
                        };
                        setMitigationList((prev) => [...prev, newItem]);
                        setNewMitigation('');
                        setErrorMessage('');
                        refetch();
                        refetchActivityLogs();
                      }
                    } catch (err: any) {
                      console.error('Failed to add mitigation plan:', err);
                      Swal.fire({
                        icon: 'error',
                        title: 'Failed to Add Mitigation Plan',
                        text: err.data?.message || 'Failed to add mitigation plan',
                        width: '500px',
                        confirmButtonColor: 'rgba(44, 104, 194, 1)',
                        customClass: {
                          title: 'small-title',
                          popup: 'small-popup',
                          icon: 'small-icon',
                          htmlContainer: 'small-html',
                        },
                      });
                      setErrorMessage('');
                    }
                  }
                }}
                className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errorMessage && errorMessage.includes('mitigation plan') && (
                <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
              )}
            </li>
          </ul>
        </div>

        <div className='detail-section triple-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='impactLikelihoodWrapper space-y-2'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>IMPACT</div>
            <ul className='radio-button-list space-y-2'>
              {isImpactLoading ? (
                <li>Loading...</li>
              ) : (
                impactCategories?.map((category) => (
                  <li key={category.name}>
                    <label
                      className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                        editableRisk.impactLevel === category.name
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <input
                        type='radio'
                        name='impact'
                        value={category.name}
                        checked={editableRisk.impactLevel === category.name}
                        onChange={async () => {
                          try {
                            await updateRiskImpactLevel({
                              id: editableRisk.id,
                              impactLevel: category.name,
                              createdBy: accountId,
                            }).unwrap();
                            handleChange('impactLevel', category.name);
                            setErrorMessage('');
                            refetchActivityLogs();
                          } catch (err: any) {
                            console.error('Failed to update impact level:', err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Failed to Update Impact Level',
                              text: err.data?.message || 'Failed to update impact level',
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                            setErrorMessage('');
                          }
                        }}
                        className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='radio-value text-sm'>{category.label}</span>
                    </label>
                  </li>
                ))
              )}
            </ul>
            {errorMessage && errorMessage.includes('impact level') && (
              <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
            )}
          </div>

          <div className='impactLikelihoodWrapper space-y-2'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LIKELIHOOD</div>
            <ul className='radio-button-list space-y-2'>
              {isProbabilityLoading ? (
                <li>Loading...</li>
              ) : (
                probabilityCategories?.map((category) => (
                  <li key={category.name}>
                    <label
                      className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                        editableRisk.probability === category.name
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <input
                        type='radio'
                        name='probability'
                        value={category.name}
                        checked={editableRisk.probability === category.name}
                        onChange={async () => {
                          try {
                            await updateRiskProbability({
                              id: editableRisk.id,
                              probability: category.name,
                              createdBy: accountId,
                            }).unwrap();
                            handleChange('probability', category.name);
                            setErrorMessage('');
                            refetchActivityLogs();
                          } catch (err: any) {
                            console.error('Failed to update probability:', err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Failed to Update Probability',
                              text: err.data?.message || 'Failed to update probability',
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                            setErrorMessage('');
                          }
                        }}
                        className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='radio-value text-sm'>{category.label}</span>
                    </label>
                  </li>
                ))
              )}
            </ul>
            {errorMessage && errorMessage.includes('probability') && (
              <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
            )}
          </div>

          <div className='levelWrapper'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LEVEL</div>
            <div
              className={`semi-gauge w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold ${getSeverityColor(
                editableRisk.severityLevel
              )}`}
            >
              {editableRisk.severityLevel
                ? editableRisk.severityLevel.charAt(0).toUpperCase() +
                  editableRisk.severityLevel.slice(1).toLowerCase()
                : 'Unknown'}
            </div>
          </div>
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>Attachments</div>
          {Array.isArray(attachments) && attachments.length > 0 ? (
            <div className='attachments-section mt-2'>
              <div className='attachments-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {attachments.map((file) => (
                  <div
                    className='attachment-card relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition'
                    key={file.id}
                    onMouseEnter={() => setHoveredFileId(file.id)}
                    onMouseLeave={() => setHoveredFileId(null)}
                  >
                    <a
                      href={file.fileUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block'
                    >
                      <div className='thumbnail w-full h-32 overflow-hidden rounded-md'>
                        {file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='doc-thumbnail flex items-center justify-center w-full h-32 overflow-hidden rounded-md bg-gray-100'>
                            <span className='doc-text text-gray-700'>
                              {file.fileName?.length > 15
                                ? file.fileName.slice(0, 15) + '...'
                                : file.fileName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className='file-meta mt-2 text-sm text-gray-600'>
                        <div className='file-name font-medium' title={file.fileName}>
                          {file.fileName}
                        </div>
                        <div className='file-date'>
                          {new Date(file.uploadedAt).toLocaleString('vi-VN', { hour12: false })}
                        </div>
                      </div>
                    </a>
                    {hoveredFileId === file.id && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className='delete-file-btn absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition'
                        title='Delete file'
                      >
                        <Trash2 size={20} className='text-white' />
                      </button>
                    )}
                  </div>
                ))}
                <div
                  className='upload-box bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className='plus-icon text-3xl text-gray-500'>＋</div>
                  <div className='upload-text text-center text-gray-600 text-sm'>
                    Drag and
                    <br />
                    drop or
                    <br />
                    <span className='upload-browse text-blue-500'>browse</span>
                  </div>
                </div>
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          ) : (
            <div className='attachment-upload flex justify-center'>
              <div
                className='upload-box bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-center cursor-pointer w-full max-w-xs'
                onClick={() => fileInputRef.current?.click()}
              >
                <div className='plus-icon text-4xl text-gray-500'>＋</div>
                <div className='upload-text text-center text-gray-600 text-sm'>
                  Drag and
                  <br />
                  drop or
                  <br />
                  <span className='upload-browse text-blue-500'>browse</span>
                </div>
              </div>
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}
          {errorMessage && errorMessage.includes('file') && (
            <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
          )}
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>ACTIVITY LOG</div>
          <div className='activity-log-list space-y-4 max-h-80 overflow-y-auto'>
            {isActivityLogsLoading ? (
              <p className='activity-log-loading text-gray-500 italic'>Loading activity logs...</p>
            ) : activityLogs.length === 0 ? (
              <p className='activity-log-empty text-gray-500 italic'>No activity logs available.</p>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className='activity-log-item bg-white p-3 rounded-lg shadow'>
                  <div className='activity-log-header flex justify-between items-center text-sm'>
                    <span className='activity-log-user font-semibold text-gray-800'>
                      {log.createdByName || `User #${log.createdBy}`}
                    </span>
                    <span className='activity-log-time text-gray-500'>
                      {new Date(log.createdAt).toLocaleString('vi-VN', { hour12: false })}
                    </span>
                  </div>
                  <div className='activity-log-message mt-1 text-gray-700'>{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className='risk-comments-panel mt-6 p-4 bg-gray-50 rounded-lg shadow-md'>
        <div className='comments-header text-lg font-semibold text-gray-800 mb-4 border-b pb-2'>
          COMMENTS
        </div>
        <div className='comments-body'>
          <div className='comment-list space-y-4'>
            {isCommentsLoading ? (
              <p className='text-gray-500 italic'>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className='text-gray-500 italic'>No comments yet.</p>
            ) : (
              comments
                .slice()
                .reverse()
                .map((comment) => (
                  <div
                    key={comment.id}
                    className='simple-comment flex gap-3 bg-white p-3 rounded-lg shadow'
                  >
                    <div className='avatar-circle w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm'>
                      <img
                        src={comment.accountPicture || accountIcon}
                        alt='avatar'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='comment-content flex-1'>
                      <div className='comment-header flex justify-between items-center text-sm'>
                        <strong className='text-gray-800'>
                          {comment.accountFullname ||
                            comment.accountUsername ||
                            `User #${comment.accountId}`}
                        </strong>
                        <span className='text-gray-500 text-xs'>
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className='comment-text mt-1 text-gray-700'>
                        {editingCommentId === comment.id ? (
                          <>
                            <input
                              type='text'
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className='border border-gray-300 rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            <div className='flex gap-2'>
                              <button
                                className='text-green-600 font-semibold px-2 py-1 rounded hover:bg-green-100 transition'
                                onClick={async () => {
                                  if (editedContent.trim() === '') {
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Invalid Comment',
                                      text: 'Comment cannot be empty',
                                      width: '500px',
                                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                      customClass: {
                                        title: 'small-title',
                                        popup: 'small-popup',
                                        icon: 'small-icon',
                                        htmlContainer: 'small-html',
                                      },
                                    });
                                    return;
                                  }
                                  try {
                                    await updateRiskComment({
                                      id: comment.id,
                                      riskId: risk.id,
                                      accountId,
                                      comment: editedContent,
                                    }).unwrap();
                                    Swal.fire({
                                      icon: 'success',
                                      title: 'Comment Updated',
                                      text: 'Comment updated successfully!',
                                      width: '500px',
                                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                      customClass: {
                                        title: 'small-title',
                                        popup: 'small-popup',
                                        icon: 'small-icon',
                                        htmlContainer: 'small-html',
                                      },
                                    });
                                    setEditingCommentId(null);
                                    setEditedContent('');
                                    setErrorMessage('');
                                    await refetchComments();
                                    await refetchActivityLogs();
                                  } catch (err: any) {
                                    console.error('Failed to update comment:', err);
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Failed to Update Comment',
                                      text: err.data?.message || 'Failed to update comment',
                                      width: '500px',
                                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                      customClass: {
                                        title: 'small-title',
                                        popup: 'small-popup',
                                        icon: 'small-icon',
                                        htmlContainer: 'small-html',
                                      },
                                    });
                                    setErrorMessage('');
                                  }
                                }}
                              >
                                ✅ Save
                              </button>
                              <button
                                className='text-red-500 font-semibold px-2 py-1 rounded hover:bg-red-100 transition'
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditedContent('');
                                  setErrorMessage('');
                                }}
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          comment.comment
                        )}
                      </div>
                      {comment.accountId === accountId && (
                        <div className='comment-actions flex gap-2 mt-2'>
                          <button
                            className='edit-btn text-blue-600 hover:text-blue-800 transition'
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditedContent(comment.comment);
                            }}
                          >
                            ✏ Edit
                          </button>
                          <button
                            className='delete-btn text-red-500 hover:text-red-700 transition'
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Are you sure?',
                                text: 'Do you want to delete this comment?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!',
                                customClass: {
                                  title: 'small-title',
                                  popup: 'small-popup',
                                  icon: 'small-icon',
                                  htmlContainer: 'small-html',
                                },
                              });

                              if (result.isConfirmed) {
                                try {
                                  await deleteRiskComment({
                                    id: comment.id,
                                    createdBy: accountId,
                                  }).unwrap();
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Comment Deleted',
                                    text: 'Comment deleted successfully!',
                                    width: '500px',
                                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                    customClass: {
                                      title: 'small-title',
                                      popup: 'small-popup',
                                      icon: 'small-icon',
                                      htmlContainer: 'small-html',
                                    },
                                  });
                                  setErrorMessage('');
                                  await refetchComments();
                                  await refetchActivityLogs();
                                } catch (err: any) {
                                  console.error('Failed to delete comment:', err);
                                  Swal.fire({
                                    icon: 'error',
                                    title: 'Failed to Delete Comment',
                                    text: err.data?.message || 'Failed to delete comment',
                                    width: '500px',
                                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                    customClass: {
                                      title: 'small-title',
                                      popup: 'small-popup',
                                      icon: 'small-icon',
                                      htmlContainer: 'small-html',
                                    },
                                  });
                                  setErrorMessage('');
                                }
                              }
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className='comment-input mt-4 relative w-full'>
          <input
            type='text'
            placeholder='Add a comment'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newComment.trim() !== '') {
                try {
                  await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
                  Swal.fire({
                    icon: 'success',
                    title: 'Comment Added',
                    text: 'Comment added successfully!',
                    width: '500px',
                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                    customClass: {
                      title: 'small-title',
                      popup: 'small-popup',
                      icon: 'small-icon',
                      htmlContainer: 'small-html',
                    },
                  });
                  setNewComment('');
                  setErrorMessage('');
                  await refetchComments();
                  await refetchActivityLogs();
                } catch (err: any) {
                  console.error('Failed to send comment:', err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Failed to Add Comment',
                    text: err.data?.message || 'Failed to send comment',
                    width: '500px',
                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                    customClass: {
                      title: 'small-title',
                      popup: 'small-popup',
                      icon: 'small-icon',
                      htmlContainer: 'small-html',
                    },
                  });
                  setErrorMessage('');
                }
              }
            }}
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
          />
          {newComment.trim() && (
            <button
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition'
              onClick={async () => {
                if (newComment.trim() === '') {
                  Swal.fire({
                    icon: 'error',
                    title: 'Invalid Comment',
                    text: 'Comment cannot be empty',
                    width: '500px',
                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                    customClass: {
                      title: 'small-title',
                      popup: 'small-popup',
                      icon: 'small-icon',
                      htmlContainer: 'small-html',
                    },
                  });
                  return;
                }
                try {
                  await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
                  Swal.fire({
                    icon: 'success',
                    title: 'Comment Added',
                    text: 'Comment added successfully!',
                    width: '500px',
                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                    customClass: {
                      title: 'small-title',
                      popup: 'small-popup',
                      icon: 'small-icon',
                      htmlContainer: 'small-html',
                    },
                  });
                  setNewComment('');
                  setErrorMessage('');
                  await refetchComments();
                  await refetchActivityLogs();
                } catch (err: any) {
                  console.error('Failed to send comment:', err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Failed to Add Comment',
                    text: err.data?.message || 'Failed to send comment',
                    width: '500px',
                    confirmButtonColor: 'rgba(44, 104, 194, 1)',
                    customClass: {
                      title: 'small-title',
                      popup: 'small-popup',
                      icon: 'small-icon',
                      htmlContainer: 'small-html',
                    },
                  });
                  setErrorMessage('');
                }
              }}
            >
              <SendHorizontal size={20} />
            </button>
          )}
          {errorMessage && errorMessage.includes('comment') && (
            <div className='error-message text-red-600 text-sm mt-1'>{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskDetail;
