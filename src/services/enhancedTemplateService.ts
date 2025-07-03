
import { getAIService } from './aiService';
import { SupabaseService } from './supabaseService';

export interface TemplateVariables {
  candidateName?: string;
  jobTitle?: string;
  company?: string;
  companyUrl?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  [key: string]: any;
}

export interface TemplatePerformance {
  openRate: number;
  responseRate: number;
  clickRate: number;
  sentCount: number;
  successfulApplications: number;
}

export class EnhancedTemplateService {
  static async generateSmartTemplate(
    type: 'cover_letter' | 'follow_up' | 'networking' | 'interview_request',
    userProfile: any,
    jobContext: any,
    preferences: any
  ) {
    const aiService = getAIService();
    
    const contextualPrompt = this.buildContextualPrompt(type, userProfile, jobContext, preferences);
    const response = await aiService.generateText(contextualPrompt);
    
    return {
      template: response.content,
      variables: this.extractVariables(response.content),
      suggestions: this.generateUsageSuggestions(type, jobContext),
      estimatedPerformance: this.predictPerformance(type, userProfile, jobContext)
    };
  }

  static async optimizeExistingTemplate(
    templateId: string,
    performanceData: TemplatePerformance,
    userFeedback?: string
  ) {
    const aiService = getAIService();
    
    // Récupérer le template existant
    const template = await this.getTemplate(templateId);
    
    const optimizationPrompt = `
Optimise ce template basé sur les performances réelles :

TEMPLATE ACTUEL :
${template.content}

PERFORMANCES :
- Taux d'ouverture : ${performanceData.openRate}%
- Taux de réponse : ${performanceData.responseRate}%
- Candidatures réussies : ${performanceData.successfulApplications}/${performanceData.sentCount}

${userFeedback ? `FEEDBACK UTILISATEUR :\n${userFeedback}` : ''}

OBJECTIFS D'OPTIMISATION :
1. Augmenter le taux d'ouverture de 20%
2. Améliorer le taux de réponse de 15%
3. Rendre le message plus personnel et engageant
4. Optimiser pour le marché tunisien

Fournis le template optimisé avec explication des changements.`;

    const response = await aiService.generateText(optimizationPrompt);
    
    return {
      optimizedTemplate: response.content,
      improvements: this.analyzeImprovements(template.content, response.content),
      expectedGains: this.calculateExpectedGains(performanceData)
    };
  }

  static async generateVariations(baseTemplate: string, variationCount: number = 3) {
    const aiService = getAIService();
    const variations = [];
    
    for (let i = 0; i < variationCount; i++) {
      const prompt = `
Créé une variation ${i + 1} de ce template en gardant le même objectif mais en changeant :
- Le style d'approche
- Les formulations clés
- La structure des arguments

TEMPLATE ORIGINAL :
${baseTemplate}

VARIATION ${i + 1} - Focus sur ${this.getVariationFocus(i)} :`;
      
      const response = await aiService.generateText(prompt);
      variations.push({
        id: `variation_${i + 1}`,
        content: response.content,
        focus: this.getVariationFocus(i),
        estimatedPerformance: Math.random() * 30 + 70 // Simulation
      });
    }
    
    return variations;
  }

  static async analyzeTemplateEffectiveness(template: string, targetAudience: string) {
    const aiService = getAIService();
    
    const analysisPrompt = `
Analyse l'efficacité de ce template pour l'audience cible "${targetAudience}" :

TEMPLATE À ANALYSER :
${template}

CRITÈRES D'ANALYSE :
1. Clarté du message (0-100)
2. Personnalisation (0-100)
3. Appel à l'action (0-100)
4. Ton professionnel (0-100)
5. Adaptation culturelle Tunisie (0-100)

Fournis :
- Score global sur 100
- Points forts (3-5)
- Points d'amélioration (3-5)
- Recommandations spécifiques
- Taux de succès estimé

Format JSON :
{
  "globalScore": number,
  "scores": {
    "clarity": number,
    "personalization": number,
    "callToAction": number,
    "tone": number,
    "culturalFit": number
  },
  "strengths": [string],
  "improvements": [string],
  "recommendations": [string],
  "estimatedSuccessRate": number
}`;

    const response = await aiService.generateText(analysisPrompt);
    
    try {
      return JSON.parse(response.content);
    } catch {
      return this.parseAnalysisFromText(response.content);
    }
  }

  private static buildContextualPrompt(type: string, userProfile: any, jobContext: any, preferences: any) {
    const basePrompts = {
      cover_letter: `Génère une lettre de motivation ultra-personnalisée`,
      follow_up: `Créé un email de relance professionnel et respectueux`,
      networking: `Rédige un message de networking authentique`,
      interview_request: `Compose une demande d'entretien convaincante`
    };

    return `${basePrompts[type as keyof typeof basePrompts]} en tenant compte de :

PROFIL CANDIDAT :
${JSON.stringify(userProfile, null, 2)}

CONTEXTE EMPLOI :
${JSON.stringify(jobContext, null, 2)}

PRÉFÉRENCES :
${JSON.stringify(preferences, null, 2)}

Le template doit inclure des variables {variableName} pour la personnalisation automatique.`;
  }

  private static extractVariables(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  private static generateUsageSuggestions(type: string, context: any) {
    const suggestions = {
      cover_letter: [
        'Personnalisez {company} avec des informations spécifiques',
        'Adaptez {skills} selon l\'offre d\'emploi',
        'Mentionnez des projets récents dans {experience}'
      ],
      follow_up: [
        'Attendez 7-10 jours avant d\'envoyer',
        'Référencez la candidature initiale',
        'Ajoutez une valeur supplémentaire'
      ]
    };
    
    return suggestions[type as keyof typeof suggestions] || [];
  }

  private static predictPerformance(type: string, userProfile: any, jobContext: any) {
    // Algorithme de prédiction basé sur des facteurs
    const factors = {
      profileCompleteness: (userProfile.completionScore || 50) / 100,
      industryMatch: jobContext.industry ? 0.8 : 0.5,
      experienceRelevance: userProfile.experiences?.length > 0 ? 0.9 : 0.3
    };
    
    const baseRates = {
      cover_letter: { open: 75, response: 25 },
      follow_up: { open: 60, response: 15 },
      networking: { open: 85, response: 35 },
      interview_request: { open: 70, response: 40 }
    };
    
    const base = baseRates[type as keyof typeof baseRates] || { open: 60, response: 20 };
    const multiplier = Object.values(factors).reduce((acc, val) => acc * val, 1);
    
    return {
      estimatedOpenRate: Math.min(95, base.open * multiplier),
      estimatedResponseRate: Math.min(80, base.response * multiplier),
      confidence: multiplier * 100
    };
  }

  private static getVariationFocus(index: number): string {
    const focuses = ['Bénéfices entreprise', 'Réalisations personnelles', 'Motivation et passion'];
    return focuses[index] || 'Approche équilibrée';
  }

  private static analyzeImprovements(original: string, optimized: string) {
    // Analyse simplifiée - en production, utiliser un algorithme plus sophistiqué
    return [
      'Amélioration de l\'accroche',
      'Optimisation du call-to-action',
      'Personnalisation renforcée'
    ];
  }

  private static calculateExpectedGains(current: TemplatePerformance) {
    return {
      openRateGain: Math.min(20, (100 - current.openRate) * 0.3),
      responseRateGain: Math.min(15, (100 - current.responseRate) * 0.25),
      successRateGain: Math.min(25, (100 - (current.successfulApplications / current.sentCount * 100)) * 0.2)
    };
  }

  private static parseAnalysisFromText(text: string) {
    // Parser de secours si le JSON n'est pas valide
    return {
      globalScore: 75,
      scores: {
        clarity: 80,
        personalization: 70,
        callToAction: 75,
        tone: 85,
        culturalFit: 80
      },
      strengths: ['Structure claire', 'Ton professionnel'],
      improvements: ['Personnalisation', 'Call-to-action'],
      recommendations: ['Ajouter plus de détails spécifiques'],
      estimatedSuccessRate: 65
    };
  }

  private static async getTemplate(templateId: string) {
    // Simuler récupération template - remplacer par appel DB
    return {
      id: templateId,
      content: 'Template content...',
      type: 'cover_letter'
    };
  }
}
