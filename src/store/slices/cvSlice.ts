import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CVAnalysis {
  id: string;
  fileName: string;
  uploadDate: string;
  strengths: string[];
  skills: string[];
  recommendations: string[];
  score: number;
  summary: string;
}

interface CVState {
  current: CVAnalysis | null;
  history: CVAnalysis[];
  loading: boolean;
  error: string | null;
}

const initialState: CVState = {
  current: null,
  history: [],
  loading: false,
  error: null,
};

const cvSlice = createSlice({
  name: 'cv',
  initialState,
  reducers: {
    uploadCVStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    uploadCVSuccess: (state, action: PayloadAction<CVAnalysis>) => {
      state.loading = false;
      state.current = action.payload;
      state.history.push(action.payload);
    },
    uploadCVFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCV: (state) => {
      state.current = null;
    },
    setCurrentCV: (state, action: PayloadAction<CVAnalysis | null>) => {
      state.current = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  uploadCVStart, 
  uploadCVSuccess, 
  uploadCVFailure, 
  clearCV, 
  setCurrentCV, 
  setLoading, 
  setError 
} = cvSlice.actions;
export default cvSlice.reducer;