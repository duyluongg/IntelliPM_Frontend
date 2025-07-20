import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  currentProjectId: number | null;
}

const initialState: ProjectState = {
  currentProjectId: null,
};

const projectCurrentSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProjectId(state, action: PayloadAction<number>) {
      state.currentProjectId = action.payload;
    },
    clearCurrentProjectId(state) {
      state.currentProjectId = null;
    },
  },
});

export const { setCurrentProjectId, clearCurrentProjectId } = projectCurrentSlice.actions;

export default projectCurrentSlice.reducer;
