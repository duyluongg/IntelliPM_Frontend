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
  'to-do-list': `
  <h1 style="color: #6C6C6C;">Name your to do list</h1>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #F7C841;">&#128193;</span> 
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
      <span style="color: #FF9800;">&#10024;</span> 
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
      <span style="color: #9C27B0;">&#128220;</span> 
      <span style="color: #000000;">Upcoming tasks</span>
    </span>
  </h2>
  
  <h3 class="task-project-header">Name of project 1</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>List</p>
    </li>
  </ul>

  <h3 class="task-project-header">Name of project 2</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>or type '/board' to insert a board here</p>
    </li>
  </ul>
`,
  'project-plan': `
    <h1>Kế Hoạch Dự Án: [Điền Tên Dự Án]</h1>
    <p><strong>Ngày bắt đầu:</strong> [Ngày]</p>
    <p><strong>Ngày kết thúc dự kiến:</strong> [Ngày]</p>
    <p><strong>Người phụ trách chính:</strong> [Tên]</p>

    <h2>1. Mục Tiêu Dự Án</h2>
    <p>Mô tả rõ ràng các mục tiêu chính mà dự án này muốn đạt được. Đảm bảo các mục tiêu là SMART (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
    <ul>
      <li>Mục tiêu 1:</li>
      <li>Mục tiêu 2:</li>
      <li>Mục tiêu 3:</li>
    </ul>

    <h2>2. Phạm Vi Dự Án</h2>
    <p>Xác định ranh giới và giới hạn của dự án. Liệt kê những gì sẽ được bao gồm và những gì sẽ không được bao gồm.</p>
    <ul>
      <li><strong>Bao gồm:</strong></li>
      <li><strong>Không bao gồm:</strong></li>
    </ul>

    <h2>3. Lịch Trình & Giai Đoạn</h2>
    <table>
      <thead>
        <tr>
          <th>Giai đoạn</th>
          <th>Mô tả</th>
          <th>Ngày bắt đầu</th>
          <th>Ngày kết thúc dự kiến</th>
          <th>Người chịu trách nhiệm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Khởi tạo</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Lập kế hoạch</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Thực hiện</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Kiểm tra & Đánh giá</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Kết thúc</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <h2>4. Nguồn Lực</h2>
    <p>Liệt kê các nguồn lực cần thiết cho dự án (nhân lực, tài chính, công cụ, vật liệu).</p>
    <ul>
      <li>Nhân lực:</li>
      <li>Ngân sách:</li>
      <li>Công cụ:</li>
    </ul>

    <h2>5. Rủi Ro & Giảm Thiểu</h2>
    <p>Xác định các rủi ro tiềm ẩn và kế hoạch giảm thiểu cho từng rủi ro.</p>
    <ul>
      <li>Rủi ro 1: [Mô tả] - Giải pháp: [Kế hoạch giảm thiểu]</li>
      <li>Rủi ro 2: [Mô tả] - Giải pháp: [Kế hoạch giảm thiểu]</li>
    </ul>

    <h2>6. Các Bên Liên Quan</h2>
    <p>Liệt kê các bên liên quan chính và vai trò của họ trong dự án.</p>
    <ul>
      <li>[Tên / Chức vụ]: [Vai trò]</li>
    </ul>
  `,
  'feature-specs': `
  <h1>📄 Feature Specification: [Tên Tính Năng]</h1>
  <p><strong>Project:</strong> [Tên Dự Án]</p>
  <p><strong>Owner:</strong> [Tên người phụ trách]</p>
  <p><strong>Date:</strong> [Ngày]</p>

  <h2>1. 📝 Mô tả tổng quan</h2>
  <p>Mô tả ngắn gọn về tính năng, bối cảnh sử dụng, và lý do xây dựng.</p>

  <h2>2. 🎯 Mục tiêu</h2>
  <ul>
    <li>Giải quyết vấn đề gì?</li>
    <li>Giá trị mang lại cho người dùng?</li>
    <li>Chỉ số thành công (KPIs)</li>
  </ul>

  <h2>3. 🧩 Phạm vi tính năng</h2>
  <ul>
    <li>Chức năng chính</li>
    <li>Chức năng phụ</li>
    <li>Không bao gồm gì</li>
  </ul>

  <h2>4. 👤 Đối tượng sử dụng</h2>
  <p>Ai là người sẽ dùng tính năng này (vai trò, nhóm người dùng...)?</p>

  <h2>5. 🔄 Luồng người dùng (User Flow)</h2>
  <ol>
    <li>Bước 1: [Mô tả]</li>
    <li>Bước 2: [Mô tả]</li>
    <li>...</li>
  </ol>

  <h2>6. 🖼️ Wireframe / Mockup</h2>
  <p>Gắn liên kết tới thiết kế hoặc hình ảnh.</p>

  <h2>7. 🧪 Test Cases</h2>
  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Tình huống kiểm thử</th>
        <th>Input</th>
        <th>Kết quả mong đợi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Người dùng nhấn nút "Lưu"</td>
        <td>Form hợp lệ</td>
        <td>Hiển thị thông báo thành công</td>
      </tr>
    </tbody>
  </table>

  <h2>8. 🚧 Ràng buộc & Lưu ý</h2>
  <ul>
    <li>Hiệu suất, độ trễ tối đa?</li>
    <li>Tương thích với thiết bị nào?</li>
    <li>Yêu cầu bảo mật / phân quyền?</li>
  </ul>

  <h2>9. ✅ Checklist hoàn thành</h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false"><p>Đã duyệt yêu cầu</p></li>
    <li data-type="taskItem" data-checked="false"><p>Hoàn thành mockup</p></li>
    <li data-type="taskItem" data-checked="false"><p>Viết test case</p></li>
    <li data-type="taskItem" data-checked="false"><p>Triển khai và review</p></li>
  </ul>
`,
  'meeting-note': `
  <h1>Meeting Notes: [Chủ đề cuộc họp]</h1>
  <p><strong>Ngày:</strong> [Ngày] | <strong>Thời gian:</strong> [Giờ] | <strong>Địa điểm:</strong> [Địa điểm]</p>

  <h2>👥 Người tham dự</h2>
  <ul>
    <li>[Tên người tham dự 1]</li>
    <li>[Tên người tham dự 2]</li>
  </ul>

  <h2>📝 Nội dung cuộc họp (Agenda)</h2>
  <ol>
    <li>Chủ đề 1: [Mô tả]</li>
    <li>Chủ đề 2: [Mô tả]</li>
  </ol>

  <h2>💬 Thảo luận & Ghi chú</h2>
  <p>Ghi lại các điểm chính, ý tưởng và thảo luận tại đây...</p>

  <h2>✅ Các mục hành động (Action Items)</h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Nhiệm vụ 1 - Giao cho: @[Tên] - Hạn chót: [Ngày]</p>
    </li>
    <li data-type="taskItem" data-checked="false">
      <p>Nhiệm vụ 2 - Giao cho: @[Tên] - Hạn chót: [Ngày]</p>
    </li>
  </ul>

  <h2>⚖️ Các quyết định chính</h2>
  <ul>
    <li>Quyết định 1: [Mô tả]</li>
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
    closeModal(); // Đóng modal sau khi chọn
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
    { label: 'Chart', icon: Clock },
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
