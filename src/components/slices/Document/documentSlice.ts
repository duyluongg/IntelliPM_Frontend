import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface DocState {
  id: number | null;
  title: string;
  content: string;
  isNew: boolean;
}

const initialState: DocState = {
  id: null,
  title: '',
  content: '',
  isNew: true,
};

const docSlice = createSlice({
  name: 'doc',
  initialState,
  reducers: {
    setDoc(state, action: PayloadAction<Partial<DocState>>) {
      return { ...state, ...action.payload };
    },
    resetDoc() {
      return initialState;
    },
  },
});

export const { setDoc, resetDoc } = docSlice.actions;
export default docSlice.reducer;
