import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  CVAnalysisInput,
  CVAnalysisOutput,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Recommendation
} from '../types/index.ts';

/**
 * Agent d'analyse de CV avancé pour KhedmaFinal
 * Utilise l'IA pour extraire et analyser les informations des CV
 */
class CVAnalyzerAgent {
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
   * Point d'entrée principal pour l'analyse de CV
   */
  async analyzeCV(input: CVAnalysisInput): Promise<CVAnalysisOutput> {
    try {
      console.log(`🔍 Début de l'analyse CV pour l'utilisateur ${input.userId}`);

      // Étape 1: Extraction du texte du CV
      const extractedText = await this.extractTextFromFile(input);

      // Étape 2: Analyse structurée avec l'IA
      const structuredData = await this.performStructuredAnalysis(extractedText, input.analysisType);

      // Étape 3: Validation et enrichissement des données
      const validatedData = await this.validateAndEnrichData(structuredData);

      // Étape 4: Génération des recommandations
      const recommendations = await this.generateRecommendations(validatedData, extractedText);

      // Étape 5: Calcul des scores de qualité
      const scores = this.calculateQualityScores(validatedData, extractedText);

      const result: CVAnalysisOutput = {
        extractedText,
        personalInfo: validatedData.personalInfo,
        experiences: validatedData.experiences,
        education: validatedData.education,
        skills: validatedData.skills,
        languages: validatedData.languages,
        certifications: validatedData.certifications,
        recommendations,
        qualityScore: scores.qualityScore,
        completenessScore: scores.completenessScore,
        improvementSuggestions: scores.improvementSuggestions
      };

      // Sauvegarder les résultats
      await this.saveAnalysisResults(input.userId, result);

      console.log(`✅ Analyse CV terminée avec succès (Score: ${scores.qualityScore}/100)`);
      return result;

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse CV:', error);
      throw new Error(`Erreur d'analyse CV: ${error.message}`);
    }
  }

  /**
   * Extrait le texte du fichier CV selon son type
   */
  private async extractTextFromFile(input: CVAnalysisInput): Promise<string> {
    try {
      if (input.fileType === 'application/pdf') {
        return await this.extractTextFromPDF(input.fileBuffer);
      } else if (input.fileType.includes('word') || input.fileType.includes('document')) {
        return await this.extractTextFromWord(input.fileBuffer);
      } else if (input.fileType.startsWith('text/')) {
        return new TextDecoder().decode(input.fileBuffer);
      } else {
        throw new Error(`Type de fichier non supporté: ${input.fileType}`);
      }
    } catch (error) {
      throw new Error(`Erreur d'extraction de texte: ${error.message}`);
    }
  }

  /**
   * Extrait le texte d'un PDF en utilisant l'API Google Document AI
   */
  private async extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
      // Utiliser l'API Google Document AI pour une extraction précise
      const response = await fetch('https://documentai.googleapis.com/v1/projects/YOUR_PROJECT/locations/us/processors/YOUR_PROCESSOR:process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getGoogleAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawDocument: {
            content: this.arrayBufferToBase64(buffer),
            mimeType: 'application/pdf'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Document AI: ${response.statusText}`);
      }

      const result = await response.json();
      return result.document.text || '';
    } catch (error) {
      console.warn('Fallback vers extraction PDF basique:', error);
      // Fallback vers une méthode plus simple si Document AI échoue
      return await this.extractTextWithGemini(buffer, 'application/pdf');
    }
  }

  /**
   * Extrait le texte d'un document Word
   */
  private async extractTextFromWord(buffer: ArrayBuffer): Promise<string> {
    // Pour les documents Word, utiliser Gemini qui peut traiter les fichiers directement
    return await this.extractTextWithGemini(buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  /**
   * Utilise Gemini pour extraire le texte d'un fichier
   */
  private async extractTextWithGemini(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.geminiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Extrais tout le texte de ce document CV. Retourne uniquement le texte brut sans formatage."
            },
            {
              inlineData: {
                mimeType,
                data: this.arrayBufferToBase64(buffer)
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur Gemini: ${response.statusText}`);
    }

    const result = await response.json();
    return result.candidates[0]?.content?.parts[0]?.text || '';
  }

  /**
   * Effectue l'analyse structurée du CV avec l'IA
   */
  private async performStructuredAnalysis(text: string, analysisType: string): Promise<any> {
    const prompt = this.buildAnalysisPrompt(text, analysisType);

    try {
      // Utiliser Gemini pour l'analyse structurée
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.geminiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Gemini: ${response.statusText}`);
      }

      const result = await response.json();
      const analysisText = result.candidates[0]?.content?.parts[0]?.text || '';
      
      // Parser le JSON retourné par l'IA
      return this.parseAnalysisResult(analysisText);

    } catch (error) {
      console.warn('Fallback vers Groq pour l\'analyse:', error);
      return await this.performAnalysisWithGroq(text, analysisType);
    }
  }

  /**
   * Construit le prompt d'analyse selon le type demandé
   */
  private buildAnalysisPrompt(text: string, analysisType: string): string {
    const basePrompt = `
Analyse ce CV en français et extrais les informations suivantes au format JSON strict.
Le CV peut contenir des informations en français, arabe ou anglais.

CV à analyser:
${text}

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "personalInfo": {
    "fullName": "string ou null",
    "email": "string ou null", 
    "phone": "string ou null",
    "address": "string ou null",
    "linkedIn": "string ou null",
    "portfolio": "string ou null"
  },
  "experiences": [
    {
      "title": "string",
      "company": "string", 
      "location": "string ou null",
      "startDate": "YYYY-MM ou YYYY",
      "endDate": "YYYY-MM ou YYYY ou null si en cours",
      "isCurrent": boolean,
      "description": "string",
      "skills": ["skill1", "skill2"],
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string ou null", 
      "startDate": "YYYY-MM ou YYYY",
      "endDate": "YYYY-MM ou YYYY ou null",
      "gpa": number ou null,
      "description": "string ou null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "technical|soft|language|tool",
      "level": "beginner|intermediate|advanced|expert", 
      "yearsOfExperience": number ou null,
      "verified": false
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "basic|conversational|fluent|native",
      "certifications": ["cert1", "cert2"] ou []
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM ou YYYY",
      "expiryDate": "YYYY-MM ou YYYY ou null",
      "credentialId": "string ou null",
      "verificationUrl": "string ou null"
    }
  ]
}`;

    if (analysisType === 'advanced' || analysisType === 'complete') {
      return basePrompt + `

Instructions spéciales pour l'analyse avancée:
- Identifie automatiquement les compétences techniques même si elles ne sont pas explicitement listées
- Déduis le niveau de compétence basé sur l'expérience et les projets mentionnés
- Extrais les réalisations quantifiables (chiffres, pourcentages, etc.)
- Identifie les mots-clés sectoriels importants
- Détecte les lacunes potentielles dans le profil
- Analyse la cohérence chronologique des expériences`;
    }

    return basePrompt;
  }

  /**
   * Parse le résultat de l'analyse IA
   */
  private parseAnalysisResult(analysisText: string): any {
    try {
      // Nettoyer le texte pour extraire uniquement le JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Aucun JSON trouvé dans la réponse');
      }

      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      throw new Error('Impossible de parser la réponse de l\'IA');
    }
  }

  /**
   * Fallback avec Groq si Gemini échoue
   */
  private async performAnalysisWithGroq(text: string, analysisType: string): Promise<any> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de CV. Réponds uniquement avec du JSON valide.'
          },
          {
            role: 'user', 
            content: this.buildAnalysisPrompt(text, analysisType)
          }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur Groq: ${response.statusText}`);
    }

    const result = await response.json();
    const analysisText = result.choices[0]?.message?.content || '';
    return this.parseAnalysisResult(analysisText);
  }

  /**
   * Valide et enrichit les données extraites
   */
  private async validateAndEnrichData(rawData: any): Promise<any> {
    // Validation des emails
    if (rawData.personalInfo?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawData.personalInfo.email)) {
        rawData.personalInfo.email = null;
      }
    }

    // Validation des téléphones
    if (rawData.personalInfo?.phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(rawData.personalInfo.phone)) {
        rawData.personalInfo.phone = null;
      }
    }

    // Normalisation des dates
    rawData.experiences = rawData.experiences?.map((exp: any) => ({
      ...exp,
      startDate: this.normalizeDate(exp.startDate),
      endDate: exp.endDate ? this.normalizeDate(exp.endDate) : null
    })) || [];

    rawData.education = rawData.education?.map((edu: any) => ({
      ...edu,
      startDate: this.normalizeDate(edu.startDate),
      endDate: edu.endDate ? this.normalizeDate(edu.endDate) : null
    })) || [];

    // Enrichissement des compétences avec des données sectorielles
    rawData.skills = await this.enrichSkills(rawData.skills || []);

    return rawData;
  }

  /**
   * Normalise les formats de date
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Convertir différents formats vers YYYY-MM
    const patterns = [
      /^(\d{4})-(\d{2})$/, // YYYY-MM
      /^(\d{4})$/, // YYYY
      /^(\d{2})\/(\d{4})$/, // MM/YYYY
      /^(\d{1,2})\/(\d{4})$/ // M/YYYY
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        if (match.length === 2) {
          return match[1]; // Année seulement
        } else if (match.length === 3) {
          const [, year, month] = match;
          return `${year}-${month.padStart(2, '0')}`;
        }
      }
    }

    return dateStr; // Retourner tel quel si aucun pattern ne correspond
  }

  /**
   * Enrichit les compétences avec des données sectorielles
   */
  private async enrichSkills(skills: any[]): Promise<Skill[]> {
    const enrichedSkills: Skill[] = [];

    for (const skill of skills) {
      const enrichedSkill: Skill = {
        name: skill.name,
        category: skill.category || await this.categorizeSkill(skill.name),
        level: skill.level || 'intermediate',
        yearsOfExperience: skill.yearsOfExperience || null,
        verified: false
      };

      enrichedSkills.push(enrichedSkill);
    }

    return enrichedSkills;
  }

  /**
   * Catégorise automatiquement une compétence
   */
  private async categorizeSkill(skillName: string): Promise<'technical' | 'soft' | 'language' | 'tool'> {
    const technicalSkills = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes'];
    const tools = ['photoshop', 'illustrator', 'figma', 'sketch', 'autocad', 'solidworks', 'excel', 'powerpoint', 'word'];
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'creativity', 'adaptability'];
    const languages = ['français', 'anglais', 'arabe', 'espagnol', 'allemand', 'italien'];

    const lowerSkill = skillName.toLowerCase();

    if (technicalSkills.some(tech => lowerSkill.includes(tech))) return 'technical';
    if (tools.some(tool => lowerSkill.includes(tool))) return 'tool';
    if (softSkills.some(soft => lowerSkill.includes(soft))) return 'soft';
    if (languages.some(lang => lowerSkill.includes(lang))) return 'language';

    return 'technical'; // Par défaut
  }

  /**
   * Génère des recommandations personnalisées
   */
  private async generateRecommendations(data: any, originalText: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyser les lacunes dans le profil
    const gaps = this.identifyProfileGaps(data);
    
    for (const gap of gaps) {
      const recommendation = await this.createRecommendation(gap, data, originalText);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Ajouter des recommandations d'optimisation
    const optimizations = await this.generateOptimizationRecommendations(data, originalText);
    recommendations.push(...optimizations);

    return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  /**
   * Identifie les lacunes dans le profil
   */
  private identifyProfileGaps(data: any): string[] {
    const gaps: string[] = [];

    if (!data.personalInfo?.email) gaps.push('missing_email');
    if (!data.personalInfo?.phone) gaps.push('missing_phone');
    if (!data.experiences || data.experiences.length === 0) gaps.push('missing_experience');
    if (!data.education || data.education.length === 0) gaps.push('missing_education');
    if (!data.skills || data.skills.length < 5) gaps.push('insufficient_skills');
    if (!data.languages || data.languages.length === 0) gaps.push('missing_languages');

    return gaps;
  }

  /**
   * Crée une recommandation basée sur une lacune identifiée
   */
  private async createRecommendation(gap: string, data: any, originalText: string): Promise<Recommendation | null> {
    const recommendationMap: Record<string, Recommendation> = {
      missing_email: {
        type: 'format_improvement',
        priority: 'high',
        title: 'Ajouter une adresse email',
        description: 'Votre CV ne contient pas d\'adresse email visible. C\'est essentiel pour que les recruteurs puissent vous contacter.',
        actionItems: ['Ajouter votre adresse email professionnelle en haut du CV', 'Vérifier que l\'email est correct et actif'],
        estimatedImpact: 9
      },
      missing_phone: {
        type: 'format_improvement',
        priority: 'high',
        title: 'Ajouter un numéro de téléphone',
        description: 'Un numéro de téléphone facilite le contact direct avec les recruteurs.',
        actionItems: ['Ajouter votre numéro de téléphone mobile', 'Utiliser le format international (+216 XX XXX XXX)'],
        estimatedImpact: 8
      },
      insufficient_skills: {
        type: 'skill_gap',
        priority: 'medium',
        title: 'Enrichir la section compétences',
        description: 'Votre CV manque de compétences détaillées. Ajoutez plus de compétences techniques et transversales.',
        actionItems: ['Lister toutes vos compétences techniques', 'Ajouter des compétences transversales', 'Préciser votre niveau pour chaque compétence'],
        estimatedImpact: 7
      }
    };

    return recommendationMap[gap] || null;
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private async generateOptimizationRecommendations(data: any, originalText: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyser la longueur du CV
    const wordCount = originalText.split(/\s+/).length;
    if (wordCount < 200) {
      recommendations.push({
        type: 'format_improvement',
        priority: 'medium',
        title: 'Développer le contenu du CV',
        description: 'Votre CV semble trop court. Ajoutez plus de détails sur vos expériences et réalisations.',
        actionItems: ['Détailler vos missions et responsabilités', 'Ajouter des réalisations quantifiées', 'Inclure des projets pertinents'],
        estimatedImpact: 6
      });
    }

    // Vérifier la présence de mots-clés sectoriels
    const hasIndustryKeywords = await this.checkIndustryKeywords(originalText, data);
    if (!hasIndustryKeywords) {
      recommendations.push({
        type: 'keyword_optimization',
        priority: 'medium',
        title: 'Optimiser les mots-clés sectoriels',
        description: 'Votre CV manque de mots-clés spécifiques à votre secteur d\'activité.',
        actionItems: ['Rechercher les mots-clés de votre secteur', 'Intégrer naturellement ces termes dans vos descriptions', 'Adapter le vocabulaire aux offres ciblées'],
        estimatedImpact: 7
      });
    }

    return recommendations;
  }

  /**
   * Vérifie la présence de mots-clés sectoriels
   */
  private async checkIndustryKeywords(text: string, data: any): Promise<boolean> {
    // Logique simplifiée - à améliorer avec une base de données de mots-clés
    const commonKeywords = ['projet', 'équipe', 'gestion', 'développement', 'analyse', 'optimisation'];
    const lowerText = text.toLowerCase();
    
    return commonKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Calcule les scores de qualité du CV
   */
  private calculateQualityScores(data: any, originalText: string): { qualityScore: number; completenessScore: number; improvementSuggestions: string[] } {
    let qualityScore = 0;
    let completenessScore = 0;
    const suggestions: string[] = [];

    // Score de complétude (40 points max)
    if (data.personalInfo?.fullName) completenessScore += 5;
    if (data.personalInfo?.email) completenessScore += 10;
    if (data.personalInfo?.phone) completenessScore += 10;
    if (data.experiences?.length > 0) completenessScore += 15;

    // Score de qualité (60 points max)
    const wordCount = originalText.split(/\s+/).length;
    if (wordCount >= 200) qualityScore += 15;
    else if (wordCount >= 100) qualityScore += 10;
    else suggestions.push('Développer le contenu du CV (minimum 200 mots)');

    if (data.skills?.length >= 5) qualityScore += 15;
    else suggestions.push('Ajouter plus de compétences (minimum 5)');

    if (data.experiences?.some((exp: any) => exp.achievements?.length > 0)) qualityScore += 15;
    else suggestions.push('Ajouter des réalisations quantifiées dans vos expériences');

    if (data.education?.length > 0) qualityScore += 10;
    else suggestions.push('Ajouter votre formation');

    if (data.languages?.length > 0) qualityScore += 5;
    else suggestions.push('Préciser les langues parlées');

    const totalScore = Math.min(100, qualityScore + completenessScore);

    return {
      qualityScore: totalScore,
      completenessScore: Math.min(40, completenessScore),
      improvementSuggestions: suggestions
    };
  }

  /**
   * Sauvegarde les résultats d'analyse en base de données
   */
  private async saveAnalysisResults(userId: string, results: CVAnalysisOutput): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('cv_analysis_results')
        .insert([{
          user_id: userId,
          analysis_data: results,
          quality_score: results.qualityScore,
          completeness_score: results.completenessScore,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des résultats:', error);
    }
  }

  /**
   * Obtient un token d'accès Google pour Document AI
   */
  private async getGoogleAccessToken(): Promise<string> {
    // Implémentation simplifiée - en production, utiliser les Service Account Keys
    return 'YOUR_GOOGLE_ACCESS_TOKEN';
  }

  /**
   * Convertit un ArrayBuffer en base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Health check pour l'agent
   */
  async healthCheck(): Promise<{ status: string; timestamp: Date; capabilities: string[] }> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      capabilities: [
        'pdf_extraction',
        'word_extraction', 
        'structured_analysis',
        'skill_categorization',
        'recommendation_generation',
        'quality_scoring'
      ]
    };
  }
}

// Point d'entrée pour Supabase Edge Function
serve(async (req) => {
  try {
    const { taskType, inputData, configuration } = await req.json();
    const agent = new CVAnalyzerAgent();

    switch (taskType) {
      case 'analyze_cv':
        const result = await agent.analyzeCV(inputData as CVAnalysisInput);
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
    console.error('Erreur dans CV Analyzer Agent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

