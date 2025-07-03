import { createClient } from '@supabase/supabase-js';
import { UserProfile, Experience, Education, Skill, Language, Certification } from '../store/slices/profileSlice';
import { Job } from '../store/slices/jobsSlice';
import { Application } from '../store/slices/applicationsSlice';
import { CacheService } from './cacheService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
  // Auth Methods
  static async signUp(email: string, password: string, userData: { firstName: string; lastName: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email,
        phone: '',
        location: '',
        title: '',
        summary: '',
        experiences: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        lastUpdated: new Date().toISOString(),
        completionScore: 20
      });
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Profile Methods
  static async createUserProfile(userId: string, profile: UserProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        title: profile.title,
        summary: profile.summary,
        phone: profile.phone,
        location: profile.location,
        date_of_birth: profile.dateOfBirth,
        linkedin: profile.linkedin,
        github: profile.github,
        website: profile.website,
        portfolio: profile.portfolio,
        completion_score: profile.completionScore
      });

    if (error) throw error;
    return data;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Vérifier le cache d'abord
    const cached = CacheService.getUserProfile(userId);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

            if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a default one
          const defaultProfile: UserProfile = {
            firstName: 'Utilisateur',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            title: '',
            summary: '',
            cvFilePath: '',
            originalCVFileName: '',
            experiences: [],
            education: [],
            skills: [],
            languages: [],
            certifications: [],
            lastUpdated: new Date().toISOString(),
            completionScore: 20
          };

          try {
            await this.createUserProfile(userId, defaultProfile);
            return defaultProfile;
          } catch (createError: any) {
            // If it's a duplicate key error, the profile already exists
            if (createError.code === '23505') {
              // Try to fetch the existing profile again
              const { data: existingData, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

              if (fetchError) {
                return null;
              }

              // Return the existing profile data
              return {
                firstName: existingData.first_name,
                lastName: existingData.last_name,
                email: existingData.email || '',
                phone: existingData.phone || '',
                location: existingData.location || '',
                dateOfBirth: existingData.date_of_birth,
                title: existingData.title || '',
                summary: existingData.summary || '',
                linkedin: existingData.linkedin,
                github: existingData.github,
                website: existingData.website,
                portfolio: existingData.portfolio,
                cvFilePath: existingData.cv_file_path,
                originalCVFileName: existingData.original_cv_file_name,
                experiences: [],
                education: [],
                skills: [],
                languages: [],
                certifications: [],
                lastUpdated: existingData.updated_at,
                completionScore: existingData.completion_score || 0
              };
            }
            return null;
          }
        }
        throw error;
      }

      // Get related data
      const [experiences, education, skills, languages, certifications] = await Promise.all([
        this.getUserExperiences(userId),
        this.getUserEducation(userId),
        this.getUserSkills(userId),
        this.getUserLanguages(userId),
        this.getUserCertifications(userId)
      ]);

      const profile = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        dateOfBirth: data.date_of_birth,
        title: data.title || '',
        summary: data.summary || '',
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
        portfolio: data.portfolio,
        cvFilePath: data.cv_file_path,
        originalCVFileName: data.original_cv_file_name,
        experiences,
        education,
        skills,
        languages,
        certifications,
        lastUpdated: data.updated_at,
        completionScore: data.completion_score || 0
      };

      // Mettre en cache le profil
      CacheService.cacheUserProfile(userId, profile);
      
      return profile;
    } catch (error: any) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('user_profiles table does not exist - returning null');
        return null;
      }
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    console.log('SupabaseService.updateUserProfile started');
    console.log('Parameters:', { userId, updates });

    try {
      // 1. Update main profile data
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          title: updates.title,
          summary: updates.summary,
          phone: updates.phone,
          location: updates.location,
          date_of_birth: updates.dateOfBirth,
          linkedin: updates.linkedin,
          github: updates.github,
          website: updates.website,
          portfolio: updates.portfolio,
          cv_file_path: updates.cvFilePath,
          original_cv_file_name: updates.originalCVFileName,
          completion_score: updates.completionScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      console.log('Main profile updated:', data);

      // 2. Update related data if provided
      if (updates.experiences && updates.experiences.length > 0) {
        console.log('Updating experiences...');
        // Delete existing experiences
        await supabase.from('experiences').delete().eq('user_id', userId);
        // Insert new experiences
        for (const exp of updates.experiences) {
          await this.addExperience(userId, exp);
        }
      }

      if (updates.education && updates.education.length > 0) {
        console.log('Updating education...');
        // Delete existing education
        await supabase.from('education').delete().eq('user_id', userId);
        // Insert new education
        for (const edu of updates.education) {
          await this.addEducation(userId, edu);
        }
      }

      if (updates.skills && updates.skills.length > 0) {
        console.log('Updating skills...');
        // Delete existing skills
        await supabase.from('skills').delete().eq('user_id', userId);
        // Insert new skills
        for (const skill of updates.skills) {
          await this.addSkill(userId, skill);
        }
      }

      if (updates.languages && updates.languages.length > 0) {
        console.log('Updating languages...');
        // Delete existing languages
        await supabase.from('languages').delete().eq('user_id', userId);
        // Insert new languages
        for (const lang of updates.languages) {
          await this.addLanguage(userId, lang);
        }
      }

      if (updates.certifications && updates.certifications.length > 0) {
        console.log('Updating certifications...');
        // Delete existing certifications
        await supabase.from('certifications').delete().eq('user_id', userId);
        // Insert new certifications
        for (const cert of updates.certifications) {
          await this.addCertification(userId, cert);
        }
      }

      // 3. Return complete profile data
      console.log('Getting complete profile data...');
      const completeProfile = await this.getUserProfile(userId);
      console.log('Complete profile retrieved:', completeProfile);

      return completeProfile;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }

  // Storage Methods
  static async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { 
        cacheControl: '3600',
        upsert: true // Remplace le fichier s'il existe déjà
      });

    if (error) throw error;
    return data;
  }

  static getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Notification methods
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('notifications table does not exist - returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  }

  static async markNotificationAsRead(userId: string, notificationId: string) {
    const { error } = await supabase.rpc('mark_notification_read', {
      notification_id: notificationId
    });

    if (error) throw error;
  }

  static async createNotification(userId: string, notification: {
    type: 'application' | 'job' | 'interview' | 'reminder' | 'system';
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase.rpc('create_notification', {
      target_user_id: userId,
      notification_type: notification.type,
      notification_title: notification.title,
      notification_message: notification.message,
      notification_priority: notification.priority || 'medium',
      notification_action_url: notification.actionUrl,
      notification_metadata: notification.metadata
    });

    if (error) throw error;
    return data;
  }

  static async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Formatter la notification pour le frontend
          const notification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            timestamp: payload.new.created_at,
            read: payload.new.read,
            priority: payload.new.priority,
            actionUrl: payload.new.action_url
          };
          callback(notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Notification automatique pour changement de statut
          if (payload.old.status !== payload.new.status) {
            const statusNotification = {
              id: `status_${payload.new.id}_${Date.now()}`,
              type: 'application',
              title: 'Mise à jour de candidature',
              message: `Le statut de votre candidature a changé : ${payload.new.status}`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: payload.new.status === 'accepté' ? 'high' : 'medium',
              actionUrl: `/applications/${payload.new.id}`
            };
            callback(statusNotification);
          }
        }
      )
      .subscribe();

    return subscription;
  }

  static async triggerApplicationNotification(userId: string, applicationData: any) {
    return await this.createNotification(userId, {
      type: 'application',
      title: 'Candidature mise à jour',
      message: `Votre candidature chez ${applicationData.company} a été mise à jour`,
      priority: 'medium',
      actionUrl: `/applications/${applicationData.id}`,
      metadata: { applicationId: applicationData.id }
    });
  }

  static async triggerJobMatchNotification(userId: string, jobData: any, matchScore: number) {
    return await this.createNotification(userId, {
      type: 'job',
      title: 'Nouvelle opportunité correspondante',
      message: `Le poste "${jobData.title}" chez ${jobData.company} correspond à votre profil (${matchScore}% de compatibilité)`,
      priority: matchScore > 70 ? 'high' : 'medium',
      actionUrl: `/jobs/${jobData.id}`,
      metadata: { jobId: jobData.id, matchScore }
    });
  }

  // CV Version methods
  static async getCVVersions(userId: string) {
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('cv_versions table does not exist - returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  }

  static async createCVVersion(userId: string, cvData: {
    name: string;
    filePath: string;
    originalFileName: string;
    fileSize?: number;
    fileType?: string;
    description?: string;
    analysisData?: any;
  }) {
    const { data, error } = await supabase
      .from('cv_versions')
      .insert({
        user_id: userId,
        name: cvData.name,
        file_path: cvData.filePath,
        original_file_name: cvData.originalFileName,
        file_size: cvData.fileSize,
        file_type: cvData.fileType,
        description: cvData.description,
        analysis_data: cvData.analysisData,
        is_active: false
      });

    if (error) throw error;
    return data;
  }

  static async setActiveCV(userId: string, cvId: string) {
    const { error } = await supabase.rpc('set_active_cv', {
      cv_version_id: cvId
    });

    if (error) throw error;
  }

  static async updateCVVersion(cvId: string, updates: {
    name?: string;
    description?: string;
    analysisData?: any;
  }) {
    const { data, error } = await supabase
      .from('cv_versions')
      .update({
        name: updates.name,
        description: updates.description,
        analysis_data: updates.analysisData,
        updated_at: new Date().toISOString()
      })
      .eq('id', cvId);

    if (error) throw error;
    return data;
  }

  static async deleteCVVersion(cvId: string) {
    const { error } = await supabase
      .from('cv_versions')
      .delete()
      .eq('id', cvId);

    if (error) throw error;
  }

  static async getActiveCVVersion(userId: string) {
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return data;
  }

  // Experience Methods
  static async getUserExperiences(userId: string): Promise<Experience[]> {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('experiences table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(exp => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: exp.start_date,
      endDate: exp.end_date,
      current: exp.current,
      description: exp.description || '',
      location: exp.location,
      achievements: exp.achievements || []
    }));
  }

  static async addExperience(userId: string, experience: Omit<Experience, 'id'>) {
    // Helper function to convert date strings to proper format
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

    const { data, error } = await supabase
      .from('experiences')
      .insert({
        user_id: userId,
        company: experience.company || 'Entreprise non spécifiée',
        position: experience.position || 'Poste non spécifié',
        start_date: formatDate(experience.startDate),
        end_date: formatDate(experience.endDate),
        current: experience.current || false,
        description: experience.description || '',
        location: experience.location || '',
        achievements: experience.achievements || []
      });

    if (error) throw error;
    return data;
  }

  static async updateExperience(experienceId: string, updates: Partial<Experience>) {
    const { data, error } = await supabase
      .from('experiences')
      .update({
        company: updates.company,
        position: updates.position,
        start_date: updates.startDate,
        end_date: updates.endDate,
        current: updates.current,
        description: updates.description,
        location: updates.location,
        achievements: updates.achievements
      })
      .eq('id', experienceId);

    if (error) throw error;
    return data;
  }

  static async deleteExperience(experienceId: string) {
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', experienceId);

    if (error) throw error;
  }

  // Education Methods
  static async getUserEducation(userId: string): Promise<Education[]> {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('education table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(edu => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.start_date,
      endDate: edu.end_date,
      current: edu.current,
      grade: edu.grade,
      description: edu.description
    }));
  }

  static async addEducation(userId: string, education: Omit<Education, 'id'>) {
    // Helper function to convert date strings to proper format
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

    const { data, error } = await supabase
      .from('education')
      .insert({
        user_id: userId,
        institution: education.institution || 'Institution inconnue',
        degree: education.degree || 'Diplôme non spécifié',
        field: education.field || '',
        start_date: formatDate(education.startDate),
        end_date: formatDate(education.endDate),
        current: education.current || false,
        grade: education.grade || '',
        description: education.description || ''
      });

    if (error) throw error;
    return data;
  }

  static async updateEducation(educationId: string, updates: Partial<Education>) {
    const { data, error } = await supabase
      .from('education')
      .update({
        institution: updates.institution,
        degree: updates.degree,
        field: updates.field,
        start_date: updates.startDate,
        end_date: updates.endDate,
        current: updates.current,
        grade: updates.grade,
        description: updates.description
      })
      .eq('id', educationId);

    if (error) throw error;
    return data;
  }

  static async deleteEducation(educationId: string) {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', educationId);

    if (error) throw error;
  }

  // Skills Methods
  static async getUserSkills(userId: string): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('skills table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(skill => ({
      name: skill.name,
      level: skill.level as Skill['level'],
      category: skill.category as Skill['category'],
      verified: skill.verified
    }));
  }

  static async addSkill(userId: string, skill: Skill) {
    const { data, error } = await supabase
      .from('skills')
      .insert({
        user_id: userId,
        name: skill.name,
        level: skill.level,
        category: skill.category,
        verified: skill.verified
      });

    if (error) throw error;
    return data;
  }

  static async updateSkill(userId: string, skillName: string, updates: Partial<Skill>) {
    const { data, error } = await supabase
      .from('skills')
      .update({
        level: updates.level,
        category: updates.category,
        verified: updates.verified
      })
      .eq('user_id', userId)
      .eq('name', skillName);

    if (error) throw error;
    return data;
  }

  static async deleteSkill(userId: string, skillName: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('user_id', userId)
      .eq('name', skillName);

    if (error) throw error;
  }

  // Languages Methods
  static async getUserLanguages(userId: string): Promise<Language[]> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('languages table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(lang => ({
      name: lang.name,
      level: lang.level as Language['level']
    }));
  }

  static async addLanguage(userId: string, language: Language) {
    // Helper function to normalize language levels
    const normalizeLanguageLevel = (level: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif' => {
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
    };

    const { data, error } = await supabase
      .from('languages')
      .insert({
        user_id: userId,
        name: language.name || 'Langue non spécifiée',
        level: normalizeLanguageLevel(language.level)
      });

    if (error) throw error;
    return data;
  }

  static async updateLanguage(userId: string, languageName: string, level: Language['level']) {
    const { data, error } = await supabase
      .from('languages')
      .update({ level })
      .eq('user_id', userId)
      .eq('name', languageName);

    if (error) throw error;
    return data;
  }

  static async deleteLanguage(userId: string, languageName: string) {
    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('user_id', userId)
      .eq('name', languageName);

    if (error) throw error;
  }

  // Certifications Methods
  static async getUserCertifications(userId: string): Promise<Certification[]> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('certifications table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(cert => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issue_date,
      expiryDate: cert.expiry_date,
      credentialId: cert.credential_id,
      url: cert.url
    }));
  }

  static async addCertification(userId: string, certification: Omit<Certification, 'id'>) {
    // Helper function to convert date strings to proper format
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

    const { data, error } = await supabase
      .from('certifications')
      .insert({
        user_id: userId,
        name: certification.name || 'Certification non spécifiée',
        issuer: certification.issuer || 'Émetteur non spécifié',
        issue_date: formatDate(certification.issueDate),
        expiry_date: formatDate(certification.expiryDate),
        credential_id: certification.credentialId || '',
        url: certification.url || ''
      });

    if (error) throw error;
    return data;
  }

  static async updateCertification(certificationId: string, updates: Partial<Certification>) {
    const { data, error } = await supabase
      .from('certifications')
      .update({
        name: updates.name,
        issuer: updates.issuer,
        issue_date: updates.issueDate,
        expiry_date: updates.expiryDate,
        credential_id: updates.credentialId,
        url: updates.url
      })
      .eq('id', certificationId);

    if (error) throw error;
    return data;
  }

  static async deleteCertification(certificationId: string) {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', certificationId);

    if (error) throw error;
  }

  // Jobs Methods
  static async getJobs(filters?: {
    location?: string;
    type?: string;
    keywords?: string;
    limit?: number;
  }): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_date', { ascending: false });

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.keywords) {
      query = query.or(`title.ilike.%${filters.keywords}%,company.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('403') || error.message.includes('42501')) {
        console.log('Access to jobs table denied - returning empty array');
        return [];
      }
      if (error.code === 'PGRST200' || error.message.includes('relationship') || error.message.includes('foreign key')) {
        console.log('Foreign key relationship issue - returning empty array');
        return [];
      }
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('Table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type as Job['type'],
      salary: job.salary,
      description: job.description,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      postedDate: job.posted_date,
      source: job.source,
      saved: false, // Will be updated with saved jobs data
      matchScore: undefined // Will be calculated based on user profile
    }));
  }

  static async getSavedJobs(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('saved_jobs table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(item => item.job_id);
  }

  static async getSavedJobsWithDetails(userId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        jobs!inner (
          id,
          title,
          company,
          location,
          type,
          salary,
          description,
          requirements,
          benefits,
          posted_date,
          source
        )
      `)
      .eq('user_id', userId)
      .eq('jobs.is_active', true);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('403') || error.message.includes('42501')) {
        console.log('Access to saved_jobs or jobs table denied - returning empty array');
        return [];
      }
      if (error.code === 'PGRST200' || error.message.includes('relationship') || error.message.includes('foreign key')) {
        console.log('Foreign key relationship issue - returning empty array');
        return [];
      }
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('Table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(item => ({
      id: item.jobs.id,
      title: item.jobs.title,
      company: item.jobs.company,
      location: item.jobs.location,
      type: item.jobs.type as Job['type'],
      salary: item.jobs.salary,
      description: item.jobs.description,
      requirements: item.jobs.requirements || [],
      benefits: item.jobs.benefits || [],
      postedDate: item.jobs.posted_date,
      source: item.jobs.source,
      saved: true,
      matchScore: undefined
    }));
  }

  static async saveJob(userId: string, jobId: string) {
    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: jobId
      });

    if (error) throw error;
  }

  static async unsaveJob(userId: string, jobId: string) {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) throw error;
  }

  // Applications Methods
  static async getUserApplications(userId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner (
          title,
          company,
          source
        )
      `)
      .eq('user_id', userId)
      .filter('jobs.is_active', 'eq', true) // Explicitly filter for active jobs
      .order('applied_date', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('403') || error.message.includes('42501')) {
        console.log('Access to applications or jobs table denied - returning empty array');
        return [];
      }
      if (error.code === 'PGRST200' || error.message.includes('relationship') || error.message.includes('foreign key')) {
        console.log('Foreign key relationship issue - returning empty array');
        return [];
      }
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('Table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(app => ({
      id: app.id,
      jobId: app.job_id,
      jobTitle: app.jobs.title,
      company: app.jobs.company,
      companyEmail: app.company_email,
      appliedDate: app.applied_date,
      status: app.status as Application['status'],
      type: app.type as Application['type'],
      coverLetter: app.cover_letter || '',
      customMessage: app.custom_message,
      response: app.response,
      responseDate: app.response_date,
      interviewDate: app.interview_date,
      notes: app.notes,
      attachments: app.attachments || [],
      emailSent: app.email_sent,
      emailId: app.email_id,
      readReceipt: app.read_receipt,
      source: app.jobs.source
    }));
  }

  static async addApplication(userId: string, application: Omit<Application, 'id'>) {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: application.jobId,
        status: application.status,
        type: application.type,
        cover_letter: application.coverLetter,
        custom_message: application.customMessage,
        company_email: application.companyEmail,
        email_sent: application.emailSent,
        email_id: application.emailId,
        read_receipt: application.readReceipt,
        response: application.response,
        response_date: application.responseDate,
        interview_date: application.interviewDate,
        notes: application.notes,
        attachments: application.attachments,
        applied_date: application.appliedDate
      });

    if (error) throw error;
    return data;
  }

  static async updateApplication(applicationId: string, updates: Partial<Application>) {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: updates.status,
        cover_letter: updates.coverLetter,
        cover_letter_file_path: updates.coverLetterFilePath, // NOUVEAU
        company_email: updates.companyEmail,
        email_sent: updates.emailSent,
        email_id: updates.emailId,
        read_receipt: updates.readReceipt,
        response: updates.response,
        response_date: updates.responseDate,
        interview_date: updates.interviewDate,
        notes: updates.notes,
        attachments: updates.attachments
      })
      .eq('id', applicationId);

    if (error) throw error;
    return data;
  }

  static async deleteApplication(applicationId: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw error;
  }

  // Admin Methods
  static async getUsers() {
    const { data, error } = await supabase.rpc('get_users_with_emails');

    if (error) throw error;
    return data;
  }

  static async getAllApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*');

    if (error) throw error;
    return data;
  }

  static async getSystemAlerts() {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('403')) {
          console.log('Access to system_alerts denied - admin privileges required');
          return [];
        }
        throw error;
      }
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116' || error.message?.includes('403')) {
        console.log('Access to system_alerts denied - admin privileges required');
        return [];
      }
      throw error;
    }
  }

  static async getRecentLogs() {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  }

  static async checkAdminAccess() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('No authenticated user');

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) throw adminError;

    return {
      currentUserId: user.id,
      hasAdminRole: isAdmin || false,
      userMetadata: user.user_metadata,
      errorMessage: null,
      isAuthenticated: true,
      email: user.email || null
    };
  }

  static async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: role
    });
    if (error) throw error;
    return data;
  }

  static async checkIsAdmin() {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return { data, error: null };
  }

  static async getUserRole(userId: string) {
    const { data, error } = await supabase.rpc('get_user_role', { target_user_id: userId });
    if (error) throw error;
    return { data, error: null };
  }

  static async debugAdminAccess() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('No authenticated user');

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) throw adminError;

    return {
      currentUserId: user.id,
      hasAdminRole: isAdmin || false,
      userMetadata: user.user_metadata,
      errorMessage: null,
      isAuthenticated: true,
      email: user.email || null
    };
  }

  static async fixAdminRole(email: string) {
    const { data, error } = await supabase.rpc('fix_admin_role', { admin_email: email });
    if (error) throw error;
    return data;
  }

  // System Monitoring Methods (Simulated for now)
  static async getSystemMetrics() {
    // In a real application, this would fetch data from a monitoring system
    return {
      uptime: '15 jours 8h 32m',
      systemLoad: Math.floor(Math.random() * (80 - 20 + 1)) + 20, // 20-80%
      memoryUsage: Math.floor(Math.random() * (90 - 30 + 1)) + 30, // 30-90%
      diskUsage: Math.floor(Math.random() * (70 - 10 + 1)) + 10, // 10-70%
      networkTraffic: (Math.random() * (5 - 0.5) + 0.5).toFixed(1), // 0.5-5.0 GB/h
    };
  }

  static async getServiceStatuses() {
    // In a real application, this would check actual service health
    const statuses = ['running', 'warning', 'error'];
    const getRandomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];

    return [
      { name: 'API Server', status: getRandomStatus(), uptime: '99.9%', lastCheck: '2 min' },
      { name: 'Database', status: getRandomStatus(), uptime: '99.8%', lastCheck: '1 min' },
      { name: 'Email Service', status: getRandomStatus(), uptime: '98.5%', lastCheck: '3 min' },
      { name: 'File Storage', status: getRandomStatus(), uptime: '99.7%', lastCheck: '1 min' },
      { name: 'AI Service', status: getRandomStatus(), uptime: '95.2%', lastCheck: '5 min' },
      { name: 'Backup Service', status: getRandomStatus(), uptime: '99.1%', lastCheck: '10 min' }
    ];
  }

  static async getRecentSystemLogs() {
    // In a real application, this would fetch from a logging service
    const levels = ['info', 'warning', 'error'];
    const messages = [
      'User login successful',
      'High memory usage detected',
      'Failed to send email notification',
      'Database backup completed',
      'New user registration',
      'Unauthorized access attempt',
      'Service restarted',
    ];
    const sources = ['auth', 'system', 'email', 'backup', 'security'];

    const logs = [];
    for (let i = 0; i < 5; i++) {
      logs.push({
        id: `${i + 1}`,
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString().slice(0, 19).replace('T', ' '),
        source: sources[Math.floor(Math.random() * sources.length)],
      });
    }
    return logs;
  }

  static async getBackupStatuses() {
    // In a real application, this would fetch from a backup management system
    const statuses = ['completed', 'failed'];
    return [
      { id: '1', name: 'Daily Backup', date: new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' '), size: '2.3 GB', status: statuses[Math.floor(Math.random() * statuses.length)] },
      { id: '2', name: 'Weekly Backup', date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 19).replace('T', ' '), size: '2.1 GB', status: statuses[Math.floor(Math.random() * statuses.length)] },
      { id: '3', name: 'Monthly Backup', date: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 19).replace('T', ' '), size: '2.5 GB', status: statuses[Math.floor(Math.random() * statuses.length)] },
    ];
  }

  // AI Settings Methods
  static async getAISettings(userId: string) {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('ai_settings table does not exist - returning null');
        return null;
      }
      throw error;
    }

    return {
      groqApiKey: data.groq_api_key || '',
      geminiApiKey: data.gemini_api_key || '',
      preferredModel: data.preferred_model,
      temperature: data.temperature,
      maxTokens: data.max_tokens
    };
  }

  static async updateAISettings(userId: string, settings: {
    groqApiKey?: string;
    geminiApiKey?: string;
    preferredModel?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const { data, error } = await supabase
      .from('ai_settings')
      .upsert({
        user_id: userId,
        groq_api_key: settings.groqApiKey,
        gemini_api_key: settings.geminiApiKey,
        preferred_model: settings.preferredModel,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      });

    if (error) throw error;
    return data;
  }

  // AI Usage Tracking
  static async trackAIUsage(userId: string, usage: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestType?: string;
  }) {
    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        model: usage.model,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.totalTokens,
        request_type: usage.requestType
      });

    if (error) throw error;
  }

  static async getAIUsageStats(userId: string) {
    const { data, error } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('ai_usage table does not exist - returning empty stats');
        return {
          totalTokens: 0,
          totalRequests: 0,
          lastReset: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      throw error;
    }

    const totalTokens = (data || []).reduce((sum, usage) => sum + usage.total_tokens, 0);
    const totalRequests = (data || []).length;

    return {
      totalTokens,
      totalRequests,
      lastReset: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Recommendations Methods
  static async getUserRecommendations(userId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('404')) {
        console.log('recommendations table does not exist - returning empty array');
        return [];
      }
      throw error;
    }

    return (data || []).map(rec => ({
      id: rec.id,
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      action: rec.action,
      category: rec.category,
      completed: rec.completed,
      dismissed: rec.dismissed
    }));
  }

  static async addRecommendation(userId: string, recommendation: {
    type: string;
    priority: string;
    title: string;
    description: string;
    action: string;
    category: string;
  }) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        user_id: userId,
        type: recommendation.type,
        priority: recommendation.priority,
        title: recommendation.title,
        description: recommendation.description,
        action: recommendation.action,
        category: recommendation.category,
        completed: false,
        dismissed: false
      });

    if (error) throw error;
    return data;
  }

  static async updateRecommendation(recommendationId: string, updates: {
    completed?: boolean;
    dismissed?: boolean;
  }) {
    const { data, error } = await supabase
      .from('recommendations')
      .update(updates)
      .eq('id', recommendationId);

    if (error) throw error;
    return data;
  }

  static async addJob(job: {
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    description: string;
    requirements?: string[];
    benefits?: string[];
    postedDate?: string;
    source?: string;
    contactEmail: string;
  }) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        posted_date: job.postedDate || new Date().toISOString(),
        source: job.source || 'admin',
        contact_email: job.contactEmail,
        is_active: true
      });
    if (error) throw error;
    return data;
  }
}