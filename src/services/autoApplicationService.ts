import { supabase } from '../integrations/supabase/client';
import { Application } from '../store/slices/applicationsSlice';
import { Job } from '../store/slices/jobsSlice';
import { UserProfile } from '../store/slices/profileSlice';
import { getAIService } from './aiService';

export interface AutoApplicationSettings {
  id: string;
  userId: string;
  enabled: boolean;
  maxApplicationsPerDay: number;
  minSalary?: number;
  maxSalary?: number;
  preferredLocations: string[];
  excludedCompanies: string[];
  requiredKeywords: string[];
  excludedKeywords: string[];
  jobTypes: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'all';
  autoSend: boolean;
  requireApproval: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface AutoApplicationTemplate {
  id: string;
  userId: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface EmailLog {
  id: string;
  userId: string;
  applicationId?: string;
  mailId: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  body: string;
  attachments: string[];
  sentStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  retries: number;
  errorMessage?: string;
}

export interface RecruiterResponse {
  id: string;
  applicationId: string;
  emailLogId?: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string;
  receivedAt: string;
  parsed: boolean;
  responseType: 'positive' | 'negative' | 'neutral' | 'interview_request' | 'rejection' | 'unknown';
  sentiment?: string;
  actionRequired: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  processed: boolean;
}

export interface UserEmailAlias {
  id: string;
  userId: string;
  alias: string;
  fullEmail: string;
  routingStatus: 'active' | 'inactive' | 'suspended';
}

export class AutoApplicationService {
  // Gestion des alias emails
  static async createUserEmailAlias(userId: string): Promise<string> {
    const { data, error } = await supabase.rpc('create_user_email_alias', { user_id: userId });
    
    if (error) throw error;
    return data;
  }

  static async getUserEmailAlias(userId: string): Promise<UserEmailAlias | null> {
    const { data, error } = await supabase
      .from('user_email_aliases')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Gestion des paramètres de postulation automatique
  static async getAutoApplicationSettings(userId: string): Promise<AutoApplicationSettings | null> {
    const { data, error } = await supabase
      .from('auto_application_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) {
      return this.createDefaultSettings(userId);
    }

    return this.mapSettingsFromDB(data);
  }

  static async updateAutoApplicationSettings(
    userId: string, 
    settings: Partial<AutoApplicationSettings>
  ): Promise<AutoApplicationSettings> {
    const { data, error } = await supabase
      .from('auto_application_settings')
      .upsert({
        user_id: userId,
        enabled: settings.enabled,
        max_applications_per_day: settings.maxApplicationsPerDay,
        min_salary: settings.minSalary,
        max_salary: settings.maxSalary,
        preferred_locations: settings.preferredLocations,
        excluded_companies: settings.excludedCompanies,
        required_keywords: settings.requiredKeywords,
        excluded_keywords: settings.excludedKeywords,
        job_types: settings.jobTypes,
        experience_level: settings.experienceLevel,
        auto_send: settings.autoSend,
        require_approval: settings.requireApproval,
        notification_preferences: settings.notificationPreferences
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSettingsFromDB(data);
  }

  private static async createDefaultSettings(userId: string): Promise<AutoApplicationSettings> {
    const defaultSettings: Partial<AutoApplicationSettings> = {
      userId,
      enabled: false,
      maxApplicationsPerDay: 10,
      preferredLocations: [],
      excludedCompanies: [],
      requiredKeywords: [],
      excludedKeywords: [],
      jobTypes: ['CDI', 'CDD'],
      experienceLevel: 'all',
      autoSend: false,
      requireApproval: true,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      }
    };

    return this.updateAutoApplicationSettings(userId, defaultSettings);
  }

  // Gestion des templates
  static async getAutoApplicationTemplates(userId: string): Promise<AutoApplicationTemplate[]> {
    const { data, error } = await supabase
      .from('auto_application_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapTemplateFromDB);
  }

  static async createAutoApplicationTemplate(
    userId: string, 
    template: Omit<AutoApplicationTemplate, 'id' | 'userId'>
  ): Promise<AutoApplicationTemplate> {
    const { data, error } = await supabase
      .from('auto_application_templates')
      .insert({
        user_id: userId,
        name: template.name,
        subject_template: template.subjectTemplate,
        body_template: template.bodyTemplate,
        is_default: template.isDefault,
        is_active: template.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplateFromDB(data);
  }

  // Matching automatique des offres
  static async findMatchingJobs(
    userId: string, 
    settings: AutoApplicationSettings
  ): Promise<Job[]> {
    if (!settings.enabled) return [];

    // Vérifier la limite quotidienne
    const todayApplications = await this.getTodayApplicationsCount(userId);
    if (todayApplications >= settings.maxApplicationsPerDay) {
      return [];
    }

    // Construire la requête de filtrage
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(SELECT job_id FROM applications WHERE user_id = '${userId}')`);

    // Filtres par localisation
    if (settings.preferredLocations.length > 0) {
      query = query.in('location', settings.preferredLocations);
    }

    // Filtres par type de contrat
    if (settings.jobTypes.length > 0) {
      query = query.in('type', settings.jobTypes);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    // Filtrer par mots-clés exclus
    let filteredJobs = data || [];
    if (settings.excludedKeywords.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        !settings.excludedKeywords.some(keyword => 
          job.description.toLowerCase().includes(keyword.toLowerCase()) ||
          job.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    return filteredJobs;
  }

  // Génération automatique de candidature
  static async generateAutoApplication(
    job: Job,
    userId: string,
    profile: UserProfile
  ): Promise<Partial<Application>> {
    const aiService = getAIService();
    const templates = await this.getAutoApplicationTemplates(userId);
    const defaultTemplate = templates.find(t => t.isDefault) || templates[0];

    if (!defaultTemplate) {
      throw new Error('Aucun template de candidature trouvé');
    }

    // Générer la lettre de motivation avec l'IA
    const coverLetter = await aiService.generateCoverLetter(job.title, job.company, profile);

    // Générer l'objet de l'email
    const subject = this.generateEmailSubject(job, profile, defaultTemplate);

    // Extraire l'email de l'entreprise
    const companyEmail = this.extractCompanyEmail(job);

    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyEmail,
      appliedDate: new Date().toISOString(),
      status: 'draft',
      type: 'automatic',
      coverLetter,
      customMessage: subject,
      attachments: ['cv.pdf'],
      emailSent: false,
      autoMode: true,
      approvalStatus: 'pending',
      source: job.source
    };
  }

  // Envoi d'email via Cloudflare Email Routing
  static async sendApplicationEmail(
    application: Application,
    userId: string,
    profile: UserProfile
  ): Promise<EmailLog> {
    const userAlias = await this.getUserEmailAlias(userId);
    if (!userAlias) {
      throw new Error('Alias email non trouvé pour l\'utilisateur');
    }

    const mailId = `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Préparer l'email
    const emailData = {
      to: application.companyEmail || '',
      from: userAlias.fullEmail,
      subject: application.customMessage || `Candidature - ${application.jobTitle}`,
      body: this.formatEmailBody(application, profile),
      attachments: application.attachments
    };

    // Envoyer l'email via Cloudflare Email Routing
    const emailLog = await this.sendEmailViaCloudflare(emailData, userId, application.id, mailId);

    // Mettre à jour l'application
    await this.updateApplicationEmailStatus(application.id, true, mailId);

    return emailLog;
  }

  // Analyse des réponses des recruteurs
  static async analyzeRecruiterResponse(
    response: RecruiterResponse
  ): Promise<RecruiterResponse> {
    const aiService = getAIService();
    
    try {
      // Analyser le contenu avec l'IA
      const analysis = await aiService.analyzeEmailResponse(response.body);
      
      // Mettre à jour la réponse avec l'analyse
      const { data, error } = await supabase
        .from('recruiter_responses')
        .update({
          parsed: true,
          response_type: analysis.responseType,
          sentiment: analysis.sentiment,
          action_required: analysis.actionRequired,
          priority: analysis.priority
        })
        .eq('id', response.id)
        .select()
        .single();

      if (error) throw error;
      return this.mapResponseFromDB(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la réponse:', error);
      return response;
    }
  }

  // Utilitaires privés
  private static mapSettingsFromDB(data: any): AutoApplicationSettings {
    return {
      id: data.id,
      userId: data.user_id,
      enabled: data.enabled,
      maxApplicationsPerDay: data.max_applications_per_day,
      minSalary: data.min_salary,
      maxSalary: data.max_salary,
      preferredLocations: data.preferred_locations || [],
      excludedCompanies: data.excluded_companies || [],
      requiredKeywords: data.required_keywords || [],
      excludedKeywords: data.excluded_keywords || [],
      jobTypes: data.job_types || [],
      experienceLevel: data.experience_level,
      autoSend: data.auto_send,
      requireApproval: data.require_approval,
      notificationPreferences: data.notification_preferences || {
        email: true,
        push: true,
        sms: false
      }
    };
  }

  private static mapTemplateFromDB(data: any): AutoApplicationTemplate {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      subjectTemplate: data.subject_template,
      bodyTemplate: data.body_template,
      isDefault: data.is_default,
      isActive: data.is_active
    };
  }

  private static mapResponseFromDB(data: any): RecruiterResponse {
    return {
      id: data.id,
      applicationId: data.application_id,
      emailLogId: data.email_log_id,
      fromEmail: data.from_email,
      fromName: data.from_name,
      subject: data.subject,
      body: data.body,
      receivedAt: data.received_at,
      parsed: data.parsed,
      responseType: data.response_type,
      sentiment: data.sentiment,
      actionRequired: data.action_required,
      priority: data.priority,
      processed: data.processed
    };
  }

  private static async getTodayApplicationsCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today);

    if (error) throw error;
    return count || 0;
  }

  private static generateEmailSubject(job: Job, profile: UserProfile, template: AutoApplicationTemplate): string {
    return template.subjectTemplate
      .replace(/{jobTitle}/g, job.title)
      .replace(/{firstName}/g, profile.firstName)
      .replace(/{lastName}/g, profile.lastName)
      .replace(/{company}/g, job.company);
  }

  private static extractCompanyEmail(job: Job): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = job.description.match(emailRegex);
    
    if (emails && emails.length > 0) {
      return emails[0];
    }

    // Fallback: générer un email probable
    const companyDomain = job.company.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '') + '.tn';
    
    return `recrutement@${companyDomain}`;
  }

  private static formatEmailBody(application: Application, profile: UserProfile): string {
    return `
Bonjour,

${application.coverLetter}

Cordialement,
${profile.firstName} ${profile.lastName}
${profile.phone}
${profile.email}
    `.trim();
  }

  private static async sendEmailViaCloudflare(
    emailData: any, 
    userId: string, 
    applicationId: string, 
    mailId: string
  ): Promise<EmailLog> {
    // Ici, vous intégreriez l'API Cloudflare Email Routing
    // Pour l'instant, on simule l'envoi
    
    const emailLog: EmailLog = {
      id: '',
      userId,
      applicationId,
      mailId,
      toEmail: emailData.to,
      fromEmail: emailData.from,
      subject: emailData.subject,
      body: emailData.body,
      attachments: emailData.attachments,
      sentStatus: 'sent',
      sentAt: new Date().toISOString(),
      retries: 0
    };

    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        user_id: userId,
        application_id: applicationId,
        mail_id: mailId,
        to_email: emailData.to,
        from_email: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
        attachments: emailData.attachments,
        sent_status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapEmailLogFromDB(data);
  }

  private static mapEmailLogFromDB(data: any): EmailLog {
    return {
      id: data.id,
      userId: data.user_id,
      applicationId: data.application_id,
      mailId: data.mail_id,
      toEmail: data.to_email,
      fromEmail: data.from_email,
      subject: data.subject,
      body: data.body,
      attachments: data.attachments || [],
      sentStatus: data.sent_status,
      sentAt: data.sent_at,
      deliveredAt: data.delivered_at,
      readAt: data.read_at,
      retries: data.retries,
      errorMessage: data.error_message
    };
  }

  private static async updateApplicationEmailStatus(
    applicationId: string, 
    emailSent: boolean, 
    mailId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({
        email_sent: emailSent,
        mail_id: mailId,
        email_sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('id', applicationId);

    if (error) throw error;
  }
} 