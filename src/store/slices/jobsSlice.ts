import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  source: 'TanitJobs' | 'Keejob' | 'Emploi.tn' | 'LinkedIn';
  logo?: string;
  saved: boolean;
  matchScore?: number;
}

interface JobsState {
  jobs: Job[];
  savedJobs: Job[];
  loading: boolean;
  error: string | null;
  filters: {
    location: string;
    type: string;
    salary: string;
    keywords: string;
  };
}

const initialState: JobsState = {
  jobs: [],
  savedJobs: [],
  loading: false,
  error: null,
  filters: {
    location: '',
    type: '',
    salary: '',
    keywords: '',
  },
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    fetchJobsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.jobs = action.payload;
    },
    fetchJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    saveJob: (state, action: PayloadAction<string>) => {
      const job = state.jobs.find(j => j.id === action.payload);
      if (job) {
        job.saved = true;
        state.savedJobs.push(job);
      }
    },
    unsaveJob: (state, action: PayloadAction<string>) => {
      const jobIndex = state.jobs.findIndex(j => j.id === action.payload);
      if (jobIndex !== -1) {
        state.jobs[jobIndex].saved = false;
      }
      state.savedJobs = state.savedJobs.filter(j => j.id !== action.payload);
    },
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    fetchSavedJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.savedJobs = action.payload;
    },
  },
});

export const { 
  fetchJobsStart, 
  fetchJobsSuccess, 
  fetchJobsFailure, 
  saveJob, 
  unsaveJob, 
  fetchSavedJobsSuccess,
  updateFilters 
} = jobsSlice.actions;
export default jobsSlice.reducer;