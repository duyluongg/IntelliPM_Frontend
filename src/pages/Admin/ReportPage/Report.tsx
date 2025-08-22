// import React, { useRef, useState } from 'react';
// import { useGetProjectStatusQuery } from '../../../services/adminApi';
// import type { ProjectStatus } from '../../../services/adminApi';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const Report = () => {
//   const { data, isLoading } = useGetProjectStatusQuery();
//   const projectRefs = useRef<HTMLDivElement[]>([]);
//   const [isExporting, setIsExporting] = useState(false);

//   const handleExportPDF = async () => {
//     setIsExporting(true);
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     for (let i = 0; i < projectRefs.current.length; i++) {
//       const ref = projectRefs.current[i];
//       if (ref) {
//         const canvas = await html2canvas(ref, { scale: 2 });
//         const imgData = canvas.toDataURL('image/png');
//         const imgProps = pdf.getImageProperties(imgData);
//         const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//         if (i > 0) pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
//       }
//     }

//     pdf.save('project-status-report.pdf');
//   };

//   return (
//     <div className='p-6 space-y-6'>
//       <div className='flex justify-between items-center'>
//         <h1 className='text-2xl font-bold'>Project Status Report</h1>
//         {/* <button
//           onClick={handleExportPDF}
//           className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl'
//         >
//           Export PDF
//         </button> */}
//         <button
//           onClick={handleExportPDF}
//           disabled={isExporting}
//           className={`px-4 py-2 rounded-xl text-white ${
//             isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {isExporting ? 'Exporting...' : 'Export PDF'}
//         </button>
//       </div>

//       <div className='p-6 space-y-6'>
//         <h1 className='text-2xl font-bold'>Project Reports</h1>

//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//           {/* Sample report cards */}
//           <div className='bg-white rounded-2xl shadow p-4'>
//             <h2 className='text-lg font-semibold'>Monthly Progress</h2>
//             <p className='text-sm text-gray-500 mt-1'>July 2025</p>
//             <p className='text-3xl font-bold text-green-600 mt-4'>+18%</p>
//           </div>

//           <div className='bg-white rounded-2xl shadow p-4'>
//             <h2 className='text-lg font-semibold'>Overdue Tasks</h2>
//             <p className='text-sm text-gray-500 mt-1'>Across all projects</p>
//             <p className='text-3xl font-bold text-red-500 mt-4'>12</p>
//           </div>

//           <div className='bg-white rounded-2xl shadow p-4'>
//             <h2 className='text-lg font-semibold'>Budget Variance</h2>
//             <p className='text-sm text-gray-500 mt-1'>This quarter</p>
//             <p className='text-3xl font-bold text-yellow-600 mt-4'>- $5,200</p>
//           </div>
//         </div>

//         {/* <div className='mt-8'> */}
//         <h2 className='text-xl font-semibold mb-4'>Detailed Reports</h2>
//         {/* <div className='bg-gray-50 border rounded-lg p-6 text-gray-500'>
//             Add graphs, tables or filters here (e.g., Gantt changes, workload history, etc.)
//           </div> */}
//         {/* </div> */}
//       </div>
//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className='space-y-8'>
//           {Array.isArray(data) &&
//             data.map((project: ProjectStatus, idx) => (
//               <div
//                 key={project.projectId}
//                 ref={(el) => {
//                   projectRefs.current[idx] = el!;
//                 }}
//                 className='bg-white rounded-2xl shadow p-6'
//               >
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

// import React, { useRef, useState } from 'react';
// import { useGetProjectManagerReportsQuery } from '../../../services/adminApi';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   BarElement,
//   CategoryScale,
//   LinearScale,
// } from 'chart.js';
// import { Pie, Bar } from 'react-chartjs-2';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { FileDown } from 'lucide-react';

// ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// const Report = () => {
//   const { data: reports, isLoading } = useGetProjectManagerReportsQuery();
//   const reportRefs = useRef<HTMLDivElement[]>([]);
//   const [isExporting, setIsExporting] = useState(false);

//   const handleExportPDF = async () => {
//     setIsExporting(true);
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     for (let i = 0; i < reportRefs.current.length; i++) {
//       const ref = reportRefs.current[i];
//       if (ref) {
//         const canvas = await html2canvas(ref, { scale: 2 });
//         const imgData = canvas.toDataURL('image/png');
//         const imgProps = pdf.getImageProperties(imgData);
//         const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//         if (i > 0) pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
//       }
//     }

//     pdf.save('project-manager-report.pdf');
//     setIsExporting(false);
//   };

//   // Chart data for total projects per manager
//   const projectChartData = {
//     labels: reports?.map((r) => r.projectManagerName) || [],
//     datasets: [
//       {
//         label: 'Total Projects',
//         data: reports?.map((r) => r.totalProjects) || [],
//         backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
//       },
//     ],
//   };

//   // Chart data for overdue tasks
//   // const overdueChartData = {
//   //   labels: reports?.map((r) => r.projectManagerName) || [],
//   //   datasets: [
//   //     {
//   //       label: 'Overdue Tasks',
//   //       data: reports?.map((r) => r.overdueTasks) || [],
//   //       backgroundColor: '#ef4444',
//   //     },
//   //   ],
//   // };

//   const overdueChartData = {
//     labels: reports?.map((r) => r.projectManagerName) || [],
//     datasets: [
//       {
//         label: 'Overdue Tasks',
//         data: reports?.map((r) => r.overdueTasks) || [],
//         backgroundColor: '#ef4444',
//         maxBarThickness: 40, // Limit maximum bar width
//       },
//     ],
//   };

//   // Chart options for overdue tasks
//   const overdueChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       tooltip: {
//         enabled: true,
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           maxRotation: 45, // Rotate labels for better readability
//           minRotation: 45,
//           autoSkip: true, // Skip labels if they overlap
//           maxTicksLimit: 10, // Limit number of ticks to prevent overcrowding
//         },
//       },
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Number of Overdue Tasks',
//         },
//       },
//     },
//   };

//   return (
//     <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
//       <div className='flex justify-between items-center'>
//         <h1 className='text-3xl font-bold text-gray-800'>Project Manager Reports</h1>
//         <button
//           onClick={handleExportPDF}
//           disabled={isExporting}
//           className={`flex items-center px-4 py-2 rounded-xl text-white ${
//             isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           <FileDown className='w-5 h-5 mr-2' />
//           {isExporting ? 'Exporting...' : 'Export PDF'}
//         </button>
//       </div>

//       {isLoading ? (
//         <div className='text-center text-gray-500'>Loading...</div>
//       ) : (
//         <>
//           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//             {/* <div className='bg-white rounded-2xl shadow p-6'>
//               <h2 className='text-lg font-semibold mb-4'>Projects by Manager</h2>
//               <Pie
//                 data={projectChartData}
//                 options={{ responsive: true, maintainAspectRatio: false }}
//               />
//             </div> */}
//             {/* <div className='bg-white rounded-2xl shadow p-6'>
//               <h2 className='text-lg font-semibold mb-4'>Overdue Tasks by Manager</h2>
//               <Bar data={overdueChartData} options={overdueChartOptions} />
//             </div> */}
//           </div>

//           <div className='space-y-8'>
//             {reports?.map((report, idx) => (
//               <div
//                 key={report.projectManagerId}
//                 //ref={(el) => (reportRefs.current[idx] = el!)}
//                 ref={(el) => {
//                   reportRefs.current[idx] = el!;
//                 }}
//                 className='bg-white rounded-2xl shadow p-6'
//               >
//                 <div className='mb-4'>
//                   <h2 className='text-xl font-semibold text-gray-800'>
//                     {report.projectManagerName}
//                   </h2>
//                   <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 mt-2'>
//                     <div>
//                       <p className='font-medium'>Total Projects</p>
//                       <p>{report.totalProjects}</p>
//                     </div>
//                     <div>
//                       <p className='font-medium'>Active Projects</p>
//                       <p>{report.activeProjects}</p>
//                     </div>
//                     <div>
//                       <p className='font-medium'>Overdue Tasks</p>
//                       <p className={report.overdueTasks > 0 ? 'text-red-600' : ''}>
//                         {report.overdueTasks}
//                       </p>
//                     </div>
//                     <div>
//                       <p className='font-medium'>Total Budget</p>
//                       <p>${report.totalBudget.toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className='mt-4'>
//                   <h3 className='font-semibold mb-2'>Projects</h3>
//                   <div className='overflow-x-auto'>
//                     <table className='w-full text-sm text-gray-700'>
//                       <thead>
//                         <tr className='bg-gray-100'>
//                           <th className='p-2 text-left'>Project</th>
//                           <th className='p-2 text-left'>Status</th>
//                           <th className='p-2 text-left'>SPI</th>
//                           <th className='p-2 text-left'>CPI</th>
//                           <th className='p-2 text-left'>Progress</th>
//                           <th className='p-2 text-left'>Tasks</th>
//                           <th className='p-2 text-left'>Overdue</th>
//                           <th className='p-2 text-left'>Budget</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {report.projects.map((project) => (
//                           <tr key={project.projectId} className='border-b'>
//                             <td className='p-2'>
//                               {project.projectName} ({project.projectKey})
//                             </td>
//                             <td className='p-2'>{project.status}</td>
//                             <td
//                               className={
//                                 project.spi && project.spi < 1 ? 'text-red-600' : 'text-green-600'
//                               }
//                             >
//                               {project.spi?.toFixed(2) ?? 'N/A'}
//                             </td>
//                             <td
//                               className={
//                                 project.cpi && project.cpi < 1 ? 'text-red-600' : 'text-green-600'
//                               }
//                             >
//                               {project.cpi?.toFixed(2) ?? 'N/A'}
//                             </td>
//                             <td className='p-2'>{project.progress.toFixed(1)}%</td>
//                             <td className='p-2'>
//                               {project.completedTasks} / {project.totalTasks}
//                             </td>
//                             <td className={project.overdueTasks > 0 ? 'text-red-600' : ''}>
//                               {project.overdueTasks}
//                             </td>
//                             <td className='p-2'>
//                               ${project.actualCost.toLocaleString()} /{' '}
//                               <span className='text-gray-500'>
//                                 ${project.budget.toLocaleString()}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 <div className='mt-6'>
//                   <h3 className='font-semibold mb-2'>Milestones</h3>
//                   {report.projects.map((project) => (
//                     <div key={project.projectId} className='mb-4'>
//                       <h4 className='text-sm font-medium'>
//                         {project.projectName} ({project.projectKey})
//                       </h4>
//                       <ul className='space-y-2 mt-2'>
//                         {project.milestones.map((m) => (
//                           <li
//                             key={m.milestoneId}
//                             className='flex justify-between text-sm border-b pb-1'
//                           >
//                             <span>
//                               {m.name} ({m.key})
//                             </span>
//                             <span className='text-gray-500'>
//                               {m.status} (
//                               {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A'} →{' '}
//                               {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A'})
//                             </span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Report;

import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useGetProjectManagerReportsQuery } from '../../../services/adminApi';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Report = () => {
  const { data: reports, isLoading, refetch } = useGetProjectManagerReportsQuery();
  const reportRefs = useRef<HTMLDivElement[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    useEffect(() => {
      refetch();
    }, [refetch]);

    for (let i = 0; i < reportRefs.current.length; i++) {
      const ref = reportRefs.current[i];
      if (ref) {
        const canvas = await html2canvas(ref, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      }
    }

    pdf.save('project-manager-report.pdf');
    setIsExporting(false);
  };

  // Chart data for total projects per manager
  const projectChartData = {
    labels: reports?.map((r) => r.projectManagerName) || [],
    datasets: [
      {
        label: 'Total Projects',
        data: reports?.map((r) => r.totalProjects) || [],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  // Chart options for total projects
  const projectChartOptions = {
    responsive: true,
    maintainAspectRatio: true, // Ensure square aspect ratio
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // Chart data for overdue tasks
  const overdueChartData = {
    labels: reports?.map((r) => r.projectManagerName) || [],
    datasets: [
      {
        label: 'Overdue Tasks',
        data: reports?.map((r) => r.overdueTasks) || [],
        backgroundColor: '#ef4444',
        maxBarThickness: 20, // Smaller bar width for compact look
      },
    ],
  };

  // Chart options for overdue tasks
  const overdueChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Ensure square aspect ratio
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45, // Rotate labels for readability
          minRotation: 45,
          autoSkip: true, // Skip labels if they overlap
          maxTicksLimit: 8, // Reduced to keep chart compact
          font: {
            size: 10, // Smaller font for labels
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Overdue Tasks',
          font: { size: 12 },
        },
        ticks: {
          font: { size: 10 }, // Smaller font for y-axis
        },
      },
    },
  };

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-800'>Project Manager Reports</h1>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className={`flex items-center px-4 py-2 rounded-xl text-white ${
            isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <FileDown className='w-5 h-5 mr-2' />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {isLoading ? (
        <div className='text-center text-gray-500'>Loading...</div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white rounded-2xl shadow p-6'>
              <h2 className='text-lg font-semibold mb-4'>Projects by Manager</h2>
              <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
                <Pie data={projectChartData} options={projectChartOptions} />
              </div>
            </div>
            <div className='bg-white rounded-2xl shadow p-6'>
              <h2 className='text-lg font-semibold mb-4'>Overdue Tasks by Manager</h2>
              <div style={{ width: '300px', height: '300px', margin: '0 auto', overflowX: 'auto' }}>
                <Bar data={overdueChartData} options={overdueChartOptions} />
              </div>
            </div>
          </div>

          <div className='space-y-8'>
            {reports?.map((report, idx) => (
              <div
                key={report.projectManagerId}
                ref={(el) => {
                  reportRefs.current[idx] = el!;
                }}
                className='bg-white rounded-2xl shadow p-6'
              >
                <div className='mb-4'>
                  <h2 className='text-xl font-semibold text-gray-800'>
                    {report.projectManagerName}
                  </h2>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 mt-2'>
                    <div>
                      <p className='font-medium'>Total Projects</p>
                      <p>{report.totalProjects}</p>
                    </div>
                    <div>
                      <p className='font-medium'>Overdue Tasks</p>
                      <p className={report.overdueTasks > 0 ? 'text-red-600' : ''}>
                        {report.overdueTasks}
                      </p>
                    </div>
                    <div>
                      <p className='font-medium'>Total Budget</p>
                      <p>${report.totalBudget.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className='mt-4'>
                  <h3 className='font-semibold mb-2'>Projects</h3>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-gray-700'>
                      <thead>
                        <tr className='bg-gray-100'>
                          <th className='p-2 text-left'>Project</th>
                          <th className='p-2 text-left'>Status</th>
                          <th className='p-2 text-left'>SPI</th>
                          <th className='p-2 text-left'>CPI</th>
                          <th className='p-2 text-left'>Progress</th>
                          <th className='p-2 text-left'>Tasks</th>
                          <th className='p-2 text-left'>Overdue</th>
                          <th className='p-2 text-left'>Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.projects.map((project) => (
                          <tr key={project.projectId} className='border-b'>
                            <td className='p-2'>
                              {project.projectName} ({project.projectKey})
                            </td>
                            <td className='p-2'>{project.status}</td>
                            <td
                              className={
                                project.spi && project.spi < 1 ? 'text-red-600' : 'text-green-600'
                              }
                            >
                              {project.spi?.toFixed(2) ?? 'N/A'}
                            </td>
                            <td
                              className={
                                project.cpi && project.cpi < 1 ? 'text-red-600' : 'text-green-600'
                              }
                            >
                              {project.cpi?.toFixed(2) ?? 'N/A'}
                            </td>
                            <td className='p-2'>{project.progress.toFixed(1)}%</td>
                            <td className='p-2'>
                              {project.completedTasks} / {project.totalTasks}
                            </td>
                            <td className={project.overdueTasks > 0 ? 'text-red-600' : ''}>
                              {project.overdueTasks}
                            </td>
                            <td className='p-2'>
                              ${project.actualCost.toLocaleString()} /{' '}
                              <span className='text-gray-500'>
                                ${project.budget.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* <div className='mt-6'>
                  <h3 className='font-semibold mb-2'>Milestones</h3>
                  {report.projects.map((project) => (
                    <div key={project.projectId} className='mb-4'>
                      <h4 className='text-sm font-medium'>
                        {project.projectName} ({project.projectKey})
                      </h4>
                      <ul className='space-y-2 mt-2'>
                        {project.milestones.map((m) => (
                          <li
                            key={m.milestoneId}
                            className='flex justify-between text-sm border-b pb-1'
                          >
                            <span>
                              {m.name} ({m.key})
                            </span>
                            <span className='text-gray-500'>
                              {m.status} (
                              {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A'} →{' '}
                              {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A'})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div> */}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
