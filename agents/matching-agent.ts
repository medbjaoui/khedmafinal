import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  MatchingInput,
  MatchingOutput,
  CandidateProfile,
  JobOffer,
  DetailedMatchingScores,
  MatchingCriteria
} from '../types/index.ts';

/**
 * Agent de matching intelligent pour KhedmaFinal
 * Utilise l'IA et des algorithmes avancés pour matcher candidats et offres d'emploi
 */
class MatchingAgent {
  private supabase: any;
  private geminiApiKey: string;
  private groqApiKey: string;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    this.geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    this.groqApiKey = Deno.env.get('GROQ_API_KEY') ?? '';
  }

  /**
   * Point d'entrée principal pour le matching
   */
  async performMatching(input: MatchingInput): Promise<MatchingOutput> {
    try {
      console.log(`🎯 Début du matching pour le candidat ${input.candidateProfile.id} et l'offre ${input.jobOffer.id}`);

      // Étape 1: Calcul des scores détaillés
      const detailedScores = await this.calculateDetailedScores(input);

      // Étape 2: Calcul du score global pondéré
      const overallScore = this.calculateOverallScore(detailedScores, input.matchingCriteria);

      // Étape 3: Génération de l'explication avec l'IA
      const explanation = await this.generateMatchingExplanation(input, detailedScores, overallScore);

      // Étape 4: Identification des forces et faiblesses
      const { strengths, weaknesses } = this.identifyStrengthsAndWeaknesses(detailedScores, input);

      // Étape 5: Génération des recommandations
      const recommendations = await this.generateRecommendations(input, detailedScores, weaknesses);

      // Étape 6: Calcul du niveau de confiance
      const confidenceLevel = this.calculateConfidenceLevel(detailedScores, input);

      const result: MatchingOutput = {
        overallScore,
        detailedScores,
        explanation,
        strengths,
        weaknesses,
        recommendations,
        confidenceLevel
      };

      // Sauvegarder les résultats pour l'apprentissage
      await this.saveMatchingResults(input, result);

      console.log(`✅ Matching terminé avec succès (Score: ${overallScore.toFixed(1)}%)`);
      return result;

    } catch (error) {
      console.error('❌ Erreur lors du matching:', error);
      throw new Error(`Erreur de matching: ${error.message}`);
    }
  }

  /**
   * Calcule les scores détaillés pour chaque dimension
   */
  private async calculateDetailedScores(input: MatchingInput): Promise<DetailedMatchingScores> {
    const { candidateProfile, jobOffer } = input;

    // Score des compétences (le plus important)
    const skillsScore = await this.calculateSkillsScore(candidateProfile, jobOffer);

    // Score de l'expérience
    const experienceScore = this.calculateExperienceScore(candidateProfile, jobOffer);

    // Score de l'éducation
    const educationScore = this.calculateEducationScore(candidateProfile, jobOffer);

    // Score de localisation
    const locationScore = this.calculateLocationScore(candidateProfile, jobOffer);

    // Score salarial
    const salaryScore = this.calculateSalaryScore(candidateProfile, jobOffer);

    // Score des langues
    const languageScore = this.calculateLanguageScore(candidateProfile, jobOffer);

    // Score de fit culturel (basé sur l'IA)
    const culturalFitScore = await this.calculateCulturalFitScore(candidateProfile, jobOffer);

    return {
      skillsScore,
      experienceScore,
      educationScore,
      locationScore,
      salaryScore,
      languageScore,
      culturalFitScore
    };
  }

  /**
   * Calcule le score de correspondance des compétences
   */
  private async calculateSkillsScore(candidate: CandidateProfile, job: JobOffer): Promise<number> {
    const candidateSkills = candidate.skills || [];
    const requiredSkills = job.requirements.requiredSkills || [];
    const preferredSkills = job.requirements.preferredSkills || [];

    if (requiredSkills.length === 0) return 50; // Score neutre si pas d'exigences

    let totalScore = 0;
    let totalWeight = 0;

    // Évaluer les compétences requises
    for (const requiredSkill of requiredSkills) {
      const candidateSkill = candidateSkills.find(cs => 
        this.normalizeSkillName(cs.name) === this.normalizeSkillName(requiredSkill.name)
      );

      const weight = requiredSkill.weight || 5;
      totalWeight += weight;

      if (candidateSkill) {
        // Calculer le score basé sur le niveau
        const levelScore = this.calculateSkillLevelScore(candidateSkill.level, requiredSkill.level);
        totalScore += levelScore * weight;
      } else if (requiredSkill.isRequired) {
        // Pénalité importante pour les compétences requises manquantes
        totalScore += 0;
      } else {
        // Score partiel pour les compétences non requises manquantes
        totalScore += 25 * weight;
      }
    }

    // Bonus pour les compétences préférées
    for (const preferredSkill of preferredSkills) {
      const candidateSkill = candidateSkills.find(cs => 
        this.normalizeSkillName(cs.name) === this.normalizeSkillName(preferredSkill.name)
      );

      if (candidateSkill) {
        const weight = (preferredSkill.weight || 3) * 0.5; // Poids réduit pour les compétences préférées
        const levelScore = this.calculateSkillLevelScore(candidateSkill.level, preferredSkill.level);
        totalScore += levelScore * weight;
        totalWeight += weight;
      }
    }

    // Utiliser l'IA pour détecter des compétences similaires ou transférables
    const semanticBonus = await this.calculateSemanticSkillsBonus(candidateSkills, requiredSkills);
    
    const baseScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    return Math.min(100, baseScore + semanticBonus);
  }

  /**
   * Normalise le nom d'une compétence pour la comparaison
   */
  private normalizeSkillName(skillName: string): string {
    return skillName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/js$/, 'javascript')
      .replace(/ts$/, 'typescript')
      .replace(/py$/, 'python');
  }

  /**
   * Calcule le score basé sur le niveau de compétence
   */
  private calculateSkillLevelScore(candidateLevel: string, requiredLevel: string): number {
    const levelMap: Record<string, number> = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    const candidateScore = levelMap[candidateLevel] || 2;
    const requiredScore = levelMap[requiredLevel] || 2;

    if (candidateScore >= requiredScore) {
      return 100; // Niveau suffisant ou supérieur
    } else if (candidateScore === requiredScore - 1) {
      return 75; // Un niveau en dessous
    } else {
      return Math.max(0, 50 - (requiredScore - candidateScore) * 15);
    }
  }

  /**
   * Utilise l'IA pour détecter des compétences sémantiquement similaires
   */
  private async calculateSemanticSkillsBonus(candidateSkills: any[], requiredSkills: any[]): Promise<number> {
    try {
      const prompt = `
Analyse les compétences du candidat et les compétences requises pour identifier des correspondances sémantiques.

Compétences du candidat: ${candidateSkills.map(s => s.name).join(', ')}
Compétences requises: ${requiredSkills.map(s => s.name).join(', ')}

Identifie les compétences transférables ou similaires et retourne un score bonus entre 0 et 15.
Exemples de correspondances:
- React et Vue.js (frameworks frontend)
- Python et Java (langages de programmation)
- Photoshop et GIMP (édition d'images)

Réponds uniquement avec un nombre entre 0 et 15.`;

      const response = await this.callAI(prompt, 'groq');
      const bonus = parseFloat(response) || 0;
      return Math.min(15, Math.max(0, bonus));
    } catch (error) {
      console.warn('Erreur lors du calcul du bonus sémantique:', error);
      return 0;
    }
  }

  /**
   * Calcule le score d'expérience
   */
  private calculateExperienceScore(candidate: CandidateProfile, job: JobOffer): number {
    const candidateExperience = this.calculateTotalExperience(candidate.experiences || []);
    const requiredExperience = job.requirements.minimumExperience || 0;

    if (requiredExperience === 0) return 100;

    if (candidateExperience >= requiredExperience) {
      // Bonus pour l'expérience supplémentaire, mais avec rendements décroissants
      const bonus = Math.min(20, (candidateExperience - requiredExperience) * 2);
      return Math.min(100, 100 + bonus);
    } else {
      // Pénalité pour manque d'expérience
      const deficit = requiredExperience - candidateExperience;
      return Math.max(0, 100 - (deficit * 15));
    }
  }

  /**
   * Calcule l'expérience totale en années
   */
  private calculateTotalExperience(experiences: any[]): number {
    let totalMonths = 0;

    for (const exp of experiences) {
      const startDate = new Date(exp.startDate + '-01');
      const endDate = exp.isCurrent ? new Date() : new Date(exp.endDate + '-01');
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }

    return totalMonths / 12;
  }

  /**
   * Calcule le score d'éducation
   */
  private calculateEducationScore(candidate: CandidateProfile, job: JobOffer): number {
    const candidateEducation = candidate.education || [];
    const requiredEducation = job.requirements.educationLevel;

    if (!requiredEducation || candidateEducation.length === 0) return 50;

    const educationLevels: Record<string, number> = {
      'bac': 1,
      'bac+2': 2,
      'bac+3': 3,
      'licence': 3,
      'bac+4': 4,
      'bac+5': 5,
      'master': 5,
      'mastère': 5,
      'ingénieur': 5,
      'doctorat': 6,
      'phd': 6
    };

    const requiredLevel = this.getEducationLevel(requiredEducation, educationLevels);
    const candidateLevel = Math.max(...candidateEducation.map(edu => 
      this.getEducationLevel(edu.degree, educationLevels)
    ));

    if (candidateLevel >= requiredLevel) {
      return 100;
    } else if (candidateLevel === requiredLevel - 1) {
      return 80;
    } else {
      return Math.max(30, 100 - (requiredLevel - candidateLevel) * 20);
    }
  }

  /**
   * Obtient le niveau numérique d'une formation
   */
  private getEducationLevel(education: string, levels: Record<string, number>): number {
    const normalized = education.toLowerCase();
    for (const [key, value] of Object.entries(levels)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    return 3; // Niveau par défaut (licence)
  }

  /**
   * Calcule le score de localisation
   */
  private calculateLocationScore(candidate: CandidateProfile, job: JobOffer): number {
    const candidateLocations = candidate.preferences?.preferredLocations || [];
    const jobLocation = job.location;

    if (candidateLocations.length === 0) return 50;

    // Vérification de correspondance exacte
    if (candidateLocations.some(loc => 
      this.normalizeLocation(loc) === this.normalizeLocation(jobLocation)
    )) {
      return 100;
    }

    // Vérification de correspondance régionale (même gouvernorat)
    const jobRegion = this.extractRegion(jobLocation);
    if (candidateLocations.some(loc => 
      this.extractRegion(loc) === jobRegion
    )) {
      return 80;
    }

    // Vérifier la volonté de déplacement
    const travelWillingness = candidate.preferences?.travelWillingness || 0;
    return Math.min(70, travelWillingness);
  }

  /**
   * Normalise une localisation
   */
  private normalizeLocation(location: string): string {
    return location.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim();
  }

  /**
   * Extrait la région d'une localisation
   */
  private extractRegion(location: string): string {
    const tunisianRegions = [
      'tunis', 'ariana', 'ben arous', 'manouba',
      'nabeul', 'zaghouan', 'bizerte',
      'béja', 'jendouba', 'kef', 'siliana',
      'sousse', 'monastir', 'mahdia', 'kairouan', 'kasserine',
      'sfax', 'sidi bouzid', 'gafsa', 'tozeur', 'kebili',
      'gabès', 'medenine', 'tataouine'
    ];

    const normalized = this.normalizeLocation(location);
    for (const region of tunisianRegions) {
      if (normalized.includes(region)) {
        return region;
      }
    }
    return normalized.split(' ')[0]; // Premier mot par défaut
  }

  /**
   * Calcule le score salarial
   */
  private calculateSalaryScore(candidate: CandidateProfile, job: JobOffer): number {
    const candidateExpectation = candidate.preferences?.salaryExpectation;
    const jobSalary = job.salaryRange;

    if (!candidateExpectation || !jobSalary) return 50;

    // Convertir en même devise et période si nécessaire
    const candidateMin = candidateExpectation.min;
    const candidateMax = candidateExpectation.max;
    const jobMin = jobSalary.min;
    const jobMax = jobSalary.max;

    // Vérifier s'il y a chevauchement
    if (candidateMin <= jobMax && candidateMax >= jobMin) {
      // Calculer le pourcentage de chevauchement
      const overlapMin = Math.max(candidateMin, jobMin);
      const overlapMax = Math.min(candidateMax, jobMax);
      const overlapSize = overlapMax - overlapMin;
      const candidateRange = candidateMax - candidateMin;
      const jobRange = jobMax - jobMin;
      
      const overlapPercentage = overlapSize / Math.min(candidateRange, jobRange);
      return Math.min(100, 70 + (overlapPercentage * 30));
    } else if (candidateMax < jobMin) {
      // Le candidat demande moins que ce qui est offert (très bon)
      return 100;
    } else {
      // Le candidat demande plus que ce qui est offert
      const gap = candidateMin - jobMax;
      const gapPercentage = gap / jobMax;
      return Math.max(0, 50 - (gapPercentage * 100));
    }
  }

  /**
   * Calcule le score des langues
   */
  private calculateLanguageScore(candidate: CandidateProfile, job: JobOffer): number {
    const candidateLanguages = candidate.languages || [];
    const requiredLanguages = job.requirements.languages || [];

    if (requiredLanguages.length === 0) return 100;

    let totalScore = 0;
    let totalWeight = 0;

    for (const reqLang of requiredLanguages) {
      const candidateLang = candidateLanguages.find(cl => 
        this.normalizeLanguage(cl.name) === this.normalizeLanguage(reqLang.name)
      );

      const weight = reqLang.isRequired ? 10 : 5;
      totalWeight += weight;

      if (candidateLang) {
        const levelScore = this.calculateLanguageLevelScore(candidateLang.level, reqLang.level);
        totalScore += levelScore * weight;
      } else if (reqLang.isRequired) {
        totalScore += 0; // Pénalité pour langue requise manquante
      } else {
        totalScore += 30 * weight; // Score partiel pour langue préférée manquante
      }
    }

    return totalWeight > 0 ? (totalScore / totalWeight) : 100;
  }

  /**
   * Normalise le nom d'une langue
   */
  private normalizeLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'français': 'french',
      'francais': 'french',
      'anglais': 'english',
      'arabe': 'arabic',
      'espagnol': 'spanish',
      'allemand': 'german',
      'italien': 'italian'
    };

    const normalized = language.toLowerCase();
    return languageMap[normalized] || normalized;
  }

  /**
   * Calcule le score basé sur le niveau de langue
   */
  private calculateLanguageLevelScore(candidateLevel: string, requiredLevel: string): number {
    const levelMap: Record<string, number> = {
      'basic': 1,
      'conversational': 2,
      'fluent': 3,
      'native': 4
    };

    const candidateScore = levelMap[candidateLevel] || 2;
    const requiredScore = levelMap[requiredLevel] || 2;

    if (candidateScore >= requiredScore) {
      return 100;
    } else {
      return Math.max(0, 100 - (requiredScore - candidateScore) * 25);
    }
  }

  /**
   * Calcule le score de fit culturel avec l'IA
   */
  private async calculateCulturalFitScore(candidate: CandidateProfile, job: JobOffer): Promise<number> {
    try {
      const prompt = `
Analyse la compatibilité culturelle entre ce candidat et cette offre d'emploi.

CANDIDAT:
- Expériences: ${candidate.experiences?.map(exp => `${exp.title} chez ${exp.company}`).join(', ') || 'Non spécifié'}
- Formation: ${candidate.education?.map(edu => `${edu.degree} à ${edu.institution}`).join(', ') || 'Non spécifié'}
- Compétences: ${candidate.skills?.map(skill => skill.name).join(', ') || 'Non spécifié'}

OFFRE D'EMPLOI:
- Poste: ${job.title}
- Entreprise: ${job.company}
- Description: ${job.description.substring(0, 500)}...
- Type de contrat: ${job.contractType}
- Niveau: ${job.experienceLevel}

Évalue la compatibilité culturelle et professionnelle sur une échelle de 0 à 100.
Considère:
- L'adéquation du profil avec la culture d'entreprise
- La progression de carrière logique
- La cohérence avec les expériences passées
- L'adaptation au niveau de responsabilité

Réponds uniquement avec un nombre entre 0 et 100.`;

      const response = await this.callAI(prompt, 'gemini');
      const score = parseFloat(response) || 50;
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.warn('Erreur lors du calcul du fit culturel:', error);
      return 50; // Score neutre par défaut
    }
  }

  /**
   * Calcule le score global pondéré
   */
  private calculateOverallScore(scores: DetailedMatchingScores, criteria: MatchingCriteria): number {
    const weights = {
      skills: criteria.skillsWeight || 0.35,
      experience: criteria.experienceWeight || 0.25,
      education: criteria.educationWeight || 0.15,
      location: criteria.locationWeight || 0.10,
      salary: criteria.salaryWeight || 0.05,
      language: criteria.languageWeight || 0.05,
      culturalFit: 0.05
    };

    // Normaliser les poids pour qu'ils totalisent 1
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(weights).forEach(key => {
      weights[key as keyof typeof weights] /= totalWeight;
    });

    const weightedScore = 
      scores.skillsScore * weights.skills +
      scores.experienceScore * weights.experience +
      scores.educationScore * weights.education +
      scores.locationScore * weights.location +
      scores.salaryScore * weights.salary +
      scores.languageScore * weights.language +
      scores.culturalFitScore * weights.culturalFit;

    return Math.round(weightedScore * 10) / 10; // Arrondir à 1 décimale
  }

  /**
   * Génère une explication du matching avec l'IA
   */
  private async generateMatchingExplanation(
    input: MatchingInput, 
    scores: DetailedMatchingScores, 
    overallScore: number
  ): Promise<string> {
    try {
      const prompt = `
Génère une explication claire et concise du matching entre ce candidat et cette offre d'emploi.

CANDIDAT: ${input.candidateProfile.personalInfo?.fullName || 'Candidat'}
POSTE: ${input.jobOffer.title} chez ${input.jobOffer.company}

SCORES DÉTAILLÉS:
- Compétences: ${scores.skillsScore.toFixed(1)}%
- Expérience: ${scores.experienceScore.toFixed(1)}%
- Formation: ${scores.educationScore.toFixed(1)}%
- Localisation: ${scores.locationScore.toFixed(1)}%
- Salaire: ${scores.salaryScore.toFixed(1)}%
- Langues: ${scores.languageScore.toFixed(1)}%
- Fit culturel: ${scores.culturalFitScore.toFixed(1)}%

SCORE GLOBAL: ${overallScore}%

Rédige une explication en français de 2-3 phrases qui explique pourquoi ce candidat correspond ou ne correspond pas à cette offre. Mentionne les points forts et les points d'amélioration principaux.`;

      return await this.callAI(prompt, 'gemini');
    } catch (error) {
      console.warn('Erreur lors de la génération de l\'explication:', error);
      return `Ce candidat obtient un score de ${overallScore}% pour ce poste. L'analyse détaillée révèle des correspondances variables selon les critères évalués.`;
    }
  }

  /**
   * Identifie les forces et faiblesses du matching
   */
  private identifyStrengthsAndWeaknesses(
    scores: DetailedMatchingScores, 
    input: MatchingInput
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const scoreEntries = Object.entries(scores) as [keyof DetailedMatchingScores, number][];
    
    for (const [category, score] of scoreEntries) {
      if (score >= 80) {
        strengths.push(this.getStrengthMessage(category, score));
      } else if (score < 50) {
        weaknesses.push(this.getWeaknessMessage(category, score));
      }
    }

    return { strengths, weaknesses };
  }

  /**
   * Génère un message de force pour une catégorie
   */
  private getStrengthMessage(category: keyof DetailedMatchingScores, score: number): string {
    const messages: Record<keyof DetailedMatchingScores, string> = {
      skillsScore: `Excellente correspondance des compétences (${score.toFixed(1)}%)`,
      experienceScore: `Expérience professionnelle très adaptée (${score.toFixed(1)}%)`,
      educationScore: `Formation parfaitement alignée (${score.toFixed(1)}%)`,
      locationScore: `Localisation idéale (${score.toFixed(1)}%)`,
      salaryScore: `Attentes salariales compatibles (${score.toFixed(1)}%)`,
      languageScore: `Maîtrise des langues requises (${score.toFixed(1)}%)`,
      culturalFitScore: `Excellent fit culturel (${score.toFixed(1)}%)`
    };

    return messages[category];
  }

  /**
   * Génère un message de faiblesse pour une catégorie
   */
  private getWeaknessMessage(category: keyof DetailedMatchingScores, score: number): string {
    const messages: Record<keyof DetailedMatchingScores, string> = {
      skillsScore: `Compétences à développer (${score.toFixed(1)}%)`,
      experienceScore: `Expérience insuffisante (${score.toFixed(1)}%)`,
      educationScore: `Formation non alignée (${score.toFixed(1)}%)`,
      locationScore: `Localisation problématique (${score.toFixed(1)}%)`,
      salaryScore: `Attentes salariales inadéquates (${score.toFixed(1)}%)`,
      languageScore: `Langues à améliorer (${score.toFixed(1)}%)`,
      culturalFitScore: `Fit culturel à évaluer (${score.toFixed(1)}%)`
    };

    return messages[category];
  }

  /**
   * Génère des recommandations personnalisées
   */
  private async generateRecommendations(
    input: MatchingInput,
    scores: DetailedMatchingScores,
    weaknesses: string[]
  ): Promise<string[]> {
    if (weaknesses.length === 0) {
      return ['Profil excellent pour ce poste, candidature fortement recommandée !'];
    }

    try {
      const prompt = `
Génère 3-5 recommandations concrètes pour améliorer la candidature de ce profil pour ce poste.

CANDIDAT: ${input.candidateProfile.personalInfo?.fullName || 'Candidat'}
POSTE: ${input.jobOffer.title}

FAIBLESSES IDENTIFIÉES:
${weaknesses.join('\n')}

COMPÉTENCES REQUISES MANQUANTES:
${input.jobOffer.requirements.requiredSkills
  .filter(skill => !input.candidateProfile.skills?.some(cs => 
    this.normalizeSkillName(cs.name) === this.normalizeSkillName(skill.name)
  ))
  .map(skill => skill.name)
  .join(', ') || 'Aucune'}

Génère des recommandations pratiques et réalisables en français. Chaque recommandation doit être une phrase complète et actionnable.`;

      const response = await this.callAI(prompt, 'gemini');
      
      // Parser les recommandations (supposer qu'elles sont séparées par des retours à la ligne)
      return response.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.warn('Erreur lors de la génération des recommandations:', error);
      return [
        'Développer les compétences techniques manquantes',
        'Acquérir plus d\'expérience dans le domaine',
        'Améliorer la présentation du profil'
      ];
    }
  }

  /**
   * Calcule le niveau de confiance du matching
   */
  private calculateConfidenceLevel(scores: DetailedMatchingScores, input: MatchingInput): number {
    // Facteurs qui influencent la confiance
    let confidence = 0.7; // Base de confiance

    // Qualité des données candidat
    const candidateDataQuality = this.assessCandidateDataQuality(input.candidateProfile);
    confidence += candidateDataQuality * 0.15;

    // Qualité des données offre
    const jobDataQuality = this.assessJobDataQuality(input.jobOffer);
    confidence += jobDataQuality * 0.15;

    // Cohérence des scores (moins de variance = plus de confiance)
    const scoreVariance = this.calculateScoreVariance(scores);
    confidence -= scoreVariance * 0.1;

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Évalue la qualité des données candidat
   */
  private assessCandidateDataQuality(candidate: CandidateProfile): number {
    let quality = 0;
    
    if (candidate.personalInfo?.email) quality += 0.1;
    if (candidate.experiences && candidate.experiences.length > 0) quality += 0.3;
    if (candidate.education && candidate.education.length > 0) quality += 0.2;
    if (candidate.skills && candidate.skills.length >= 5) quality += 0.3;
    if (candidate.languages && candidate.languages.length > 0) quality += 0.1;

    return Math.min(1.0, quality);
  }

  /**
   * Évalue la qualité des données offre
   */
  private assessJobDataQuality(job: JobOffer): number {
    let quality = 0;
    
    if (job.description && job.description.length > 100) quality += 0.3;
    if (job.requirements.requiredSkills && job.requirements.requiredSkills.length > 0) quality += 0.4;
    if (job.requirements.minimumExperience !== undefined) quality += 0.1;
    if (job.requirements.educationLevel) quality += 0.1;
    if (job.salaryRange) quality += 0.1;

    return Math.min(1.0, quality);
  }

  /**
   * Calcule la variance des scores pour évaluer la cohérence
   */
  private calculateScoreVariance(scores: DetailedMatchingScores): number {
    const scoreValues = Object.values(scores);
    const mean = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    const variance = scoreValues.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scoreValues.length;
    
    return Math.sqrt(variance) / 100; // Normaliser entre 0 et 1
  }

  /**
   * Sauvegarde les résultats pour l'apprentissage automatique
   */
  private async saveMatchingResults(input: MatchingInput, result: MatchingOutput): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('matching_results')
        .insert([{
          candidate_id: input.candidateProfile.id,
          job_id: input.jobOffer.id,
          overall_score: result.overallScore,
          detailed_scores: result.detailedScores,
          confidence_level: result.confidenceLevel,
          matching_criteria: input.matchingCriteria,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Erreur lors de la sauvegarde des résultats de matching:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  /**
   * Appelle un service d'IA (Gemini ou Groq)
   */
  private async callAI(prompt: string, service: 'gemini' | 'groq' = 'gemini'): Promise<string> {
    if (service === 'gemini') {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.geminiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) throw new Error(`Erreur Gemini: ${response.statusText}`);
      
      const result = await response.json();
      return result.candidates[0]?.content?.parts[0]?.text || '';
    } else {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1024
        })
      });

      if (!response.ok) throw new Error(`Erreur Groq: ${response.statusText}`);
      
      const result = await response.json();
      return result.choices[0]?.message?.content || '';
    }
  }

  /**
   * Health check pour l'agent
   */
  async healthCheck(): Promise<{ status: string; timestamp: Date; capabilities: string[] }> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      capabilities: [
        'skills_matching',
        'experience_analysis',
        'education_scoring',
        'location_matching',
        'salary_compatibility',
        'language_assessment',
        'cultural_fit_analysis',
        'semantic_skills_detection',
        'recommendation_generation'
      ]
    };
  }
}

// Point d'entrée pour Supabase Edge Function
serve(async (req) => {
  try {
    const { taskType, inputData, configuration } = await req.json();
    const agent = new MatchingAgent();

    switch (taskType) {
      case 'perform_matching':
        const result = await agent.performMatching(inputData as MatchingInput);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });

      case 'health_check':
        const health = await agent.healthCheck();
        return new Response(JSON.stringify(health), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });

      default:
        return new Response(JSON.stringify({ error: 'Type de tâche non supporté' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
    }
  } catch (error) {
    console.error('Erreur dans Matching Agent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

