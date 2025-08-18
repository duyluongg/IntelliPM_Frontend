// import { useSearchParams } from 'react-router-dom';
// import { useEffect } from 'react';
// import {
//   useGetRisksByProjectKeyQuery,
//   useCreateRiskMutation,
//   useUpdateRiskStatusMutation,
//   useUpdateRiskTypeMutation,
//   useUpdateRiskResponsibleMutation,
//   useUpdateRiskDueDateMutation,
//   useCheckOverdueTasksMutation,
// } from '../../../services/riskApi';
// import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useCreateRiskSolutionMutation } from '../../../services/riskSolutionApi';
// import { useState } from 'react';
// import RiskDetail from './RiskDetail';
// import ManualRiskModal from './ManualRiskModal';
// import SuggestedRisksModal from './SuggestedRisksModal';
// import { useParams } from 'react-router-dom';
// import './Risk.css';
// import { useGetProjectsByAccountIdQuery } from '../../../services/accountApi';

// const Risk = () => {
//   const [searchParams] = useSearchParams();
//   const { projectKey: paramProjectKey } = useParams();
//   const queryProjectKey = searchParams.get('projectKey');
//   const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [scopeFilter, setScopeFilter] = useState('ALL');

//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);

//   const projectId = projectData?.data?.id;
//   const skipMembers = !projectId;

//   const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
//     skip: skipMembers,
//   });

//   const { data: scopeCategoriesData, isLoading: isScopeCategoriesLoading } =
//     useGetCategoriesByGroupQuery('risk_scope');

//   const { data, isLoading, error, refetch } = useGetRisksByProjectKeyQuery(projectKey);
//   const [createRisk] = useCreateRiskMutation();
//   const [checkOverdueTasks] = useCheckOverdueTasksMutation();
//   const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showSuggestedModal, setShowSuggestedModal] = useState(false);
//   const [updateRiskStatus] = useUpdateRiskStatusMutation();
//   const [updateRiskType] = useUpdateRiskTypeMutation();
//   const [updateResponsible] = useUpdateRiskResponsibleMutation();
//   const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
//   const [createRiskSolution] = useCreateRiskSolutionMutation();

//   const { data: categoryData, isLoading: isCategoryLoading } =
//     useGetCategoriesByGroupQuery('risk_type');

//   const { data: severityCategoriesData, isLoading: isSeverityLoading } =
//     useGetCategoriesByGroupQuery('risk_severity_level');

//   useEffect(() => {
//     if (projectKey && projectKey !== 'NotFound') {
//       checkOverdueTasks(projectKey)
//         .unwrap()
//         .then(() => refetch())
//         .catch((err) => console.error('Failed to check overdue tasks:', err));
//     }
//   }, [projectKey, checkOverdueTasks, refetch]);

//   if (isLoading || isProjectLoading || isCategoryLoading || isSeverityLoading || isScopeCategoriesLoading) {
//     return (
//       <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
//         Loading risks...
//       </div>
//     );
//   }
//   if (error || !data?.data) {
//     return (
//       <div className='flex items-center justify-center h-full text-red-500 text-sm'>
//         Error loading risks
//       </div>
//     );
//   }

//   const risks = data.data;
//   const riskTypes = categoryData?.data || [];
//   const scopeTypes = scopeCategoriesData?.data || [];
//   const assignees =
//     membersData?.data?.map((m) => ({
//       id: m.accountId,
//       fullName: m.fullName,
//       userName: m.username,
//       picture: m.picture,
//     })) || [];

//   // Filter risks based on scopeFilter
//   const filteredRisks = risks.filter((risk) => {
//     if (scopeFilter === 'ALL') return true;
//     if (scopeFilter === 'TASK') return risk.taskId !== null;
//     if (scopeFilter === 'PROJECT') return risk.taskId === null;
//     return true;
//   });

//   const getInitials = (name?: string | null) => {
//     if (!name) return '';
//     const parts = name.trim().split(' ');
//     if (parts.length === 1) return parts[0][0].toUpperCase();
//     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
//   };

//   const getDueClass = (dueDate: string): string => {
//     const today = new Date().toISOString().split('T')[0];
//     if (dueDate === today) return 'bg-yellow-100 text-yellow-800';
//     if (dueDate < today) return 'bg-red-100 text-red-800';
//     return 'bg-gray-100 text-gray-800';
//   };

//   const Severity: React.FC<{ status: string }> = ({ status }) => {
//     const getStatusStyle = () => {
//       const category = severityCategoriesData?.data?.find(
//         (cat) => cat.name.toLowerCase() === status.toLowerCase()
//       );
//       if (!category?.color) return 'bg-gray-100 text-gray-700';
//       const [bgColor, textColor] = category.color.split(',');
//       return `bg-${bgColor} text-${textColor}`;
//     };

//     return (
//       <span
//         className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle()}`}
//       >
//         {status.toUpperCase()}
//       </span>
//     );
//   };

//   type Assignee = {
//     id: number;
//     fullName: string | null;
//     userName: string;
//     picture?: string | null;
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
//         className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//         value={selectedId?.toString() ?? ''}
//         onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
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
//         className={`p-2 text-xs font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStyle(
//           status
//         )}`}
//         value={status}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={isLoading}
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

//   const openCreateRiskModal = () => {
//     setShowCreateModal(true);
//   };

//   const closeCreateRiskModal = () => {
//     setShowCreateModal(false);
//   };

//   const handleSaveRisk = async (newRisk: any) => {
//     try {
//       const request = {
//         projectKey,
//         responsibleId: newRisk.responsibleId,
//         createdBy: accountId,
//         taskId: null,
//         riskScope: 'GENERAL',
//         title: newRisk.title,
//         description: newRisk.description,
//         status: 'OPEN',
//         type: newRisk.type,
//         generatedBy: 'Manual',
//         probability: newRisk.probability,
//         impactLevel: newRisk.impactLevel,
//         isApproved: true,
//         dueDate: newRisk.dueDate ? newRisk.dueDate + 'T00:00:00Z' : undefined,
//       };
//       await createRisk(request).unwrap();
//       refetch();
//     } catch (error) {
//       console.error('Failed to create risk:', error);
//     }
//   };

//   const openSuggestedRisks = () => {
//     setShowSuggestedModal(true);
//   };

//   const closeSuggestedRisks = () => {
//     setShowSuggestedModal(false);
//   };

//   const handleApproveSuggestedRisk = async (risk: any) => {
//     const today = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
//     try {
//       const request = {
//         projectKey,
//         responsibleId: null,
//         createdBy: accountId,
//         taskId: null,
//         riskScope: 'PROJECT',
//         title: risk.title,
//         description: risk.description,
//         status: 'OPEN',
//         type: risk.type,
//         generatedBy: 'AI',
//         probability: risk.probability || risk.likelihood,
//         impactLevel: risk.impactLevel || risk.impact,
//         isApproved: true,
//         dueDate: today,
//       };

//       const res = await createRisk(request).unwrap();
//       if (risk.mitigationPlan || risk.contingencyPlan) {
//         await createRiskSolution({
//           riskId: res.data.id,
//           mitigationPlan: risk.mitigationPlan,
//           contingencyPlan: risk.contingencyPlan,
//           createdBy: accountId,
//         });
//       }
//       refetch();
//     } catch (error) {
//       console.error('Failed to create risk:', error);
//     }
//   };

//   return (
//     <div className='p-6 min-h-screen'>
//       <div className='flex justify-between items-center mb-6'>
//         <h1 className='text-2xl font-bold text-gray-800'>Risk Management</h1>
//         <div className='flex items-center space-x-4'>
//           <select
//             className='p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//             value={scopeFilter}
//             onChange={(e) => setScopeFilter(e.target.value)}
//           >
//             <option value='ALL'>All Scopes</option>
//             {scopeTypes.map((scope) => (
//               <option key={scope.name} value={scope.name}>
//                 {scope.label}
//               </option>
//             ))}
//           </select>
//           <button
//             className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
//             onClick={openCreateRiskModal}
//           >
//             + Add Risk
//           </button>
//           <button
//             className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition'
//             onClick={openSuggestedRisks}
//           >
//             🤖 Suggest by AI
//           </button>
//         </div>
//       </div>

//       <div className='bg-white shadow-md rounded-lg overflow-hidden'>
//         <div className='overflow-x-auto'>
//           <table className='w-full min-w-[800px]'>
//             <thead className='bg-gray-100'>
//               <tr>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Key</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Risk Name</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Type</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Status</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Severity</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Responsible</th>
//                 <th className='p-3 text-left text-sm font-semibold text-gray-600'>Due Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRisks.map((risk) => (
//                 <tr key={risk.id} className='border-b hover:bg-gray-50'>
//                   <td className='p-3'>
//                     <span
//                       className='text-black-600 cursor-pointer hover:underline'
//                       onClick={() => setSelectedRisk(risk)}
//                     >
//                       {risk.riskKey}
//                     </span>
//                   </td>
//                   <td className='p-3'>
//                     <span
//                       className='text-black-600 cursor-pointer hover:underline'
//                       onClick={() => setSelectedRisk(risk)}
//                     >
//                       {risk.title}
//                     </span>
//                   </td>
//                   <td className='p-3'>
//                     <select
//                       className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//                       value={risk.type}
//                       onChange={async (e) => {
//                         try {
//                           await updateRiskType({
//                             id: risk.id,
//                             type: e.target.value,
//                             createdBy: accountId,
//                           }).unwrap();
//                           refetch();
//                         } catch (err) {
//                           console.error('Failed to update risk type:', err);
//                         }
//                       }}
//                     >
//                       {riskTypes.map((type: any) => (
//                         <option key={type.id} value={type.name}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className='p-3'>
//                     <RiskStatusDropdown
//                       status={risk.status}
//                       onChange={async (newStatus) => {
//                         try {
//                           await updateRiskStatus({
//                             id: risk.id,
//                             status: newStatus,
//                             createdBy: accountId,
//                           }).unwrap();
//                           refetch();
//                         } catch (err) {
//                           console.error('Failed to update status:', err);
//                         }
//                       }}
//                     />
//                   </td>
//                   <td className='p-3'>
//                     <Severity status={risk.severityLevel} />
//                   </td>
//                   <td className='p-3 flex items-center space-x-2'>
//                     {risk.responsibleId ? (
//                       risk.responsiblePicture ? (
//                         <img
//                           src={risk.responsiblePicture}
//                           alt='avatar'
//                           className='w-6 h-6 rounded-full'
//                         />
//                       ) : (
//                         <div className='w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold'>
//                           {getInitials(risk.responsibleFullName || risk.responsibleUserName)}
//                         </div>
//                       )
//                     ) : (
//                       <span className='text-gray-500 text-sm'>No Assignee</span>
//                     )}
//                     <ResponsibleDropdown
//                       assignees={assignees}
//                       selectedId={risk.responsibleId}
//                       onChange={async (newId) => {
//                         try {
//                           await updateResponsible({
//                             id: risk.id,
//                             responsibleId: newId,
//                             createdBy: accountId,
//                           }).unwrap();
//                           refetch();
//                         } catch (err) {
//                           console.error('Failed to update responsible:', err);
//                         }
//                       }}
//                     />
//                   </td>
//                   <td className='p-3'>
//                     <input
//                       type='date'
//                       value={risk.dueDate?.split('T')[0] || ''}
//                       onChange={async (e) => {
//                         const newDate = e.target.value + 'T00:00:00Z';
//                         try {
//                           await updateRiskDueDate({
//                             id: risk.id,
//                             dueDate: newDate,
//                             createdBy: accountId,
//                           }).unwrap();
//                           refetch();
//                         } catch (err) {
//                           console.error('Failed to update due date:', err);
//                         }
//                       }}
//                       className={`p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDueClass(
//                         risk.dueDate?.split('T')[0]
//                       )}`}
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedRisk && (
//         <RiskDetail
//           risk={selectedRisk}
//           onClose={() => {
//             setSelectedRisk(null);
//             refetch();
//           }}
//         />
//       )}
//       {showCreateModal && (
//         <ManualRiskModal onClose={closeCreateRiskModal} onSave={handleSaveRisk} />
//       )}
//       {showSuggestedModal && (
//         <SuggestedRisksModal
//           onClose={closeSuggestedRisks}
//           onApprove={handleApproveSuggestedRisk}
//           projectId={projectId}
//         />
//       )}
//     </div>
//   );
// };

// export default Risk;


import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import {
  useGetRisksByProjectKeyQuery,
  useCreateRiskMutation,
  useUpdateRiskStatusMutation,
  useUpdateRiskTypeMutation,
  useUpdateRiskResponsibleMutation,
  useUpdateRiskDueDateMutation,
  useCheckOverdueTasksMutation,
} from '../../../services/riskApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateRiskSolutionMutation } from '../../../services/riskSolutionApi';
import { useState } from 'react';
import RiskDetail from './RiskDetail';
import ManualRiskModal from './ManualRiskModal';
import SuggestedRisksModal from './SuggestedRisksModal';
import { useParams } from 'react-router-dom';
import './Risk.css';
import { useGetProjectsByAccountIdQuery } from '../../../services/accountApi';

const Risk = () => {
  const [searchParams] = useSearchParams();
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [scopeFilter, setScopeFilter] = useState('ALL');

  const { data: projectData, isLoading: isProjectLoading } =
    useGetProjectDetailsByKeyQuery(projectKey);

  const projectId = projectData?.data?.id;
  const skipMembers = !projectId;

  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
    skip: skipMembers,
  });

  const { data: scopeCategoriesData, isLoading: isScopeCategoriesLoading } =
    useGetCategoriesByGroupQuery('risk_scope');

  const { data: generatedByCategoriesData, isLoading: isGeneratedByCategoriesLoading } =
    useGetCategoriesByGroupQuery('risk_generated_by');

  const { data, isLoading, error, refetch } = useGetRisksByProjectKeyQuery(projectKey);
  const [createRisk] = useCreateRiskMutation();
  const [checkOverdueTasks] = useCheckOverdueTasksMutation();
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [updateRiskStatus] = useUpdateRiskStatusMutation();
  const [updateRiskType] = useUpdateRiskTypeMutation();
  const [updateResponsible] = useUpdateRiskResponsibleMutation();
  const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
  const [createRiskSolution] = useCreateRiskSolutionMutation();

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');

  const { data: severityCategoriesData, isLoading: isSeverityLoading } =
    useGetCategoriesByGroupQuery('risk_severity_level');

  useEffect(() => {
    if (projectKey && projectKey !== 'NotFound') {
      checkOverdueTasks(projectKey)
        .unwrap()
        .then(() => refetch())
        .catch((err) => console.error('Failed to check overdue tasks:', err));
    }
  }, [projectKey, checkOverdueTasks, refetch]);

  if (isLoading || isProjectLoading || isCategoryLoading || isSeverityLoading || isScopeCategoriesLoading || isGeneratedByCategoriesLoading) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
        Loading risks...
      </div>
    );
  }
  if (error || !data?.data) {
    return (
      <div className='flex items-center justify-center h-full text-red-500 text-sm'>
        Error loading risks
      </div>
    );
  }

  const risks = data.data;
  const riskTypes = categoryData?.data || [];
  const scopeTypes = scopeCategoriesData?.data || [];
  const generatedByTypes = generatedByCategoriesData?.data || [];
  const assignees =
    membersData?.data?.map((m) => ({
      id: m.accountId,
      fullName: m.fullName,
      userName: m.username,
      picture: m.picture,
    })) || [];

  // Filter risks based on scopeFilter
  const filteredRisks = risks.filter((risk) => {
    if (scopeFilter === 'ALL') return true;
    if (scopeFilter === 'TASK') return risk.taskId !== null;
    if (scopeFilter === 'PROJECT') return risk.taskId === null;
    return true;
  });

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getDueClass = (dueDate: string): string => {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate === today) return 'bg-yellow-100 text-yellow-800';
    if (dueDate < today) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const Severity: React.FC<{ status: string }> = ({ status }) => {
    const getStatusStyle = () => {
      const category = severityCategoriesData?.data?.find(
        (cat) => cat.name.toLowerCase() === status.toLowerCase()
      );
      if (!category?.color) return 'bg-gray-100 text-gray-700';
      const [bgColor, textColor] = category.color.split(',');
      return `bg-${bgColor} text-${textColor}`;
    };

    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle()}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  type Assignee = {
    id: number;
    fullName: string | null;
    userName: string;
    picture?: string | null;
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
        className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        value={selectedId?.toString() ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
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
        className={`p-2 text-xs font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStyle(
          status
        )}`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
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

  const openCreateRiskModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateRiskModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveRisk = async (newRisk: any) => {
    try {
      const defaultScope = scopeTypes.find((scope: any) => scope.name === 'PROJECT')?.name || 'PROJECT';
      const defaultGeneratedBy = generatedByTypes.find((gen: any) => gen.name === 'MANUAL')?.name || 'MANUAL';

      const request = {
        projectKey,
        responsibleId: newRisk.responsibleId,
        createdBy: accountId,
        taskId: null,
        riskScope: defaultScope,
        title: newRisk.title,
        description: newRisk.description,
        status: newRisk.status,
        type: newRisk.type,
        generatedBy: defaultGeneratedBy,
        probability: newRisk.probability,
        impactLevel: newRisk.impactLevel,
        isApproved: true,
        dueDate: newRisk.dueDate ? newRisk.dueDate + 'T00:00:00Z' : undefined,
      };
      await createRisk(request).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to create risk:', error);
    }
  };

  const openSuggestedRisks = () => {
    setShowSuggestedModal(true);
  };

  const closeSuggestedRisks = () => {
    setShowSuggestedModal(false);
  };

  const handleApproveSuggestedRisk = async (risk: any) => {
    const today = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
    try {
      const defaultScope = scopeTypes.find((scope: any) => scope.name === 'PROJECT')?.name || 'PROJECT';
      const defaultGeneratedBy = generatedByTypes.find((gen: any) => gen.name === 'AI')?.name || 'AI';

      const request = {
        projectKey,
        responsibleId: null,
        createdBy: accountId,
        taskId: null,
        riskScope: defaultScope,
        title: risk.title,
        description: risk.description,
        status: risk.status,
        type: risk.type,
        generatedBy: defaultGeneratedBy,
        probability: risk.probability || risk.likelihood,
        impactLevel: risk.impactLevel || risk.impact,
        isApproved: true,
        dueDate: today,
      };

      const res = await createRisk(request).unwrap();
      if (risk.mitigationPlan || risk.contingencyPlan) {
        await createRiskSolution({
          riskId: res.data.id,
          mitigationPlan: risk.mitigationPlan,
          contingencyPlan: risk.contingencyPlan,
          createdBy: accountId,
        });
      }
      refetch();
    } catch (error) {
      console.error('Failed to create risk:', error);
    }
  };

  return (
    <div className='p-6 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Risk Management</h1>
        <div className='flex items-center space-x-4'>
          <select
            className='p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
          >
            <option value='ALL'>All Scopes</option>
            {scopeTypes.map((scope) => (
              <option key={scope.name} value={scope.name}>
                {scope.label}
              </option>
            ))}
          </select>
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
            onClick={openCreateRiskModal}
          >
            + Add Risk
          </button>
          <button
            className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition'
            onClick={openSuggestedRisks}
          >
            🤖 Suggest by AI
          </button>
        </div>
      </div>

      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[800px]'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Key</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Risk Name</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Type</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Status</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Severity</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Responsible</th>
                <th className='p-3 text-left text-sm font-semibold text-gray-600'>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => (
                <tr key={risk.id} className='border-b hover:bg-gray-50'>
                  <td className='p-3'>
                    <span
                      className='text-black-600 cursor-pointer hover:underline'
                      onClick={() => setSelectedRisk(risk)}
                    >
                      {risk.riskKey}
                    </span>
                  </td>
                  <td className='p-3'>
                    <span
                      className='text-black-600 cursor-pointer hover:underline'
                      onClick={() => setSelectedRisk(risk)}
                    >
                      {risk.title}
                    </span>
                  </td>
                  <td className='p-3'>
                    <select
                      className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      value={risk.type}
                      onChange={async (e) => {
                        try {
                          await updateRiskType({
                            id: risk.id,
                            type: e.target.value,
                            createdBy: accountId,
                          }).unwrap();
                          refetch();
                        } catch (err) {
                          console.error('Failed to update risk type:', err);
                        }
                      }}
                    >
                      {riskTypes.map((type: any) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='p-3'>
                    <RiskStatusDropdown
                      status={risk.status}
                      onChange={async (newStatus) => {
                        try {
                          await updateRiskStatus({
                            id: risk.id,
                            status: newStatus,
                            createdBy: accountId,
                          }).unwrap();
                          refetch();
                        } catch (err) {
                          console.error('Failed to update status:', err);
                        }
                      }}
                    />
                  </td>
                  <td className='p-3'>
                    <Severity status={risk.severityLevel} />
                  </td>
                  <td className='p-3 flex items-center space-x-2'>
                    {risk.responsibleId ? (
                      risk.responsiblePicture ? (
                        <img
                          src={risk.responsiblePicture}
                          alt='avatar'
                          className='w-6 h-6 rounded-full'
                        />
                      ) : (
                        <div className='w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold'>
                          {getInitials(risk.responsibleFullName || risk.responsibleUserName)}
                        </div>
                      )
                    ) : (
                      <span className='text-gray-500 text-sm'>No Assignee</span>
                    )}
                    <ResponsibleDropdown
                      assignees={assignees}
                      selectedId={risk.responsibleId}
                      onChange={async (newId) => {
                        try {
                          await updateResponsible({
                            id: risk.id,
                            responsibleId: newId,
                            createdBy: accountId,
                          }).unwrap();
                          refetch();
                        } catch (err) {
                          console.error('Failed to update responsible:', err);
                        }
                      }}
                    />
                  </td>
                  <td className='p-3'>
                    <input
                      type='date'
                      value={risk.dueDate?.split('T')[0] || ''}
                      onChange={async (e) => {
                        const newDate = e.target.value + 'T00:00:00Z';
                        try {
                          await updateRiskDueDate({
                            id: risk.id,
                            dueDate: newDate,
                            createdBy: accountId,
                          }).unwrap();
                          refetch();
                        } catch (err) {
                          console.error('Failed to update due date:', err);
                        }
                      }}
                      className={`p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDueClass(
                        risk.dueDate?.split('T')[0]
                      )}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRisk && (
        <RiskDetail
          risk={selectedRisk}
          onClose={() => {
            setSelectedRisk(null);
            refetch();
          }}
        />
      )}
      {showCreateModal && (
        <ManualRiskModal onClose={closeCreateRiskModal} onSave={handleSaveRisk} />
      )}
      {showSuggestedModal && (
        <SuggestedRisksModal
          onClose={closeSuggestedRisks}
          onApprove={handleApproveSuggestedRisk}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default Risk;