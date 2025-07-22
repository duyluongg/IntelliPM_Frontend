import { useSearchParams } from 'react-router-dom';
import React, { useState } from 'react';
import './RiskDetail.css';
import { Check, MessageSquare, Paperclip, CalendarDays, UserPlus, Trash2 } from 'lucide-react';
import { useUpdateRiskTitleMutation, useUpdateRiskStatusMutation } from '../../../services/riskApi';

interface Risk {
  id: number;
  riskKey: string;
  title: string;
  description?: string;
  impactLevel?: 'Low' | 'Medium' | 'High';
  probability?: 'Low' | 'Medium' | 'High';
  severityLevel?: 'Low' | 'Medium' | 'High';
  status?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  responsibleId?: number;
  responsibleFullName?: string;
  responsibleUserName?: string;
  responsiblePicture?: string;
  creatorFullName?: string;
  creatorUserName?: string;
  creatorPicture?: string;
  resolution?: string;
}

interface RiskDetailProps {
  risk: Risk;
  onClose: () => void;
  assignees: Assignee[];
  updateResponsible: (params: { id: number; responsibleId: number | null }) => any;
  refetch: () => void;
}

type Assignee = {
  id: number;
  fullName: string | null;
  userName: string;
  picture?: string | null;
};

function calculateSeverityLevel(risk: any): string {
  const levels = { Low: 1, Medium: 2, High: 3 };
  const i = levels[risk.impactLevel as keyof typeof levels] || 0;
  const p = levels[risk.probability as keyof typeof levels] || 0;
  const score = i * p;
  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

function calculateSeverityColor(risk: any): string {
  const level = calculateSeverityLevel(risk);
  return level.toLowerCase();
}

const RiskDetail: React.FC<RiskDetailProps> = ({
  risk,
  onClose,
  assignees,
  updateResponsible,
  refetch,
}) => {
  const [editableRisk, setEditableRisk] = useState<Risk>({ ...risk });
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const commentCount = 0;
  const attachmentCount = 0;
  const [todoList, setTodoList] = useState<string[]>(
    editableRisk.resolution ? editableRisk.resolution.split('\n') : []
  );
  const [newTodo, setNewTodo] = useState('');
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

  const [updateRiskTitle] = useUpdateRiskTitleMutation();
  const [updateRiskStatus] = useUpdateRiskStatusMutation();

  const handleAddTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim()) {
      const updated = [...todoList, newTodo.trim()];
      setTodoList(updated);
      setNewTodo('');
      handleChange('resolution', updated.join('\n'));
    }
  };

  const handleChange = (field: keyof Risk, value: any) => {
    setEditableRisk((prev) => ({ ...prev, [field]: value }));
  };

  const renderAvatar = () => {
    if (editableRisk.responsiblePicture) {
      return (
        <img src={editableRisk.responsiblePicture} alt='avatar' className='responsible-avatar' />
      );
    }
    const initials =
      editableRisk.responsibleFullName
        ?.split(' ')
        .map((n) => n[0])
        .join('') ||
      editableRisk.responsibleUserName?.slice(0, 2)?.toUpperCase() ||
      '?';
    return <div className='responsible-avatar-placeholder'>{initials}</div>;
  };

  const RiskStatusDropdown = ({
    status,
    onChange,
  }: {
    status: string;
    onChange: (newStatus: string) => void;
  }) => {
    const getStyle = (status: string) => {
      switch (status.toUpperCase()) {
        case 'OPEN':
          return { backgroundColor: '#DBEAFE', color: '#1D4ED8' }; // blue
        case 'MITIGATED':
          return { backgroundColor: '#D1FAE5', color: '#047857' }; // green
        case 'CLOSED':
          return { backgroundColor: '#E5E7EB', color: '#6B7280' }; // gray
        default:
          return {};
      }
    };

    return (
      <select
        className={`risk-detail-status-select status-${status.toLowerCase()}`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...getStyle(status),
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontWeight: 600,
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        <option value='OPEN'>OPEN</option>
        <option value='MITIGATED'>MITIGATED</option>
        <option value='CLOSED'>CLOSED</option>
      </select>
    );
  };

  const ResponsibleDropdown = ({
    assignees,
    selectedId,
    onChange,
  }: {
    assignees: Assignee[];
    selectedId: number | null;
    onChange: (id: number) => void;
  }) => {
    const getInitials = (name?: string | null) => {
      if (!name) return '';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
      <select
        className='responsible-dropdown'
        value={selectedId ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
      >
        <option value='' disabled>
          -- Select --
        </option>
        {assignees.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName || user.userName}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className='risk-detail-container'>
      <div className='risk-detail-panel'>
        <div className='detail-header'>
          <div className='detail-title-section'>
            <div className='risk-path'>
              <div>
                {projectKey} /{' '}
                <span className='risk-code'>{editableRisk.riskKey || `R-${editableRisk.id}`}</span>
              </div>
              <div className='reporter-meta-block'>
                <div className='reporter-icons'>
                  <div className='icon-with-count'>
                    <MessageSquare size={16} strokeWidth={1.5} />
                    <span>{commentCount}</span>
                  </div>
                  <div className='icon-with-count'>
                    <Paperclip size={16} strokeWidth={1.5} />
                    <span>{attachmentCount}</span>
                  </div>
                </div>
                <div className='reporter-avatar'>
                  {editableRisk.creatorPicture ? (
                    <img
                      src={editableRisk.creatorPicture}
                      alt='reporter avatar'
                      className='avatar-image'
                    />
                  ) : (
                    <div className='avatar-placeholder'>
                      {editableRisk.creatorFullName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') ||
                        editableRisk.creatorUserName?.slice(0, 2)?.toUpperCase() ||
                        '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='title-and-status'>
              <input
                className='editable-title-input'
                value={editableRisk.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={async (e) => {
                  const newTitle = e.target.value.trim();
                  if (newTitle && newTitle !== risk.title) {
                    try {
                      await updateRiskTitle({ id: editableRisk.id, title: newTitle }).unwrap();
                      console.log('Title updated successfully');
                    } catch (err) {
                      console.error('Failed to update title:', err);
                    }
                  }
                }}
                placeholder='Enter risk title'
              />
              <RiskStatusDropdown
                status={editableRisk.status || 'OPEN'}
                onChange={async (newStatus) => {
                  try {
                    await updateRiskStatus({ id: editableRisk.id, status: newStatus }).unwrap();
                    handleChange('status', newStatus);
                    console.log(`Updated status to ${newStatus}`);
                  } catch (err) {
                    console.error('Failed to update status:', err);
                  }
                }}
              />
            </div>
            <div className='meta-inline'>
              <span className='meta-item'>Risk</span>
              <span className='meta-separator'>·</span>

              <span className='meta-item with-icon'>
                <CalendarDays size={14} className='inline-icon' />
                {editableRisk.dueDate?.split('T')[0] || 'None'}
              </span>

              <span className='meta-separator'>·</span>

              {/* <div className='meta-value responsible-info'>
                {editableRisk.responsiblePicture || editableRisk.responsibleFullName ? (
                  <>
                    {renderAvatar()}
                    <span>
                      {editableRisk.responsibleFullName ||
                        editableRisk.responsibleUserName ||
                        'Unassigned'}
                    </span>
                  </>
                ) : (
                  <div className='unassigned-avatar'>
                    <UserPlus size={14} />
                  </div>
                )}
              </div> */}

              <div
                className='meta-value responsible-info'
                onClick={() => setShowResponsibleDropdown(true)}
              >
                {showResponsibleDropdown ? (
                  <ResponsibleDropdown
                    assignees={assignees}
                    selectedId={editableRisk.responsibleId ?? null}
                    onChange={async (newId) => {
                      try {
                        await updateResponsible({
                          id: editableRisk.id,
                          responsibleId: newId,
                        }).unwrap();
                        const updated = assignees.find((u) => u.id === newId);
                        // setEditableRisk((prev) => ({
                        //   ...prev,
                        //   responsibleId: newId,
                        //   responsibleFullName: updated?.fullName,
                        //   responsibleUserName: updated?.userName,
                        //   responsiblePicture: '', // nếu bạn có picture, set thêm
                        // }));
                        setEditableRisk(
                          (prev) =>
                            ({
                              ...prev,
                              responsibleId: newId,
                              responsibleFullName: updated?.fullName || '',
                              responsibleUserName: updated?.userName || '',
                              responsiblePicture: updated?.picture || '',
                            } as Risk)
                        );
                        refetch();
                        setShowResponsibleDropdown(false);
                      } catch (err) {
                        console.error('Update failed', err);
                      }
                    }}
                  />
                ) : editableRisk.responsibleFullName || editableRisk.responsibleUserName ? (
                  <>
                    {renderAvatar()}
                    <span className='clickable-name'>
                      {editableRisk.responsibleFullName || editableRisk.responsibleUserName}
                    </span>
                  </>
                ) : (
                  <div className='unassigned-avatar'>
                    <UserPlus size={14} />
                    <span className='click-to-assign'>Assign</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button className='close-btn' onClick={onClose}>
          ×
        </button>

        <div className='detail-section-no-border'>
          <div className='section-label'>DESCRIPTION</div>
          <textarea
            className={`editable-textarea ${!editableRisk.description ? 'text-placeholder' : ''}`}
            value={editableRisk.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder='Add a description'
          />
        </div>

        <div className='detail-section'>
          <div className='section-label'>RESOLUTION</div>
          {/* <textarea
            className={`editable-textarea ${!editableRisk.resolution ? 'text-placeholder' : ''}`}
            value={editableRisk.resolution || ''}
            onChange={(e) => handleChange('resolution', e.target.value)}
            rows={4}
            placeholder='Add a resolution'
          /> */}

          <ul className='todo-list'>
            {todoList.map((item, index) => (
              <li key={index} className='todo-item'>
                {/* <input type='checkbox' /> */}
                <span className='todo-index'>{index + 1}.</span>
                <span>{item}</span>
                <button
                  // className='todo-delete'
                  className='text-gray-500 hover:text-red-500 transition'
                  onClick={() => {
                    const updated = todoList.filter((_, i) => i !== index);
                    setTodoList(updated);
                    handleChange('resolution', updated.join('\n'));
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            <li className='todo-item new'>
              <input
                type='text'
                placeholder='Add To Do'
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleAddTodo}
                className='add-todo-input'
              />
            </li>
          </ul>
        </div>

        <div className='detail-section triple-grid'>
          <div className='impactLikelihoodWrapper'>
            <div className='section-label'>IMPACT</div>
            <ul className='radio-button-list'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label
                    className={`radio-label ${editableRisk.impactLevel === lvl ? 'checked' : ''}`}
                  >
                    <input
                      type='radio'
                      name='impact'
                      value={lvl}
                      checked={editableRisk.impactLevel === lvl}
                      onChange={() => handleChange('impactLevel', lvl)}
                    />
                    <span className='radio-icon'></span>
                    <span className='radio-value'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='impactLikelihoodWrapper'>
            <div className='section-label'>LIKELIHOOD</div>
            <ul className='radio-button-list'>
              {['Low', 'Medium', 'High'].map((lvl) => (
                <li key={lvl}>
                  <label
                    className={`radio-label ${editableRisk.probability === lvl ? 'checked' : ''}`}
                  >
                    <input
                      type='radio'
                      name='probability'
                      value={lvl}
                      checked={editableRisk.probability === lvl}
                      onChange={() => handleChange('probability', lvl)}
                    />
                    <span className='radio-icon'></span>
                    <span className='radio-value'>{lvl}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='levelWrapper'>
            <div className='section-label'>LEVEL</div>
            <div className={`semi-gauge ${calculateSeverityColor(editableRisk)}`}>
              <div className='gauge-text'>{calculateSeverityLevel(editableRisk)}</div>
            </div>
          </div>
        </div>

        <div className='detail-section-no-border'>
          <div className='section-label'>Attachments</div>
          <div className='attachment-upload'>
            <div className='upload-box'>
              <div className='plus-icon'>＋</div>
              <div className='upload-text'>
                Drag and
                <br />
                drop or
                <br />
                <span className='upload-browse'>browse</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='risk-comments-panel'>
        <div className='comments-header'>COMMENTS</div>
        <div className='comments-body'>
          <p className='no-comments'>No comments</p>
        </div>
        <div className='comment-input'>
          <input type='text' placeholder='Add a comment' />
        </div>
      </div>
    </div>
  );
};

export default RiskDetail;
