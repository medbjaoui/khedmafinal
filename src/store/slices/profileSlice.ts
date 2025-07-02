import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  location?: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  description?: string;
}

export interface Skill {
  name: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  category: 'Technique' | 'Linguistique' | 'Soft Skills' | 'Outils';
  verified: boolean;
}

export interface Language {
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface UserProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth?: string;
  nationality?: string;
  
  // Professional Information
  title: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  
  // Additional Information
  portfolio?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  
  // CV Information
  cvFilePath?: string;
  originalCVFileName?: string;
  originalCVUrl?: string;
  lastUpdated: string;
  completionScore: number;
}

export interface ProfileRecommendation {
  id: string;
  type: 'missing_info' | 'improvement' | 'optimization' | 'formatting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  category: 'profile' | 'experience' | 'skills' | 'education' | 'formatting';
  completed: boolean;
  dismissed?: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  recommendations: ProfileRecommendation[];
  loading: boolean;
  error: string | null;
  extractionLoading: boolean;
  extractionProgress: number;
  extractionError: string | null;
  analysisResults: {
    extractedText: string;
    confidence: number;
    detectedSections: string[];
    processingTime: number;
  } | null;
  profileCompletion: {
    overall: number;
    sections: {
      personal: number;
      professional: number;
      experience: number;
      education: number;
      skills: number;
    };
  };
}

const initialState: ProfileState = {
  profile: null,
  recommendations: [],
  loading: false,
  error: null,
  extractionLoading: false,
  extractionProgress: 0,
  extractionError: null,
  analysisResults: null,
  profileCompletion: {
    overall: 0,
    sections: {
      personal: 0,
      professional: 0,
      experience: 0,
      education: 0,
      skills: 0,
    },
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Profile Fetching Actions
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.loading = false;
      state.profile = action.payload;
      state.profileCompletion = calculateProfileCompletion(action.payload);
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // CV Extraction Actions
    startCVExtraction: (state) => {
      state.extractionLoading = true;
      state.extractionProgress = 0;
      state.extractionError = null;
    },
    updateExtractionProgress: (state, action: PayloadAction<number>) => {
      state.extractionProgress = action.payload;
    },
    cvExtractionSuccess: (state, action: PayloadAction<{
      profile: UserProfile;
      analysisResults: typeof initialState.analysisResults;
      recommendations: ProfileRecommendation[];
    }>) => {
      state.extractionLoading = false;
      state.extractionProgress = 100;
      state.profile = action.payload.profile;
      state.analysisResults = action.payload.analysisResults;
      state.recommendations = action.payload.recommendations;
      state.profileCompletion = calculateProfileCompletion(action.payload.profile);
    },
    cvExtractionFailure: (state, action: PayloadAction<string>) => {
      state.extractionLoading = false;
      state.extractionError = action.payload;
    },

    // Profile Management Actions
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.profileCompletion = calculateProfileCompletion(action.payload);
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload, lastUpdated: new Date().toISOString() };
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    addExperience: (state, action: PayloadAction<Experience>) => {
      if (state.profile) {
        if (!state.profile.experiences) {
          state.profile.experiences = [];
        }
        state.profile.experiences.push(action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    updateExperience: (state, action: PayloadAction<{id: string; data: Partial<Experience>}>) => {
      if (state.profile && state.profile.experiences) {
        const index = state.profile.experiences.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.profile.experiences[index] = { ...state.profile.experiences[index], ...action.payload.data };
          state.profileCompletion = calculateProfileCompletion(state.profile);
        }
      }
    },
    removeExperience: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.experiences) {
        state.profile.experiences = state.profile.experiences.filter(exp => exp.id !== action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    addEducation: (state, action: PayloadAction<Education>) => {
      if (state.profile) {
        if (!state.profile.education) {
          state.profile.education = [];
        }
        state.profile.education.push(action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    updateEducation: (state, action: PayloadAction<{id: string; data: Partial<Education>}>) => {
      if (state.profile && state.profile.education) {
        const index = state.profile.education.findIndex(edu => edu.id === action.payload.id);
        if (index !== -1) {
          state.profile.education[index] = { ...state.profile.education[index], ...action.payload.data };
          state.profileCompletion = calculateProfileCompletion(state.profile);
        }
      }
    },
    removeEducation: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.education) {
        state.profile.education = state.profile.education.filter(edu => edu.id !== action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    updateSkills: (state, action: PayloadAction<Skill[]>) => {
      if (state.profile) {
        state.profile.skills = action.payload;
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    addSkill: (state, action: PayloadAction<Skill>) => {
      if (state.profile) {
        if (!state.profile.skills) {
          state.profile.skills = [];
        }
        const existingSkill = state.profile.skills.find(skill => skill.name.toLowerCase() === action.payload.name.toLowerCase());
        if (!existingSkill) {
          state.profile.skills.push(action.payload);
          state.profileCompletion = calculateProfileCompletion(state.profile);
        }
      }
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.skills) {
        state.profile.skills = state.profile.skills.filter(skill => skill.name !== action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    updateLanguages: (state, action: PayloadAction<Language[]>) => {
      if (state.profile) {
        state.profile.languages = action.payload;
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    addCertification: (state, action: PayloadAction<Certification>) => {
      if (state.profile) {
        if (!state.profile.certifications) {
          state.profile.certifications = [];
        }
        state.profile.certifications.push(action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },
    removeCertification: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.certifications) {
        state.profile.certifications = state.profile.certifications.filter(cert => cert.id !== action.payload);
        state.profileCompletion = calculateProfileCompletion(state.profile);
      }
    },

    // Recommendations Actions
    markRecommendationCompleted: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(rec => rec.id === action.payload);
      if (recommendation) {
        recommendation.completed = true;
      }
    },
    dismissRecommendation: (state, action: PayloadAction<string>) => {
      state.recommendations = state.recommendations.filter(rec => rec.id !== action.payload);
    },
    generateNewRecommendations: (state) => {
      if (state.profile) {
        state.recommendations = generateRecommendations(state.profile);
      }
    },
    setRecommendations: (state, action: PayloadAction<ProfileRecommendation[]>) => {
      state.recommendations = action.payload;
    },
    addRecommendation: (state, action: PayloadAction<ProfileRecommendation>) => {
      state.recommendations.push(action.payload);
    },
    updateRecommendation: (state, action: PayloadAction<{id: string; updates: Partial<ProfileRecommendation>}>) => {
      const index = state.recommendations.findIndex(rec => rec.id === action.payload.id);
      if (index !== -1) {
        state.recommendations[index] = { ...state.recommendations[index], ...action.payload.updates };
      }
    },

    // Clear Profile
    clearProfile: (state) => {
      state.profile = null;
      state.recommendations = [];
      state.analysisResults = null;
      state.profileCompletion = initialState.profileCompletion;
    },
  },
});

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: UserProfile) {
  const sections = {
    personal: 0,
    professional: 0,
    experience: 0,
    education: 0,
    skills: 0,
  };

  // Personal Information (25%)
  let personalFields = 0;
  const personalTotal = 6;
  if (profile.firstName) personalFields++;
  if (profile.lastName) personalFields++;
  if (profile.email) personalFields++;
  if (profile.phone) personalFields++;
  if (profile.location) personalFields++;
  if (profile.dateOfBirth) personalFields++;
  sections.personal = Math.round((personalFields / personalTotal) * 100);

  // Professional Information (25%)
  let professionalFields = 0;
  const professionalTotal = 4;
  if (profile.title) professionalFields++;
  if (profile.summary && profile.summary.length > 50) professionalFields++;
  if (profile.linkedin) professionalFields++;
  if (profile.portfolio || profile.github || profile.website) professionalFields++;
  sections.professional = Math.round((professionalFields / professionalTotal) * 100);

  // Experience (25%) - Handle undefined arrays
  const experiences = profile.experiences || [];
  sections.experience = experiences.length > 0 ? 
    Math.min(100, experiences.length * 33) : 0;

  // Education (15%) - Handle undefined arrays
  const education = profile.education || [];
  sections.education = education.length > 0 ? 
    Math.min(100, education.length * 50) : 0;

  // Skills (10%) - Handle undefined arrays
  const skills = profile.skills || [];
  sections.skills = skills.length > 0 ? 
    Math.min(100, skills.length * 10) : 0;

  // Overall completion
  const overall = Math.round(
    (sections.personal * 0.25) +
    (sections.professional * 0.25) +
    (sections.experience * 0.25) +
    (sections.education * 0.15) +
    (sections.skills * 0.10)
  );

  return { overall, sections };
}

// Helper function to generate recommendations
function generateRecommendations(profile: UserProfile): ProfileRecommendation[] {
  const recommendations: ProfileRecommendation[] = [];

  // Missing personal information
  if (!profile.dateOfBirth) {
    recommendations.push({
      id: 'missing-dob',
      type: 'missing_info',
      priority: 'low',
      title: 'Ajouter votre date de naissance',
      description: 'Certains employeurs peuvent demander cette information',
      action: 'Compléter les informations personnelles',
      category: 'profile',
      completed: false,
    });
  }

  if (!profile.linkedin) {
    recommendations.push({
      id: 'missing-linkedin',
      type: 'missing_info',
      priority: 'high',
      title: 'Ajouter votre profil LinkedIn',
      description: 'LinkedIn est essentiel pour votre visibilité professionnelle',
      action: 'Ajouter le lien LinkedIn',
      category: 'profile',
      completed: false,
    });
  }

  // Professional summary
  if (!profile.summary || profile.summary.length < 100) {
    recommendations.push({
      id: 'improve-summary',
      type: 'improvement',
      priority: 'high',
      title: 'Améliorer votre résumé professionnel',
      description: 'Un résumé détaillé augmente vos chances de 40%',
      action: 'Rédiger un résumé de 150-200 mots',
      category: 'profile',
      completed: false,
    });
  }

  // Experience recommendations
  const experiences = profile.experiences || [];
  if (experiences.length === 0) {
    recommendations.push({
      id: 'add-experience',
      type: 'missing_info',
      priority: 'high',
      title: 'Ajouter vos expériences professionnelles',
      description: 'Les expériences sont cruciales pour votre profil',
      action: 'Ajouter au moins une expérience',
      category: 'experience',
      completed: false,
    });
  } else {
    // Check for incomplete experiences
    experiences.forEach((exp) => {
      if (!exp.description || exp.description.length < 50) {
        recommendations.push({
          id: `improve-exp-${exp.id}`,
          type: 'improvement',
          priority: 'medium',
          title: `Détailler l'expérience chez ${exp.company}`,
          description: 'Ajoutez des détails sur vos responsabilités et réalisations',
          action: 'Compléter la description',
          category: 'experience',
          completed: false,
        });
      }
    });
  }

  // Skills recommendations
  const skills = profile.skills || [];
  if (skills.length < 5) {
    recommendations.push({
      id: 'add-skills',
      type: 'missing_info',
      priority: 'medium',
      title: 'Ajouter plus de compétences',
      description: 'Visez 8-12 compétences pour un profil complet',
      action: 'Ajouter des compétences techniques et soft skills',
      category: 'skills',
      completed: false,
    });
  }

  // Education recommendations
  const education = profile.education || [];
  if (education.length === 0) {
    recommendations.push({
      id: 'add-education',
      type: 'missing_info',
      priority: 'medium',
      title: 'Ajouter votre formation',
      description: 'Incluez vos diplômes et formations importantes',
      action: 'Ajouter au moins un diplôme',
      category: 'education',
      completed: false,
    });
  }

  return recommendations;
}

export const {
  startCVExtraction,
  updateExtractionProgress,
  cvExtractionSuccess,
  cvExtractionFailure,
  setProfile,
  updateProfile,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  updateSkills,
  addSkill,
  removeSkill,
  updateLanguages,
  addCertification,
  removeCertification,
  markRecommendationCompleted,
  dismissRecommendation,
  generateNewRecommendations,
  setRecommendations,
  addRecommendation,
  updateRecommendation,
  clearProfile,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} = profileSlice.actions;

export default profileSlice.reducer;