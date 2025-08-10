import React from 'react';
import { useNavigate } from 'react-router-dom';

// Centralized route constants (recommended to move to a separate file)
const ROUTES = {
  PROJECT_CREATE_FORM: '/project/createform',
  HOME: '/',
};

// Image imports with type safety
import logo from '../../../assets/logo.png';
import backlogImg from '../../../assets/CreateProject/PlanUpcomingWorkInABacklog.svg';
import sprintImg from '../../../assets/CreateProject/OrganizeCyclesOfWorkIntoSprints.png';
import velocityImg from '../../../assets/CreateProject/UnderstandYourTeamVelocity.png';
import aiImg from '../../../assets/CreateProject/AiIntro.png';
import typeEpic from '../../../assets/icon/type_epic.svg';
import typeStory from '../../../assets/icon/type_story.svg';
import typeBug from '../../../assets/icon/type_bug.svg';
import typeTask from '../../../assets/icon/type_task.svg';
import typeSubTask from '../../../assets/icon/type_subtask.svg';

interface ProjectIntroductionProps {
  onNext?: () => void;
}

const ProjectIntroduction: React.FC<ProjectIntroductionProps> = ({ onNext }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    try {
      // Clear localStorage items safely
      localStorage.removeItem('projectFormData');
      localStorage.removeItem('projectCreationStep');
      localStorage.removeItem('projectCreationId');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }

    if (onNext) {
      onNext();
    } else {
      navigate(ROUTES.PROJECT_CREATE_FORM);
    }
  };

  return (
    <div className="bg-white mx-auto rounded-lg shadow min-h-screen pb-32 relative max-w-7xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0052CC] to-[#2684FF] p-4 flex justify-between items-center rounded-t-lg text-white">
        <h1 className="text-xl font-semibold">Project Introduction</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-white text-xl font-bold px-3 rounded hover:bg-[#0045b1] transition"
            aria-label="Cancel project creation"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-10 p-8">
        {/* Left + Middle Columns */}
        <div className="md:col-span-2 space-y-10">
          {/* AI Section */}
          <div className="flex items-start gap-6">
            <img src={aiImg} alt="AI integration illustration" className="w-41 h-40 object-contain" />
            <div>
              <h2 className="text-xl font-semibold text-[#172B4D] mb-2">Empower your workflow with AI</h2>
              <p className="text-sm text-gray-700 mb-2">
                IntelliPM integrates AI to streamline your project management processes. With intelligent automation and smart alerts,
                your team stays focused and informed.
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>
                  <strong>Automation:</strong> Auto-generate meeting summaries, progress reports, and task assignments with minimal manual effort.
                </li>
                <li>
                  <strong>Smart alerts:</strong> Instantly detect risks such as delayed deadlines, team overloads, or sprint bottlenecks.
                </li>
              </ul>
            </div>
          </div>

          {/* Backlog Section */}
          <div className="grid grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#172B4D]">Plan upcoming work in a backlog</h3>
              <p className="text-sm text-gray-600 mt-1">
                Prioritize and plan your team’s work in the backlog. Break tasks into actionable items along your project timeline to ensure clarity and alignment.
              </p>
              <a href="#" className="text-blue-600 text-sm mt-2 inline-block hover:underline" aria-label="Learn more about the backlog">Learn more about the backlog</a>
            </div>
            <img src={backlogImg} alt="Backlog planning illustration" className="w-41 h-40 object-contain mx-auto" />
          </div>

          {/* Sprints Section */}
          <div className="grid grid-cols-2 gap-6 items-center">
            <img src={sprintImg} alt="Sprints organization illustration" className="w-45 h-44 object-contain mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-[#172B4D]">Organize cycles of work into sprints</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sprints are short, focused work periods that help teams deliver incremental value. Use them to drive continuous delivery, ensure high-quality output, and accelerate feedback loops.
              </p>
              <a href="#" className="text-blue-600 text-sm mt-2 inline-block hover:underline" aria-label="Learn more about sprints">Learn more about sprints</a>
            </div>
          </div>

          {/* Velocity Section */}
          <div className="grid grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#172B4D]">Understand your team’s velocity</h3>
              <p className="text-sm text-gray-600 mt-1">
                Boost predictability with visual reports like velocity charts and sprint summaries. Understand team capacity and continuously improve planning accuracy.
              </p>
              <a href="#" className="text-blue-600 text-sm mt-2 inline-block hover:underline" aria-label="Learn more about agile metrics">Learn more about agile metrics</a>
            </div>
            <img src={velocityImg} alt="Team velocity illustration" className="w-45 h-44 object-contain mx-auto" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <p className="font-medium text-sm text-gray-500">Product</p>
            <img src={logo} alt="IntelliPM product logo" className="w-20 h-20 mt-1" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-500">Recommended for</p>
            <ul className="text-sm text-gray-700 list-disc list-inside mt-1 space-y-1">
              <li>Teams that deliver work on a regular cadence</li>
              <li>DevOps teams that want to connect tools</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-500">Work types</p>
            <div className="flex flex-col gap-3 mt-1 text-sm text-gray-700">
              <div className="flex items-center gap-2"><img src={typeEpic} className="w-4 h-4" alt="Epic icon" /> Epic</div>
              <div className="flex items-center gap-2"><img src={typeStory} className="w-4 h-4" alt="Story icon" /> Story</div>
              <div className="flex items-center gap-2"><img src={typeBug} className="w-4 h-4" alt="Bug icon" /> Bug</div>
              <div className="flex items-center gap-2 text-black"><img src={typeTask} className="w-4 h-4" alt="Task icon" /> Task</div>
              <div className="flex items-center gap-2"><img src={typeSubTask} className="w-4 h-4" alt="Sub-task icon" /> Sub-task</div>
            </div>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-500">Workflow</p>
            <div className="flex flex-col gap-2 mt-1 text-xs font-medium">
              <span className="bg-[#DDDEE1] text-gray-800 px-2 py-1 rounded w-fit font-bold">TO DO</span>
              <span className="bg-[#87B1E1] text-gray-800 px-2 py-1 rounded w-fit font-bold">IN PROGRESS</span>
              <span className="bg-[#B2DA73] text-gray-800 px-2 py-1 rounded w-fit font-bold">DONE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer INSIDE Container */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-8 py-4 text-sm text-gray-600 flex justify-between items-center z-50 shadow rounded-b-lg max-w-7xl mx-auto">
        <span>Next: Select a project type</span>
        <button
          onClick={handleNext}
          className="bg-[#0052CC] text-white px-4 py-1.5 rounded hover:bg-[#003087] text-sm transition"
          aria-label="Proceed to create project"
        >
          Create project
        </button>
      </div>
    </div>
  );
};

export default ProjectIntroduction;