import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIModel, AIResponse } from '../../services/aiService';

export interface AIState {
  currentModel: AIModel;
  availableModels: {
    id: AIModel;
    name: string;
    description: string;
    enabled: boolean;
    requiresApiKey: boolean;
  }[];
  isGenerating: boolean;
  lastResponse: AIResponse | null;
  error: string | null;
  usage: {
    totalTokens: number;
    totalRequests: number;
    lastReset: string;
  };
  settings: {
    groqApiKey: string;
    geminiApiKey: string;
    temperature: number;
    maxTokens: number;
  };
}

const initialState: AIState = {
  currentModel: 'local-mock',
  availableModels: [
    {
      id: 'local-mock',
      name: 'Mode Démo',
      description: 'Réponses simulées pour démonstration',
      enabled: true,
      requiresApiKey: false
    },
    {
      id: 'groq-llama',
      name: 'Groq Llama 3.1',
      description: 'Modèle rapide et performant via Groq',
      enabled: false,
      requiresApiKey: true
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Modèle avancé de Google',
      enabled: false,
      requiresApiKey: true
    }
  ],
  isGenerating: false,
  lastResponse: null,
  error: null,
  usage: {
    totalTokens: 0,
    totalRequests: 0,
    lastReset: new Date().toISOString()
  },
  settings: {
    groqApiKey: '',
    geminiApiKey: '',
    temperature: 0.7,
    maxTokens: 2048
  }
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setCurrentModel: (state, action: PayloadAction<AIModel>) => {
      state.currentModel = action.payload;
    },
    
    updateModelAvailability: (state, action: PayloadAction<{modelId: AIModel; enabled: boolean}>) => {
      const model = state.availableModels.find(m => m.id === action.payload.modelId);
      if (model) {
        model.enabled = action.payload.enabled;
      }
    },
    
    startGeneration: (state) => {
      state.isGenerating = true;
      state.error = null;
    },
    
    generationSuccess: (state, action: PayloadAction<AIResponse>) => {
      state.isGenerating = false;
      state.lastResponse = action.payload;
      state.usage.totalRequests += 1;
      if (action.payload.usage) {
        state.usage.totalTokens += action.payload.usage.totalTokens;
      }
    },
    
    generationFailure: (state, action: PayloadAction<string>) => {
      state.isGenerating = false;
      state.error = action.payload;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<typeof initialState.settings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Update model availability based on API keys
      const groqModel = state.availableModels.find(m => m.id === 'groq-llama');
      const geminiModel = state.availableModels.find(m => m.id === 'gemini-2.0-flash');
      
      if (groqModel) {
        groqModel.enabled = !!state.settings.groqApiKey;
      }
      if (geminiModel) {
        geminiModel.enabled = !!state.settings.geminiApiKey;
      }
    },
    
    resetUsage: (state) => {
      state.usage = {
        totalTokens: 0,
        totalRequests: 0,
        lastReset: new Date().toISOString()
      };
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setCurrentModel,
  updateModelAvailability,
  startGeneration,
  generationSuccess,
  generationFailure,
  updateSettings,
  resetUsage,
  clearError
} = aiSlice.actions;

export default aiSlice.reducer;