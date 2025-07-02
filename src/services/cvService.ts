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
        return { 
          profile: this.convertBasicToUserProfile(basicResult.data!), 
          analysis: basicResult 
        };
      } catch (basicError) {
        throw error;
      }
    }
  }

  // Helper method to convert basic analysis result to UserProfile
  private static convertBasicToUserProfile(basicData: any): UserProfile {
    const personalInfo = basicData.personalInfo || {};
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
      title: basicData.experience?.[0]?.title || '',
      summary: basicData.summary || '',
      linkedin: personalInfo.linkedin || '',
      github: personalInfo.website || '',
      experiences: (basicData.experience || []).map((exp: any) => ({
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: exp.title || 'Poste non spécifié',
        company: exp.company || 'Entreprise non spécifiée',
        location: '',
        startDate: formatDate(exp.period),
        endDate: '',
        current: false,
        description: exp.description || '',
        achievements: []
      })),
      education: (basicData.education || []).map((edu: any) => ({
        id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        institution: edu.institution || 'Institution inconnue',
        degree: edu.degree || 'Diplôme non spécifié',
        field: '',
        startDate: formatDate(edu.year),
        endDate: formatDate(edu.year),
        current: false,
        grade: edu.grade || '',
        description: ''
      })),
      skills: (basicData.skills || []).map((skill: string) => ({
        name: skill,
        level: 'Intermédiaire' as const,
        category: 'Technique' as const,
        verified: false
      })),
      languages: (basicData.languages || []).map((lang: any) => ({
        name: lang.language || 'Langue non spécifiée',
        level: this.normalizeLanguageLevel(lang.level || 'B1')
      })),
      certifications: (basicData.certifications || []).map((cert: any) => ({
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cert.name || 'Certification non spécifiée',
        issuer: cert.issuer || 'Émetteur non spécifié',
        issueDate: formatDate(cert.date),
        credentialId: '',
        url: ''
      })),
      cvFilePath: '',
      lastUpdated: new Date().toISOString(),
      completionScore: this.calculateCompletionScore(basicData)
    };
  }

  private static normalizeLanguageLevel(level: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif' {
    const normalizedLevel = level.toLowerCase().trim();
    
    // Direct matches
    if (['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'natif'].includes(normalizedLevel)) {
      return level.toUpperCase() as any;
    }
    
    // Common variations
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

  private static calculateCompletionScore(data: any): number {
    let score = 0;
    const personalInfo = data.personalInfo || {};
    
    if (personalInfo.name) score += 20;
    if (personalInfo.email) score += 20;
    if (personalInfo.phone) score += 10;
    if (data.summary) score += 10;
    
    score += Math.min((data.experience || []).length * 15, 30);
    score += Math.min((data.education || []).length * 10, 20);
    score += Math.min((data.skills || []).length * 2, 10);
    
    return Math.min(score, 100);
  }

  // Update profile with CV data after user acceptance
  static async updateProfileWithCVData(userId: string, profile: UserProfile, file: File): Promise<{ profile: UserProfile; analysis: any }> {
    try {
      console.log('CVService.updateProfileWithCVData started');
      console.log('Parameters:', { userId, profile, fileName: file.name });
      
      // 1. Upload CV to Supabase Storage
      const filePath = `cvs/${userId}/${file.name}`;
      console.log('Uploading CV to:', filePath);
      
      const uploadData = await SupabaseService.uploadFile('cvs', filePath, file);
      console.log('CV upload result:', uploadData);
      
      if (!uploadData) {
        throw new Error('Failed to upload CV file to storage');
      }
      
      // Get the public URL for the uploaded file
      const publicUrl = SupabaseService.getFileUrl('cvs', filePath);
      console.log('CV public URL:', publicUrl);
      
      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded CV');
      }

      // 2. Update user profile with CV file path and analysis results
      console.log('Preparing profile update data...');
      const updatedProfile: Partial<UserProfile> = {
        cvFilePath: publicUrl, // Store the public URL of the uploaded CV
        originalCVFileName: file.name, // Store original filename
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        title: profile.title,
        summary: profile.summary,
        linkedin: profile.linkedin,
        github: profile.github,
        experiences: profile.experiences || [],
        education: profile.education || [],
        skills: profile.skills || [],
        languages: profile.languages || [],
        certifications: profile.certifications || [],
        completionScore: profile.completionScore,
        lastUpdated: new Date().toISOString(),
      };

      console.log('Calling SupabaseService.updateUserProfile...');
      const profileData = await SupabaseService.updateUserProfile(userId, updatedProfile);
      console.log('SupabaseService.updateUserProfile completed');

      if (!profileData) {
        throw new Error(`Failed to update user profile with CV path`);
      }

      console.log('Profile updated successfully with CV:', profileData);
      return { profile: profileData, analysis: null };
    } catch (error) {
      console.error('Error in updateProfileWithCVData:', error);
      throw error;
    }
  }

  // Test method to check text extraction
  static async testTextExtraction(file: File): Promise<string> {
    try {
      const text = await cvAnalysisService.extractTextFromFile(file);
      return text;
    } catch (error) {
      throw error;
    }
  }

  // Original method for backward compatibility
  static async uploadAndAnalyzeCV(userId: string, file: File): Promise<{ profile: UserProfile; analysis: any }> {
    try {
      // 1. Upload CV to Supabase Storage
      const filePath = `cvs/${userId}/${file.name}`;
      const uploadData = await SupabaseService.uploadFile('cvs', filePath, file);
      
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
