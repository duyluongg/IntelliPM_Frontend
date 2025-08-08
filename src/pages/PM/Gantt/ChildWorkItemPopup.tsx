import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../WorkItem/ChildWorkItemPopup.css';
import {
  useUpdateSubtaskStatusMutation,
  useUpdateSubtaskMutation,
} from '../../../services/subtaskApi';
import { useGetTaskByIdQuery } from '../../../services/taskApi';
import { useGetProjectMembersQuery } from '../../../services/projectMemberApi';
import { useGetWorkItemLabelsBySubtaskQuery } from '../../../services/workItemLabelApi';
import {
  useDeleteSubtaskFileMutation,
  useGetSubtaskFilesBySubtaskIdQuery,
  useUploadSubtaskFileMutation,
} from '../../../services/subtaskFileApi';
import deleteIcon from '../../../assets/delete.png';
import accountIcon from '../../../assets/account.png';
import {
  useGetSubtaskCommentsBySubtaskIdQuery,
  useDeleteSubtaskCommentMutation,
  useUpdateSubtaskCommentMutation,
  useCreateSubtaskCommentMutation,
} from '../../../services/subtaskCommentApi';
import { WorkLogModal } from '../../WorkItem/WorkLogModal';
import TaskDependency from '../../WorkItem/TaskDependency';
import { useGetActivityLogsBySubtaskIdQuery } from '../../../services/activityLogApi';
import { useAuth } from '../../../services/AuthContext';
import { useGetSubtaskByIdQuery } from '../../../services/subtaskApi';
import { useSearchParams } from 'react-router-dom';
import { useDeleteWorkItemLabelMutation } from '../../../services/workItemLabelApi';
import { useGetLabelsByProjectIdQuery } from '../../../services/labelApi';
import { useCreateLabelAndAssignMutation } from '../../../services/labelApi';

// interface SubtaskDetail {
//   id: string;
//   taskId: string;
//   assignedBy: number;
//   assignedByName: string;
//   title: string;
//   description: string;
//   status: string;
//   priority: string;
//   startDate: string;
//   endDate: string;
//   reporterId: number;
//   reporterName: string;
// }

// interface ChildWorkItemPopupProps {
//     item: {
//       key: string;
//       summary: string;
//       assignee: string;
//       parent: string;
//       status: string;
//     };
//   subtaskId: string;
//   taskId: string;
//   onClose: () => void;
// }

// const ChildWorkItemPopup: React.FC<ChildWorkItemPopupProps> = ({ subtaskId, taskId, onClose }) => {
//   const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
//   const [subtaskDetail, setSubtaskDetail] = React.useState<SubtaskDetail | null>(null);
//   const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const navigate = useNavigate();
//   const [uploadSubtaskFile] = useUploadSubtaskFileMutation();
//   const [deleteSubtaskFile] = useDeleteSubtaskFileMutation();
//   const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
//   const accountId = parseInt(localStorage.getItem('accountId') || '0');
//   const [updateSubtaskComment] = useUpdateSubtaskCommentMutation();
//   const [deleteSubtaskComment] = useDeleteSubtaskCommentMutation();
//   const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
//   const [commentContent, setCommentContent] = React.useState('');
//   const [createSubtaskComment] = useCreateSubtaskCommentMutation();
//   const [isWorklogOpen, setIsWorklogOpen] = React.useState(false);
//   const [isDependencyOpen, setIsDependencyOpen] = useState(false);
//   const [description, setDescription] = React.useState('');
//   const [title, setTitle] = React.useState('');
//   const [assignedBy, setAssignedBy] = React.useState('');
//   const [priority, setPriority] = React.useState('');
//   const [startDate, setStartDate] = React.useState('');
//   const [endDate, setEndDate] = React.useState('');
//   const [reporterId, setReporterId] = React.useState('');
//   const [newTitle, setNewTitle] = useState<string>();
//   const [newDescription, setNewDescription] = useState<string>();
//   const [newPriority, setNewPriority] = useState<string>();
//   const [newStartDate, setNewStartDate] = useState<string>();
//   const [newEndDate, setNewEndDate] = useState<string>();
//   const [newReporterId, setNewReporterId] = useState<number>();
//   const [newAssignedBy, setNewAssignedBy] = useState<number>();
//   const [updateSubtask] = useUpdateSubtaskMutation();
//   const [selectedAssignee, setSelectedAssignee] = useState<number | undefined>(
//     subtaskDetail?.assignedBy
//   );
//   const [selectedReporter, setSelectedReporter] = useState<number | undefined>(
//     subtaskDetail?.reporterId
//   );
//   const { data: taskDetail } = useGetTaskByIdQuery(subtaskDetail?.taskId ?? '');
//   const projectId = taskDetail?.projectId;
//   const { data: projectMembers } = useGetProjectMembersQuery(projectId!, { skip: !projectId });
//   const { user } = useAuth();
//   const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

//   React.useEffect(() => {
//     if (subtaskDetail) {
//       setDescription(subtaskDetail.description || '');
//       setTitle(subtaskDetail.title || '');
//       setAssignedBy(String(subtaskDetail.assignedBy) || '');
//       setPriority(subtaskDetail.priority || '');
//       setStartDate(subtaskDetail.startDate || '');
//       setEndDate(subtaskDetail.endDate || '');
//       setReporterId(String(subtaskDetail.reporterId) || '');
//     }
//   }, [subtaskDetail]);

//   const { data: attachments = [], refetch: refetchAttachments } =
//     useGetSubtaskFilesBySubtaskIdQuery(subtaskDetail?.id ?? '', {
//       skip: !subtaskDetail?.id,
//     });

//   const {
//     data: comments = [],
//     isLoading: isCommentsLoading,
//     refetch: refetchComments,
//   } = useGetSubtaskCommentsBySubtaskIdQuery(subtaskDetail?.id ?? '', {
//     skip: !subtaskDetail?.id,
//   });

//   const isUserAssignee = (subtaskAssigneeId?: number) => {
//     const currentUserId = accountId.toString();
//     return subtaskAssigneeId?.toString() === currentUserId;
//   };

//   const {
//     data: activityLogs = [],
//     isLoading: isActivityLogsLoading,
//     refetch: refetchActivityLogs,
//   } = useGetActivityLogsBySubtaskIdQuery(subtaskDetail?.id!, {
//     skip: !subtaskDetail?.id!,
//   });

//   const {
//     data: fetchedSubtask,
//     isLoading: isSubtaskLoading,
//     refetch: refetchSubtask,
//   } = useGetSubtaskByIdQuery(subtaskId, { skip: !subtaskId });

//   useEffect(() => {
//     if (fetchedSubtask) {
//       setSubtaskDetail(fetchedSubtask);
//     }
//   }, [fetchedSubtask]);

//   const fetchSubtask = async () => {
//     try {
//       const res = await fetch(`https://localhost:7128/api/subtask/${subtaskId}`);
//       const json = await res.json();
//       if (json.isSuccess && json.data) {
//         setSubtaskDetail(json.data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch subtask', err);
//     }
//   };

//   useEffect(() => {
//     fetchSubtask();
//   }, [subtaskId]);

//   const toISO = (localDate: string) => {
//     const date = new Date(localDate);
//     return date.toISOString(); // "2025-07-21T00:00:00.000Z"
//   };

//   const handleUpdateSubtask = async () => {
//     if (!subtaskDetail) return;

//     if (
//       newTitle === undefined &&
//       newDescription === undefined &&
//       newPriority === undefined &&
//       newStartDate === undefined &&
//       newEndDate === undefined &&
//       newReporterId === undefined &&
//       newAssignedBy === undefined
//     ) {
//       return;
//     }

//     try {
//       await updateSubtask({
//         id: subtaskDetail.id,
//         title: newTitle ?? subtaskDetail.title,
//         description: newDescription ?? subtaskDetail.description,
//         priority: newPriority ?? subtaskDetail.priority,
//         startDate: newStartDate ? toISO(newStartDate) : subtaskDetail.startDate,
//         endDate: newEndDate ? toISO(newEndDate) : subtaskDetail.endDate,
//         reporterId: newReporterId ?? subtaskDetail.reporterId,
//         assignedBy: newAssignedBy ?? subtaskDetail.assignedBy,
//         createdBy: accountId,
//       }).unwrap();

//       console.log('✅ Subtask updated');
//       await fetchSubtask();
//       await refetchActivityLogs();
//     } catch (err) {
//       console.error('❌ Failed to update subtask', err);
//       alert('❌ Update failed');
//     }
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !subtaskDetail) return;

//     try {
//       await uploadSubtaskFile({
//         subtaskId: subtaskDetail.id,
//         title: file.name,
//         file,
//         createdBy: accountId,
//       }).unwrap();

//       alert(`✅ Uploaded file "${file.name}" successfully!`);
//       refetchAttachments();
//       await refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Upload failed:', error);
//       alert('❌ Upload failed!');
//     } finally {
//       setIsAddDropdownOpen(false);
//     }
//   };

//   const handleDeleteFile = async (id: number, createdBy: number) => {
//     if (!window.confirm('Are you sure you want to delete this file?')) return;
//     try {
//       await deleteSubtaskFile({ id, createdBy: accountId }).unwrap();
//       alert('✅ File deleted!');
//       await refetchAttachments();
//       await refetchActivityLogs();
//     } catch (error) {
//       console.error('❌ Delete failed:', error);
//       alert('❌ Delete failed!');
//     }
//   };

//   const formatDate = (isoString: string | undefined) => {
//     if (!isoString) return 'None';
//     const date = new Date(isoString);
//     return date.toLocaleDateString('vi-VN');
//   };

//   const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newStatus = e.target.value;
//     if (!subtaskDetail) return;

//     try {
//       await updateSubtaskStatus({
//         id: subtaskDetail.id,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();

//       setSubtaskDetail({ ...subtaskDetail, status: newStatus }); // ✅ Cập nhật UI
//       console.log(`✅ Updated subtask ${subtaskDetail.id} to ${newStatus}`);
//       await refetchActivityLogs();
//     } catch (err) {
//       console.error('❌ Failed to update subtask status', err);
//     }
//   };

//   const { data: parentTask } = useGetTaskByIdQuery(subtaskDetail?.taskId || '', {
//     skip: !subtaskDetail?.taskId,
//   });

//   const { data: subtaskLabels = [] } = useGetWorkItemLabelsBySubtaskQuery(subtaskId, {
//     skip: !subtaskId,
//   });

//   if (!subtaskDetail)
//     return (
//       <div className='modal-overlay'>
//         <div className='child-work-item-popup-container'>Loading...</div>
//       </div>
//     );

//   return (
//     <div className='modal-overlay' onClick={onClose}>
//       <div className='child-work-item-popup-container' onClick={(e) => e.stopPropagation()}>
//         <div className='child-popup-header'>
//           <div className='breadcrumb'>
//             Projects / <span>{parentTask?.projectName || '...'}</span> /{' '}
//             <span>{subtaskDetail.taskId}</span> /{' '}
//             <span
//               className='child-popup-key'
//               style={{ cursor: 'pointer', textDecoration: 'underline' }}
//               onClick={() => navigate(`/project/child-work/${subtaskDetail.id}`)}
//             >
//               {subtaskDetail.id}
//             </span>
//           </div>
//           <button className='btn-close' onClick={onClose}>
//             ✖
//           </button>
//         </div>

//         <input
//           className='subtask-input'
//           defaultValue={subtaskDetail?.title}
//           onChange={(e) => setNewTitle(e.target.value)}
//           onBlur={handleUpdateSubtask}
//           style={{
//             width: '500px',
//             fontWeight: 'bold',
//           }}
//         />

//         <div className='child-popup-content'>
//           <div className='child-popup-main'>
//             <div className='child-popup-header-row'>
//               <div className='add-menu-wrapper'>
//                 <button
//                   className='btn-add'
//                   onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
//                 >
//                   + Add
//                 </button>
//                 {isAddDropdownOpen && (
//                   <div className='add-dropdown'>
//                     <div className='add-item' onClick={() => fileInputRef.current?.click()}>
//                       📎 Attachment
//                     </div>
//                   </div>
//                 )}
//                 <input
//                   type='file'
//                   ref={fileInputRef}
//                   style={{ display: 'none' }}
//                   onChange={handleFileUpload}
//                 />
//               </div>
//             </div>

//             <div className='field-group'>
//               <label>Description</label>
//               <textarea
//                 className='subtask-description'
//                 defaultValue={subtaskDetail?.description}
//                 onChange={(e) => setNewDescription(e.target.value)}
//                 onBlur={handleUpdateSubtask}
//               />
//             </div>
//             {attachments.length > 0 && (
//               <div className='attachments-section'>
//                 <label>
//                   Attachments <span>({attachments.length})</span>
//                 </label>
//                 <div className='attachments-grid'>
//                   {attachments.map((file) => (
//                     <div
//                       className='attachment-card'
//                       key={file.id}
//                       onMouseEnter={() => setHoveredFileId(file.id)}
//                       onMouseLeave={() => setHoveredFileId(null)}
//                     >
//                       <a
//                         href={file.urlFile}
//                         target='_blank'
//                         rel='noopener noreferrer'
//                         style={{ textDecoration: 'none', color: 'inherit' }}
//                       >
//                         <div className='thumbnail'>
//                           {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                             <img src={file.urlFile} alt={file.title} />
//                           ) : (
//                             <div className='doc-thumbnail'>
//                               <span className='doc-text'>
//                                 {file.title.length > 15
//                                   ? file.title.slice(0, 15) + '...'
//                                   : file.title}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                         <div className='file-meta'>
//                           <div className='file-name' title={file.title}>
//                             {file.title}
//                           </div>
//                           <div className='file-date'>
//                             {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
//                           </div>
//                         </div>
//                       </a>

//                       {hoveredFileId === file.id && (
//                         <button
//                           onClick={() => handleDeleteFile(file.id, file.createdBy)}
//                           className='delete-file-btn'
//                           title='Delete file'
//                         >
//                           <img
//                             src={deleteIcon}
//                             alt='Delete'
//                             style={{ width: '25px', height: '25px' }}
//                           />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className='activity-section'>
//               <h4 style={{ marginBottom: '8px' }}>Activity</h4>

//               {/* Tabs */}
//               <div className='activity-tabs'>
//                 <button
//                   className={`activity-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
//                   onClick={() => setActiveTab('COMMENTS')}
//                 >
//                   Comments
//                 </button>
//                 <button
//                   className={`activity-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
//                   onClick={() => setActiveTab('HISTORY')}
//                 >
//                   History
//                 </button>
//               </div>

//               {activeTab === 'HISTORY' && (
//                 <div className='history-list'>
//                   {isActivityLogsLoading ? (
//                     <div>Loading...</div>
//                   ) : activityLogs.length === 0 ? (
//                     <div>No history available.</div>
//                   ) : (
//                     activityLogs.map((log) => (
//                       <div key={log.id} className='history-item'>
//                         <div className='history-header'>
//                           <span className='history-user'>{log.createdByName}</span>
//                           <span className='history-time'>
//                             {new Date(log.createdAt).toLocaleTimeString()}{' '}
//                             {new Date(log.createdAt).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <div className='history-message'>{log.message}</div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}

//               {activeTab === 'COMMENTS' ? (
//                 <>
//                   <div className='comment-list'>
//                     {isCommentsLoading ? (
//                       <p>Loading comments...</p>
//                     ) : comments.length === 0 ? (
//                       <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
//                     ) : (
//                       comments
//                         .slice()
//                         .reverse()
//                         .map((comment) => (
//                           <div key={comment.id} className='simple-comment'>
//                             <div className='avatar-circle'>
//                               <img src={comment.accountPicture || accountIcon} alt='avatar' />
//                             </div>
//                             <div className='comment-content'>
//                               <div className='comment-header'>
//                                 <strong>
//                                   {comment.accountName || `User #${comment.accountId}`}
//                                 </strong>{' '}
//                                 <span className='comment-time'>
//                                   {new Date(comment.createdAt).toLocaleString('vi-VN')}
//                                 </span>
//                               </div>
//                               <div className='comment-text'>{comment.content}</div>
//                               {comment.accountId === accountId && (
//                                 <div className='comment-actions'>
//                                   <button
//                                     className='edit-btn'
//                                     onClick={async () => {
//                                       const newContent = prompt(
//                                         '✏ Edit your comment:',
//                                         comment.content
//                                       );
//                                       if (newContent && newContent !== comment.content) {
//                                         try {
//                                           await updateSubtaskComment({
//                                             id: comment.id,
//                                             subtaskId: subtaskDetail.id,
//                                             accountId,
//                                             content: newContent,
//                                             createdBy: accountId,
//                                           }).unwrap();
//                                           alert('✅ Comment updated');
//                                           await refetchComments();
//                                           await refetchActivityLogs();
//                                         } catch (err) {
//                                           console.error('❌ Failed to update comment', err);
//                                           alert('❌ Update failed');
//                                         }
//                                       }
//                                     }}
//                                   >
//                                     ✏ Edit
//                                   </button>
//                                   <button
//                                     className='delete-btn'
//                                     onClick={async () => {
//                                       if (
//                                         window.confirm(
//                                           '🗑️ Are you sure you want to delete this comment?'
//                                         )
//                                       ) {
//                                         try {
//                                           await deleteSubtaskComment({
//                                             id: comment.id,
//                                             createdBy: accountId,
//                                           }).unwrap();
//                                           alert('🗑️ Deleted successfully');
//                                           await refetchComments();
//                                           await refetchActivityLogs();
//                                         } catch (err) {
//                                           console.error('❌ Failed to delete comment', err);
//                                           alert('❌ Delete failed');
//                                         }
//                                       }
//                                     }}
//                                   >
//                                     🗑 Delete
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))
//                     )}
//                   </div>

//                   {/* Comment Input */}
//                   <div className='simple-comment-input'>
//                     <textarea
//                       placeholder='Add a comment...'
//                       value={commentContent}
//                       onChange={(e) => setCommentContent(e.target.value)}
//                     />
//                     <button
//                       disabled={!commentContent.trim()}
//                       onClick={async () => {
//                         try {
//                           if (!accountId || isNaN(accountId)) {
//                             alert('❌ User not identified. Please log in again.');
//                             return;
//                           }
//                           await createSubtaskComment({
//                             subtaskId: subtaskDetail.id,
//                             accountId,
//                             content: commentContent.trim(),
//                             createdBy: accountId,
//                           }).unwrap();
//                           alert('✅ Comment posted');
//                           setCommentContent('');
//                           await refetchComments();
//                         } catch (err: any) {
//                           console.error('❌ Failed to post comment:', err);
//                           alert('❌ Failed to post comment: ' + JSON.stringify(err?.data || err));
//                         }
//                       }}
//                     >
//                       Comment
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className='activity-placeholder'></div>
//               )}
//             </div>
//           </div>

//           <div className='details-panel'>
//             {/* <div className='panel-header'>
//               <select
//                 value={subtaskDetail.status}
//                 className={`status-dropdown-select status-${subtaskDetail.status
//                   .toLowerCase()
//                   .replace('_', '-')}`}
//                 onChange={handleStatusChange}
//               >
//                 <option value='TO_DO'>To Do</option>
//                 <option value='IN_PROGRESS'>In Progress</option>
//                 <option value='DONE'>Done</option>
//               </select>
//             </div> */}
//             <div className='panel-header'>
//               {isUserAssignee(subtaskDetail.assignedBy) || canEdit ? (
//                 <select
//                   value={subtaskDetail.status}
//                   className={`status-dropdown-select status-${subtaskDetail.status
//                     .toLowerCase()
//                     .replace('_', '-')}`}
//                   onChange={handleStatusChange}
//                 >
//                   <option value='TO_DO'>To Do</option>
//                   <option value='IN_PROGRESS'>In Progress</option>
//                   <option value='DONE'>Done</option>
//                 </select>
//               ) : (
//                 <span
//                   className={`status-dropdown-select status-${subtaskDetail.status
//                     .toLowerCase()
//                     .replace('_', '-')}`}
//                 >
//                   {subtaskDetail.status.replace('_', ' ')}
//                 </span>
//               )}
//               {fetchedSubtask?.warnings && fetchedSubtask.warnings.length > 0 && (
//                 <div className='warning-box'>
//                   {fetchedSubtask.warnings.map((warning, idx) => (
//                     <div key={idx} className='warning-text'>
//                       ⚠️ {warning}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className='details-content'>
//               <h4>Details</h4>
//               <div className='detail-item'>
//                 <label>Assignee</label>
//                 <div className='detail-item'>
//                   <select
//                     value={selectedAssignee ?? subtaskDetail?.assignedBy}
//                     onChange={async (e) => {
//                       const newAssignee = parseInt(e.target.value);
//                       setSelectedAssignee(newAssignee);

//                       try {
//                         await updateSubtask({
//                           id: subtaskDetail.id,
//                           assignedBy: newAssignee,
//                           title: subtaskDetail.title,
//                           description: subtaskDetail.description ?? '',
//                           priority: subtaskDetail.priority,
//                           startDate: subtaskDetail.startDate,
//                           endDate: subtaskDetail.endDate,
//                           reporterId: subtaskDetail.reporterId,
//                           createdBy: accountId,
//                         }).unwrap();
//                         alert('✅ Updated subtask assignee');
//                         await fetchSubtask();
//                         await refetchActivityLogs();
//                       } catch (err) {
//                         alert('❌ Failed to update subtask');
//                         console.error(err);
//                       }
//                     }}
//                     style={{ minWidth: '150px' }}
//                   >
//                     <option value='0'>Unassigned</option>
//                     {projectMembers?.map((m) => (
//                       <option key={m.accountId} value={m.accountId}>
//                         {m.accountName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className='detail-item'>
//                 <label>Labels</label>
//                 <span>
//                   {subtaskLabels.length === 0
//                     ? 'None'
//                     : subtaskLabels.map((label) => label.labelName).join(', ')}
//                 </span>
//               </div>

//               <div className='detail-item'>
//                 <label>Parent</label>
//                 <span>{subtaskDetail.taskId}</span>
//               </div>

//               <div className='detail-item'>
//                 <label>Priority</label>
//                 <select
//                   style={{ width: '150px' }}
//                   value={newPriority ?? subtaskDetail?.priority}
//                   onChange={(e) => setNewPriority(e.target.value)}
//                   onBlur={handleUpdateSubtask}
//                 >
//                   <option value='HIGH'>High</option>
//                   <option value='HIGHEST'>Highest</option>
//                   <option value='MEDIUM'>Medium</option>
//                   <option value='LOW'>Low</option>
//                   <option value='LOWEST'>Lowest</option>
//                 </select>
//               </div>

//               <div className='detail-item'>
//                 <label>Start Date</label>
//                 <input
//                   type='date'
//                   value={newStartDate ?? subtaskDetail?.startDate?.slice(0, 10) ?? ''}
//                   onChange={(e) => setNewStartDate(e.target.value)}
//                   onBlur={handleUpdateSubtask}
//                   style={{ width: '150px' }}
//                 />
//               </div>

//               <div className='detail-item'>
//                 <label>Due Date</label>
//                 <input
//                   type='date'
//                   value={newEndDate ?? subtaskDetail?.endDate?.slice(0, 10) ?? ''}
//                   onChange={(e) => setNewEndDate(e.target.value)}
//                   onBlur={handleUpdateSubtask}
//                   style={{ width: '150px' }}
//                 />
//               </div>

//               <div className='detail-item'>
//                 <label>Reporter</label>
//                 <div className='detail-item'>
//                   <select
//                     value={selectedReporter ?? subtaskDetail?.reporterId}
//                     onChange={async (e) => {
//                       const newReporter = parseInt(e.target.value);
//                       setSelectedReporter(newReporter);

//                       try {
//                         await updateSubtask({
//                           id: subtaskDetail.id,
//                           assignedBy: subtaskDetail.assignedBy,
//                           title: subtaskDetail.title,
//                           description: subtaskDetail.description ?? '',
//                           priority: subtaskDetail.priority,
//                           startDate: subtaskDetail.startDate,
//                           endDate: subtaskDetail.endDate,
//                           reporterId: newReporter,
//                           createdBy: accountId,
//                         }).unwrap();
//                         alert('✅ Updated subtask reporter');
//                         await fetchSubtask();
//                         await refetchActivityLogs();
//                       } catch (err) {
//                         alert('❌ Failed to update reporter');
//                         console.error(err);
//                       }
//                     }}
//                     style={{ minWidth: '150px' }}
//                   >
//                     <option value='0'>Unassigned</option>
//                     {projectMembers?.map((m) => (
//                       <option key={m.accountId} value={m.accountId}>
//                         {m.accountName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className='detail-item'>
//                 <label>Time Tracking</label>
//                 <span
//                   onClick={() => setIsWorklogOpen(true)}
//                   className='text-blue-600 hover:underline cursor-pointer'
//                 >
//                   Log Work
//                 </span>
//               </div>

//               <WorkLogModal
//                 open={isWorklogOpen}
//                 onClose={() => setIsWorklogOpen(false)}
//                 workItemId={subtaskDetail.id}
//                 type='subtask'
//               />
//               <div className='detail-item'>
//                 <label>Connections</label>
//                 <span
//                   onClick={() => setIsDependencyOpen(true)}
//                   className='text-blue-600 hover:underline cursor-pointer'
//                 >
//                   Manage Dependencies
//                 </span>
//               </div>
//               <TaskDependency
//                 open={isDependencyOpen}
//                 onClose={() => setIsDependencyOpen(false)}
//                 workItemId={subtaskDetail.id}
//                 type='subtask'
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChildWorkItemPopup;

interface SubtaskDetail {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedByName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  reporterId: number;
  reporterName: string;
}

interface ChildWorkItemPopupProps {
  subtaskId: string;
  taskId: string;
  onClose: () => void;
}

const ChildWorkItemPopup: React.FC<ChildWorkItemPopupProps> = ({ subtaskId, taskId, onClose }) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
  const [subtaskDetail, setSubtaskDetail] = React.useState<SubtaskDetail | null>(null);
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [uploadSubtaskFile] = useUploadSubtaskFileMutation();
  const [deleteSubtaskFile] = useDeleteSubtaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [updateSubtaskComment] = useUpdateSubtaskCommentMutation();
  const [deleteSubtaskComment] = useDeleteSubtaskCommentMutation();
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [commentContent, setCommentContent] = React.useState('');
  const [createSubtaskComment] = useCreateSubtaskCommentMutation();
  const [isWorklogOpen, setIsWorklogOpen] = React.useState(false);
  const [isDependencyOpen, setIsDependencyOpen] = useState(false);
  const [description, setDescription] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [assignedBy, setAssignedBy] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reporterId, setReporterId] = React.useState('');
  const [newTitle, setNewTitle] = useState<string>();
  const [newDescription, setNewDescription] = useState<string>();
  const [newPriority, setNewPriority] = useState<string>();
  const [newStartDate, setNewStartDate] = useState<string>();
  const [newEndDate, setNewEndDate] = useState<string>();
  const [newReporterId, setNewReporterId] = useState<number>();
  const [newAssignedBy, setNewAssignedBy] = useState<number>();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [selectedAssignee, setSelectedAssignee] = useState<number | undefined>(
    subtaskDetail?.assignedBy
  );
  const [selectedReporter, setSelectedReporter] = useState<number | undefined>(
    subtaskDetail?.reporterId
  );
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [deleteWorkItemLabel] = useDeleteWorkItemLabelMutation();
  const { data: taskDetail } = useGetTaskByIdQuery(subtaskDetail?.taskId ?? '');
  const projectId = taskDetail?.projectId;
  const { data: projectMembers } = useGetProjectMembersQuery(projectId!, { skip: !projectId });
  const { user } = useAuth();
  const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

  React.useEffect(() => {
    if (subtaskDetail) {
      setDescription(subtaskDetail.description || '');
      setTitle(subtaskDetail.title || '');
      setAssignedBy(String(subtaskDetail.assignedBy) || '');
      setPriority(subtaskDetail.priority || '');
      setStartDate(subtaskDetail.startDate || '');
      setEndDate(subtaskDetail.endDate || '');
      setReporterId(String(subtaskDetail.reporterId) || '');
    }
  }, [subtaskDetail]);

  const { data: attachments = [], refetch: refetchAttachments } =
    useGetSubtaskFilesBySubtaskIdQuery(subtaskDetail?.id ?? '', {
      skip: !subtaskDetail?.id,
    });

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetSubtaskCommentsBySubtaskIdQuery(subtaskDetail?.id ?? '', {
    skip: !subtaskDetail?.id,
  });

  const isUserAssignee = (subtaskAssigneeId?: number) => {
    const currentUserId = accountId.toString();
    return subtaskAssigneeId?.toString() === currentUserId;
  };

  const {
    data: activityLogs = [],
    isLoading: isActivityLogsLoading,
    refetch: refetchActivityLogs,
  } = useGetActivityLogsBySubtaskIdQuery(subtaskDetail?.id!, {
    skip: !subtaskDetail?.id!,
  });

  const {
    data: fetchedSubtask,
    isLoading: isSubtaskLoading,
    refetch: refetchSubtask,
  } = useGetSubtaskByIdQuery(subtaskId, { skip: !subtaskId });

  useEffect(() => {
    if (subtaskId) {
      refetchSubtask();
    }
  }, [subtaskId, refetchSubtask]);

  useEffect(() => {
    if (fetchedSubtask) {
      setSubtaskDetail(fetchedSubtask);
    }
  }, [fetchedSubtask]);

  const { data: workItemLabels = [], isLoading: isLabelLoading, refetch: refetchWorkItemLabels } = useGetWorkItemLabelsBySubtaskQuery(
    subtaskDetail?.id!, { skip: !subtaskDetail?.id!, }
  );

  const { data: projectLabels = [], isLoading: isProjectLabelsLoading,
    refetch: refetchProjectLabels, } = useGetLabelsByProjectIdQuery(projectId!, {
      skip: !projectId,
    });

  const filteredLabels = projectLabels.filter((label) => {
    const notAlreadyAdded = !workItemLabels.some((l) => l.labelName === label.name);

    if (newLabelName.trim() === '') {
      return notAlreadyAdded;
    }

    return (
      label.name.toLowerCase().includes(newLabelName.toLowerCase()) &&
      notAlreadyAdded
    );
  });

  const [createLabelAndAssign, { isLoading: isCreating }] = useCreateLabelAndAssignMutation();

  const handleCreateLabelAndAssign = async (labelName?: string) => {
    const nameToAssign = labelName?.trim() || newLabelName.trim();

    if (!projectId || !subtaskDetail?.id || !nameToAssign) {
      alert('Missing projectId, taskId or label name!');
      return;
    }

    try {
      await createLabelAndAssign({
        projectId,
        name: nameToAssign,
        taskId: null,
        epicId: null,
        subtaskId: subtaskDetail?.id,
      }).unwrap();

      alert('✅ Label assigned successfully!');
      setNewLabelName('');
      setIsEditingLabel(false);
      await Promise.all([
        refetchWorkItemLabels?.(),
        refetchProjectLabels?.(),
      ]);
    } catch (error) {
      console.error('❌ Failed to create and assign label:', error);
      alert('❌ Failed to assign label');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsEditingLabel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteWorkItemLabel = async (id: number) => {
    try {
      await deleteWorkItemLabel(id).unwrap();
      console.log('Delete successfully');
      await refetchWorkItemLabels();
    } catch (error) {
      console.error(':', error);
    }
  };

  const toISO = (localDate: string) => {
    const date = new Date(localDate);
    return date.toISOString(); // "2025-07-21T00:00:00.000Z"
  };

  const handleUpdateSubtask = async () => {
    if (!subtaskDetail) return;

    if (
      newTitle === undefined &&
      newDescription === undefined &&
      newPriority === undefined &&
      newStartDate === undefined &&
      newEndDate === undefined &&
      newReporterId === undefined &&
      newAssignedBy === undefined
    ) {
      return;
    }

    try {
      await updateSubtask({
        id: subtaskDetail.id,
        title: newTitle ?? subtaskDetail.title,
        description: newDescription ?? subtaskDetail.description,
        priority: newPriority ?? subtaskDetail.priority,
        startDate: newStartDate ? toISO(newStartDate) : subtaskDetail.startDate,
        endDate: newEndDate ? toISO(newEndDate) : subtaskDetail.endDate,
        reporterId: newReporterId ?? subtaskDetail.reporterId,
        assignedBy: newAssignedBy ?? subtaskDetail.assignedBy,
        createdBy: accountId,
      }).unwrap();

      console.log('✅ Subtask updated');
      await refetchSubtask();
      await refetchActivityLogs();
    } catch (err) {
      console.error('❌ Failed to update subtask', err);
      alert('❌ Update failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subtaskDetail) return;

    try {
      await uploadSubtaskFile({
        subtaskId: subtaskDetail.id,
        title: file.name,
        file,
        createdBy: accountId,
      }).unwrap();

      alert(`✅ Uploaded file "${file.name}" successfully!`);
      refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('❌ Upload failed!');
    } finally {
      setIsAddDropdownOpen(false);
    }
  };

  const handleDeleteFile = async (id: number, createdBy: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteSubtaskFile({ id, createdBy: accountId }).unwrap();
      alert('✅ File deleted!');
      await refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('❌ Delete failed!');
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!subtaskDetail) return;

    try {
      await updateSubtaskStatus({
        id: subtaskDetail.id,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();

      setSubtaskDetail({ ...subtaskDetail, status: newStatus }); // ✅ Cập nhật UI
      console.log(`✅ Updated subtask ${subtaskDetail.id} to ${newStatus}`);
      await refetchSubtask();
      await refetchActivityLogs();
    } catch (err) {
      console.error('❌ Failed to update subtask status', err);
    }
  };

  const { data: parentTask } = useGetTaskByIdQuery(subtaskDetail?.taskId || '', {
    skip: !subtaskDetail?.taskId,
  });

  if (!subtaskDetail)
    return (
      <div className='modal-overlay'>
        <div className='child-work-item-popup-container'>Loading...</div>
      </div>
    );

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='child-work-item-popup-container' onClick={(e) => e.stopPropagation()}>
        <div className='child-popup-header'>
          <div className='breadcrumb'>
            Projects / <span>{parentTask?.projectName || '...'}</span> /{' '}
            <span>{subtaskDetail.taskId}</span> /{' '}
            <span
              className='child-popup-key'
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate(`/project/${projectKey}/child-work/${subtaskDetail.id}`)}
            >
              {subtaskDetail.id}
            </span>
          </div>
          <button className='btn-close' onClick={onClose}>
            ✖
          </button>
        </div>

        <input
          className='subtask-input'
          defaultValue={subtaskDetail?.title}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleUpdateSubtask}
          style={{
            width: '500px',
            fontWeight: 'bold',
          }}
        />

        <div className='child-popup-content'>
          <div className='child-popup-main'>
            <div className='child-popup-header-row'>
              <div className='add-menu-wrapper'>
                <button
                  className='btn-add'
                  onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                >
                  + Add
                </button>
                {isAddDropdownOpen && (
                  <div className='add-dropdown'>
                    <div className='add-item' onClick={() => fileInputRef.current?.click()}>
                      📎 Attachment
                    </div>
                  </div>
                )}
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className='field-group'>
              <label>Description</label>
              <textarea
                className='subtask-description'
                defaultValue={subtaskDetail?.description}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleUpdateSubtask}
              />
            </div>
            {attachments.length > 0 && (
              <div className='attachments-section'>
                <label>
                  Attachments <span>({attachments.length})</span>
                </label>
                <div className='attachments-grid'>
                  {attachments.map((file) => (
                    <div
                      className='attachment-card'
                      key={file.id}
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <a
                        href={file.urlFile}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className='thumbnail'>
                          {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={file.urlFile} alt={file.title} />
                          ) : (
                            <div className='doc-thumbnail'>
                              <span className='doc-text'>
                                {file.title.length > 15
                                  ? file.title.slice(0, 15) + '...'
                                  : file.title}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className='file-meta'>
                          <div className='file-name' title={file.title}>
                            {file.title}
                          </div>
                          <div className='file-date'>
                            {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                          </div>
                        </div>
                      </a>

                      {hoveredFileId === file.id && (
                        <button
                          onClick={() => handleDeleteFile(file.id, file.createdBy)}
                          className='delete-file-btn'
                          title='Delete file'
                        >
                          <img
                            src={deleteIcon}
                            alt='Delete'
                            style={{ width: '25px', height: '25px' }}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='activity-section'>
              <h4 style={{ marginBottom: '8px' }}>Activity</h4>

              {/* Tabs */}
              <div className='activity-tabs'>
                <button
                  className={`activity-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('COMMENTS')}
                >
                  Comments
                </button>
                <button
                  className={`activity-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
                  onClick={() => setActiveTab('HISTORY')}
                >
                  History
                </button>
              </div>

              {activeTab === 'HISTORY' && (
                <div className='history-list'>
                  {isActivityLogsLoading ? (
                    <div>Loading...</div>
                  ) : activityLogs.length === 0 ? (
                    <div>No history available.</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className='history-item'>
                        <div className='history-header'>
                          <span className='history-user'>{log.createdByName}</span>
                          <span className='history-time'>
                            {new Date(log.createdAt).toLocaleTimeString()}{' '}
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='history-message'>{log.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'COMMENTS' ? (
                <>
                  <div className='comment-list'>
                    {isCommentsLoading ? (
                      <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
                    ) : (
                      comments
                        .slice()
                        .reverse()
                        .map((comment) => (
                          <div key={comment.id} className='simple-comment'>
                            <div className='avatar-circle'>
                              <img src={comment.accountPicture || accountIcon} alt='avatar' />
                            </div>
                            <div className='comment-content'>
                              <div className='comment-header'>
                                <strong>
                                  {comment.accountName || `User #${comment.accountId}`}
                                </strong>{' '}
                                <span className='comment-time'>
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div className='comment-text'>{comment.content}</div>
                              {comment.accountId === accountId && (
                                <div className='comment-actions'>
                                  <button
                                    className='edit-btn'
                                    onClick={async () => {
                                      const newContent = prompt(
                                        '✏ Edit your comment:',
                                        comment.content
                                      );
                                      if (newContent && newContent !== comment.content) {
                                        try {
                                          await updateSubtaskComment({
                                            id: comment.id,
                                            subtaskId: subtaskDetail.id,
                                            accountId,
                                            content: newContent,
                                            createdBy: accountId,
                                          }).unwrap();
                                          alert('✅ Comment updated');
                                          await refetchComments();
                                          await refetchActivityLogs();
                                        } catch (err) {
                                          console.error('❌ Failed to update comment', err);
                                          alert('❌ Update failed');
                                        }
                                      }
                                    }}
                                  >
                                    ✏ Edit
                                  </button>
                                  <button
                                    className='delete-btn'
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          '🗑️ Are you sure you want to delete this comment?'
                                        )
                                      ) {
                                        try {
                                          await deleteSubtaskComment({
                                            id: comment.id,
                                            createdBy: accountId,
                                          }).unwrap();
                                          alert('🗑️ Deleted successfully');
                                          await refetchComments();
                                          await refetchActivityLogs();
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

                  {/* Comment Input */}
                  <div className='simple-comment-input'>
                    <textarea
                      placeholder='Add a comment...'
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button
                      disabled={!commentContent.trim()}
                      onClick={async () => {
                        try {
                          if (!accountId || isNaN(accountId)) {
                            alert('❌ User not identified. Please log in again.');
                            return;
                          }
                          await createSubtaskComment({
                            subtaskId: subtaskDetail.id,
                            accountId,
                            content: commentContent.trim(),
                            createdBy: accountId,
                          }).unwrap();
                          alert('✅ Comment posted');
                          console.error('✅ Comment posted');
                          setCommentContent('');
                          await refetchComments();
                          await refetchActivityLogs()
                        } catch (err: any) {
                          console.error('❌ Failed to post comment:', err);
                          alert('❌ Failed to post comment: ' + JSON.stringify(err?.data || err));
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </>
              ) : (
                <div className='activity-placeholder'></div>
              )}
            </div>
          </div>

          <div className='details-panel'>
            <div className='panel-header'>
              {isUserAssignee(subtaskDetail.assignedBy) || canEdit ? (
                <select
                  value={subtaskDetail.status}
                  className={`status-dropdown-select status-${subtaskDetail.status
                    .toLowerCase()
                    .replace('_', '-')}`}
                  onChange={handleStatusChange}
                >
                  <option value='TO_DO'>To Do</option>
                  <option value='IN_PROGRESS'>In Progress</option>
                  <option value='DONE'>Done</option>
                </select>
              ) : (
                <span
                  className={`status-dropdown-select status-${subtaskDetail.status
                    .toLowerCase()
                    .replace('_', '-')}`}
                >
                  {subtaskDetail.status.replace('_', ' ')}
                </span>
              )}
              {fetchedSubtask?.warnings && fetchedSubtask.warnings.length > 0 && (
                <div className='warning-box'>
                  {fetchedSubtask.warnings.map((warning, idx) => (
                    <div key={idx} className='warning-text'>
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='details-content'>
              <h4>Details</h4>
              <div className='detail-item'>
                <label>Assignee</label>
                <div className='detail-item'>
                  <select
                    value={selectedAssignee ?? subtaskDetail?.assignedBy}
                    onChange={async (e) => {
                      const newAssignee = parseInt(e.target.value);
                      setSelectedAssignee(newAssignee);

                      try {
                        await updateSubtask({
                          id: subtaskDetail.id,
                          assignedBy: newAssignee,
                          title: subtaskDetail.title,
                          description: subtaskDetail.description ?? '',
                          priority: subtaskDetail.priority,
                          startDate: subtaskDetail.startDate,
                          endDate: subtaskDetail.endDate,
                          reporterId: subtaskDetail.reporterId,
                          createdBy: accountId,
                        }).unwrap();
                        alert('✅ Updated subtask assignee');
                        await refetchSubtask();
                        await refetchActivityLogs();
                      } catch (err) {
                        alert('❌ Failed to update subtask');
                        console.error(err);
                      }
                    }}
                    style={{ minWidth: '150px' }}
                  >
                    <option value='0'>Unassigned</option>
                    {projectMembers?.map((m) => (
                      <option key={m.accountId} value={m.accountId}>
                        {m.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditingLabel ? (
                <div ref={labelRef} className="flex flex-col gap-2 w-full relative">
                  <div className="flex flex-col gap-2 w-full relative">
                    <label className="font-semibold">Labels</label>

                    {/* Tag list + input */}
                    <div
                      className="border rounded px-2 py-1 flex flex-wrap items-center gap-2 min-h-[42px] focus-within:ring-2 ring-blue-400"
                      onClick={() => setDropdownOpen(true)}
                    >
                      {workItemLabels.map((label) => (
                        <span
                          key={label.id}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {label.labelName}
                          <button
                            onClick={() => handleDeleteWorkItemLabel(label.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        value={newLabelName}
                        onChange={(e) => {
                          setNewLabelName(e.target.value);
                          setDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateLabelAndAssign();
                        }}
                        placeholder="Type to search or add"
                        className="flex-1 min-w-[100px] border-none outline-none py-1"
                        autoFocus
                      />
                    </div>

                    {/* Dropdown suggestion */}
                    {dropdownOpen && filteredLabels.length > 0 && (
                      <ul className="absolute top-full mt-1 w-full bg-white border rounded shadow z-10 max-h-48 overflow-auto">
                        <li className="px-3 py-1 font-semibold text-gray-600 border-b">All labels</li>
                        {filteredLabels.map((label) => (
                          <li
                            key={label.id}
                            onClick={() => handleCreateLabelAndAssign(label.name)}
                            className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                          >
                            {label.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-item" onClick={() => setIsEditingLabel(true)}>
                  <label className="font-semibold">Labels</label>
                  <span>
                    {isLabelLoading
                      ? 'Loading...'
                      : workItemLabels.length === 0
                        ? 'None'
                        : workItemLabels.map((label) => label.labelName).join(', ')}
                  </span>
                </div>
              )}

              <div className='detail-item'>
                <label>Parent</label>
                <span>{subtaskDetail.taskId}</span>
              </div>

              <div className='detail-item'>
                <label>Priority</label>
                <select
                  style={{ width: '150px' }}
                  value={newPriority ?? subtaskDetail?.priority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onBlur={handleUpdateSubtask}
                >
                  <option value='HIGH'>High</option>
                  <option value='HIGHEST'>Highest</option>
                  <option value='MEDIUM'>Medium</option>
                  <option value='LOW'>Low</option>
                  <option value='LOWEST'>Lowest</option>
                </select>
              </div>

              <div className='detail-item'>
                <label>Start Date</label>
                <input
                  type='date'
                  value={newStartDate ?? subtaskDetail?.startDate?.slice(0, 10) ?? ''}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  onBlur={handleUpdateSubtask}
                  style={{ width: '150px' }}
                />
              </div>

              <div className='detail-item'>
                <label>Due Date</label>
                <input
                  type='date'
                  value={newEndDate ?? subtaskDetail?.endDate?.slice(0, 10) ?? ''}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  onBlur={handleUpdateSubtask}
                  style={{ width: '150px' }}
                />
              </div>

              <div className='detail-item'>
                <label>Reporter</label>
                <div className='detail-item'>
                  <select
                    value={selectedReporter ?? subtaskDetail?.reporterId}
                    onChange={async (e) => {
                      const newReporter = parseInt(e.target.value);
                      setSelectedReporter(newReporter);

                      try {
                        await updateSubtask({
                          id: subtaskDetail.id,
                          assignedBy: subtaskDetail.assignedBy,
                          title: subtaskDetail.title,
                          description: subtaskDetail.description ?? '',
                          priority: subtaskDetail.priority,
                          startDate: subtaskDetail.startDate,
                          endDate: subtaskDetail.endDate,
                          reporterId: newReporter,
                          createdBy: accountId,
                        }).unwrap();
                        alert('✅ Updated subtask reporter');
                        await refetchSubtask();
                        await refetchActivityLogs();
                      } catch (err) {
                        alert('❌ Failed to update reporter');
                        console.error(err);
                      }
                    }}
                    style={{ minWidth: '150px' }}
                  >
                    <option value='0'>Unassigned</option>
                    {projectMembers?.map((m) => (
                      <option key={m.accountId} value={m.accountId}>
                        {m.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='detail-item'>
                <label>Time Tracking</label>
                <span
                  onClick={() => setIsWorklogOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Log Work
                </span>
              </div>

              <WorkLogModal
                open={isWorklogOpen}
                onClose={() => setIsWorklogOpen(false)}
                workItemId={subtaskDetail.id}
                type='subtask'
              />
              <div className='detail-item'>
                <label>Connections</label>
                <span
                  onClick={() => setIsDependencyOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Manage Dependencies
                </span>
              </div>
              <TaskDependency
                open={isDependencyOpen}
                onClose={() => setIsDependencyOpen(false)}
                workItemId={subtaskDetail.id}
                type='subtask'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWorkItemPopup;
