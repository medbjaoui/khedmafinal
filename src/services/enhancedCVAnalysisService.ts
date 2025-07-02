import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { getAIService } from './aiService';
import { UserProfile } from '../store/slices/profileSlice';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface CVExtractedData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    level: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface EnhancedCVAnalysisResult {
  success: boolean;
  userProfile?: UserProfile;
  extractedData?: CVExtractedData;
  rawText?: string;
  aiAnalysis?: string;
  error?: string;
  confidence?: number;
  processingTime?: number;
}

class EnhancedCVAnalysisService {
  
  async processFile(file: File): Promise<EnhancedCVAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          processingTime: Date.now() - startTime
        };
      }
      
      // Step 1: Extract raw text from file
      let rawText = '';
      switch (file.type) {
        case 'application/pdf':
          rawText = await this.extractFromPDF(file);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          rawText = await this.extractFromDOC(file);
          break;
        case 'text/plain':
          rawText = await this.extractFromTXT(file);
          break;
        default:
          return {
            success: false,
            error: `Type de fichier non supporté: ${file.type}. Formats acceptés: PDF, DOCX, DOC, TXT`,
            processingTime: Date.now() - startTime
          };
      }
      
      if (!rawText.trim()) {
        return {
          success: false,
          error: 'Aucun texte extrait du fichier.',
          processingTime: Date.now() - startTime
        };
      }

      // Step 2: Use AI to analyze and structure the extracted text
      const aiService = getAIService();
      const aiAnalysisPrompt = this.createAnalysisPrompt(rawText);
      const aiResponse = await aiService.generateText(aiAnalysisPrompt);
      
      // Step 3: Parse AI response and convert to UserProfile format
      const structuredData = this.parseAIResponse(aiResponse.content);
      const userProfile = this.convertToUserProfile(structuredData, rawText);
      
      // Step 4: Calculate confidence score
      const confidence = this.calculateConfidence(userProfile);
      
      return {
        success: true,
        userProfile: userProfile,
        extractedData: structuredData,
        rawText: rawText,
        aiAnalysis: aiResponse.content,
        confidence: confidence,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  private createAnalysisPrompt(rawText: string): string {
    return `Analyse ce CV en français et extrait les informations suivantes au format JSON strict. Ne retourne que le JSON, sans commentaire ni texte supplémentaire :

{
  "personalInfo": {
    "name": "nom complet",
    "email": "email",
    "phone": "téléphone",
    "address": "adresse",
    "linkedin": "profil linkedin",
    "website": "site web"
  },
  "summary": "résumé professionnel ou objectif",
  "experience": [
    {
      "title": "titre du poste",
      "company": "nom de l'entreprise",
      "period": "période (ex: 2020-2023)",
      "description": "description des responsabilités et réalisations"
    }
  ],
  "education": [
    {
      "degree": "diplôme",
      "institution": "établissement",
      "year": "année",
      "grade": "mention ou note"
    }
  ],
  "skills": ["compétence1", "compétence2", "compétence3"],
  "languages": [
    {
      "language": "langue",
      "level": "niveau (Débutant, Intermédiaire, Courant, Natif)"
    }
  ],
  "certifications": [
    {
      "name": "nom de la certification",
      "issuer": "organisme émetteur",
      "date": "date d'obtention"
    }
  ],
  "projects": [
    {
      "name": "nom du projet",
      "description": "description",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

CV à analyser :
${rawText}`;
  }
  
  private parseAIResponse(aiResponse: string): CVExtractedData {
    try {
      // Clean the response to extract only JSON
      let cleanResponse = aiResponse.trim();
      
      // Find JSON object in response
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in AI response');
      }
      
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validate and structure the response
      return {
        personalInfo: parsed.personalInfo || {},
        summary: parsed.summary || undefined,
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('AI Response:', aiResponse);
      
      // Fallback to basic parsing if AI response parsing fails
      return this.fallbackBasicParsing(aiResponse);
    }
  }
  
  private fallbackBasicParsing(text: string): CVExtractedData {
    // Basic fallback parsing when AI response is not in expected format
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phonePattern = /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g;
    
    const emailMatch = text.match(emailPattern);
    const phoneMatch = text.match(phonePattern);
    
    return {
      personalInfo: {
        email: emailMatch ? emailMatch[0] : undefined,
        phone: phoneMatch ? phoneMatch[0] : undefined
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      projects: []
    };
  }
  
  private convertToUserProfile(data: CVExtractedData, _rawText: string): UserProfile {
    const personalInfo = data.personalInfo || {};
    const nameParts = personalInfo.name ? personalInfo.name.split(' ') : ['', ''];
    
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.address || '',
      title: data.experience.length > 0 ? data.experience[0].title : '',
      summary: data.summary || '',
      linkedin: personalInfo.linkedin || '',
      github: personalInfo.website || '',
      experiences: data.experience.map(exp => ({
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: exp.title,
        company: exp.company,
        location: '',
        startDate: this.extractStartDate(exp.period),
        endDate: this.extractEndDate(exp.period),
        current: exp.period.toLowerCase().includes('actuel') || exp.period.toLowerCase().includes('present'),
        description: exp.description,
        achievements: []
      })),
      education: data.education.map(edu => ({
        id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        institution: edu.institution,
        degree: edu.degree,
        field: '',
        startDate: edu.year ? `${edu.year}-01-01` : '',
        endDate: edu.year ? `${edu.year}-01-01` : '',
        current: false,
        grade: edu.grade || '',
        description: ''
      })),
      skills: data.skills.map(skill => ({
        name: skill,
        level: 'Intermédiaire' as const,
        category: 'Technique' as const,
        verified: false
      })),
      languages: data.languages.map(lang => ({
        name: lang.language || 'Langue non spécifiée',
        level: this.normalizeLanguageLevel(lang.level)
      })),
      certifications: data.certifications.map(cert => ({
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cert.name || 'Certification non spécifiée',
        issuer: cert.issuer || 'Émetteur non spécifié',
        issueDate: this.formatCertificationDate(cert.date),
        credentialId: '',
        url: ''
      })),
      cvFilePath: '',
      lastUpdated: new Date().toISOString(),
      completionScore: this.calculateCompletionScore(data)
    };
  }
  
  private extractStartDate(period: string): string {
    const datePattern = /(\d{4})/g;
    const matches = period.match(datePattern);
    if (matches) {
      // Convert year to YYYY-MM-DD format
      return `${matches[0]}-01-01`;
    }
    return '';
  }
  
  private extractEndDate(period: string): string {
    if (period.toLowerCase().includes('actuel') || period.toLowerCase().includes('present')) {
      return '';
    }
    const datePattern = /(\d{4})/g;
    const matches = period.match(datePattern);
    if (matches && matches.length > 1) {
      // Convert year to YYYY-MM-DD format
      return `${matches[1]}-01-01`;
    } else if (matches) {
      // Convert year to YYYY-MM-DD format
      return `${matches[0]}-01-01`;
    }
    return '';
  }
  
  private formatCertificationDate(dateStr: string | undefined): string {
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
  }

  private normalizeLanguageLevel(level: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif' {
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

  private calculateCompletionScore(data: CVExtractedData): number {
    let score = 0;
    
    if (data.personalInfo.name) score += 15;
    if (data.personalInfo.email) score += 15;
    if (data.personalInfo.phone) score += 10;
    if (data.personalInfo.address) score += 5;
    if (data.summary) score += 10;
    
    score += Math.min(data.experience.length * 10, 20);
    score += Math.min(data.education.length * 5, 10);
    score += Math.min(data.skills.length * 2, 10);
    score += Math.min(data.languages.length * 2, 5);
    
    return Math.min(score, 100);
  }

  // File extraction methods (reused from original service)
  private async extractFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          continue;
        }
      }
      
      if (!fullText.trim()) {
        throw new Error('Aucun texte extrait du PDF');
      }
      
      return this.cleanExtractedText(fullText);
      
    } catch (error) {
      throw new Error(`Impossible d'extraire le texte du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  private async extractFromDOC(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || !result.value.trim()) {
        throw new Error('Aucun texte extrait du document Word');
      }
      
      return this.cleanExtractedText(result.value);
      
    } catch (error) {
      throw new Error(`Impossible d'extraire le texte du document: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  private async extractFromTXT(file: File): Promise<string> {
    try {
      const text = await file.text();
      
      if (!text.trim()) {
        throw new Error('Le fichier texte est vide');
      }
      
      return this.cleanExtractedText(text);
    } catch (error) {
      throw new Error(`Impossible de lire le fichier texte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  private cleanExtractedText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();
  }
  
  private calculateConfidence(profile: UserProfile): number {
    let score = 0;
    
    if (profile.firstName) score += 15;
    if (profile.lastName) score += 15;
    if (profile.email) score += 20;
    if (profile.phone) score += 10;
    if (profile.title) score += 15;
    if (profile.summary) score += 10;
    
    score += Math.min(profile.experiences.length * 10, 20);
    score += Math.min(profile.education.length * 5, 10);
    score += Math.min(profile.skills.length * 2, 10);
    
    return Math.min(score, 100);
  }
  
  async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'Fichier trop volumineux (max 10MB)' };
    }
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Type de fichier non supporté' };
    }
    
    return { valid: true };
  }
}

export const enhancedCVAnalysisService = new EnhancedCVAnalysisService();
export default enhancedCVAnalysisService;