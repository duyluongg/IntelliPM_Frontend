import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProjectsByAccountIdQuery,
  useGetProjectDetailsQuery,
  useCreateMeetingMutation,
  useGetProjectByIdQuery,
  useCreateInternalMeetingMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingServices';
import './CreateMeetingPage.css';

import { useAuth } from '../../../../services/AuthContext';
import { useShareDocumentViaEmailMutation } from '../../../../services/Document/documentAPI';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants/api';

// >>> NEW: system configuration API
import {
  useGetAllQuery as useGetAllSystemConfigsQuery,
} from '../../../../services/systemConfigurationApi';

/** ===================== Fallback defaults (nếu BE chưa có config) ===================== */
const DEFAULTS = {
  TOPIC_LEN_MAX: 150,
  TOPIC_LEN_MIN: 1,

  DURATION_MIN: 15,
  DURATION_MAX: 240,
  DURATION_STEP: 15,
  DURATION_EST: 60,

  ATTENDEES_MIN: 1,
  ATTENDEES_MAX: 100,
  ATTENDEES_EST: 8,

  STATUS_LIST: ['ACTIVE', 'COMPLETED', 'CANCELLED'] as string[],

  // Work hours (bạn có thể nâng cấp bằng system config riêng)
  WORK_START: '08:00',
  WORK_END: '23:00',
  SLOT_STEP_MIN: 15,

  MAX_FILE_MB: 30,
  ACCEPT_EXTS: ['pdf', 'doc', 'docx'],
};

/** ===================== Helpers ===================== */
const toInt = (v: any, fb: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};
const splitPipe = (v: any, fb: string[]) =>
  typeof v === 'string' ? v.split('|').map(s => s.trim()).filter(Boolean) : fb;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fromMinutes = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// helper: local datetime -> ISO (tránh lệch timezone)
const toLocalIso = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
};

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const CreateMeetingPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;
  const navigate = useNavigate();

  // ===================== Local states =====================
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingDuration, setMeetingDuration] = useState<number>(DEFAULTS.DURATION_EST);
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // ===================== Queries =====================
  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsByAccountIdQuery(
    accountId!,
    { skip: !accountId }
  );
  const { data: projectDetails } = useGetProjectDetailsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });
  const { data: singleProject } = useGetProjectByIdQuery(
    selectedProjectId!,
    { skip: !selectedProjectId }
  );

  // >>> Load system configs (one-shot)
  const { data: cfgResp, isLoading: cfgLoading } = useGetAllSystemConfigsQuery();

  // Map config keys -> FE config object
  const cfg = useMemo(() => {
    const list = Array.isArray(cfgResp?.data) ? (cfgResp!.data as any[]) : [];
    const byKey = new Map<string, any>(list.map((c) => [c.configKey, c]));

    const topic = byKey.get('meeting_topic_length');
    const duration = byKey.get('meeting_duration_minutes');
    const attendees = byKey.get('meeting_attendees');
    const status = byKey.get('meeting_status');

    return {
      // title length
      TOPIC_LEN_MIN: toInt(topic?.minValue, DEFAULTS.TOPIC_LEN_MIN),
      TOPIC_LEN_MAX: toInt(topic?.valueConfig, DEFAULTS.TOPIC_LEN_MAX),

      // duration (minutes)
      DURATION_MIN: toInt(duration?.minValue, DEFAULTS.DURATION_MIN),
      DURATION_MAX: toInt(duration?.maxValue, DEFAULTS.DURATION_MAX),
      DURATION_STEP: DEFAULTS.DURATION_STEP, // nếu muốn động => thêm cột step ở DB
      DURATION_EST: toInt(duration?.estimateValue, DEFAULTS.DURATION_EST),

      // attendees
      ATTENDEES_MIN: toInt(attendees?.minValue, DEFAULTS.ATTENDEES_MIN),
      ATTENDEES_MAX: toInt(attendees?.maxValue, DEFAULTS.ATTENDEES_MAX),
      ATTENDEES_EST: toInt(attendees?.estimateValue, DEFAULTS.ATTENDEES_EST),

      // status list (trong screenshot bạn để ở col maxValue của meeting_status: "ACTIVE|COMPLETED|CANCELLED")
      STATUS_LIST: splitPipe(status?.maxValue, DEFAULTS.STATUS_LIST),

      // other FE constants (có thể bơm bằng config riêng nếu muốn)
      WORK_START: DEFAULTS.WORK_START,
      WORK_END: DEFAULTS.WORK_END,
      SLOT_STEP_MIN: DEFAULTS.SLOT_STEP_MIN,
      MAX_FILE_MB: DEFAULTS.MAX_FILE_MB,
      ACCEPT_EXTS: DEFAULTS.ACCEPT_EXTS,
    };
  }, [cfgResp]);

  // set default duration theo estimate ngay khi cfg có
  useEffect(() => {
    if (!cfgLoading) setMeetingDuration(cfg.DURATION_EST);
  }, [cfgLoading, cfg.DURATION_EST]);

  // ===================== Project end date =====================
  const projectEndDateObj = singleProject?.data?.endDate
    ? new Date(singleProject.data.endDate)
    : null;
  const projectEndDateYMD = projectEndDateObj ? toYMD(projectEndDateObj) : undefined;

  // ===================== Mutations =====================
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [createInternalMeeting, { isLoading: isCreatingInternal }] = useCreateInternalMeetingMutation();
  const [shareDocumentViaEmail, { isLoading: isSharing }] = useShareDocumentViaEmailMutation();

  // ===================== Effects =====================
  // reset khi đổi ngày/proj
  useEffect(() => {
    setStartTime('');
    setEndTime('');
    setMeetingDuration(cfg.DURATION_EST);
  }, [meetingDate, selectedProjectId, cfg.DURATION_EST]);

  // clear participants when switching project + validate date <= endDate
  useEffect(() => {
    setParticipantIds([]);
    if (projectEndDateObj && meetingDate) {
      const picked = new Date(meetingDate);
      if (picked > projectEndDateObj) {
        setMeetingDate(''); // reset vì vượt quá endDate
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, projectEndDateYMD]);

  const handleParticipantToggle = (accId: number) => {
    setParticipantIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const isValidMeetingUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      if (u.protocol !== 'https:') return false;

      // Google Meet: abc-defg-hij
      if (u.hostname === 'meet.google.com') {
        return /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(u.pathname);
      }
      // Zoom: /j/1234567890
      if (u.hostname.endsWith('.zoom.us')) {
        return /^\/j\/\d+\/?$/i.test(u.pathname);
      }
      return false;
    } catch {
      return false;
    }
  };

  /** ===================== Time options ===================== */
  const getStartTimeOptions = () => {
    if (!meetingDate) return [];
    const selected = new Date(meetingDate);
    const today = new Date();
    const isToday = selected.toDateString() === today.toDateString();

    const workStart = toMinutes(cfg.WORK_START);
    const workEnd = toMinutes(cfg.WORK_END);
    const nowMin = isToday ? (today.getHours() * 60 + today.getMinutes()) : workStart;

    const options: string[] = [];
    for (let t = workStart; t + meetingDuration <= workEnd; t += cfg.SLOT_STEP_MIN) {
      if (isToday && t <= nowMin) continue; // skip quá khứ hôm nay
      options.push(fromMinutes(t));
    }
    return options;
  };

  const onStartChange = (value: string) => {
    setStartTime(value);
    if (value && meetingDuration) {
      const end = toMinutes(value) + meetingDuration;
      setEndTime(fromMinutes(end));
    } else {
      setEndTime('');
    }
  };

  const onDurationChange = (mins: number) => {
    setMeetingDuration(mins);
    if (startTime) {
      const end = toMinutes(startTime) + mins;
      setEndTime(fromMinutes(end));
    }
  };

  // auto adjust nếu end vượt giờ làm việc
  useEffect(() => {
    if (!startTime) return;
    const end = toMinutes(startTime) + meetingDuration;
    if (end > toMinutes(cfg.WORK_END)) {
      const latestStart = toMinutes(cfg.WORK_END) - meetingDuration;
      if (latestStart >= toMinutes(cfg.WORK_START)) {
        const snapped = Math.ceil(latestStart / cfg.SLOT_STEP_MIN) * cfg.SLOT_STEP_MIN;
        const adjusted = fromMinutes(snapped);
        setStartTime(adjusted);
        setEndTime(fromMinutes(snapped + meetingDuration));
      } else {
        setStartTime('');
        setEndTime('');
      }
    }
  }, [meetingDuration, startTime, cfg.WORK_END, cfg.WORK_START, cfg.SLOT_STEP_MIN]);

  // Debounce conflict-check (giữ nguyên)
  useEffect(() => {
    const shouldCheck =
      meetingDate && startTime && endTime && participantIds.length > 0 && selectedProjectId;
    if (!shouldCheck) {
      setConflictMessage(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const start = toLocalIso(meetingDate, startTime);
        const end = toLocalIso(meetingDate, endTime);
        const dateIso = toLocalIso(meetingDate, '00:00');

        const queryParams = new URLSearchParams();
        participantIds.concat(user!.id).forEach((id) => queryParams.append('participantIds', id.toString()));
        queryParams.append('projectId', String(selectedProjectId));
        queryParams.append('date', dateIso);
        queryParams.append('startTime', start);
        queryParams.append('endTime', end);

        const { data } = await axios.get(
          `${API_BASE_URL}meetings/check-conflict?${queryParams.toString()}`,
          { signal: controller.signal }
        );

        if (data?.conflictingAccountIds?.length > 0) {
          const conflictedNames = data.conflictingAccountIds.map((id: number) => {
            if (id === user?.id) return 'You';
            const member = projectDetails?.data.projectMembers.find((m: any) => m.accountId === id);
            return member?.fullName || `User ${id}`;
          });
          setConflictMessage(`⚠️ These members are busy during this time: ${conflictedNames.join(', ')}`);
        } else {
          setConflictMessage(null);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('Error checking conflict:', err);
          setConflictMessage('❌ Unable to check conflict at this time.');
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [participantIds, meetingDate, startTime, endTime, projectDetails, user, selectedProjectId]);

  /** ===================== Duration options từ config ===================== */
  const durationOptions = useMemo(() => {
    const arr: number[] = [];
    // step cố định 15' (nếu muốn dynamic, thêm cột "step" ở DB)
    for (let m = cfg.DURATION_MIN; m <= cfg.DURATION_MAX; m += cfg.DURATION_STEP) {
      arr.push(m);
    }
    return arr;
  }, [cfg.DURATION_MIN, cfg.DURATION_MAX, cfg.DURATION_STEP]);

  /** ===================== Validate form (theo config) ===================== */
  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!selectedProjectId) e.project = 'Please select a project.';

    const topic = meetingTopic.trim();
    if (topic.length < cfg.TOPIC_LEN_MIN)
      e.topic = `Title must be ≥ ${cfg.TOPIC_LEN_MIN} chars.`;
    else if (topic.length > cfg.TOPIC_LEN_MAX)
      e.topic = `Title must be ≤ ${cfg.TOPIC_LEN_MAX} chars.`;

    if (!meetingUrl) e.url = 'Meeting link is required.';
    else if (!/^https:\/\//i.test(meetingUrl)) e.url = 'Link must start with https://';
    else if (!isValidMeetingUrl(meetingUrl)) e.url = 'Link must be a valid Zoom or Google Meet.';

    if (!meetingDate) e.date = 'Please select a date.';
    else if (projectEndDateObj) {
      const picked = new Date(meetingDate);
      if (picked > projectEndDateObj) {
        e.date = `Meeting date must be on or before project end date (${toYMD(projectEndDateObj)}).`;
      }
    }

    if (!startTime) e.time = 'Please select a start time.';
    if (!meetingDuration) e.duration = 'Please select a duration.';
    if (startTime && meetingDuration) {
      const startMin = toMinutes(startTime);
      const endMin = startMin + meetingDuration;

      if (meetingDuration < cfg.DURATION_MIN || meetingDuration > cfg.DURATION_MAX) {
        e.duration = `Duration must be between ${cfg.DURATION_MIN}–${cfg.DURATION_MAX} minutes.`;
      }
      if (endMin <= startMin) e.time = 'Start time must be before end time.';
      if (startMin < toMinutes(cfg.WORK_START) || endMin > toMinutes(cfg.WORK_END)) {
        e.time = `Meeting must be within working hours ${cfg.WORK_START}–${cfg.WORK_END}.`;
      }
    }

    // attendees = yourself + selected participants (unique)
    const attendeesCount = [user!.id, ...participantIds.filter(id => id !== user!.id)].length;
    if (attendeesCount < cfg.ATTENDEES_MIN || attendeesCount > cfg.ATTENDEES_MAX) {
      e.participants = `Attendees must be between ${cfg.ATTENDEES_MIN}–${cfg.ATTENDEES_MAX}.`;
    } else if (participantIds.length === 0) {
      // vẫn giữ UX: chọn ít nhất 1 người khác
      e.participants = 'Select at least one participant.';
    }

    if (uploadedFile) {
      const sizeMb = uploadedFile.size / (1024 * 1024);
      if (sizeMb > cfg.MAX_FILE_MB) e.file = `File must be ≤ ${cfg.MAX_FILE_MB}MB.`;
      const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      if (!cfg.ACCEPT_EXTS.includes(ext)) e.file = `Only ${cfg.ACCEPT_EXTS.join(', ').toUpperCase()} are allowed.`;
    }

    if (conflictMessage) e.conflict = 'There is a scheduling conflict. Please adjust time/participants.';

    setErrors(e);
    return e;
  };

  const isSubmitting = isCreating || isCreatingInternal || isSharing;
  const isReady =
    !!selectedProjectId &&
    meetingTopic.trim().length > 0 &&
    !!meetingUrl &&
    !!meetingDate &&
    !!startTime &&
    !!endTime &&
    participantIds.length > 0 &&
    !conflictMessage;

  const handleSelectAll = () => {
    const members = projectDetails?.data?.projectMembers ?? [];
    if (participantIds.length === members.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(members.map((m: any) => m.accountId));
    }
  };

  /** ===================== Submit ===================== */
  const handleCreateMeeting = async () => {
    setErrorMessage(null);
    if (selectedProjectId == null) {
      setErrorMessage('Please select a project.');
      return;
    }
    const e = validateForm();
    if (Object.keys(e).length > 0) {
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    // add self to participants (unique)
    const finalParticipantIds = [user!.id, ...participantIds.filter((id) => id !== user!.id)];

    const startDateTime = toLocalIso(meetingDate, startTime);
    const endDateTime = toLocalIso(meetingDate, endTime);
    const selectedProject = projectsData?.data.find((p: any) => p.projectId === selectedProjectId);
    const fullMeetingTopic = `${meetingTopic.trim()} - ${selectedProject?.projectName ?? 'Unknown Project'}`;

    const meetingPayload = {
      projectId: selectedProjectId,
      meetingTopic: fullMeetingTopic,
      meetingDate: toLocalIso(meetingDate, '00:00'),
      meetingUrl,
      startTime: startDateTime,
      endTime: endDateTime,
      attendees: finalParticipantIds.length,
      participantIds: finalParticipantIds,
      // status: cfg.STATUS_LIST?.[0] ?? 'ACTIVE', // nếu muốn set default theo config
    };

    try {
      const role = user?.role as string;
      const mutationToUse =
        role === 'TEAM_LEADER' || role === 'TEAM_MEMBER'
          ? createInternalMeeting
          : role === 'PROJECT_MANAGER'
          ? createMeeting
          : null;

      if (!mutationToUse) {
        setErrorMessage('❌ You do not have permission to create a meeting.');
        return;
      }

      const response = await mutationToUse(meetingPayload).unwrap();

      if (uploadedFile) {
        await shareDocumentViaEmail({
          userIds: finalParticipantIds,
          customMessage: customMessage,
          file: uploadedFile,
        }).unwrap();
      }

      console.log('📥 Response:', response);
      setErrorMessage(null);
      navigate('/meeting-room');
    } catch (error: any) {
      const apiError = error?.data;
      let message =
        apiError?.innerDetails ??
        apiError?.details ??
        apiError?.message ??
        'An unknown error occurred.';

      const conflictMatch = message.match(/Participant (\d+) has a conflicting meeting/);
      if (conflictMatch) {
        const conflictId = Number(conflictMatch[1]);
        if (conflictId === user?.id) {
          message = '⚠️ You have a meeting during this time.';
        } else {
          const conflictedMember = projectDetails?.data.projectMembers.find(
            (m: any) => m.accountId === conflictId
          );
          if (conflictedMember) {
            message = `⚠️ Member "${conflictedMember.fullName}" had a meeting during this time.`;
          }
        }
      }

      setErrorMessage(message);
    }
  };

  if (!accountId) {
    return (
      <div className='text-red-500 text-center mt-6 font-medium'>⚠️ You are not logged in</div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='bg-white shadow-xl rounded-2xl p-8 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Create Meeting Room</h1>

        {loadingProjects ? (
          <p className='text-gray-600'>Loading project list...</p>
        ) : (
          <div>
            <label className='block mb-1 font-medium text-gray-700'>Project</label>
            <select
              className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              value={selectedProjectId ?? ''}
            >
              <option value='' disabled>
                --Select project--
              </option>
              {projectsData?.data?.map((project: any) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>
            {errors.project && <p className='mt-1 text-sm text-red-600'>{errors.project}</p>}
          </div>
        )}

        {selectedProjectId && projectDetails && (
          <>
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-800">Select participants</label>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {projectDetails.data.projectMembers
                  .filter((member: any) => member.accountId !== user?.id)
                  .map((member: any) => {
                    const isSelected = participantIds.includes(member.accountId);
                    return (
                      <label
                        key={member.accountId}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
                          ${isSelected ? 'bg-blue-100 border-2 border-blue-500 shadow-lg' : 'bg-white border-2 border-gray-300 hover:border-blue-300 hover:shadow-md'}`}
                        onClick={() => handleParticipantToggle(member.accountId)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mr-3 h-5 w-5 text-blue-600"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{member.fullName}</span>
                          <span className="text-xs text-gray-500">{member.username}</span>
                        </div>
                      </label>
                    );
                  })}
              </div>
              {errors.participants && <p className='mt-2 text-sm text-red-600'>{errors.participants}</p>}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Meeting Title{' '}
                  <span className='text-gray-400 text-xs'>
                    ({meetingTopic.trim().length}/{cfg.TOPIC_LEN_MAX})
                  </span>
                </label>
                <input
                  type='text'
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  maxLength={cfg.TOPIC_LEN_MAX}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  placeholder='VD: Meeting Sprint Planning'
                />
                {errors.topic && <p className='mt-1 text-sm text-red-600'>{errors.topic}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Link Meeting</label>
                <input
                  type='text'
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  placeholder='VD: Zoom/Google Meet'
                />
                {errors.url && <p className='mt-1 text-sm text-red-600'>{errors.url}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Day</label>
                <input
                  type='date'
                  value={meetingDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={projectEndDateYMD}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                />
                {errors.date && <p className='mt-1 text-sm text-red-600'>{errors.date}</p>}
              </div>

              {/* Time block: Start + Duration + End (auto) */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Time</label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Start Time */}
                  <div>
                    <label className='block text-xs text-gray-600'>Start</label>
                    <select
                      className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                      value={startTime}
                      onChange={(e) => onStartChange(e.target.value)}
                      disabled={!meetingDate}
                    >
                      <option value='' disabled>-- Select Start --</option>
                      {getStartTimeOptions().map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration (from config) */}
                  <div>
                    <label className='block text-xs text-gray-600'>Duration</label>
                    <select
                      className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                      value={meetingDuration}
                      onChange={(e) => onDurationChange(Number(e.target.value))}
                      disabled={!meetingDate}
                    >
                      {durationOptions.map((mins) => (
                        <option key={mins} value={mins}>
                          {mins >= 60
                            ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`
                            : `${mins}m`}
                        </option>
                      ))}
                    </select>
                    {errors.duration && <p className='mt-1 text-sm text-red-600'>{errors.duration}</p>}
                  </div>

                  {/* End Time (auto) */}
                  <div>
                    <label className='block text-xs text-gray-600'>End (auto)</label>
                    <input
                      type='text'
                      value={endTime}
                      readOnly
                      className='w-full mt-1 p-2 border rounded-lg bg-gray-100 text-gray-700'
                      placeholder='Auto after start & duration'
                    />
                  </div>
                </div>
                {errors.time && <p className='mt-1 text-sm text-red-600'>{errors.time}</p>}
              </div>
            </div>

            {/* Upload file */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Upload File</label>
              <input
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
              />
              {errors.file && <p className='mt-1 text-sm text-red-600'>{errors.file}</p>}
            </div>

            {/* Custom note */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Custom Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                placeholder='Content of note sent with email'
              />
            </div>

            {errorMessage && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
                <strong className='font-semibold'>Error:</strong> <span>{errorMessage}</span>
              </div>
            )}

            {conflictMessage && (
              <div className="mt-6 flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-500 mt-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="mt-1 text-sm text-red-700">{conflictMessage}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateMeeting}
              disabled={isSubmitting || !isReady}
              className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-medium transition 
                ${isSubmitting || !isReady
                  ? 'bg-blue-400 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isSubmitting ? <div className='loadermeeting scale-75' /> : 'Create Meeting'}
            </button>
          </>
        )}
      </div>

      <div className='mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-sm'>
        <h2 className='text-lg font-semibold text-yellow-700 flex items-center'>
          <svg
            className='w-5 h-5 mr-2 text-yellow-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z'
            />
          </svg>
          Business Rule
        </h2>
        <p className='text-sm text-yellow-700 mt-2'>
          A <strong>Project Manager</strong> can only create{' '}
          <strong>one meeting per project</strong> for <strong>each working day</strong>. Please
          ensure you haven’t already scheduled a meeting today for this project.
        </p>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
