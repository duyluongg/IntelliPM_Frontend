import React, { Fragment, useState } from 'react';
import {
  FileText,
  Table,
  Clock,
  Presentation, // Icon này khá giống "Board values"
  KanbanSquare,
  X, // Icon cho "Board"
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  action?: () => void; // ✅ Thêm hành động tùy chọn cho mỗi mục
}

interface SideMenuProps {
  onInsertTable?: () => void; // ✅ THÊM VÀO ĐÂY

  onSelectTemplate: (html: string) => void;
}

const templates = {
  // Đã xoá các icon emoji khỏi các tiêu đề h2
  'to-do-list': `
  <h1 style="color: #6C6C6C;">Name your to-do list</h1>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #000000;">Today</span>
    </span>
  </h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Add a task for today and turn it into an item on your board</p>
    </li>
  </ul>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #000000;">Priorities for the week</span>
    </span>
  </h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Add a task, use '@' to mention someone</p>
    </li>
  </ul>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #000000;">Upcoming tasks</span>
    </span>
  </h2>
  
  <h3 class="task-project-header">Project 1</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>List</p>
    </li>
  </ul>

  <h3 class="task-project-header">Project 2</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>or type '/board' to insert a board here</p>
    </li>
  </ul>
`,

  // Template này không chứa emoji, không cần thay đổi.
  'project-plan': `
  <h1>Project Plan: [Project Name]</h1>
  <p><strong>Start Date:</strong> [Date]</p>
  <p><strong>Expected End Date:</strong> [Date]</p>
  <p><strong>Main Responsible Person:</strong> [Name]</p>

  <h2>1. Project Objectives</h2>
  <p>Clearly describe the main goals of this project. Make sure they are SMART (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
  <ul>
    <li>Objective 1:</li>
    <li>Objective 2:</li>
    <li>Objective 3:</li>
  </ul>

  <h2>2. Project Scope</h2>
  <p>Define the boundaries and limitations of the project. List what is included and what is excluded.</p>
  <ul>
    <li><strong>Included:</strong></li>
    <li><strong>Excluded:</strong></li>
  </ul>

  <h2>3. Timeline & Phases</h2>
  <table>
    <thead>
      <tr>
        <th>Phase</th>
        <th>Description</th>
        <th>Start Date</th>
        <th>Expected End Date</th>
        <th>Responsible Person</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Initiation</td><td></td><td></td><td></td><td></td></tr>
      <tr><td>Planning</td><td></td><td></td><td></td><td></td></tr>
      <tr><td>Execution</td><td></td><td></td><td></td><td></td></tr>
      <tr><td>Monitoring & Evaluation</td><td></td><td></td><td></td><td></td></tr>
      <tr><td>Closure</td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <h2>4. Resources</h2>
  <p>List all the resources required for the project (human resources, budget, tools, materials).</p>
  <ul>
    <li>Human resources:</li>
    <li>Budget:</li>
    <li>Tools:</li>
  </ul>

  <h2>5. Risks & Mitigation</h2>
  <p>Identify potential risks and provide mitigation plans for each.</p>
  <ul>
    <li>Risk 1: [Description] – Solution: [Mitigation plan]</li>
    <li>Risk 2: [Description] – Solution: [Mitigation plan]</li>
  </ul>

  <h2>6. Stakeholders</h2>
  <p>List key stakeholders and their roles in the project.</p>
  <ul>
    <li>[Name / Position]: [Role]</li>
  </ul>
`,

  // Đã xoá các icon emoji khỏi các tiêu đề h1 và h2
  'feature-specs': `
  <h1>Feature Specification: [Feature Name]</h1>
  <p><strong>Project:</strong> [Project Name]</p>
  <p><strong>Owner:</strong> [Person in charge]</p>
  <p><strong>Date:</strong> [Date]</p>

  <h2>1. Overview</h2>
  <p>Briefly describe the feature, its usage context, and the reason for building it.</p>

  <h2>2. Goals</h2>
  <ul>
    <li>What problem does it solve?</li>
    <li>What value does it bring to users?</li>
    <li>Success metrics (KPIs)</li>
  </ul>

  <h2>3. Feature Scope</h2>
  <ul>
    <li>Main functions</li>
    <li>Secondary functions</li>
    <li>What is excluded</li>
  </ul>

  <h2>4. Target Users</h2>
  <p>Who will use this feature (roles, user groups, etc.)?</p>

  <h2>5. User Flow</h2>
  <ol>
    <li>Step 1: [Description]</li>
    <li>Step 2: [Description]</li>
    <li>...</li>
  </ol>

  <h2>6. Wireframe / Mockup</h2>
  <p>Attach design link or image.</p>

  <h2>7. Test Cases</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Test Scenario</th>
        <th>Input</th>
        <th>Expected Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>User clicks "Save" button</td>
        <td>Valid form</td>
        <td>Success message is displayed</td>
      </tr>
    </tbody>
  </table>

  <h2>8. Constraints & Notes</h2>
  <ul>
    <li>Performance, max latency?</li>
    <li>Device compatibility?</li>
    <li>Security / Access control requirements?</li>
  </ul>

  <h2>9. Completion Checklist</h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false"><p>Requirements approved</p></li>
    <li data-type="taskItem" data-checked="false"><p>Mockup completed</p></li>
    <li data-type="taskItem" data-checked="false"><p>Test cases written</p></li>
    <li data-type="taskItem" data-checked="false"><p>Implemented and reviewed</p></li>
  </ul>
`,

  // Đã xoá các icon emoji khỏi các tiêu đề h2
  'meeting-note': `
  <h1>Meeting Notes: [Meeting Topic]</h1>
  <p><strong>Date:</strong> [Date] | <strong>Time:</strong> [Time] | <strong>Location:</strong> [Location]</p>

  <h2>Participants</h2>
  <ul>
    <li>[Participant 1]</li>
    <li>[Participant 2]</li>
  </ul>

  <h2>Meeting Agenda</h2>
  <ol>
    <li>Topic 1: [Description]</li>
    <li>Topic 2: [Description]</li>
  </ol>

  <h2>Discussion & Notes</h2>
  <p>Capture key points, ideas, and discussion notes here...</p>

  <h2>Action Items</h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Task 1 - Assigned to: @[Name] - Due: [Date]</p>
    </li>
    <li data-type="taskItem" data-checked="false">
      <p>Task 2 - Assigned to: @[Name] - Due: [Date]</p>
    </li>
  </ul>

  <h2>Key Decisions</h2>
  <ul>
    <li>Decision 1: [Description]</li>
  </ul>
`,
};


// Component để hiển thị danh sách
const SideMenu: React.FC<SideMenuProps> = ({ onSelectTemplate, onInsertTable }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ✅ Hàm xử lý khi một template trong modal được chọn
  const handleTemplateSelect = (templateKey: string) => {
    onSelectTemplate(templates[templateKey as keyof typeof templates]);
    closeModal(); 
  };

  // ✅ Cập nhật dữ liệu menu để có hành động mở modal
  const menuItems: MenuItem[] = [
    { label: 'Templates', icon: FileText, action: openModal }, // Hành động là mở modal
    {
      label: 'Table',
      icon: Table,
      action: () => {
        onInsertTable?.();
      },
    },
  ];

  // Hàm để chuyển đổi key thành tên hiển thị đẹp hơn
  const formatTemplateName = (key: string) => {
    return key
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Fragment>
      {/* --- Menu chính --- */}
      <div className=' rounded-lg  p-2 font-sans shadow-md'>
        <ul className='space-y-1'>
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={item.action} // ✅ Gọi hàm action khi nhấn
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              >
                <item.icon className='h-5 w-5' />
                <span className='text-sm font-medium'>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Modal Chọn Template --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as='div' className='relative z-20' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900 flex justify-between items-center'
                  >
                    <span>Choose a Template</span>
                    <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-200'>
                      <X className='w-5 h-5' />
                    </button>
                  </Dialog.Title>

                  {/* ✅ Lưới hiển thị các template */}
                  <div className='mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {Object.keys(templates).map((key) => (
                      <div
                        key={key}
                        onClick={() => handleTemplateSelect(key)}
                        className='cursor-pointer rounded-lg border bg-slate-50 hover:border-blue-500 hover:shadow-lg transition-all'
                      >
                        <h4 className='font-semibold p-3 border-b bg-white rounded-t-lg'>
                          {formatTemplateName(key)}
                        </h4>
                        {/* Khu vực xem trước, dùng dangerouslySetInnerHTML */}
                        <div
                          className='p-3 h-64 overflow-y-auto text-xs prose prose-sm max-w-none'
                          dangerouslySetInnerHTML={{
                            __html: templates[key as keyof typeof templates],
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
};

export default SideMenu;
