import React, { useState, useEffect } from 'react';
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
  { label: 'Summary', icon: <Globe className="w-4 h-4" /> },
  { label: 'Timeline', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'Backlog', icon: <ClipboardList className="w-4 h-4" /> },
  { label: 'Board', icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'List', icon: <List className="w-4 h-4" />, active: true },
  { label: 'Forms', icon: <FileText className="w-4 h-4" /> },
  { label: 'Goals', icon: <Flag className="w-4 h-4" /> },
  { label: 'All work', icon: <Users2 className="w-4 h-4" /> },
  { label: 'Code', icon: <Code2 className="w-4 h-4" /> },
  { label: 'Archived work items', icon: <Archive className="w-4 h-4" /> },
  { label: 'Pages', icon: <FileText className="w-4 h-4" /> },
  { label: 'Shortcuts', icon: <Link className="w-4 h-4" /> },
  { label: 'Releases', icon: <PackagePlus className="w-4 h-4" /> },
];

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const MAX_VISIBLE_TABS = 7;

const ProjectDetailHeader: React.FC = () => {
  const [visibleTabs, setVisibleTabs] = useState<NavItem[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<NavItem[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const visible = navItems.slice(0, MAX_VISIBLE_TABS);
    const hidden = navItems.slice(MAX_VISIBLE_TABS);
    setVisibleTabs(visible);
    setHiddenTabs(hidden);
  }, []);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  return (
    <div className="project-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <a href="/projects" className="breadcrumb-link">Projects</a>
      </nav>

      {/* Header */}
      <div className="project-header">
        <img src="https://via.placeholder.com/24" alt="icon" className="project-icon" />
        <h1 className="project-title">SEP_Agile_Scrum</h1>
        <Users2 className="icon-button" />
        <MoreHorizontal className="icon-button" />
        <div className="header-actions">
          <button className="icon-button" aria-label="Fullscreen">
            <svg className="w-4 h-4" stroke="currentColor" viewBox="0 0 24 24" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 1h4.75a.75.75 0 01.75.75V6.5h-1.5v-4h-4zM2 13h1.5v4h4v1.5H2.75a.75.75 0 01-.75-.75V13z" />
            </svg>
          </button>
          <button className="icon-button" aria-label="Share">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.5a1 1 0 1 0 0 2m-2.5 1a2.5 2.5 0 1 1 .73 1.765L6.2 7.6a2.5 2.5 0 0 1 0 .866l4.1 2.3a2.5 2.5 0 1 1-.7 1.334L5.5 9.75a2.5 2.5 0 1 1 0-3.5l4.016-2.3A2.5 2.5 0 0 1 9.5 3.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="nav-tabs">
        {visibleTabs.map((item, idx) => (
          <div key={idx} className={`tab-item ${item.active ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
        {hiddenTabs.length > 0 && (
          <div className="tab-item relative" onClick={togglePopup}>
            <span>More</span>
            <span className="tab-more-count">{hiddenTabs.length}</span>
            {isPopupOpen && (
              <div className="more-popup">
                {hiddenTabs.map((item, idx) => (
                  <div key={idx} className="more-popup-item">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add to navigation */}
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
