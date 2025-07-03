import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RequirementRequest } from '../../../services/requirementApi';

export interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  requirements: RequirementRequest[];
  invitees: string[];
}

interface ProjectCreationState {
  step: number;
  projectId?: number;
  formData: ProjectFormData;
}

const initialState: ProjectCreationState = {
  step: 0,
  projectId: undefined,
  formData: {
    name: '',
    projectKey: '',
    description: '',
    requirements: [],
    invitees: [''],
  },
};

const projectCreationSlice = createSlice({
  name: 'projectCreation',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setFormData: (state, action: PayloadAction<Partial<ProjectFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setProjectId: (state, action: PayloadAction<number>) => {
      state.projectId = action.payload;
    },
    resetProjectCreation: () => initialState,
  },
});

export const { setStep, setFormData, setProjectId, resetProjectCreation } = projectCreationSlice.actions;
export const selectStep = (state: { projectCreation: ProjectCreationState }) => state.projectCreation.step;
export const selectFormData = (state: { projectCreation: ProjectCreationState }) => state.projectCreation.formData;
export const selectProjectId = (state: { projectCreation: ProjectCreationState }) => state.projectCreation.projectId;

export default projectCreationSlice.reducer;