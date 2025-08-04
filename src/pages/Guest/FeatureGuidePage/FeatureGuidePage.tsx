import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FeatureGuidePage.css'; // chứa animation gradient

const flows = [
  {
    id: 'flow1',
    title: 'Flow 1: Team Leader Setup',
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnUZM_rDw7yIB5w8EmaIzPJaGSg3DmZjlxcQ&s',
    steps: [
      {
        icon: '🔧',
        caption: 'Team Leader logs into the system and creates a new project.',
        hint: 'A person (Team Leader) is logging into their laptop. The screen shows a list of projects and a “Create New Project” button.',
        img: 'https://media.istockphoto.com/id/1373745245/vector/login-page-background-enter-username-and-password-ui-user-interface.jpg?s=612x612&w=0&k=20&c=lTFio2kjoTHxwlEPxLGf59_vibtvjzp4ypy-RVcQTp0='
      },
      {
        icon: '🧾',
        caption: 'Enter project info and invite team members.',
        hint: 'Form to input project details (name, description, start date). Option to invite members via email.',
        img: '/images/flow1-step2.png'
      },
      {
        icon: '🤖',
        caption: 'Choose task creation method: AI-suggested or manual.',
        hint: 'Two options: AI 🤖 (suggested from templates) or ✍️ (manual input).',
        img: '/images/flow1-step3.png'
      },
      {
        icon: '📋',
        caption: 'Add or edit task list.',
        hint: 'Task list interface with input fields, add/edit buttons. Sample tasks like “Design UI”, “Setup Repo”.',
        img: '/images/flow1-step4.png'
      },
      {
        icon: '📩',
        caption: 'Guest receives invitation and confirms participation.',
        hint: 'Guest receives email/message with a “View Project” button. Detail view with “Accept” option.',
        img: '/images/flow1-step5.png'
      },
      {
        icon: '✅',
        caption: 'Guest sees assigned tasks and notification.',
        hint: 'Task list for the guest. Notification box saying “You have a new task”.',
        img: '/images/flow1-step6.png'
      }
    ]
  },
{
  id: 'flow2',
  title: 'Flow 2: Team Member Participation',
  cover: 'data:image/jpeg;base64,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',
  steps: [
    {
      icon: '👤',
      caption: 'Team Member logs in and checks invitation.',
      hint: 'A user (Team Member) logs into the system. The screen shows a notification: “You have been invited to join a project.”',
      img: '/images/flow2-step1.png'
    },
    {
      icon: '✅',
      caption: 'Accept or reject the invitation.',
      hint: 'Two buttons: “Accept” ✅ and “Reject” ❌. If rejected, display message: “You are not authorized to access this project.”',
      img: '/images/flow2-step2.png'
    },
    {
      icon: '📄',
      caption: 'Access the project and view tasks.',
      hint: 'Project dashboard showing a task list with checkboxes, titles, and status. A “View Tasks” button is visible.',
      img: '/images/flow2-step3.png'
    },
    {
      icon: '📌',
      caption: 'Create to-do list for each task.',
      hint: 'When a task is selected, an interface opens to create a to-do list. Two options: “Manual Input” or “AI Suggestion”.',
      img: '/images/flow2-step4.png'
    },
    {
      icon: '🤖',
      caption: 'Use AI suggestions or enter manually.',
      hint: 'An AI icon processes the task and displays a sample checklist: “Review requirements”, “Make a plan”. Manual input is also allowed.',
      img: '/images/flow2-step5.png'
    },
    {
      icon: '🔔',
      caption: 'Update progress & receive notifications.',
      hint: 'Task interface displays status: “In Progress”, “Completed”. A bell icon pops up with new notifications.',
      img: '/images/flow2-step6.png'
    }
  ]
},
{
  id: 'flow3',
  title: 'Flow 3: Project Manager Monitoring',
  cover: 'https://cdn-icons-png.flaticon.com/512/1215/1215195.png',
  steps: [
    {
      icon: '🖥️',
      caption: 'Project Manager logs in and selects a project.',
      hint: 'Project Manager logs into the system and selects a specific project from a list. A “Select” button appears next to each project.',
      img: '/images/flow3-step1.png'
    },
    {
      icon: '📊',
      caption: 'Track progress and update tasks/milestones.',
      hint: 'Dashboard displays Gantt chart and milestone list. Fields for time, progress %, and estimated cost are editable.',
      img: '/images/flow3-step2.png'
    },
    {
      icon: '📈',
      caption: 'System calculates EVM and performance metrics.',
      hint: 'Dashboard auto-updates with EVM metrics: EV, AC, PV, SPI, CPI. Visual charts display project performance.',
      img: '/images/flow3-step3.png'
    },
    {
      icon: '⚠️',
      caption: 'Identify project risks and impact level.',
      hint: 'Form lists risks with selectable levels: High, Medium, Low. Option to create risks manually or use AI suggestions.',
      img: '/images/flow3-step4.png'
    },
    {
      icon: '🤖',
      caption: 'AI suggests mitigation and contingency plans.',
      hint: 'AI generates risk analysis, mitigation plan, and contingency strategy. User can review, adjust, and confirm.',
      img: '/images/flow3-step5.png'
    },
    {
      icon: '📤',
      caption: 'Export report.',
      hint: 'Interface shows export options (PDF/Excel) with a preview containing graphs and project stats.',
      img: '/images/flow3-step6.png'
    }
  ]
},
{
  id: 'flow4',
  title: 'Flow 4: Online Meeting Management',
  cover: 'https://cdn-icons-png.flaticon.com/512/3103/3103446.png',
  steps: [
    {
      icon: '🗓️',
      caption: 'Project Manager schedules a meeting.',
      hint: 'Calendar interface where the PM selects a time. System checks for conflicts and shows alerts if overlaps occur.',
      img: '/images/flow4-step1.png'
    },
    {
      icon: '📧',
      caption: 'Send meeting invitations.',
      hint: 'Email notifications sent to clients and team members, showing the meeting time. Gmail or envelope icon displayed.',
      img: '/images/flow4-step2.png'
    },
    {
      icon: '💻',
      caption: 'Conduct online meeting.',
      hint: 'Online meeting via Google Meet or Zoom. Participants are visible. “Live” or “Recording” badge on screen.',
      img: '/images/flow4-step3.png'
    },
    {
      icon: '🎥',
      caption: 'Record audio and convert to text.',
      hint: 'Meeting recording is uploaded. AI transcribes audio to text. Icons for audio-to-text conversion or Whisper API.',
      img: '/images/flow4-step4.png'
    },
    {
      icon: '🧠',
      caption: 'Generate meeting summary using GPT.',
      hint: 'AI summarizes the meeting content and generates a structured report (PDF/DOC) with key points and action items.',
      img: '/images/flow4-step5.png'
    },
    {
      icon: '✍️',
      caption: 'Review and confirm meeting minutes.',
      hint: 'Participants review the generated document. Buttons for “Send Feedback” or “Confirm”. Option to suggest edits.',
      img: '/images/flow4-step6.png'
    }
  ]
},
{
  id: 'flow5',
  title: 'Flow 5: Project Documentation Management',
  cover: 'https://cdn-icons-png.flaticon.com/512/3128/3128313.png',
  steps: [
    {
      icon: '📝',
      caption: 'Project Manager creates a new document.',
      hint: 'PM logs in, selects a project, and clicks “Create New Document”.',
      img: '/images/flow5-step1.png'
    },
    {
      icon: '🔐',
      caption: 'Set document access permissions.',
      hint: 'Form to choose between “Public” or “Private”. Icons: lock/unlock or share toggles.',
      img: '/images/flow5-step2.png'
    },
    {
      icon: '📂',
      caption: 'Choose document type and template.',
      hint: 'User selects format (Board, Table, Chart) and template (To-do list, Meeting notes, etc.).',
      img: '/images/flow5-step3.png'
    },
    {
      icon: '👤',
      caption: 'Assign owner and add content.',
      hint: 'Assign responsible person. Enter content manually or use AI suggestions.',
      img: '/images/flow5-step4.png'
    },
    {
      icon: '🤖',
      caption: 'Use AI to process content and confirm.',
      hint: 'AI processes prompt and creates a document draft. User can edit or approve before saving.',
      img: '/images/flow5-step5.png'
    },
    {
      icon: '📤',
      caption: 'Save and link document to tasks.',
      hint: 'System stores the document. Notification sent to relevant task owners.',
      img: '/images/flow5-step6.png'
    }
  ]
},
{
  id: 'flow6',
  title: 'Flow 6: Client Review & Change Request',
  cover: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
  steps: [
    {
      icon: '🧾',
      caption: 'Client reviews meeting minutes.',
      hint: 'Client sees the latest meeting transcript. Options: “Request Changes” or “No Changes”.',
      img: '/images/flow6-step1.png'
    },
    {
      icon: '✍️',
      caption: 'Submit change request to Team Leader.',
      hint: 'Client fills a change request form. Team Leader receives a notification: “You have a new request”.',
      img: '/images/flow6-step2.png'
    },
    {
      icon: '🧠',
      caption: 'Team Leader edits or uses AI to process request.',
      hint: 'Two options: edit manually ✍️ or submit to AI 🤖 for suggestion. AI analyzes and suggests action plans.',
      img: '/images/flow6-step3.png'
    },
    {
      icon: '✅',
      caption: 'Approve or adjust proposed changes.',
      hint: 'List of proposals shown. Options to “Approve” or “Revise” the suggested changes.',
      img: '/images/flow6-step4.png'
    },
    {
      icon: '📬',
      caption: 'Send final proposal to Project Manager.',
      hint: 'Final change proposal sent to PM. PM can review and approve or request further changes.',
      img: '/images/flow6-step5.png'
    },
    {
      icon: '🔄',
      caption: 'Update tasks and notify client.',
      hint: 'Tasks are updated as per the approved proposal. Notification is sent to the client confirming resolution.',
      img: '/images/flow6-step6.png'
    }
  ]
}





];

const FeatureGuidePage: React.FC = () => {
  const [openFlow, setOpenFlow] = useState<null | number>(null);
  const [hoveredStep, setHoveredStep] = useState<null | number>(null);
  const [searchText, setSearchText] = useState('');

  return (
    <main className="bg-slate-100 min-h-screen px-6 py-12">
<div className="relative w-full rounded-xl overflow-hidden mb-12 bg-gradient-to-r from-[#0a1f44] via-[#003366] to-[#004d40]">
  <div className="relative z-10 flex flex-col justify-center h-[220px] px-6 md:px-20 lg:px-32">
    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">USER GUIDE</h1>
    <p className="text-md text-white/90 mb-4 font-semibold">Find answers instantly!</p>

    <div className="flex items-center max-w-md w-full bg-white rounded-full px-4 py-2 shadow">
<input
  type="text"
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  placeholder="Search your question here..."
  className="flex-grow outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-500"
/>

      <button className="w-6 h-6 flex items-center justify-center text-blue-600 hover:scale-105 transition-transform">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
        </svg>
      </button>
    </div>
  </div>
</div>





  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
    {flows
    .filter((flow) =>
    flow.title.toLowerCase().includes(searchText.toLowerCase())
  )
    .map((flow, i) => (
      <motion.div
        key={flow.id}
       className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-lg transition transform group hover:scale-[1.02] cursor-pointer"

        whileHover={{ scale: 1.02 }}
        onClick={() => setOpenFlow(i)}
      >
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={flow.cover}
            alt={flow.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <p className="text-white text-sm">Click to view steps</p>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold text-slate-800">{flow.title}</h2>
        </div>
      </motion.div>
    ))}
  </div>

  <AnimatePresence>
    {openFlow !== null && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        onClick={() => setOpenFlow(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-motion bg-opacity-90 max-w-6xl w-full mx-4 rounded-lg overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="px-6 pt-6 text-xl font-bold text-slate-800">
            {flows[openFlow].title}
          </div>

          <div className="flex overflow-x-auto p-6 gap-6">
            {flows[openFlow].steps.map((step, idx) => (
              <motion.div
                key={idx}
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
                animate={{
                  scale: hoveredStep === idx ? 1.05 : 1,
                  opacity: hoveredStep === null || hoveredStep === idx ? 1 : 0.7
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`min-w-[300px] max-w-sm h-[400px] bg-white/70 rounded p-4 shadow border flex-shrink-0 backdrop-blur-md ${
                  hoveredStep === idx ? 'z-10 shadow-xl' : ''
                }`}
              >
                <div className="flex flex-col h-full space-y-2">
                  <p className="text-xs font-semibold text-blue-600 uppercase">
                    Step {idx + 1}
                  </p>
                  <div className="text-3xl">{step.icon}</div>
                  <p className="font-semibold text-gray-800">{step.caption}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{step.hint}</p>
                  {step.img && (
                    <img
                      src={step.img}
                      alt={`step-${idx + 1}`}
                      className="rounded border mt-2 w-full h-[180px] object-contain"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-right px-6 pb-6">
            <button
              onClick={() => setOpenFlow(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
</main>

  );
};

export default FeatureGuidePage;
