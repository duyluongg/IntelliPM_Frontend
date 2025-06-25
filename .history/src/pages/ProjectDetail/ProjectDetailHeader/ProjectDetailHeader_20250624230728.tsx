// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\ProjectDetail\ProjectDetailHeader\ProjectDetailHeader.tsx

import React from 'react';
import './ProjectDetailHeader.css';
import {
  Users2,
  MoreHorizontal,
  Globe,
  CalendarDays,
  List,
  ClipboardList,
  ClipboardCheck,
  Flag,
  Code2,
  Archive,
  FileText,
  Link,
  PackagePlus,
  Plus,
} from 'lucide-react';

const navItems = [
  { label: 'Summary', icon: <Globe /> },
  { label: 'Timeline', icon: <CalendarDays /> },
  { label: 'Backlog', icon: <ClipboardList /> },
  { label: 'Board', icon: <ClipboardCheck /> },
  { label: 'Calendar', icon: <CalendarDays /> },
  { label: 'List', icon: <List />, active: true },
  { label: 'Forms', icon: <FileText /> },
  { label: 'Goals', icon: <Flag /> },
  { label: 'All work', icon: <Users2 /> },
  { label: 'Code', icon: <Code2 /> },
  { label: 'Archived work items', icon: <Archive /> },
  { label: 'Pages', icon: <FileText /> },
  { label: 'Shortcuts', icon: <Link /> },
  { label: 'Releases', icon: <PackagePlus /> },
];

const ProjectDetailHeader: React.FC = () => {
  const projectIconUrl = 'https://via.placeholder.com/24';

  return (
    <div className="project-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <a href="/projects" className="breadcrumb-link">Projects</a>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">SEP_Agile_Scrum</span>
      </nav>

      {/* Header */}
      <div className="project-header">
        <img src={projectIconUrl} alt="icon" className="project-icon" />
        <h1 className="project-title">SEP_Agile_Scrum</h1>
        <Users2 className="icon-button" />
        <MoreHorizontal className="icon-button" />
        <div className="header-actions">
          <button className="icon-button" aria-label="Share">
            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button className="icon-button" aria-label="Automation">
            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path d="M9 7h6m0 0l-3 3m-3-3l3 3m0 6l3-3m-3 3l-3-3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="nav-tabs">
        {navItems.slice(0, 5).map((item, idx) => (
          <div key={idx} className={`tab-item ${item.active ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
            <MoreHorizontal className="tab-more-icon" />
          </div>
        ))}
        {navItems.length > 5 && (
          <div className="tab-item">
            <span>More</span>
            <span className="tab-more-count">{navItems.length - 5}</span>
          </div>
        )}
      </div>

      {/* Add to Navigation */}
      <div className="nav-footer">
        <button className="add-nav-btn">
          <Plus className="w-4 h-4" />
          <span>Add to navigation</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
