// import React from 'react';

// const Report = () => {
//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Project Reports</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* Sample report cards */}
//         <div className="bg-white rounded-2xl shadow p-4">
//           <h2 className="text-lg font-semibold">Monthly Progress</h2>
//           <p className="text-sm text-gray-500 mt-1">July 2025</p>
//           <p className="text-3xl font-bold text-green-600 mt-4">+18%</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow p-4">
//           <h2 className="text-lg font-semibold">Overdue Tasks</h2>
//           <p className="text-sm text-gray-500 mt-1">Across all projects</p>
//           <p className="text-3xl font-bold text-red-500 mt-4">12</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow p-4">
//           <h2 className="text-lg font-semibold">Budget Variance</h2>
//           <p className="text-sm text-gray-500 mt-1">This quarter</p>
//           <p className="text-3xl font-bold text-yellow-600 mt-4">- $5,200</p>
//         </div>
//       </div>

//       {/* Placeholder for detailed components */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Detailed Reports</h2>
//         <div className="bg-gray-50 border rounded-lg p-6 text-gray-500">
//           Add graphs, tables or filters here (e.g., Gantt changes, workload history, etc.)
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Report;

// import React, { useRef } from 'react';
// import { useGetProjectStatusQuery } from '../../../services/adminApi';
// import type { ProjectStatus } from '../../../services/adminApi';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const Report = () => {
//   const { data, isLoading } = useGetProjectStatusQuery();
//   console.log('Project status data:', data);
//   const reportRef = useRef<HTMLDivElement>(null);

//   const handleExportPDF = async () => {
//     if (reportRef.current) {
//       const input = reportRef.current;
//       const canvas = await html2canvas(input, { scale: 2 });
//       const imgData = canvas.toDataURL('image/png');

//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       const imgProps = pdf.getImageProperties(imgData);
//       const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
//       heightLeft -= pdfHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
//         heightLeft -= pdfHeight;
//       }

//       pdf.save('project-status-report.pdf');
//     }
//   };

//   return (
//     <div className='p-6 space-y-6'>
//       <div className='flex justify-between items-center'>
//         <h1 className='text-2xl font-bold'>Project Status Report</h1>
//         <button
//           onClick={handleExportPDF}
//           className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl'
//         >
//           Export PDF
//         </button>
//       </div>

//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <div ref={reportRef} className='space-y-8'>
//           {Array.isArray(data) &&
//             data.map((project: ProjectStatus) => (
//               <div key={project.projectId} className='bg-white rounded-2xl shadow p-6'>
//                 <div className='mb-4'>
//                   <h2 className='text-xl font-semibold text-gray-800'>
//                     {project.projectName} ({project.projectKey})
//                   </h2>
//                   <p className='text-sm text-gray-500'>Project Manager: {project.projectManager}</p>
//                 </div>

//                 <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700'>
//                   <div>
//                     <p className='font-medium'>SPI</p>
//                     <p className={project.spi < 1 ? 'text-red-600' : 'text-green-600'}>
//                       {project.spi.toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className='font-medium'>CPI</p>
//                     <p className={project.cpi < 1 ? 'text-red-600' : 'text-green-600'}>
//                       {project.cpi.toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className='font-medium'>Progress</p>
//                     <p>{project.progress.toFixed(1)}%</p>
//                   </div>
//                   <div>
//                     <p className='font-medium'>Tasks Completed</p>
//                     <p>
//                       {project.completedTasks} / {project.totalTasks}
//                     </p>
//                   </div>
//                   <div>
//                     <p className='font-medium'>Overdue Tasks</p>
//                     <p className={project.overdueTasks > 0 ? 'text-red-600' : ''}>
//                       {project.overdueTasks}
//                     </p>
//                   </div>
//                   <div>
//                     <p className='font-medium'>Cost</p>
//                     <p>
//                       ${project.actualCost.toLocaleString()} /{' '}
//                       <span className='text-gray-500'>${project.budget.toLocaleString()}</span>
//                     </p>
//                     <p className='text-sm text-gray-500'>
//                       Remaining: ${project.remainingBudget.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Milestone list */}
//                 <div className='mt-6'>
//                   <p className='font-semibold mb-2'>Milestones</p>
//                   <ul className='space-y-2'>
//                     {project.milestones.map((m, idx) => (
//                       <li key={idx} className='flex justify-between text-sm border-b pb-1'>
//                         <span>{m.name}</span>
//                         <span className='text-gray-500'>
//                           {m.status} ({m.startDate} → {m.endDate})
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className='mt-4 text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md'>
//                   ⚠️ Key Risk: No data available yet
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Report;

import React, { useRef, useState } from 'react';
import { useGetProjectStatusQuery } from '../../../services/adminApi';
import type { ProjectStatus } from '../../../services/adminApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Report = () => {
  const { data, isLoading } = useGetProjectStatusQuery();
  const projectRefs = useRef<HTMLDivElement[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < projectRefs.current.length; i++) {
      const ref = projectRefs.current[i];
      if (ref) {
        const canvas = await html2canvas(ref, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      }
    }

    pdf.save('project-status-report.pdf');
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Project Status Report</h1>
        {/* <button
          onClick={handleExportPDF}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl'
        >
          Export PDF
        </button> */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`px-4 py-2 rounded-xl text-white ${
            isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className='p-6 space-y-6'>
        <h1 className='text-2xl font-bold'>Project Reports</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Sample report cards */}
          <div className='bg-white rounded-2xl shadow p-4'>
            <h2 className='text-lg font-semibold'>Monthly Progress</h2>
            <p className='text-sm text-gray-500 mt-1'>July 2025</p>
            <p className='text-3xl font-bold text-green-600 mt-4'>+18%</p>
          </div>

          <div className='bg-white rounded-2xl shadow p-4'>
            <h2 className='text-lg font-semibold'>Overdue Tasks</h2>
            <p className='text-sm text-gray-500 mt-1'>Across all projects</p>
            <p className='text-3xl font-bold text-red-500 mt-4'>12</p>
          </div>

          <div className='bg-white rounded-2xl shadow p-4'>
            <h2 className='text-lg font-semibold'>Budget Variance</h2>
            <p className='text-sm text-gray-500 mt-1'>This quarter</p>
            <p className='text-3xl font-bold text-yellow-600 mt-4'>- $5,200</p>
          </div>
        </div>

        {/* <div className='mt-8'> */}
        <h2 className='text-xl font-semibold mb-4'>Detailed Reports</h2>
        {/* <div className='bg-gray-50 border rounded-lg p-6 text-gray-500'>
            Add graphs, tables or filters here (e.g., Gantt changes, workload history, etc.)
          </div> */}
        {/* </div> */}
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className='space-y-8'>
          {Array.isArray(data) &&
            data.map((project: ProjectStatus, idx) => (
              <div
                key={project.projectId}
                ref={(el) => {
                  projectRefs.current[idx] = el!;
                }}
                className='bg-white rounded-2xl shadow p-6'
              >
                <div className='mb-4'>
                  <h2 className='text-xl font-semibold text-gray-800'>
                    {project.projectName} ({project.projectKey})
                  </h2>
                  <p className='text-sm text-gray-500'>Project Manager: {project.projectManager}</p>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700'>
                  <div>
                    <p className='font-medium'>SPI</p>
                    <p className={project.spi < 1 ? 'text-red-600' : 'text-green-600'}>
                      {project.spi.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>CPI</p>
                    <p className={project.cpi < 1 ? 'text-red-600' : 'text-green-600'}>
                      {project.cpi.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>Progress</p>
                    <p>{project.progress.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className='font-medium'>Tasks Completed</p>
                    <p>
                      {project.completedTasks} / {project.totalTasks}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>Overdue Tasks</p>
                    <p className={project.overdueTasks > 0 ? 'text-red-600' : ''}>
                      {project.overdueTasks}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>Cost</p>
                    <p>
                      ${project.actualCost.toLocaleString()} /{' '}
                      <span className='text-gray-500'>${project.budget.toLocaleString()}</span>
                    </p>
                    <p className='text-sm text-gray-500'>
                      Remaining: ${project.remainingBudget.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className='mt-6'>
                  <p className='font-semibold mb-2'>Milestones</p>
                  <ul className='space-y-2'>
                    {project.milestones.map((m, idx) => (
                      <li key={idx} className='flex justify-between text-sm border-b pb-1'>
                        <span>{m.name}</span>
                        <span className='text-gray-500'>
                          {m.status} ({m.startDate} → {m.endDate})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='mt-4 text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md'>
                  ⚠️ Key Risk: No data available yet
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Report;
