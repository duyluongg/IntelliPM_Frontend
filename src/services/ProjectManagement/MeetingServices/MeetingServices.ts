// src/services/ProjectManagement/MeetingServices/MeetingServices.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

export interface Project {
  projectId: number;
  projectName: string;
  projectStatus: string;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

export interface ProjectMember {
  id: number;
  fullName: string;
  accountId: number;
  username: string;
  picture: string;
}

interface CreateMeetingRequest {
 
    projectId: number;
    meetingTopic: string;
    meetingDate: string; // ISO string
    meetingUrl: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    attendees: number;
    participantIds: number[];
}

interface GetProjectsResponse {
  isSuccess: boolean;
  code: number;
  data: Project[];
  message: string;
}

interface GetProjectDetailsResponse {
  isSuccess: boolean;
  code: number;
  data: {
    projectId: number;
    projectMembers: ProjectMember[];
  };
  message: string;
}

interface CreateMeetingResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: any;
}

interface MeetingParticipant {
  id: number;
  meetingId: number;
  accountId: number;
  role: string;
  status: 'Active' | 'Absent';  
  createdAt: string;
}
interface ProjectDetails {
  id: number;
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  createdBy: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  iconUrl: string;
  status: string;
}

interface GetSingleProjectResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails;
  message: string;
}


interface Meeting {
  id: number;                    
  status: string;                 
  projectId: number;
  meetingTopic: string;
  meetingDate: string;
  meetingUrl: string;
  startTime: string;
  endTime: string;
  attendees: number;
  participantIds: number[];
  createdAt?: string;            
  projectName?: string | null;    
}
export interface MeetingEventWithStatus {
  id: string;
  title: string;
  start: string;
  end: string;
  participants: string;
  roomUrl: string;
  status: 'Present' | 'Absent' | 'Active';
  meetingStatus: string;
}



export const meetingApi = createApi({
  reducerPath: 'meetingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjectsByAccountId: builder.query<GetProjectsResponse, number>({
      query: (accountId) => ({
        url: `account/${accountId}/projects`,
        method: 'GET',
      }),
    }),

    getProjectDetails: builder.query<GetProjectDetailsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/details`,
        method: 'GET',
      }),
    }),

    createMeeting: builder.mutation<CreateMeetingResponse, CreateMeetingRequest>({
      query: (meetingData) => ({
        url: 'meetings',
        method: 'POST',
        body: meetingData,
      }),
    }),
 getProjectById: builder.query<GetSingleProjectResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}`,
        method: 'GET',
      }),
    }),
    createInternalMeeting: builder.mutation<CreateMeetingResponse, CreateMeetingRequest>({
      query: (meetingData) => ({
        url: 'meetings/internal',
        method: 'POST',
        body: meetingData,
      }),
    }),
    
    getMeetingParticipants: builder.query<MeetingParticipant[], number>({
      query: (meetingId) => ({
        url: `meeting-participants/meeting/${meetingId}`,
        method: 'GET',
      }),
    }),

checkMeetingConflict: builder.query<
  { message: string; conflictingAccountIds: number[] },
  { date: string; startTime: string; endTime: string; participantIds: number[] }
>({
  query: ({ date, startTime, endTime, participantIds }) => {
    const participantParams = participantIds.map(id => `participantIds=${id}`).join('&');
    return {
      url: `meetings/check-conflict?${participantParams}&date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
      method: 'GET',
    };
  },
}),

    
    updateParticipantStatus: builder.mutation<void, { id: number; data: Partial<MeetingParticipant> }>({
      query: ({ id, data }) => ({
        url: `meeting-participants/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    
    getMeetingsByAccountId: builder.query<Meeting[], number>({
      query: (accountId) => ({
        url: `meetings/account/${accountId}/schedule`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Trả về mảng trực tiếp
        return Array.isArray(response) ? response : response.data;
      },
    }),

    getMeetingsWithParticipantStatus: builder.query<MeetingEventWithStatus[], number>({
      async queryFn(accountId, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          // Fetch meetings
          const meetingsResp = await fetchWithBQ(`meetings/account/${accountId}/schedule`);
          if (meetingsResp.error) {
            return { error: meetingsResp.error };
          }
    
          const rawData = meetingsResp.data as any;
          const meetings = Array.isArray(rawData) ? rawData : rawData?.data;
    
          const results: MeetingEventWithStatus[] = [];
    
          // Loop through meetings to get participant status
          for (const meeting of meetings) {
            const participantsResp = await fetchWithBQ(`meeting-participants/meeting/${meeting.id}`);
            if (participantsResp.error) continue;
    
            const participants = participantsResp.data as MeetingParticipant[];
            const current = participants.find((p) => p.accountId === accountId);
    
            const startDate = new Date(meeting.startTime);
            let endDate = new Date(meeting.endTime);
            if (endDate <= startDate) {
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
    
results.push({
  id: meeting.id.toString(),
  title: meeting.meetingTopic,
  start: startDate.toISOString(),
  end: endDate.toISOString(),
  participants: `${meeting.attendees} người`,
  roomUrl: meeting.meetingUrl,
  status: current?.status ?? 'Active',     
  meetingStatus: meeting.status,           
});

          }
    
          return { data: results };
        } catch (err) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Unexpected error occurred',
            },
          };
        }
      },
    }),
    
    
    
  }),

  
});

export const {
  useGetProjectsByAccountIdQuery,
  useGetProjectDetailsQuery,
  useCreateMeetingMutation,
  useGetProjectByIdQuery,
  useGetMeetingsByAccountIdQuery,
  useGetMeetingParticipantsQuery,
  useUpdateParticipantStatusMutation,
  useGetMeetingsWithParticipantStatusQuery,
  useCreateInternalMeetingMutation,
  useCheckMeetingConflictQuery,

} = meetingApi;
