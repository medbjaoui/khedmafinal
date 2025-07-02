import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface CVData {
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

export interface CVAnalysisResult {
  success: boolean;
  data?: CVData;
  rawText?: string;
  error?: string;
  confidence?: number;
  processingTime?: number;
}

export class CVAnalysisService {
  
  async processFile(file: File): Promise<CVAnalysisResult> {
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
      
      const cvData = await this.analyzeText(rawText);
      const confidence = this.calculateConfidence(cvData);
      
      return {
        success: true,
        data: cvData,
        rawText: rawText,
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
  
  private async analyzeText(text: string): Promise<CVData> {
    const cvData: CVData = {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      projects: []
    };
    
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    cvData.personalInfo = this.extractPersonalInfo(text);
    cvData.summary = this.extractSummary(lines);
    cvData.experience = this.extractExperience(lines);
    cvData.education = this.extractEducation(lines);
    cvData.skills = this.extractSkills(text);
    cvData.languages = this.extractLanguages(text);
    cvData.certifications = this.extractCertifications(lines);
    cvData.projects = this.extractProjects(lines);
    
    return cvData;
  }
  
  private extractPersonalInfo(text: string): CVData['personalInfo'] {
    const personalInfo: CVData['personalInfo'] = {};
    
    // Email
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = text.match(emailPattern);
    if (emailMatch && emailMatch[0]) {
      personalInfo.email = emailMatch[0];
    }
    
    // Téléphone
    const phonePatterns = [
      /(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/g,
      /\+?\d{1,4}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch && phoneMatch[0] && phoneMatch[0].replace(/\D/g, '').length >= 8) {
        personalInfo.phone = phoneMatch[0].trim();
        break;
      }
    }
    
    // LinkedIn
    const linkedinPattern = /linkedin\.com\/in\/[a-zA-Z0-9\-_.]+/gi;
    const linkedinMatch = text.match(linkedinPattern);
    if (linkedinMatch) {
      personalInfo.linkedin = linkedinMatch[0];
    }
    
    // Nom (première ligne non vide)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines.slice(0, 5)) {
      if (line.length > 2 && line.length < 50 && 
          !line.includes('@') && 
          !/^\d/.test(line) &&
          /^[a-zA-ZÀ-ÿ\s.-]+$/.test(line)) {
        personalInfo.name = line;
        break;
      }
    }
    
    return personalInfo;
  }
  
  private extractSummary(lines: string[]): string | undefined {
    const summaryKeywords = ['résumé', 'summary', 'objectif', 'objective', 'profil', 'profile'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (summaryKeywords.some(keyword => line.includes(keyword) && line.length < 50)) {
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const nextLine = lines[j];
          
          if (nextLine.length > 20 && 
              !this.isNewSection(nextLine.toLowerCase()) && 
              !nextLine.includes('@')) {
            summaryLines.push(nextLine);
          } else if (summaryLines.length > 0) {
            break;
          }
        }
        
        if (summaryLines.length > 0) {
          return summaryLines.join(' ').substring(0, 500);
        }
      }
    }
    
    return undefined;
  }
  
  private extractExperience(lines: string[]): CVData['experience'] {
    const experience: CVData['experience'] = [];
    const experienceKeywords = ['expérience', 'experience', 'emploi', 'travail', 'poste'];
    
    let inExperienceSection = false;
    let currentExperience: any = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (!inExperienceSection && experienceKeywords.some(keyword => 
        lowerLine.includes(keyword) && lowerLine.length < 50)) {
        inExperienceSection = true;
        continue;
      }
      
      if (!inExperienceSection) continue;
      
      if (this.isNewSection(lowerLine) && !lowerLine.includes('expérience')) {
        if (this.isValidExperience(currentExperience)) {
          experience.push(currentExperience);
        }
        break;
      }
      
      if (line.length < 5) continue;
      
      const datePattern = /\b(?:\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre).*?(?:\d{4}|present|aujourd'hui|actuel)/i;
      
      if (datePattern.test(line)) {
        if (this.isValidExperience(currentExperience)) {
          experience.push(currentExperience);
        }
        
        currentExperience = {
          title: '',
          company: '',
          period: line,
          description: ''
        };
      } else if (currentExperience.period && !currentExperience.title) {
        currentExperience.title = line;
      } else if (currentExperience.title && !currentExperience.company) {
        currentExperience.company = line;
      } else if (currentExperience.company && line.length > 10) {
        currentExperience.description = (currentExperience.description || '') + ' ' + line;
      }
    }
    
    if (this.isValidExperience(currentExperience)) {
      experience.push(currentExperience);
    }
    
    return experience.slice(0, 10);
  }
  
  private isValidExperience(exp: any): boolean {
    return exp && exp.title && exp.company && exp.period &&
           exp.title.length > 2 && exp.company.length > 2;
  }
  
  private extractEducation(lines: string[]): CVData['education'] {
    const education: CVData['education'] = [];
    const educationKeywords = ['éducation', 'education', 'formation', 'études', 'diplôme', 'degree'];
    
    let inEducationSection = false;
    let currentEducation: any = {};
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (!inEducationSection && educationKeywords.some(keyword => 
        lowerLine.includes(keyword) && lowerLine.length < 50)) {
        inEducationSection = true;
        continue;
      }
      
      if (!inEducationSection) continue;
      
      if (this.isNewSection(lowerLine) && !educationKeywords.some(k => lowerLine.includes(k))) {
        if (this.isValidEducation(currentEducation)) {
          education.push(currentEducation);
        }
        break;
      }
      
      if (line.length < 5) continue;
      
      const yearPattern = /\b(19|20)\d{2}\b/;
      
      if (yearPattern.test(line)) {
        if (this.isValidEducation(currentEducation)) {
          education.push(currentEducation);
        }
        
        currentEducation = {
          degree: '',
          institution: '',
          year: line,
          grade: ''
        };
      } else if (currentEducation.year && !currentEducation.degree) {
        currentEducation.degree = line;
      } else if (currentEducation.degree && !currentEducation.institution) {
        currentEducation.institution = line;
      }
    }
    
    if (this.isValidEducation(currentEducation)) {
      education.push(currentEducation);
    }
    
    return education.slice(0, 5);
  }
  
  private isValidEducation(edu: any): boolean {
    return edu && edu.degree && edu.institution && edu.year &&
           edu.degree.length > 2 && edu.institution.length > 2;
  }
  
  private extractSkills(text: string): string[] {
    const skills = new Set<string>();
    const lowerText = text.toLowerCase();
    
    const techSkills = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'docker', 'aws'
    ];
    
    for (const skill of techSkills) {
      if (lowerText.includes(skill)) {
        skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
    
    return Array.from(skills).slice(0, 20);
  }
  
  private extractLanguages(text: string): CVData['languages'] {
    const languages: CVData['languages'] = [];
    const lowerText = text.toLowerCase();
    
    const languageMap = {
      'français': 'Français', 'french': 'Français',
      'anglais': 'Anglais', 'english': 'Anglais',
      'espagnol': 'Espagnol', 'spanish': 'Espagnol'
    };
    
    const levelMap = {
      'débutant': 'Débutant', 'beginner': 'Débutant',
      'intermédiaire': 'Intermédiaire', 'intermediate': 'Intermédiaire',
      'courant': 'Courant', 'fluent': 'Courant',
      'natif': 'Natif', 'native': 'Natif'
    };
    
    for (const [key, value] of Object.entries(languageMap)) {
      if (lowerText.includes(key)) {
        let level = 'Intermédiaire';
        
        for (const [levelKey, levelValue] of Object.entries(levelMap)) {
          if (lowerText.includes(levelKey)) {
            level = levelValue;
            break;
          }
        }
        
        languages.push({
          language: value,
          level: level
        });
      }
    }
    
    return languages;
  }
  
  private extractCertifications(lines: string[]): CVData['certifications'] {
    const certifications: CVData['certifications'] = [];
    const certKeywords = ['certification', 'certificate', 'diplôme', 'certified'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (certKeywords.some(keyword => lowerLine.includes(keyword)) && line.length > 10) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : 'Non spécifiée';
        
        certifications.push({
          name: line,
          issuer: 'Non spécifié',
          date: year
        });
      }
    }
    
    return certifications.slice(0, 10);
  }
  
  private extractProjects(lines: string[]): CVData['projects'] {
    const projects: CVData['projects'] = [];
    const projectKeywords = ['projet', 'project', 'réalisation', 'développement'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (projectKeywords.some(keyword => lowerLine.includes(keyword)) && line.length > 15) {
        projects.push({
          name: line,
          description: line,
          technologies: []
        });
      }
    }
    
    return projects.slice(0, 5);
  }
  
  private isNewSection(line: string): boolean {
    const sectionKeywords = [
      'éducation', 'education', 'formation', 'compétences', 'skills',
      'langues', 'languages', 'certifications', 'projets', 'projects'
    ];
    
    return sectionKeywords.some(keyword => line.includes(keyword) && line.length < 100);
  }
  
  private calculateConfidence(cvData: CVData): number {
    let score = 0;
    
    if (cvData.personalInfo.name) score += 20;
    if (cvData.personalInfo.email) score += 20;
    if (cvData.personalInfo.phone) score += 10;
    
    score += Math.min(cvData.experience.length * 15, 30);
    score += Math.min(cvData.education.length * 10, 20);
    
    if (cvData.skills.length > 0) score += 15;
    if (cvData.languages.length > 0) score += 5;
    
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

  async extractTextFromFile(file: File): Promise<string> {
    try {
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      switch (file.type) {
        case 'application/pdf':
          return await this.extractFromPDF(file);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractFromDOC(file);
        case 'text/plain':
          return await this.extractFromTXT(file);
        default:
          throw new Error(`Type de fichier non supporté: ${file.type}`);
      }
    } catch (error) {
      throw new Error(`Erreur lors de l'extraction du texte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

export const cvAnalysisService = new CVAnalysisService();
export default cvAnalysisService;