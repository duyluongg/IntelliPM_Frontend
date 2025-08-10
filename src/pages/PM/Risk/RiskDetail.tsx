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

// export interface Risk {
//   id: number;
//   riskKey: string;
//   title: string;
//   description?: string;
//   impactLevel?: 'Low' | 'Medium' | 'High';
//   probability?: 'Low' | 'Medium' | 'High';
//   severityLevel?: 'Low' | 'Medium' | 'High';
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

// type Assignee = {
//   id: number;
//   fullName: string | null;
//   userName: string;
//   picture?: string | null;
// };

// function calculateSeverityLevel(risk: any): string {
//   const levels = { Low: 1, Medium: 2, High: 3 };
//   const i = levels[risk.impactLevel as keyof typeof levels] || 0;
//   const p = levels[risk.probability as keyof typeof levels] || 0;
//   const score = i * p;
//   if (score >= 6) return 'High';
//   if (score >= 3) return 'Medium';
//   return 'Low';
// }

// function calculateSeverityColor(risk: any): string {
//   const level = calculateSeverityLevel(risk);
//   return level.toLowerCase();
// }

// const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose, isPage }) => {
//   const navigate = useNavigate();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
//   // const [searchParams] = useSearchParams();
//   // const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const [searchParams] = useSearchParams();
//   const { projectKey: paramProjectKey } = useParams();
//   const queryProjectKey = searchParams.get('projectKey');
//   const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);

//   const { data: riskSolutionRes, isLoading, refetch } = useGetRiskSolutionByRiskIdQuery(risk.id);
//   const { data: attachments = [], refetch: refetchAttachments } = useGetRiskFilesByRiskIdQuery(
//     risk.id
//   );
//   const {
//     data: comments = [],
//     isLoading: isCommentsLoading,
//     refetch: refetchComments,
//   } = useGetCommentsByRiskIdQuery(risk.id);

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
//       await updateContingency({ id, contigencyPlan: newText });
//       const updated = [...contingencyList];
//       updated[index].text = newText;
//       setContingencyList(updated);
//       setEditIndexContingency(-1);
//       refetch();
//     } catch (error) {
//       console.error('Update failed', error);
//     }
//   };

//   const handleMitigationChange = async (id: number, newText: string, index: number) => {
//     try {
//       await updateMitigation({ id, mitigationPlan: newText });
//       const updated = [...mitigationList];
//       updated[index].text = newText;
//       setMitigationList(updated);
//       setEditIndexMitigation(-1);
//       refetch();
//     } catch (error) {
//       console.error('Update failed', error);
//     }
//   };

//   const handleAddContigency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newContingency.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: newContingency.trim(),
//         mitigationPlan: null,
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.contingencyPlan ?? '',
//         };

//         setContingencyList((prev) => [...prev, newItem]);
//         setNewContingency('');
//         refetch();
//       }
//     }
//   };

//   const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && newMitigation.trim() !== '') {
//       const res = await createRiskSolution({
//         riskId: risk.id,
//         contingencyPlan: null,
//         mitigationPlan: newMitigation.trim(),
//       }).unwrap();

//       if (res?.data) {
//         const newItem = {
//           id: res.data.id,
//           text: res.data.mitigationPlan ?? '',
//         };

//         setMitigationList((prev) => [...prev, newItem]);
//         setNewMitigation('');
//         refetch();
//       }
//     }
//   };

//   const handleChange = (field: keyof Risk, value: any) => {
//     setEditableRisk((prev) => ({ ...prev, [field]: value }));
//   };

//   const renderAvatar = () => {
//     if (editableRisk.responsiblePicture) {
//       return (
//         <img src={editableRisk.responsiblePicture} alt='avatar' className='responsible-avatar' />
//       );
//     }
//     const initials =
//       editableRisk.responsibleFullName
//         ?.split(' ')
//         .map((n) => n[0])
//         .join('') ||
//       editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
//       '?';
//     return <div className='responsible-avatar-placeholder'>{initials}</div>;
//   };

//   const RiskStatusDropdown = ({
//     status,
//     onChange,
//   }: {
//     status: string;
//     onChange: (newStatus: string) => void;
//   }) => {
//     const getStyle = (status: string) => {
//       switch (status.toUpperCase()) {
//         case 'OPEN':
//           return { backgroundColor: '#DBEAFE', color: '#1D4ED8' }; // blue
//         case 'MITIGATED':
//           return { backgroundColor: '#D1FAE5', color: '#047857' }; // green
//         case 'CLOSED':
//           return { backgroundColor: '#E5E7EB', color: '#6B7280' }; // gray
//         default:
//           return {};
//       }
//     };

//     return (
//       <select
//         className={`risk-detail-status-select status-${status.toLowerCase()}`}
//         value={status}
//         onChange={(e) => onChange(e.target.value)}
//         style={{
//           ...getStyle(status),
//           border: 'none',
//           borderRadius: '4px',
//           padding: '4px 8px',
//           fontWeight: 600,
//           fontSize: '12px',
//           cursor: 'pointer',
//         }}
//       >
//         <option value='OPEN'>OPEN</option>
//         <option value='MITIGATED'>MITIGATED</option>
//         <option value='CLOSED'>CLOSED</option>
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
//         className='responsible-dropdown'
//         ref={dropdownRef}
//         value={selectedId?.toString() ?? ''}
//         onChange={(e) => {
//           const selectedValue = e.target.value;
//           onChange(selectedValue === '' ? null : Number(selectedValue));
//         }}
//         style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
//       >
//         {/* <option value='' disabled>
//           -- Select --
//         </option> */}
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
//     console.log('AccountId: ', accountId);

//     try {
//       await uploadRiskFile({
//         riskId: risk.id,
//         fileName: file.name,
//         uploadedBy: accountId,
//         file,
//       }).unwrap();

//       alert(`✅ Uploaded file "${file.name}" successfully!`);
//       refetchAttachments();
//     } catch (error) {
//       console.error('❌ Upload failed:', error);
//       alert('❌ Upload failed!');
//     } finally {
//     }
//   };

//   const handleDeleteFile = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this file?')) return;
//     try {
//       await deleteRiskFile(id).unwrap();
//       alert('✅ File deleted!');
//       refetchAttachments();
//     } catch (error) {
//       console.error('❌ Delete failed:', error);
//       alert('❌ Delete failed!');
//     }
//   };

//   return (
//     <div className={isPage ? 'risk-page-container' : 'risk-detail-container'}>
//       <div className='risk-detail-panel'>
//         {/* <div className={isPage ? 'risk-detail-page' : 'risk-detail-panel'}> */}
//         <div className='detail-header'>
//           <div className='detail-title-section'>
//             <div className='risk-path'>
//               {/* <div>
//                 {projectKey} /{' '}
//                 <span className='risk-code'>{editableRisk.riskKey || `R-${editableRisk.id}`}</span>
//               </div> */}
//               <div>
//                 {projectKey} /{' '}
//                 <span
//                   className='risk-code cursor-pointer text-blue-500 hover:underline'
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

//               <div className='reporter-meta-block'>
//                 <div className='reporter-icons'>
//                   <div className='icon-with-count'>
//                     <MessageSquare size={16} strokeWidth={1.5} />
//                     <span>{commentCount}</span>
//                   </div>
//                   <div className='icon-with-count'>
//                     <Paperclip size={16} strokeWidth={1.5} />
//                     <span>{attachmentCount}</span>
//                   </div>
//                 </div>
//                 <div
//                   className='reporter-avatar'
//                   title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'Unknown'}
//                 >
//                   {editableRisk.creatorPicture ? (
//                     <img
//                       src={editableRisk.creatorPicture}
//                       alt='reporter avatar'
//                       className='avatar-image'
//                     />
//                   ) : (
//                     <div className='avatar-placeholder'>
//                       {editableRisk.creatorFullName
//                         ?.split(' ')
//                         .map((n) => n[0])
//                         .join('') ||
//                         editableRisk.creatorUserName?.slice(0, 2)?.toUpperCase() ||
//                         '?'}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className='title-and-status'>
//               <input
//                 className='editable-title-input'
//                 value={editableRisk.title}
//                 onChange={(e) => handleChange('title', e.target.value)}
//                 onBlur={async (e) => {
//                   const newTitle = e.target.value.trim();
//                   if (newTitle && newTitle !== risk.title) {
//                     try {
//                       await updateRiskTitle({ id: editableRisk.id, title: newTitle }).unwrap();
//                       console.log('Title updated successfully');
//                     } catch (err) {
//                       console.error('Failed to update title:', err);
//                     }
//                   }
//                 }}
//                 placeholder='Enter risk title'
//               />
//               <RiskStatusDropdown
//                 status={editableRisk.status || 'OPEN'}
//                 onChange={async (newStatus) => {
//                   try {
//                     await updateRiskStatus({ id: editableRisk.id, status: newStatus }).unwrap();
//                     handleChange('status', newStatus);
//                     console.log(`Updated status to ${newStatus}`);
//                   } catch (err) {
//                     console.error('Failed to update status:', err);
//                   }
//                 }}
//               />
//             </div>
//             <div className='meta-inline'>
//               <span className='meta-item'>Risk</span>
//               <span className='meta-separator'>·</span>

//               <span className='meta-item with-icon'>
//                 <CalendarDays size={14} className='inline-icon' />
//                 <input
//                   type='date'
//                   value={editableRisk.dueDate?.split('T')[0] || ''}
//                   onChange={async (e) => {
//                     const newDate = e.target.value + 'T00:00:00Z';
//                     try {
//                       await updateRiskDueDate({ id: editableRisk.id, dueDate: newDate }).unwrap();
//                       setEditableRisk((prev) => ({
//                         ...prev,
//                         dueDate: newDate,
//                       }));
//                     } catch (err) {
//                       console.error('Failed to update due date:', err);
//                     }
//                   }}
//                   className='due-date-input'
//                   style={{
//                     marginLeft: '4px',
//                     fontSize: '12px',
//                     border: '1px solid #ccc',
//                     borderRadius: '4px',
//                     padding: '2px 4px',
//                     cursor: 'pointer',
//                   }}
//                 />
//               </span>

//               <span className='meta-separator'>·</span>

//               <div className='meta-value responsible-info cursor-pointer'>
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
//                           }).unwrap();

//                           const updated = assignees.find((u) => u.id === newId);
//                           setEditableRisk((prev) => ({
//                             ...prev,
//                             responsibleId: newId,
//                             responsibleFullName: updated?.fullName || '',
//                             responsibleUserName: updated?.userName || '',
//                             responsiblePicture: updated?.picture || '',
//                           }));
//                         } catch (err) {
//                           console.error('Update failed', err);
//                         }
//                       }}
//                     />
//                   </>
//                 ) : (
//                   <>
//                     <div
//                       className='unassigned-avatar'
//                       onClick={() => setShowResponsibleDropdown(true)}
//                     >
//                       <UserPlus size={14} />
//                     </div>
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={null}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: editableRisk.id,
//                             responsibleId: newId,
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
//                         } catch (err) {
//                           console.error('Update failed', err);
//                         }
//                       }}
//                     />
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <button className='close-btn' onClick={onClose}>
//           ×
//         </button>

//         <div className='detail-section-no-border'>
//           <div className='section-label'>DESCRIPTION</div>
//           <textarea
//             value={editableRisk.description || ''}
//             onChange={async (e) => {
//               const newDescription = e.target.value;
//               try {
//                 await updateRiskDescription({
//                   id: editableRisk.id,
//                   description: newDescription,
//                 }).unwrap();
//                 setEditableRisk((prev) => ({ ...prev, description: newDescription }));
//               } catch (error) {
//                 console.error('Failed to update description:', error);
//               }
//             }}
//             rows={4}
//             style={{
//               width: '100%',
//               padding: '6px 10px',
//               fontSize: '14px',
//               borderRadius: '4px',
//               border: '1px solid #ccc',
//             }}
//           />
//         </div>

//         <div className='detail-section-no-border'>
//           <div className='section-label'>CONTIGENCY PLAN</div>
//           <ul className='todo-list'>
//             {contingencyList.map((item, index) => (
//               <li key={index} className='todo-item'>
//                 <span className='todo-index'>{index + 1}.</span>

//                 {editIndexContingency === index ? (
//                   <input
//                     className='edit-todo-input'
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
//                     className='cursor-pointer hover:underline'
//                     onClick={() => {
//                       setEditIndexContingency(index);
//                       setEditedTextContingency(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}

//                 <button
//                   className='text-gray-500 hover:text-red-500 transition ml-2'
//                   onClick={async () => {
//                     try {
//                       await deleteRiskSolution(item.id).unwrap(); // ← gọi API
//                       const updated = contingencyList.filter((_, i) => i !== index);
//                       setContingencyList(updated);
//                       refetch();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}

//             <li className='todo-item new'>
//               <input
//                 type='text'
//                 placeholder='Add Contigency Plan'
//                 value={newContingency}
//                 onChange={(e) => setNewContingency(e.target.value)}
//                 onKeyDown={handleAddContigency}
//                 className='add-todo-input'
//               />
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section-no-border'>
//           <div className='section-label'>MITIGATION PLAN</div>
//           <ul className='todo-list'>
//             {mitigationList.map((item, index) => (
//               <li key={index} className='todo-item'>
//                 <span className='todo-index'>{index + 1}.</span>
//                 {editIndexMitigation === index ? (
//                   <input
//                     className='edit-todo-input'
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
//                     className='cursor-pointer hover:underline'
//                     onClick={() => {
//                       setEditIndexMitigation(index);
//                       setEditedTextMitigation(item.text);
//                     }}
//                   >
//                     {item.text}
//                   </span>
//                 )}

//                 <button
//                   className='text-gray-500 hover:text-red-500 transition ml-2'
//                   onClick={async () => {
//                     try {
//                       await deleteRiskSolution(item.id).unwrap();
//                       const updated = mitigationList.filter((_, i) => i !== index);
//                       setMitigationList(updated);
//                       refetch();
//                     } catch (error) {
//                       console.error('Delete failed', error);
//                     }
//                   }}
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </li>
//             ))}

//             <li className='todo-item new'>
//               <input
//                 type='text'
//                 placeholder='Add Mitigation Plan'
//                 value={newMitigation}
//                 onChange={(e) => setNewMitigation(e.target.value)}
//                 onKeyDown={handleAddMitigation}
//                 className='add-todo-input'
//               />
//             </li>
//           </ul>
//         </div>

//         <div className='detail-section triple-grid'>
//           <div className='impactLikelihoodWrapper'>
//             <div className='section-label'>IMPACT</div>
//             <ul className='radio-button-list'>
//               {['Low', 'Medium', 'High'].map((lvl) => (
//                 <li key={lvl}>
//                   <label
//                     className={`radio-label ${editableRisk.impactLevel === lvl ? 'checked' : ''}`}
//                   >
//                     <input
//                       type='radio'
//                       name='impact'
//                       value={lvl}
//                       checked={editableRisk.impactLevel === lvl}
//                       // onChange={() => handleChange('impactLevel', lvl)}
//                       onChange={async () => {
//                         try {
//                           await updateRiskImpactLevel({
//                             id: editableRisk.id,
//                             impactLevel: lvl,
//                           }).unwrap();
//                           handleChange('impactLevel', lvl);
//                         } catch (err) {
//                           console.error('Failed to update impact level:', err);
//                         }
//                       }}
//                     />
//                     <span className='radio-icon'></span>
//                     <span className='radio-value'>{lvl}</span>
//                   </label>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className='impactLikelihoodWrapper'>
//             <div className='section-label'>LIKELIHOOD</div>
//             <ul className='radio-button-list'>
//               {['Low', 'Medium', 'High'].map((lvl) => (
//                 <li key={lvl}>
//                   <label
//                     className={`radio-label ${editableRisk.probability === lvl ? 'checked' : ''}`}
//                   >
//                     <input
//                       type='radio'
//                       name='probability'
//                       value={lvl}
//                       checked={editableRisk.probability === lvl}
//                       // onChange={() => handleChange('probability', lvl)}
//                       onChange={async () => {
//                         try {
//                           await updateRiskProbability({
//                             id: editableRisk.id,
//                             probability: lvl,
//                           }).unwrap();
//                           handleChange('probability', lvl);
//                         } catch (err) {
//                           console.error('Failed to update probability:', err);
//                         }
//                       }}
//                     />
//                     <span className='radio-icon'></span>
//                     <span className='radio-value'>{lvl}</span>
//                   </label>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className='levelWrapper'>
//             <div className='section-label'>LEVEL</div>
//             <div className={`semi-gauge ${calculateSeverityColor(editableRisk)}`}>
//               <div className='gauge-text'>{calculateSeverityLevel(editableRisk)}</div>
//             </div>
//           </div>
//         </div>

//         <div className='detail-section-no-border'>
//           <div className='section-label'>Attachments</div>
//           {Array.isArray(attachments) && attachments.length > 0 ? (
//             <div className='attachments-section'>
//               <div className='attachments-grid'>
//                 {attachments.map((file) => (
//                   <div
//                     className='attachment-card'
//                     key={file.id}
//                     onMouseEnter={() => setHoveredFileId(file.id)}
//                     onMouseLeave={() => setHoveredFileId(null)}
//                   >
//                     <a
//                       href={file.fileUrl}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       style={{ textDecoration: 'none', color: 'inherit' }}
//                     >
//                       <div className='thumbnail'>
//                         {file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={file.fileUrl} alt={file.filename} />
//                         ) : (
//                           <div className='doc-thumbnail'>
//                             <span className='doc-text'>
//                               {file.filename?.length > 15
//                                 ? file.filename.slice(0, 15) + '...'
//                                 : file.filename}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <div className='file-meta'>
//                         <div className='file-name' title={file.filename}>
//                           {file.filename}
//                         </div>
//                         <div className='file-date'>
//                           {new Date(file.uploadedAt).toLocaleString('vi-VN', { hour12: false })}
//                         </div>
//                       </div>
//                     </a>

//                     {hoveredFileId === file.id && (
//                       <button
//                         onClick={() => handleDeleteFile(file.id)}
//                         className='delete-file-btn'
//                         title='Delete file'
//                       >
//                         <img
//                           src={deleteIcon}
//                           alt='Delete'
//                           style={{ width: '25px', height: '25px' }}
//                         />
//                       </button>
//                     )}
//                   </div>
//                 ))}

//                 {/* Upload box vẫn xuất hiện để thêm file mới */}
//                 <div className='upload-box' onClick={() => fileInputRef.current?.click()}>
//                   <div className='plus-icon'>＋</div>
//                   <div className='upload-text'>
//                     Drag and
//                     <br />
//                     drop or
//                     <br />
//                     <span className='upload-browse'>browse</span>
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
//             // Khi chưa có file nào
//             <div className='attachment-upload'>
//               <div className='upload-box' onClick={() => fileInputRef.current?.click()}>
//                 <div className='plus-icon'>＋</div>
//                 <div className='upload-text'>
//                   Drag and
//                   <br />
//                   drop or
//                   <br />
//                   <span className='upload-browse'>browse</span>
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
//       </div>

//       <div className='risk-comments-panel'>
//         <div className='comments-header'>COMMENTS</div>

//         <div className='comments-body'>
//           <div className='comment-list'>
//             {isCommentsLoading ? (
//               <p>Loading comments...</p>
//             ) : comments.length === 0 ? (
//               <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
//             ) : (
//               comments
//                 .slice()
//                 .reverse()
//                 .map((comment) => (
//                   <div key={comment.id} className='simple-comment'>
//                     <div className='avatar-circle'>
//                       <img src={comment.accountPicture || accountIcon} alt='avatar' />
//                     </div>
//                     <div className='comment-content'>
//                       <div className='comment-header'>
//                         <strong>
//                           {comment.accountFullname ||
//                             comment.accountUsername ||
//                             `User #${comment.accountId}`}
//                         </strong>{' '}
//                         <span className='comment-time'>
//                           {new Date(comment.createdAt).toLocaleString('vi-VN')}
//                         </span>
//                       </div>
//                       {/* <div className='comment-text'>{comment.comment}</div> */}

//                       <div className='comment-text'>
//                         {editingCommentId === comment.id ? (
//                           <>
//                             <input
//                               type='text'
//                               value={editedContent}
//                               onChange={(e) => setEditedContent(e.target.value)}
//                               className='border rounded px-2 py-1 w-full mb-1'
//                             />
//                             <div className='flex gap-2'>
//                               <button
//                                 className='text-green-600 font-semibold'
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
//                                   } catch (err) {
//                                     console.error('❌ Failed to update comment', err);
//                                     alert('❌ Update failed');
//                                   }
//                                 }}
//                               >
//                                 ✅ Save
//                               </button>
//                               <button
//                                 className='text-red-500 font-semibold'
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
//                         <div className='comment-actions'>
//                           <button
//                             className='edit-btn'
//                             onClick={() => {
//                               setEditingCommentId(comment.id);
//                               setEditedContent(comment.comment);
//                             }}
//                           >
//                             ✏ Edit
//                           </button>
//                           <button
//                             className='delete-btn'
//                             onClick={async () => {
//                               if (
//                                 window.confirm('🗑️ Are you sure you want to delete this comment?')
//                               ) {
//                                 try {
//                                   await deleteRiskComment(comment.id).unwrap();
//                                   alert('🗑️ Deleted successfully');
//                                   await refetchComments();
//                                 } catch (err) {
//                                   console.error('❌ Failed to delete comment', err);
//                                   alert('❌ Delete failed');
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

//         <div className='comment-input relative w-full'>
//           <input
//             type='text'
//             placeholder='Add a comment'
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//           />
//           {newComment.trim() && (
//             <button
//               className='absolute right-2 top-0 bottom-0 flex items-center justify-center text-gray-500 hover:text-blue-500'
//               onClick={async () => {
//                 try {
//                   await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
//                   setNewComment('');
//                   await refetchComments();
//                 } catch (err) {
//                   console.error('❌ Failed to send comment', err);
//                   alert('❌ Send failed');
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

//-------------------------------------------------------------
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

export interface Risk {
  id: number;
  riskKey: string;
  title: string;
  description?: string;
  impactLevel?: 'Low' | 'Medium' | 'High';
  probability?: 'Low' | 'Medium' | 'High';
  severityLevel?: 'Low' | 'Medium' | 'High';
  status?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  responsibleId?: number | null;
  responsibleFullName?: string;
  responsibleUserName?: string;
  responsiblePicture?: string;
  creatorFullName?: string;
  creatorUserName?: string;
  creatorPicture?: string;
  resolution?: string;
}

interface RiskDetailProps {
  risk: Risk;
  onClose: () => void;
  isPage?: boolean;
}

type Assignee = {
  id: number;
  fullName: string | null;
  userName: string;
  picture?: string | null;
};

function calculateSeverityLevel(risk: any): string {
  const levels = { Low: 1, Medium: 2, High: 3 };
  const i = levels[risk.impactLevel as keyof typeof levels] || 0;
  const p = levels[risk.probability as keyof typeof levels] || 0;
  const score = i * p;
  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

function calculateSeverityColor(risk: any): string {
  const level = calculateSeverityLevel(risk);
  return level.toLowerCase();
}

const RiskDetail: React.FC<RiskDetailProps> = ({ risk, onClose, isPage }) => {
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
      await updateContingency({ id, contigencyPlan: newText });
      const updated = [...contingencyList];
      updated[index].text = newText;
      setContingencyList(updated);
      setEditIndexContingency(-1);
      refetch();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleMitigationChange = async (id: number, newText: string, index: number) => {
    try {
      await updateMitigation({ id, mitigationPlan: newText });
      const updated = [...mitigationList];
      updated[index].text = newText;
      setMitigationList(updated);
      setEditIndexMitigation(-1);
      refetch();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleAddContigency = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newContingency.trim() !== '') {
      const res = await createRiskSolution({
        riskId: risk.id,
        contingencyPlan: newContingency.trim(),
        mitigationPlan: null,
      }).unwrap();

      if (res?.data) {
        const newItem = {
          id: res.data.id,
          text: res.data.contingencyPlan ?? '',
        };

        setContingencyList((prev) => [...prev, newItem]);
        setNewContingency('');
        refetch();
      }
    }
  };

  const handleAddMitigation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMitigation.trim() !== '') {
      const res = await createRiskSolution({
        riskId: risk.id,
        contingencyPlan: null,
        mitigationPlan: newMitigation.trim(),
      }).unwrap();

      if (res?.data) {
        const newItem = {
          id: res.data.id,
          text: res.data.mitigationPlan ?? '',
        };

        setMitigationList((prev) => [...prev, newItem]);
        setNewMitigation('');
        refetch();
      }
    }
  };

  const handleChange = (field: keyof Risk, value: any) => {
    setEditableRisk((prev) => ({ ...prev, [field]: value }));
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

  // const RiskStatusDropdown = ({
  //   status,
  //   onChange,
  // }: {
  //   status: string;
  //   onChange: (newStatus: string) => void;
  // }) => {
  //   const getStyle = (status: string) => {
  //     switch (status.toUpperCase()) {
  //       case 'OPEN':
  //         return 'bg-blue-100 text-blue-700';
  //       case 'MITIGATED':
  //         return 'bg-green-100 text-green-700';
  //       case 'CLOSED':
  //         return 'bg-gray-100 text-gray-700';
  //       default:
  //         return '';
  //     }
  //   };

  //   return (
  //     <select
  //       className={`risk-detail-status-select ${getStyle(status)}`}
  //       value={status}
  //       onChange={(e) => onChange(e.target.value)}
  //       style={{
  //         border: 'none',
  //         borderRadius: '6px',
  //         padding: '6px 12px',
  //         fontWeight: 600,
  //         fontSize: '14px',
  //         cursor: 'pointer',
  //       }}
  //     >
  //       <option value='OPEN'>OPEN</option>
  //       <option value='MITIGATED'>MITIGATED</option>
  //       <option value='CLOSED'>CLOSED</option>
  //     </select>
  //   );
  // };

  const RiskStatusDropdown = ({
    status,
    onChange,
  }: {
    status: string;
    onChange: (newStatus: string) => void;
  }) => {
    const {
      data: categoriesData,
      isLoading,
      isError,
    } = useGetCategoriesByGroupQuery('risk_status');

    // const fallbackOptions = [
    //   { name: 'OPEN', label: 'OPEN', color: '#bfdbfe,#1e40af' },
    //   { name: 'MITIGATED', label: 'MITIGATED', color: '#bbf7d0,#15803d' },
    //   { name: 'CLOSED', label: 'CLOSED', color: '#f3f4f6,#4b5563' },
    // ];

    const categories = categoriesData?.data?.filter((cat) => cat.isActive);

    const getStyle = (categoryName: string) => {
      const category = categories?.find((cat) => cat.name === categoryName);
      if (!category?.color) return 'bg-gray-100 text-gray-700';
      console.log(category.color);
      const [bgColor, textColor] = category.color.includes(',')
        ? category.color.split(',')
        : [category.color, category.color];
      return `bg-[${bgColor}] text-[${textColor}]`;
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
    const getInitials = (name?: string | null) => {
      if (!name) return '';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

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

      alert(`✅ Uploaded file "${file.name}" successfully!`);
      refetchAttachments();
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('❌ Upload failed!');
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteRiskFile(id).unwrap();
      alert('✅ File deleted!');
      refetchAttachments();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('❌ Delete failed!');
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
                  title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'Unknown'}
                >
                  {editableRisk.creatorPicture ? (
                    <img
                      src={editableRisk.creatorPicture}
                      alt='reporter avatar'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='avatar-placeholder bg-gray-300 text-white'>
                      {editableRisk.creatorFullName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') ||
                        editableRisk.creatorUserName?.slice(0, 2)?.toUpperCase() ||
                        '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='title-and-status flex items-center gap-4'>
              <input
                className='editable-title-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold'
                value={editableRisk.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={async (e) => {
                  const newTitle = e.target.value.trim();
                  if (newTitle && newTitle !== risk.title) {
                    try {
                      await updateRiskTitle({
                        id: editableRisk.id,
                        title: newTitle,
                        createdBy: accountId,
                      }).unwrap();
                      console.log('Title updated successfully');
                    } catch (err) {
                      console.error('Failed to update title:', err);
                    }
                  }
                }}
                placeholder='Enter risk title'
              />
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
                    refetchActivityLogs();
                    console.log(`Updated status to ${newStatus}`);
                  } catch (err) {
                    console.error('Failed to update status:', err);
                  }
                }}
              />
            </div>
            <div className='meta-inline flex items-center gap-2 mt-2 text-sm text-gray-500'>
              <span className='meta-item'>Risk</span>
              <span className='meta-separator'>·</span>
              <span className='meta-item with-icon flex items-center gap-1'>
                <CalendarDays size={16} />
                <input
                  type='date'
                  value={editableRisk.dueDate?.split('T')[0] || ''}
                  onChange={async (e) => {
                    const newDate = e.target.value + 'T00:00:00Z';
                    try {
                      await updateRiskDueDate({ id: editableRisk.id, dueDate: newDate }).unwrap();
                      setEditableRisk((prev) => ({
                        ...prev,
                        dueDate: newDate,
                      }));
                    } catch (err) {
                      console.error('Failed to update due date:', err);
                    }
                  }}
                  className='due-date-input p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </span>
              <span className='meta-separator'>·</span>
              <div className='meta-value responsible-info flex items-center gap-2 cursor-pointer'>
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
                          }).unwrap();

                          const updated = assignees.find((u) => u.id === newId);
                          setEditableRisk((prev) => ({
                            ...prev,
                            responsibleId: newId,
                            responsibleFullName: updated?.fullName || '',
                            responsibleUserName: updated?.userName || '',
                            responsiblePicture: updated?.picture || '',
                          }));
                        } catch (err) {
                          console.error('Update failed', err);
                        }
                      }}
                    />
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
                        } catch (err) {
                          console.error('Update failed', err);
                        }
                      }}
                    />
                  </>
                )}
              </div>
            </div>
            {/* <div className='reporter-meta-block flex items-center gap-2 mt-2'>
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
                className='reporter-avatar w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200'
                title={editableRisk.creatorFullName || editableRisk.creatorUserName || 'Unknown'}
              >
                {editableRisk.creatorPicture ? (
                  <img
                    src={editableRisk.creatorPicture}
                    alt='reporter avatar'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='avatar-placeholder text-sm text-gray-700'>
                    {editableRisk.creatorFullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') ||
                      editableRisk.creatorUserName?.slice(0, 2)?.toUpperCase() ||
                      '?'}
                  </div>
                )}
              </div>
            </div> */}
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
                }).unwrap();
                setEditableRisk((prev) => ({ ...prev, description: newDescription }));
              } catch (error) {
                console.error('Failed to update description:', error);
              }
            }}
            rows={4}
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
          />
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
                    try {
                      await deleteRiskSolution(item.id).unwrap();
                      const updated = contingencyList.filter((_, i) => i !== index);
                      setContingencyList(updated);
                      refetch();
                    } catch (error) {
                      console.error('Delete failed', error);
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
                onKeyDown={handleAddContigency}
                className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
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
                    try {
                      await deleteRiskSolution(item.id).unwrap();
                      const updated = mitigationList.filter((_, i) => i !== index);
                      setMitigationList(updated);
                      refetch();
                    } catch (error) {
                      console.error('Delete failed', error);
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
                onKeyDown={handleAddMitigation}
                className='add-todo-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </li>
          </ul>
        </div>

        <div className='detail-section triple-grid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='impactLikelihoodWrapper space-y-2'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>IMPACT</div>
            <ul className='radio-button-list space-y-2'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label
                    className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                      editableRisk.impactLevel === lvl
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <input
                      type='radio'
                      name='impact'
                      value={lvl}
                      checked={editableRisk.impactLevel === lvl}
                      onChange={async () => {
                        try {
                          await updateRiskImpactLevel({
                            id: editableRisk.id,
                            impactLevel: lvl,
                          }).unwrap();
                          handleChange('impactLevel', lvl);
                        } catch (err) {
                          console.error('Failed to update impact level:', err);
                        }
                      }}
                      className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='radio-value text-sm'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='impactLikelihoodWrapper space-y-2'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LIKELIHOOD</div>
            <ul className='radio-button-list space-y-2'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label
                    className={`radio-label flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                      editableRisk.probability === lvl
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <input
                      type='radio'
                      name='probability'
                      value={lvl}
                      checked={editableRisk.probability === lvl}
                      onChange={async () => {
                        try {
                          await updateRiskProbability({
                            id: editableRisk.id,
                            probability: lvl,
                          }).unwrap();
                          handleChange('probability', lvl);
                        } catch (err) {
                          console.error('Failed to update probability:', err);
                        }
                      }}
                      className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='radio-value text-sm'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='levelWrapper'>
            <div className='section-label text-lg font-semibold text-gray-800 mb-2'>LEVEL</div>
            <div
              className={`semi-gauge w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold ${
                calculateSeverityColor(editableRisk) === 'low'
                  ? 'bg-green-500'
                  : calculateSeverityColor(editableRisk) === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            >
              {calculateSeverityLevel(editableRisk)}
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
                    className='attachment-card bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition'
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
                            alt={file.filename}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='doc-thumbnail flex items-center justify-center w-full h-32 overflow-hidden rounded-md bg-gray-100'>
                            <span className='doc-text text-gray-700'>
                              {file.filename?.length > 15
                                ? file.filename.slice(0, 15) + '...'
                                : file.filename}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className='file-meta mt-2 text-sm text-gray-600'>
                        <div className='file-name font-medium' title={file.filename}>
                          {file.filename}
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
                        <img
                          src={deleteIcon}
                          alt='Delete'
                          style={{ width: '20px', height: '20px' }}
                        />
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
        </div>

        <div className='detail-section-no-border mt-6 p-4 bg-gray-50 rounded-lg'>
          <div className='section-label text-lg font-semibold text-gray-800 mb-2'>ACTIVITY LOG</div>
          <div className='activity-log-list space-y-4'>
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
                                  try {
                                    await updateRiskComment({
                                      id: comment.id,
                                      riskId: risk.id,
                                      accountId,
                                      comment: editedContent,
                                    }).unwrap();
                                    alert('✅ Comment updated');
                                    setEditingCommentId(null);
                                    setEditedContent('');
                                    await refetchComments();
                                  } catch (err) {
                                    console.error('❌ Failed to update comment', err);
                                    alert('❌ Update failed');
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
                              if (
                                window.confirm('🗑️ Are you sure you want to delete this comment?')
                              ) {
                                try {
                                  await deleteRiskComment(comment.id).unwrap();
                                  alert('🗑️ Deleted successfully');
                                  await refetchComments();
                                } catch (err) {
                                  console.error('❌ Failed to delete comment', err);
                                  alert('❌ Delete failed');
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
            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
          />
          {newComment.trim() && (
            <button
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition'
              onClick={async () => {
                try {
                  await createComment({ riskId: risk.id, accountId, comment: newComment }).unwrap();
                  setNewComment('');
                  await refetchComments();
                } catch (err) {
                  console.error('❌ Failed to send comment', err);
                  alert('❌ Send failed');
                }
              }}
            >
              <SendHorizontal size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskDetail;
