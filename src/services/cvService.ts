import { cvAnalysisService } from './cvAnalysisService';
import { enhancedCVAnalysisService } from './enhancedCVAnalysisService';
import { SupabaseService } from './supabaseService';
import { UserProfile } from '../store/slices/profileSlice';

export class CVService {
  // Extract and analyze CV without updating profile
  static async extractAndAnalyzeCV(file: File): Promise<{ profile: UserProfile; analysis: unknown }> {
    try {
      // Use the enhanced service with AI integration
      const analysisResult = await enhancedCVAnalysisService.processFile(file);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'CV analysis failed');
      }

      return { 
        profile: analysisResult.userProfile!, 
        analysis: {
          ...analysisResult,
          recommendations: [
            {
              category: 'profile',
              title: 'Profil extrait automatiquement du CV',
              description: 'Les informations de votre CV ont été analysées par IA'
            },
            {
              category: 'skills',
              title: `${analysisResult.userProfile?.skills.length || 0} compétences identifiées`,
              description: 'Compétences extraites et organisées automatiquement'
            },
            {
              category: 'experience',
              title: `${analysisResult.userProfile?.experiences.length || 0} expériences professionnelles`,
              description: 'Historique professionnel structuré et analysé'
            }
          ]
        }
      };
    } catch (error) {
      // Fallback to original service if enhanced fails
      try {
        const basicResult = await cvAnalysisService.processFile(file);

        if (!basicResult.success) {
          throw new Error(basicResult.error || 'Basic CV analysis failed');
        }

        const userProfile = this.convertBasicToUserProfile(basicResult.data!);

        return { 
          profile: userProfile, 
          analysis: {
            ...basicResult,
            recommendations: [
              {
                category: 'profile',
                title: 'Analyse basique du CV terminée',
                description: 'Extraction basique des informations du CV'
              },
              {
                category: 'format',
                title: 'Format du CV analysé',
                description: 'Structure et organisation du document'
              }
            ]
          }
        };
      } catch (fallbackError) {
        console.error('Both enhanced and basic CV analysis failed:', error, fallbackError);
        throw error;
      }
    }
  }

  // Update profile with CV data and upload file
  static async updateProfileWithCVData(userId: string, profile: UserProfile, file: File): Promise<UserProfile> {
    try {
      // 1. Upload CV to Supabase Storage
      const timestamp = Date.now();
      const filePath = `cvs/${userId}/${timestamp}_${file.name}`;

      await SupabaseService.uploadFile('cvs', filePath, file);

      // 2. Update profile with CV data and file path
      const updatedProfile: Partial<UserProfile> = {
        ...profile,
        cvFilePath: filePath,
        lastUpdated: new Date().toISOString(),
      };

      const profileData = await SupabaseService.updateUserProfile(userId, updatedProfile);

      if (!profileData) {
        throw new Error('Failed to update user profile');
      }

      return profileData;
    } catch (error) {
      console.error('Error updating profile with CV data:', error);
      throw error;
    }
  }

  // Convert basic CV analysis to UserProfile format
  static convertBasicToUserProfile(cvData: any): UserProfile {
    const personalInfo = cvData.personalInfo || {};
    const nameParts = personalInfo.name ? personalInfo.name.split(' ') : ['', ''];

    // Helper function to format dates
    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) return '2020-01-01'; // Default date if no date provided

      // If it's just a year (4 digits), convert to January 1st of that year
      if (/^\d{4}$/.test(dateStr)) {
        return `${dateStr}-01-01`;
      }

      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      // Try to parse other formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }

      // If all else fails, return default date
      return '2020-01-01';
    };

    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.address || '',
      title: cvData.experience?.[0]?.title || '',
      summary: cvData.summary || '',
      linkedin: personalInfo.linkedin || '',
      github: personalInfo.website || '',
      experiences: (cvData.experience || []).map((exp: any) => ({
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: exp.title || 'Poste non spécifié',
        company: exp.company || 'Entreprise non spécifiée',
        location: '',
        startDate: this.extractStartDate(exp.period),
        endDate: this.extractEndDate(exp.period),
        current: exp.period.toLowerCase().includes('actuel') || exp.period.toLowerCase().includes('present'),
        description: exp.description || '',
        achievements: []
      })),
      education: (cvData.education || []).map((edu: any) => ({
        id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        institution: edu.institution || 'Institution inconnue',
        degree: edu.degree || 'Diplôme non spécifié',
        field: '',
        startDate: this.extractStartDate(edu.year),
        endDate: this.extractEndDate(edu.year),
        current: false,
        grade: edu.grade || '',
        description: ''
      })),
      skills: (cvData.skills || []).map((skill: string) => ({
        name: skill,
        level: 'Intermédiaire' as const,
        category: 'Technique' as const,
        verified: false
      })),
      languages: (cvData.languages || []).map((lang: any) => ({
        name: lang.language || 'Langue non spécifiée',
        level: this.normalizeLanguageLevel(lang.level || 'B1')
      })),
      certifications: (cvData.certifications || []).map((cert: any) => ({
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cert.name || 'Certification non spécifiée',
        issuer: cert.issuer || 'Émetteur non spécifié',
        issueDate: this.formatDate(cert.date),
        credentialId: '',
        url: ''
      })),
      cvFilePath: '',
      lastUpdated: new Date().toISOString(),
      completionScore: this.calculateCompletionScore(cvData)
    };
  }

  private static extractStartDate(period: string): string {
    const datePattern = /(\d{4})/g;
    const matches = period.match(datePattern);
    if (matches) {
      return `${matches[0]}-01-01`;
    }
    return '';
  }

  private static extractEndDate(period: string): string {
    if (period.toLowerCase().includes('actuel') || period.toLowerCase().includes('present')) {
      return '';
    }
    const datePattern = /(\d{4})/g;
    const matches = period.match(datePattern);
    if (matches && matches.length > 1) {
      return `${matches[1]}-01-01`;
    } else if (matches) {
      return `${matches[0]}-01-01`;
    }
    return '';
  }

  private static normalizeLanguageLevel(level: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif' {
    const normalizedLevel = level.toLowerCase().trim();

    if (['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'natif'].includes(normalizedLevel)) {
      return level.toUpperCase() as any;
    }

    if (['débutant', 'beginner', 'basic', 'élémentaire'].includes(normalizedLevel)) {
      return 'A1';
    }
    if (['pré-intermédiaire', 'pre-intermediate', 'elementary'].includes(normalizedLevel)) {
      return 'A2';
    }
    if (['intermédiaire', 'intermediate', 'moyen'].includes(normalizedLevel)) {
      return 'B1';
    }
    if (['intermédiaire avancé', 'upper-intermediate', 'intermédiaire supérieur'].includes(normalizedLevel)) {
      return 'B2';
    }
    if (['avancé', 'advanced', 'supérieur'].includes(normalizedLevel)) {
      return 'C1';
    }
    if (['maîtrise', 'mastery', 'expert', 'courant'].includes(normalizedLevel)) {
      return 'C2';
    }
    if (['natif', 'native', 'maternelle', 'langue maternelle'].includes(normalizedLevel)) {
      return 'Natif';
    }

    // Default to B1 if unknown
    return 'B1';
  }

  private static formatDate(dateStr: string): string {
    if (!dateStr) return '2020-01-01';

    if (/^\d{4}$/.test(dateStr)) {
      return `${dateStr}-01-01`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return '2020-01-01';
  }

  private static calculateCompletionScore(cvData: any): number {
    let score = 0;
    const personalInfo = cvData.personalInfo || {};

    if (personalInfo.name) score += 20;
    if (personalInfo.email) score += 20;
    if (personalInfo.phone) score += 10;
    if (cvData.summary) score += 10;

    score += Math.min((cvData.experience || []).length * 15, 30);
    score += Math.min((cvData.education || []).length * 10, 20);
    score += Math.min((cvData.skills || []).length * 2, 10);

    return Math.min(score, 100);
  }

  // Original method for backward compatibility
  static async uploadAndAnalyzeCV(userId: string, file: File): Promise<{ profile: UserProfile; analysis: any }> {
    try {
      // 1. Upload CV to Supabase Storage
      const filePath = `cvs/${userId}/${file.name}`;
      // const uploadData = await SupabaseService.uploadFile('cvs', filePath, file);

      // Get the public URL for the uploaded file
      const publicUrl = SupabaseService.getFileUrl('cvs', filePath);

      // 2. Analyze CV content
      const analysisResult = await cvAnalysisService.processFile(file);

      // 3. Convert analysis result to UserProfile and update
      const userProfile = this.convertBasicToUserProfile(analysisResult.data!);
      const updatedProfile: Partial<UserProfile> = {
        ...userProfile,
        cvFilePath: publicUrl, // Store the public URL of the uploaded CV
        lastUpdated: new Date().toISOString(),
      };

      const profileData = await SupabaseService.updateUserProfile(userId, updatedProfile);

      if (!profileData) {
        throw new Error(`Failed to update user profile with CV path`);
      }

      return { profile: profileData, analysis: analysisResult };
    } catch (error) {
      throw error;
    }
  }
}