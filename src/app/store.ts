// import { configureStore } from '@reduxjs/toolkit';
// import { api } from '../services/api';
// import { authApi } from '../services/authApi';
// import { taskApi } from '../services/taskApi';
// import { milestoneApi } from '../services/milestoneApi';
// import { sprintApi } from '../services/sprintApi';
// import { accountApi } from '../services/accountApi';
// import { meetingApi } from '../services/ProjectManagement/MeetingServices/MeetingServices';
// import { meetingLogApi } from '../services/ProjectManagement/MeetingServices/MeetingLogServices';
// import { projectMetricApi } from '../services/projectMetricApi';
// import { subtaskApi } from '../services/subtaskApi';
// import { epicApi } from '../services/epicApi';
// import { projectApi } from '../services/projectApi';
// import { taskCommentApi } from '../services/taskCommentApi';
// import { meetingParticipantApi } from '../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
// import { documentApi } from '../services/Document/documentAPI';
// import docReducer from '../components/slices/Document/documentSlice';
// import { meetingFeedbackApi } from '../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
// import { riskApi } from '../services/riskApi';
// import projectCreationReducer  from '../components/slices/Project/projectCreationSlice';
// import { dynamicCategoryApi } from '../services/dynamicCategoryApi';
// import { requirementApi } from '../services/requirementApi';
// import { projectMemberApi } from '../services/projectMemberApi';
// import { taskFileApi } from '../services/taskFileApi';
// import { subtaskFileApi } from '../services/subtaskFileApi';
// import { workItemLabelApi } from '../services/workItemLabelApi';
// import { aiApi } from '../services/aiApi';
// import { subtaskCommentApi } from '../services/subtaskCommentApi';
// import { taskAssignmentApi } from '../services/taskAssignmentApi';
// import { subtaskAiApi } from '../services/subtaskAiApi';
// import { projectPositionApi } from '../services/projectPositionApi';
// import { projectRecommendationApi } from '../services/projectRecommendationApi';
// import projectCurrentReducer from '../components/slices/Project/projectCurrentSlice';

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['project'],
// };

// export const store = configureStore({
//   reducer: {
//     [api.reducerPath]: api.reducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [taskApi.reducerPath]: taskApi.reducer,
//     [milestoneApi.reducerPath]: milestoneApi.reducer,
//     [sprintApi.reducerPath]: sprintApi.reducer,
//     [accountApi.reducerPath]: accountApi.reducer,
//     [meetingApi.reducerPath]: meetingApi.reducer,
//     [meetingLogApi.reducerPath]: meetingLogApi.reducer,
//     [projectMetricApi.reducerPath]: projectMetricApi.reducer,
//     [subtaskApi.reducerPath]: subtaskApi.reducer,
//     [projectApi.reducerPath]: projectApi.reducer,
//     [taskCommentApi.reducerPath]: taskCommentApi.reducer,
//     [meetingParticipantApi.reducerPath]: meetingParticipantApi.reducer,
//     [documentApi.reducerPath]: documentApi.reducer,
//     [meetingFeedbackApi.reducerPath]: meetingFeedbackApi.reducer,
//     [riskApi.reducerPath]: riskApi.reducer,
//     [dynamicCategoryApi.reducerPath]: dynamicCategoryApi.reducer,
//     [requirementApi.reducerPath]: requirementApi.reducer,
//     [epicApi.reducerPath]: epicApi.reducer,
//     [projectMemberApi.reducerPath]: projectMemberApi.reducer,
//     [taskFileApi.reducerPath]: taskFileApi.reducer,
//     [subtaskFileApi.reducerPath]: subtaskFileApi.reducer,
//     [workItemLabelApi.reducerPath]: workItemLabelApi.reducer,
//     [aiApi.reducerPath]: aiApi.reducer,
//     [subtaskCommentApi.reducerPath]: subtaskCommentApi.reducer,
//     [taskAssignmentApi.reducerPath]: taskAssignmentApi.reducer,
//     [subtaskAiApi.reducerPath]: subtaskAiApi.reducer,
//     [projectPositionApi.reducerPath]: projectPositionApi.reducer,
//     [projectRecommendationApi.reducerPath]: projectRecommendationApi.reducer,
//     doc: docReducer,
//     projectCreation: projectCreationReducer,
//      project: projectCurrentReducer,

//   },

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       api.middleware,
//       authApi.middleware,
//       taskApi.middleware,
//       milestoneApi.middleware,
//       sprintApi.middleware,
//       accountApi.middleware,
//       meetingApi.middleware,
//       meetingLogApi.middleware,
//       projectMetricApi.middleware,
//       subtaskApi.middleware,
//       projectApi.middleware,
//       taskCommentApi.middleware,
//       meetingParticipantApi.middleware,
//       documentApi.middleware,
//       meetingFeedbackApi.middleware,
//       riskApi.middleware,
//       dynamicCategoryApi.middleware,
//       requirementApi.middleware,
//       epicApi.middleware,
//       projectMemberApi.middleware,
//       taskFileApi.middleware,
//       workItemLabelApi.middleware,
//       aiApi.middleware,
//       subtaskFileApi.middleware,
//       subtaskCommentApi.middleware,
//       taskAssignmentApi.middleware,
//       subtaskAiApi.middleware,
//       projectPositionApi.middleware,
//       projectRecommendationApi.middleware,
//     ),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // dùng localStorage
import { persistReducer, persistStore } from 'redux-persist';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

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
import { epicApi } from '../services/epicApi';
import { projectApi } from '../services/projectApi';
import { taskCommentApi } from '../services/taskCommentApi';
import { meetingParticipantApi } from '../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
import { documentApi } from '../services/Document/documentAPI';
import { meetingFeedbackApi } from '../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { riskApi } from '../services/riskApi';
import projectCreationReducer from '../components/slices/Project/projectCreationSlice';
import { dynamicCategoryApi } from '../services/dynamicCategoryApi';
import { requirementApi } from '../services/requirementApi';
import { projectMemberApi } from '../services/projectMemberApi';
import { taskFileApi } from '../services/taskFileApi';
import { subtaskFileApi } from '../services/subtaskFileApi';
import { workItemLabelApi } from '../services/workItemLabelApi';
import { aiApi } from '../services/aiApi';
import { subtaskCommentApi } from '../services/subtaskCommentApi';
import { taskAssignmentApi } from '../services/taskAssignmentApi';
import { subtaskAiApi } from '../services/subtaskAiApi';
import { projectPositionApi } from '../services/projectPositionApi';
import { projectRecommendationApi } from '../services/projectRecommendationApi';
import { epicFileApi } from '../services/epicFileApi';
import { meetingRescheduleRequestApi } from '../services/ProjectManagement/MeetingServices/MeetingRescheduleRequestServices';
import { epicCommentApi } from '../services/epicCommentApi';
import { workLogApi } from '../services/workLogApi';
import { activityLogApi } from '../services/activityLogApi';
import docReducer from '../components/slices/Document/documentSlice';
import projectCurrentReducer from '../components/slices/Project/projectCurrentSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['project'],
};

// 👉 Gộp tất cả reducers
const rootReducer = combineReducers({
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
  [dynamicCategoryApi.reducerPath]: dynamicCategoryApi.reducer,
  [requirementApi.reducerPath]: requirementApi.reducer,
  [epicApi.reducerPath]: epicApi.reducer,
  [projectMemberApi.reducerPath]: projectMemberApi.reducer,
  [taskFileApi.reducerPath]: taskFileApi.reducer,
  [subtaskFileApi.reducerPath]: subtaskFileApi.reducer,
  [workItemLabelApi.reducerPath]: workItemLabelApi.reducer,
  [aiApi.reducerPath]: aiApi.reducer,
  [subtaskCommentApi.reducerPath]: subtaskCommentApi.reducer,
  [taskAssignmentApi.reducerPath]: taskAssignmentApi.reducer,
  [subtaskAiApi.reducerPath]: subtaskAiApi.reducer,
  [projectPositionApi.reducerPath]: projectPositionApi.reducer,
  [projectRecommendationApi.reducerPath]: projectRecommendationApi.reducer,
  [epicFileApi.reducerPath]: epicFileApi.reducer,
  [meetingRescheduleRequestApi.reducerPath]: meetingRescheduleRequestApi.reducer,
  [epicCommentApi.reducerPath]: epicCommentApi.reducer,
  [workLogApi.reducerPath]: workLogApi.reducer,
  [activityLogApi.reducerPath]: activityLogApi.reducer,
  doc: docReducer,
  projectCreation: projectCreationReducer,
  project: projectCurrentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
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
      dynamicCategoryApi.middleware,
      requirementApi.middleware,
      epicApi.middleware,
      projectMemberApi.middleware,
      taskFileApi.middleware,
      workItemLabelApi.middleware,
      aiApi.middleware,
      subtaskFileApi.middleware,
      subtaskCommentApi.middleware,
      taskAssignmentApi.middleware,
      subtaskAiApi.middleware,
      projectPositionApi.middleware,
      projectRecommendationApi.middleware,
      epicFileApi.middleware,
      meetingRescheduleRequestApi.middleware,
      epicCommentApi.middleware, 
      workLogApi.middleware,
      activityLogApi.middleware,
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
