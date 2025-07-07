import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { taskApi } from '../services/taskApi';
import { milestoneApi } from '../services/milestoneApi';
import { sprintApi } from '../services/sprintApi';
import { accountApi } from '../services/accountApi';
import { meetingApi } from '../services/ProjectManagement/MeetingServices/MeetingServices';
import { meetingLogApi } from '../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { projectMetricApi } from '../services/projectMetricApi';
import { subtaskApi } from '../services/subtaskApi';
import { projectApi } from '../services/projectApi';
import { taskCommentApi } from '../services/taskCommentApi';
import { meetingParticipantApi } from '../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
import { documentApi } from '../services/Document/documentAPI';
import docReducer from '../components/slices/Document/documentSlice';
import { meetingFeedbackApi } from '../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { riskApi } from '../services/riskApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [milestoneApi.reducerPath]: milestoneApi.reducer,
    [sprintApi.reducerPath]: sprintApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [meetingApi.reducerPath]: meetingApi.reducer,
    [meetingLogApi.reducerPath]: meetingLogApi.reducer,
    [projectMetricApi.reducerPath]: projectMetricApi.reducer,
    [subtaskApi.reducerPath]: subtaskApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [taskCommentApi.reducerPath]: taskCommentApi.reducer,
    [meetingParticipantApi.reducerPath]: meetingParticipantApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [meetingFeedbackApi.reducerPath]: meetingFeedbackApi.reducer,
    [riskApi.reducerPath]: riskApi.reducer,
    doc: docReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      authApi.middleware,
      taskApi.middleware,
      milestoneApi.middleware,
      sprintApi.middleware,
      accountApi.middleware,
      meetingApi.middleware,
      meetingLogApi.middleware,
      projectMetricApi.middleware,
      subtaskApi.middleware,
      projectApi.middleware,
      taskCommentApi.middleware,
      meetingParticipantApi.middleware,
      documentApi.middleware,
      meetingFeedbackApi.middleware,
      riskApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
