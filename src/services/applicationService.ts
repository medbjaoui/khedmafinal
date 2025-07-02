import { Application, ApplicationTemplate } from '../store/slices/applicationsSlice';
import { UserProfile } from '../store/slices/profileSlice';
import { Job } from '../store/slices/jobsSlice';
import { getAIService } from './aiService';

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  attachments: string[];
}

export class ApplicationService {
  // Generate personalized cover letter using AI
  static async generateCoverLetter(
    job: Job, 
    profile: UserProfile, 
    template: ApplicationTemplate,
    customInstructions?: string
  ): Promise<string> {
    try {
      const aiService = getAIService();
      const response = await aiService.generateCoverLetter(job.title, job.company, profile);
      return response.content;
    } catch (error) {
      console.error('Error generating cover letter with AI:', error);
      // Fallback to template-based generation
      return this.personalizeTemplate(template.content, job, profile, customInstructions);
    }
  }

  // Personalize template with user and job data (fallback method)
  private static personalizeTemplate(
    template: string, 
    job: Job, 
    profile: UserProfile,
    customInstructions?: string
  ): string {
    const experience = profile.experiences.length > 0 ? 
      Math.max(...profile.experiences.map(exp => {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate || '');
        return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
      })) : 0;

    const topSkills = profile.skills
      .filter(skill => skill.level === 'Expert' || skill.level === 'Avancé')
      .slice(0, 3)
      .map(skill => skill.name)
      .join(', ');

    const field = profile.experiences.length > 0 ? 
      this.extractField(profile.experiences[0].position) : 'technologie';

    const industry = this.extractIndustry(job.company, job.description);

    // Generate personalized introduction
    const personalizedIntro = this.generatePersonalizedIntro(job, profile);
    
    // Generate specific motivation
    const specificMotivation = this.generateSpecificMotivation(job, profile, customInstructions);

    return template
      .replace(/{jobTitle}/g, job.title)
      .replace(/{company}/g, job.company)
      .replace(/{firstName}/g, profile.firstName)
      .replace(/{lastName}/g, profile.lastName)
      .replace(/{phone}/g, profile.phone)
      .replace(/{email}/g, profile.email)
      .replace(/{experience}/g, experience.toString())
      .replace(/{field}/g, field)
      .replace(/{topSkills}/g, topSkills)
      .replace(/{industry}/g, industry)
      .replace(/{personalizedIntro}/g, personalizedIntro)
      .replace(/{specificMotivation}/g, specificMotivation);
  }

  private static generatePersonalizedIntro(job: Job, profile: UserProfile): string {
    const relevantExp = profile.experiences.find(exp => 
      exp.position.toLowerCase().includes(job.title.toLowerCase().split(' ')[0]) ||
      job.requirements.some(req => exp.description.toLowerCase().includes(req.toLowerCase()))
    );

    if (relevantExp) {
      return `Ayant occupé le poste de ${relevantExp.position} chez ${relevantExp.company}, j'ai développé une expertise solide qui correspond parfaitement à vos attentes.`;
    }

    const relevantSkills = profile.skills.filter(skill => 
      job.requirements.some(req => req.toLowerCase().includes(skill.name.toLowerCase()))
    );

    if (relevantSkills.length > 0) {
      return `Mes compétences en ${relevantSkills.slice(0, 2).map(s => s.name).join(' et ')} me permettent de répondre efficacement aux exigences de ce poste.`;
    }

    return `Passionné par le domaine de la technologie, je suis convaincu que mon profil saura répondre à vos attentes.`;
  }

  private static generateSpecificMotivation(job: Job, _profile: UserProfile, customInstructions?: string): string {
    if (customInstructions) {
      return customInstructions;
    }

    const motivations = [
      `L'opportunité de rejoindre ${job.company} représente pour moi un défi stimulant qui s'inscrit parfaitement dans mon projet professionnel.`,
      `Votre entreprise ${job.company} jouit d'une excellente réputation dans le secteur, et je serais honoré de contribuer à son développement.`,
      `Les missions décrites dans cette offre correspondent exactement à mes aspirations professionnelles et à mon désir d'évolution.`,
      `Je suis particulièrement attiré par les défis techniques que propose ce poste et l'environnement innovant de ${job.company}.`
    ];

    return motivations[Math.floor(Math.random() * motivations.length)];
  }

  private static extractField(position: string): string {
    const fields = {
      'développeur': 'développement',
      'chef de projet': 'gestion de projet',
      'designer': 'design',
      'analyste': 'analyse',
      'ingénieur': 'ingénierie',
      'consultant': 'conseil'
    };

    for (const [key, value] of Object.entries(fields)) {
      if (position.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'technologie';
  }

  private static extractIndustry(company: string, description: string): string {
    const industries = {
      'tech': 'la technologie',
      'digital': 'le digital',
      'startup': 'l\'innovation',
      'consulting': 'le conseil',
      'finance': 'la finance',
      'e-commerce': 'le e-commerce'
    };

    const text = (company + ' ' + description).toLowerCase();
    
    for (const [key, value] of Object.entries(industries)) {
      if (text.includes(key)) {
        return value;
      }
    }
    return 'la technologie';
  }

  

  // Create application draft
  static createApplicationDraft(job: Job, _profile: UserProfile): Partial<Application> {
    return {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedDate: new Date().toISOString(),
      status: 'draft',
      type: 'manual',
      coverLetter: '',
      attachments: ['cv.pdf'],
      emailSent: false,
      source: job.source
    };
  }

  // Extract company email from job description or use fallback
  static extractCompanyEmail(job: Job): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = job.description.match(emailRegex);
    
    if (emails && emails.length > 0) {
      return emails[0];
    }

    // Fallback: generate likely email based on company name
    const companyDomain = job.company.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '') + '.tn';
    
    return `recrutement@${companyDomain}`;
  }

  // Generate email subject
  static generateEmailSubject(job: Job, profile: UserProfile, template: ApplicationTemplate): string {
    return template.subject
      .replace(/{jobTitle}/g, job.title)
      .replace(/{firstName}/g, profile.firstName)
      .replace(/{lastName}/g, profile.lastName)
      .replace(/{company}/g, job.company);
  }

  // Track application metrics
  static calculateApplicationMetrics(applications: Application[]) {
    const total = applications.length;
    const sent = applications.filter(app => app.status === 'sent').length;
    const viewed = applications.filter(app => app.readReceipt).length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const responses = applications.filter(app => 
      app.status === 'rejected' || app.status === 'accepted' || app.status === 'interview'
    ).length;

    return {
      total,
      sent,
      viewed,
      interviews,
      responses,
      responseRate: total > 0 ? Math.round((responses / total) * 100 * 10) / 10 : 0,
      viewRate: sent > 0 ? Math.round((viewed / sent) * 100 * 10) / 10 : 0,
      interviewRate: responses > 0 ? Math.round((interviews / responses) * 100 * 10) / 10 : 0
    };
  }
}