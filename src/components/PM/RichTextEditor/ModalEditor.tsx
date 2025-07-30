import { useGetProjectsByAccountQuery } from '../../../services/accountApi';
import { useAuth } from '../../../services/AuthContext';

const ModalEditor = ({
  onClose,
  onSelectProject,
}: {
  onClose: () => void;
  onSelectProject: (projectId: number) => void;
}) => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useGetProjectsByAccountQuery(user?.accessToken || '');
  const projects = data?.data || [];
  console.log('Projects:', projects);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4 text-center'>Chèn Gantt Chart của Project</h2>

        {isLoading && <p>Loading...</p>}
        {isError && <p className='text-red-500'>Lỗi khi tải dự án</p>}

        <ul className='space-y-2 max-h-80 overflow-y-auto'>
          {projects.map((project) => (
            <li key={project.projectId}>
              <button
                className='w-full px-4 py-2 text-left border rounded hover:bg-gray-100'
                onClick={() => onSelectProject(project.projectId)}
              >
                {project.projectName}
              </button>
            </li>
          ))}
        </ul>

        <div className='text-center mt-6'>
          <button
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm'
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditor;
// import { useGetProjectsByAccountQuery } from '../../../services/accountApi';
// import { useAuth } from '../../../services/AuthContext';

// const ModalEditor = ({
//   onClose,
//   onSelectProject,
// }: {
//   onClose: () => void;
//   onSelectProject: (projectId: number) => void;
// }) => {
//   const { user } = useAuth();
//   const { data, isLoading, isError } = useGetProjectsByAccountQuery(user?.accessToken || '');
//   const projects = data?.data || [];
// console.log('Projects:', projects);

//  return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//         <h2 className="text-xl font-bold mb-4 text-center">Chèn Gantt Chart của Project</h2>

//         {isLoading && <p>Loading...</p>}
//         {isError && <p className="text-red-500">Lỗi khi tải dự án</p>}

//         <ul className="space-y-2 max-h-80 overflow-y-auto">
//           {projects.map((project) => (
//             <li key={project.projectId}>
//               <button
//                 className="w-full px-4 py-2 text-left border rounded hover:bg-gray-100"
//                 onClick={() => onSelectProject(project.projectKey)}
//               >
//                 {project.projectName}
//               </button>
//             </li>
//           ))}
//         </ul>

//         <div className="text-center mt-6">
//           <button
//             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
//             onClick={onClose}
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ModalEditor;
