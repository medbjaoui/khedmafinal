import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyEmail?: string;
  appliedDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'interview' | 'rejected' | 'accepted';
  type: 'manual' | 'automatic';
  coverLetter: string;
  coverLetterFilePath?: string;
  customMessage?: string;
  response?: string;
  responseDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  salary?: string;
  notes?: string;
  attachments: string[];
  emailSent: boolean;
  emailId?: string;
  readReceipt?: boolean;
  source: string;
}

export interface ApplicationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isDefault: boolean;
  createdDate: string;
}

interface ApplicationsState {
  applications: Application[];
  templates: ApplicationTemplate[];
  loading: boolean;
  error: string | null;
  sendingEmail: boolean;
  generatingLetter: boolean;
  stats: {
    total: number;
    pending: number;
    interviews: number;
    responses: number;
    responseRate: number;
  };
  filters: {
    status: string;
    type: string;
    dateRange: string;
    company: string;
  };
}

const initialState: ApplicationsState = {
  applications: [],
  templates: [],
  loading: false,
  error: null,
  sendingEmail: false,
  generatingLetter: false,
  stats: {
    total: 0,
    pending: 0,
    interviews: 0,
    responses: 0,
    responseRate: 0
  },
  filters: {
    status: '',
    type: '',
    dateRange: '',
    company: ''
  }
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    // Application Management
    startApplicationProcess: (state) => {
      state.loading = true;
      state.error = null;
    },
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
      state.loading = false;
      // Recalculate stats based on new applications
      state.stats.total = action.payload.length;
      state.stats.pending = action.payload.filter(app => app.status === 'sent').length;
      state.stats.interviews = action.payload.filter(app => app.status === 'interview').length;
      state.stats.responses = action.payload.filter(app => app.status === 'rejected' || app.status === 'accepted').length;
      state.stats.responseRate = state.stats.total > 0 ? 
        Math.round((state.stats.responses / state.stats.total) * 100 * 10) / 10 : 0;
    },
    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.unshift(action.payload);
      state.stats.total += 1;
      state.stats.pending += 1;
      state.loading = false;
    },
    updateApplication: (state, action: PayloadAction<{id: string; data: Partial<Application>}>) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        const oldStatus = state.applications[index].status;
        state.applications[index] = { ...state.applications[index], ...action.payload.data };
        
        // Update stats
        if (oldStatus === 'sent' && action.payload.data.status !== 'sent') {
          state.stats.pending -= 1;
        }
        if (action.payload.data.status === 'interview') {
          state.stats.interviews += 1;
        }
        if (action.payload.data.status === 'rejected' || action.payload.data.status === 'accepted') {
          state.stats.responses += 1;
        }
        
        // Recalculate response rate
        state.stats.responseRate = state.stats.total > 0 ? 
          Math.round((state.stats.responses / state.stats.total) * 100 * 10) / 10 : 0;
      }
    },
    deleteApplication: (state, action: PayloadAction<string>) => {
      const app = state.applications.find(a => a.id === action.payload);
      if (app) {
        state.applications = state.applications.filter(a => a.id !== action.payload);
        state.stats.total -= 1;
        if (app.status === 'sent') state.stats.pending -= 1;
        if (app.status === 'interview') state.stats.interviews -= 1;
        if (app.status === 'rejected' || app.status === 'accepted') state.stats.responses -= 1;
        
        state.stats.responseRate = state.stats.total > 0 ? 
          Math.round((state.stats.responses / state.stats.total) * 100 * 10) / 10 : 0;
      }
    },

    // Email and Letter Generation
    startGeneratingLetter: (state) => {
      state.generatingLetter = true;
      state.error = null;
    },
    letterGenerationSuccess: (state, action: PayloadAction<{applicationId: string; letter: string}>) => {
      const app = state.applications.find(a => a.id === action.payload.applicationId);
      if (app) {
        app.coverLetter = action.payload.letter;
      }
      state.generatingLetter = false;
    },
    letterGenerationFailure: (state, action: PayloadAction<string>) => {
      state.generatingLetter = false;
      state.error = action.payload;
    },

    startSendingEmail: (state) => {
      state.sendingEmail = true;
      state.error = null;
    },
    emailSentSuccess: (state, action: PayloadAction<{applicationId: string; emailId: string}>) => {
      const app = state.applications.find(a => a.id === action.payload.applicationId);
      if (app) {
        app.emailSent = true;
        app.emailId = action.payload.emailId;
        app.status = 'sent';
      }
      state.sendingEmail = false;
    },
    emailSentFailure: (state, action: PayloadAction<string>) => {
      state.sendingEmail = false;
      state.error = action.payload;
    },

    // Template Management
    addTemplate: (state, action: PayloadAction<ApplicationTemplate>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<{id: string; data: Partial<ApplicationTemplate>}>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...action.payload.data };
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload && !t.isDefault);
    },
    setDefaultTemplate: (state, action: PayloadAction<string>) => {
      state.templates.forEach(t => t.isDefault = t.id === action.payload);
    },

    // Filters
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: '', type: '', dateRange: '', company: '' };
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  startApplicationProcess,
  setApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  startGeneratingLetter,
  letterGenerationSuccess,
  letterGenerationFailure,
  startSendingEmail,
  emailSentSuccess,
  emailSentFailure,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
  updateFilters,
  clearFilters,
  clearError
} = applicationsSlice.actions;

export default applicationsSlice.reducer;