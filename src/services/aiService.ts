import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, ProfileRecommendation } from '../store/slices/profileSlice';

export type AIModel = 'groq-llama' | 'gemini-2.0-flash' | 'local-mock';

export interface AIConfig {
  groqApiKey?: string;
  geminiApiKey?: string;
  defaultModel: AIModel;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private groq: Groq | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Groq client
    if (this.config.groqApiKey) {
      this.groq = new Groq({
        apiKey: this.config.groqApiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
    }

    // Initialize Gemini client
    if (this.config.geminiApiKey) {
      this.gemini = new GoogleGenerativeAI(this.config.geminiApiKey);
    }
  }

  async generateText(prompt: string, model?: AIModel): Promise<AIResponse> {
    const selectedModel = model || this.config.defaultModel;

    try {
      switch (selectedModel) {
        case 'groq-llama':
          return await this.generateWithGroq(prompt);
        case 'gemini-2.0-flash':
          return await this.generateWithGemini(prompt);
        case 'local-mock':
        default:
          return await this.generateMockResponse(prompt);
      }
    } catch (error) {
      console.error(`Error with ${selectedModel}:`, error);
      // Fallback to mock response
      return await this.generateMockResponse(prompt);
    }
  }

  private async generateWithGroq(prompt: string): Promise<AIResponse> {
    if (!this.groq) {
      throw new Error('Groq client not initialized. Please provide API key.');
    }

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant', // Updated to current model
      temperature: 0.7,
      max_tokens: 2048,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      model: 'groq-llama',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }
    };
  }

  private async generateWithGemini(prompt: string): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized. Please provide API key.');
    }

    const model = this.gemini.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      model: 'gemini-2.0-flash',
      usage: {
        promptTokens: 0, // Gemini doesn't provide detailed token usage in free tier
        completionTokens: 0,
        totalTokens: 0,
      }
    };
  }

  private async generateMockResponse(prompt: string): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual mock responses based on prompt content
    let mockResponse = '';

    if (prompt.toLowerCase().includes('lettre de motivation') || prompt.toLowerCase().includes('cover letter')) {
      mockResponse = this.generateMockCoverLetter();
    } else if (prompt.toLowerCase().includes('cv') || prompt.toLowerCase().includes('resume')) {
      mockResponse = this.generateMockCVAnalysis();
    } else if (prompt.toLowerCase().includes('entretien') || prompt.toLowerCase().includes('interview')) {
      mockResponse = this.generateMockInterviewAdvice();
    } else if (prompt.toLowerCase().includes('compétences') || prompt.toLowerCase().includes('skills')) {
      mockResponse = this.generateMockSkillsAdvice();
    } else if (prompt.toLowerCase().includes('recommandations') || prompt.toLowerCase().includes('recommendations')) {
      mockResponse = this.generateMockRecommendations();
    } else {
      mockResponse = this.generateGenericMockResponse();
    }

    return {
      content: mockResponse,
      model: 'local-mock',
      usage: {
        promptTokens: prompt.length / 4, // Rough estimation
        completionTokens: mockResponse.length / 4,
        totalTokens: (prompt.length + mockResponse.length) / 4,
      }
    };
  }

  private generateMockCoverLetter(): string {
    return `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste qui a retenu toute mon attention. Votre entreprise jouit d'une excellente réputation dans le secteur, et je serais honoré de contribuer à son développement.

Fort de mon expérience et de mes compétences techniques, je suis convaincu que mon profil correspond parfaitement aux exigences de ce poste. Ma passion pour l'innovation et mon approche orientée résultats me permettront d'apporter une valeur ajoutée significative à vos équipes.

Je serais ravi de pouvoir échanger avec vous sur cette opportunité et vous démontrer ma motivation lors d'un entretien.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Cordialement,
[Votre nom]`;
  }

  private generateMockCVAnalysis(): string {
    return `{
  "personalInfo": {
    "name": "Jean Dupont",
    "email": "jean.dupont@email.com",
    "phone": "+33 6 12 34 56 78",
    "address": "Paris, France",
    "linkedin": "https://linkedin.com/in/jeandupont",
    "website": "https://jeandupont.dev"
  },
  "summary": "Développeur Full Stack avec 8 ans d'expérience dans le développement d'applications web modernes. Expertise en React, Node.js, et technologies cloud.",
  "experience": [
    {
      "title": "Développeur Senior Full Stack",
      "company": "TechCorp",
      "period": "2021-2024",
      "description": "Développement d'applications React/Node.js pour 50k+ utilisateurs. Architecture microservices avec Docker et Kubernetes."
    },
    {
      "title": "Développeur Web",
      "company": "WebAgency",
      "period": "2019-2021",
      "description": "Création de sites web responsives avec React et TypeScript. Intégration d'APIs REST et GraphQL."
    }
  ],
  "education": [
    {
      "degree": "Master Informatique",
      "institution": "Université Paris-Saclay",
      "year": "2016",
      "grade": "Mention Bien"
    },
    {
      "degree": "Licence Informatique",
      "institution": "Université Paris-Sud",
      "year": "2014",
      "grade": "Mention Assez Bien"
    }
  ],
  "skills": ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
  "languages": [
    {
      "language": "Français",
      "level": "Natif"
    },
    {
      "language": "Anglais",
      "level": "Courant"
    },
    {
      "language": "Espagnol",
      "level": "Intermédiaire"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer Associate",
      "issuer": "Amazon",
      "date": "2023"
    },
    {
      "name": "React Developer Certification",
      "issuer": "Meta",
      "date": "2022"
    }
  ],
  "projects": [
    {
      "name": "Plateforme E-commerce",
      "description": "Application React/Node.js pour la vente en ligne",
      "technologies": ["React", "Node.js", "MongoDB", "Stripe"]
    }
  ]
}`;
  }

  private generateMockInterviewAdvice(): string {
    return `## Conseils pour votre entretien

### Préparation essentielle :
1. **Recherchez l'entreprise** : Histoire, valeurs, actualités récentes
2. **Préparez vos exemples** : Situations concrètes illustrant vos compétences
3. **Questions à poser** : Montrez votre intérêt pour le poste et l'équipe

### Pendant l'entretien :
- Soyez authentique et enthousiaste
- Écoutez attentivement les questions
- Donnez des exemples concrets et mesurables
- Posez des questions pertinentes

### Questions fréquentes à préparer :
- "Parlez-moi de vous"
- "Pourquoi ce poste vous intéresse-t-il ?"
- "Quelles sont vos forces et faiblesses ?"
- "Où vous voyez-vous dans 5 ans ?"

Bonne chance pour votre entretien !`;
  }

  private generateMockSkillsAdvice(): string {
    return `## Développement de vos compétences

### Compétences techniques en demande :
- **Développement** : React, Node.js, Python, Cloud (AWS/Azure)
- **Data** : SQL, Python, Power BI, Machine Learning
- **Digital** : SEO/SEM, Analytics, Automation
- **Gestion** : Agile, Scrum, Leadership

### Compétences transversales :
- Communication interpersonnelle
- Résolution de problèmes
- Adaptabilité
- Travail en équipe
- Pensée critique

### Recommandations :
1. Identifiez 2-3 compétences clés pour votre secteur
2. Suivez des formations en ligne (Coursera, Udemy, LinkedIn Learning)
3. Pratiquez sur des projets personnels
4. Obtenez des certifications reconnues
5. Participez à des communautés professionnelles

L'apprentissage continu est la clé du succès professionnel !`;
  }

  private generateGenericMockResponse(): string {
    return `Merci pour votre question. Voici quelques conseils personnalisés basés sur votre profil :

### Recommandations principales :
1. **Optimisez votre présence en ligne** : LinkedIn, portfolio professionnel
2. **Développez votre réseau** : Participez à des événements sectoriels
3. **Restez à jour** : Suivez les tendances de votre domaine
4. **Pratiquez régulièrement** : Maintenez et développez vos compétences

### Prochaines étapes :
- Définissez vos objectifs à court et long terme
- Identifiez les compétences à développer
- Créez un plan d'action concret
- Mesurez vos progrès régulièrement

N'hésitez pas si vous avez des questions plus spécifiques !`;
  }

  private generateMockRecommendations(): string {
    return `[
  {
    "id": "improve-summary",
    "type": "improvement",
    "priority": "high",
    "title": "Améliorer le résumé professionnel",
    "description": "Votre résumé professionnel pourrait être plus détaillé et impactant. Un bon résumé doit faire 150-200 mots et inclure vos objectifs de carrière.",
    "action": "Rédiger un résumé plus détaillé",
    "category": "profile"
  },
  {
    "id": "add-linkedin",
    "type": "missing_info",
    "priority": "high",
    "title": "Ajouter votre profil LinkedIn",
    "description": "LinkedIn est essentiel pour votre visibilité professionnelle. 87% des recruteurs utilisent LinkedIn pour rechercher des candidats.",
    "action": "Créer et ajouter le lien LinkedIn",
    "category": "profile"
  },
  {
    "id": "enhance-skills",
    "type": "optimization",
    "priority": "medium",
    "title": "Enrichir vos compétences",
    "description": "Visez 8-12 compétences techniques et soft skills pour un profil complet. Incluez des compétences spécifiques à votre domaine.",
    "action": "Ajouter des compétences manquantes",
    "category": "skills"
  },
  {
    "id": "detail-experience",
    "type": "improvement",
    "priority": "medium",
    "title": "Détailler vos expériences",
    "description": "Ajoutez des réalisations concrètes et des responsabilités clés à vos expériences. Utilisez des chiffres et des résultats.",
    "action": "Compléter les descriptions d'expérience",
    "category": "experience"
  },
  {
    "id": "add-certifications",
    "type": "missing_info",
    "priority": "low",
    "title": "Ajouter des certifications",
    "description": "Les certifications démontrent votre engagement dans l'apprentissage continu et peuvent vous démarquer.",
    "action": "Ajouter vos certifications importantes",
    "category": "education"
  }
]`;
  }

  // Utility methods
  async generateCoverLetter(jobTitle: string, company: string, userProfile: any): Promise<AIResponse> {
    const prompt = `Génère une lettre de motivation professionnelle en français pour le poste de "${jobTitle}" chez "${company}". 
    
Profil du candidat :
- Nom : ${userProfile.firstName} ${userProfile.lastName}
- Titre : ${userProfile.title}
- Expérience : ${userProfile.experiences?.length || 0} expériences
- Compétences principales : ${userProfile.skills?.slice(0, 5).map((s: any) => s.name).join(', ') || 'Non spécifiées'}

La lettre doit être :
- Personnalisée pour l'entreprise et le poste
- Professionnelle mais authentique
- Entre 200-300 mots
- Structurée avec introduction, développement, conclusion
- Adaptée au marché tunisien`;

    return await this.generateText(prompt);
  }

  async analyzeCVContent(cvText: string): Promise<AIResponse> {
    const prompt = `Analyse ce CV et fournis une évaluation détaillée en français :

CV à analyser :
${cvText}

Fournis :
1. Points forts (3-5 éléments)
2. Points à améliorer (3-5 recommandations)
3. Score global sur 100
4. Conseils spécifiques pour le marché de l'emploi tunisien
5. Mots-clés manquants importants

Format la réponse de manière structurée et professionnelle.`;

    return await this.generateText(prompt);
  }

  async generateInterviewQuestions(jobTitle: string, company: string): Promise<AIResponse> {
    const prompt = `Génère 10 questions d'entretien pertinentes en français pour le poste de "${jobTitle}" chez "${company}".

Inclus :
- 3 questions générales sur le candidat
- 4 questions techniques spécifiques au poste
- 2 questions sur la motivation et l'entreprise
- 1 question de mise en situation

Adapte les questions au contexte tunisien et aux pratiques locales de recrutement.`;

    return await this.generateText(prompt);
  }

  async optimizeJobSearch(userProfile: any, preferences: any): Promise<AIResponse> {
    const prompt = `Fournis des conseils personnalisés pour optimiser la recherche d'emploi en Tunisie.

Profil :
- Titre : ${userProfile.title}
- Expérience : ${userProfile.experiences?.length || 0} postes
- Compétences : ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Non spécifiées'}
- Localisation : ${userProfile.location}

Préférences :
- Type de poste recherché : ${preferences.jobType || 'Non spécifié'}
- Secteur d'activité : ${preferences.industry || 'Non spécifié'}

Fournis :
1. Stratégie de recherche personnalisée
2. Plateformes recommandées en Tunisie
3. Conseils de networking local
4. Compétences à développer en priorité
5. Timeline réaliste`;

    return await this.generateText(prompt);
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export const getAIService = (config?: AIConfig): AIService => {
  if (!aiServiceInstance || config) {
    const defaultConfig: AIConfig = {
      groqApiKey: import.meta.env.VITE_GROQ_API_KEY,
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
      defaultModel: 'local-mock' // Always default to mock for safety
    };
    
    // Only use external models if API keys are provided
    if (import.meta.env.VITE_GROQ_API_KEY) {
      defaultConfig.defaultModel = 'groq-llama';
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      defaultConfig.defaultModel = 'gemini-2.0-flash';
    }
    
    aiServiceInstance = new AIService(config || defaultConfig);
  }
  
  return aiServiceInstance;
};

export const generateProfileRecommendations = async (profile: UserProfile, userId: string): Promise<ProfileRecommendation[]> => {
  try {
    const prompt = `
Analysez le profil professionnel suivant et générez des recommandations personnalisées pour l'améliorer.
Profil à analyser :
- Nom : ${profile.firstName} ${profile.lastName}
- Titre : ${profile.title}
- Résumé : ${profile.summary}
- Expériences : ${profile.experiences?.length || 0} expérience(s)
- Formation : ${profile.education?.length || 0} formation(s)
- Compétences : ${profile.skills?.length || 0} compétence(s)
- Langues : ${profile.languages?.length || 0} langue(s)
- Certifications : ${profile.certifications?.length || 0} certification(s)
- Score de complétude : ${profile.completionScore}%

Générez 5-8 recommandations spécifiques et actionnables au format JSON suivant :
[
  {
    "id": "unique-id",
    "type": "missing_info|improvement|optimization|formatting",
    "priority": "high|medium|low",
    "title": "Titre de la recommandation",
    "description": "Description détaillée avec explication",
    "action": "Action concrète à effectuer",
    "category": "profile|experience|skills|education|formatting"
  }
]

Les recommandations doivent être :
- Spécifiques au profil analysé
- Actionnables et concrètes
- Priorisées selon l'impact sur la carrière
- Basées sur les meilleures pratiques RH
`;

    // Use the existing AI service instead of a non-existent endpoint
    const aiService = getAIService();
    const response = await aiService.generateText(prompt, 'groq-llama');
    
    // Extract JSON from the response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    
    // Add completed: false to each recommendation
    return recommendations.map((rec: any) => ({
      ...rec,
      completed: false,
      dismissed: false
    }));

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    // Fallback to static recommendations if AI fails
    return generateStaticRecommendations(profile);
  }
};

const generateStaticRecommendations = (profile: UserProfile): ProfileRecommendation[] => {
  const recommendations: ProfileRecommendation[] = [];

  // Profile completeness recommendations
  if (profile.completionScore < 70) {
    recommendations.push({
      id: 'improve-completeness',
      type: 'improvement',
      priority: 'high',
      title: 'Améliorer la complétude du profil',
      description: `Votre profil est complété à ${profile.completionScore}%. Un profil complet augmente vos chances de 60%.`,
      action: 'Compléter les sections manquantes',
      category: 'profile',
      completed: false,
    });
  }

  // Summary recommendations
  if (!profile.summary || profile.summary.length < 100) {
    recommendations.push({
      id: 'improve-summary',
      type: 'improvement',
      priority: 'high',
      title: 'Rédiger un résumé professionnel impactant',
      description: 'Un résumé de 150-200 mots décrivant votre parcours et objectifs professionnels',
      action: 'Rédiger un résumé détaillé',
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
      description: 'Les expériences sont essentielles pour démontrer votre expertise',
      action: 'Ajouter au moins une expérience récente',
      category: 'experience',
      completed: false,
    });
  } else {
    experiences.forEach((exp: any, index: number) => {
      if (!exp.description || exp.description.length < 100) {
        recommendations.push({
          id: `improve-exp-${index}`,
          type: 'improvement',
          priority: 'medium',
          title: `Détailler l'expérience chez ${exp.company}`,
          description: 'Ajoutez des réalisations concrètes et des responsabilités clés',
          action: 'Compléter la description avec des réalisations',
          category: 'experience',
          completed: false,
        });
      }
    });
  }

  // Skills recommendations
  const skills = profile.skills || [];
  if (skills.length < 8) {
    recommendations.push({
      id: 'add-skills',
      type: 'missing_info',
      priority: 'medium',
      title: 'Enrichir vos compétences',
      description: 'Visez 8-12 compétences techniques et soft skills',
      action: 'Ajouter des compétences manquantes',
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
      action: 'Ajouter vos formations principales',
      category: 'education',
      completed: false,
    });
  }

  // LinkedIn recommendations
  if (!profile.linkedin) {
    recommendations.push({
      id: 'add-linkedin',
      type: 'missing_info',
      priority: 'high',
      title: 'Ajouter votre profil LinkedIn',
      description: 'LinkedIn est essentiel pour votre visibilité professionnelle',
      action: 'Créer et ajouter le lien LinkedIn',
      category: 'profile',
      completed: false,
    });
  }

  return recommendations;
};