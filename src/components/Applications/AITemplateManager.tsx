
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Wand2, Save, Eye, Copy, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { getAIService } from '../../services/aiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

interface AITemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  industry: string;
  language: 'fr' | 'en' | 'ar';
  performanceScore?: number;
  usageCount: number;
  successRate?: number;
  lastUpdated: string;
  aiGenerated: boolean;
  tags: string[];
}

export const AITemplateManager: React.FC = () => {
  const { profile } = useAppSelector(state => state.profile);
  const { templates } = useAppSelector(state => state.applications);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<AITemplate>>({
    tone: 'professional',
    industry: '',
    language: 'fr'
  });
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);

  const industryOptions = [
    'Informatique / IT',
    'Finance / Banque',
    'Marketing / Communication',
    'Ingénierie',
    'Santé / Médical',
    'Éducation / Formation',
    'Commerce / Vente',
    'Ressources Humaines',
    'Logistique / Transport',
    'Autre'
  ];

  const toneOptions = [
    { value: 'formal', label: 'Formel' },
    { value: 'professional', label: 'Professionnel' },
    { value: 'friendly', label: 'Amical' },
    { value: 'casual', label: 'Décontracté' }
  ];

  const handleGenerateTemplate = async () => {
    if (!profile || !newTemplate.industry || !newTemplate.tone) {
      return;
    }

    setIsGenerating(true);
    try {
      const aiService = getAIService();
      const prompt = `Génère un template de lettre de motivation professionnelle pour le secteur "${newTemplate.industry}" avec un ton ${newTemplate.tone}.
      
      Profil du candidat :
      - Titre : ${profile.title}
      - Expérience : ${profile.experiences?.length || 0} expériences
      - Compétences : ${profile.skills?.slice(0, 8).map(s => s.name).join(', ')}
      - Localisation : ${profile.location}
      
      Le template doit :
      - Être personnalisable avec des variables comme {jobTitle}, {company}, {candidateName}
      - Faire environ 200-250 mots
      - Inclure une introduction, développement et conclusion
      - Être adapté au marché tunisien
      - Mettre en valeur les compétences pertinentes
      
      Format : Fournis seulement le contenu du template avec les variables entre accolades.`;

      const response = await aiService.generateText(prompt);
      
      const generatedTemplate: AITemplate = {
        id: `ai_template_${Date.now()}`,
        name: `Template ${newTemplate.industry} - ${newTemplate.tone}`,
        category: newTemplate.industry!,
        subject: `Candidature pour le poste de {jobTitle} - {candidateName}`,
        content: response.content,
        tone: newTemplate.tone as any,
        industry: newTemplate.industry!,
        language: newTemplate.language as any,
        usageCount: 0,
        lastUpdated: new Date().toISOString(),
        aiGenerated: true,
        tags: ['IA', newTemplate.industry!, newTemplate.tone!]
      };

      setSelectedTemplate(generatedTemplate);
      setShowPreview(generatedTemplate.id);
    } catch (error) {
      console.error('Erreur lors de la génération du template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeTemplate = async (template: AITemplate) => {
    setIsGenerating(true);
    try {
      const aiService = getAIService();
      const prompt = `Optimise ce template de lettre de motivation pour améliorer son impact et son taux de réussite.
      
      Template actuel :
      ${template.content}
      
      Suggestions d'optimisation :
      - Améliorer l'accroche
      - Renforcer les arguments de vente
      - Optimiser la conclusion
      - Adapter au marché tunisien
      - Améliorer la personnalisation
      
      Performance actuelle : ${template.performanceScore || 'Non mesurée'}
      Taux de succès : ${template.successRate || 'Non mesuré'}
      
      Fournis le template optimisé avec les mêmes variables.`;

      const response = await aiService.generateText(prompt);
      
      const optimizedTemplate: AITemplate = {
        ...template,
        id: `optimized_${template.id}_${Date.now()}`,
        name: `${template.name} - Optimisé`,
        content: response.content,
        lastUpdated: new Date().toISOString(),
        tags: [...template.tags, 'Optimisé']
      };

      setSelectedTemplate(optimizedTemplate);
      setShowPreview(optimizedTemplate.id);
    } catch (error) {
      console.error('Erreur lors de l\'optimisation du template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async (template: AITemplate) => {
    try {
      // Implement save logic here
      console.log('Saving template:', template);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Templates IA</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Wand2 className="w-4 h-4 mr-2" />
              Générer avec IA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Générer un template avec l'IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Secteur d'activité</label>
                <Select
                  value={newTemplate.industry}
                  onValueChange={(value) => setNewTemplate({...newTemplate, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Ton du message</label>
                <Select
                  value={newTemplate.tone}
                  onValueChange={(value) => setNewTemplate({...newTemplate, tone: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Langue</label>
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate({...newTemplate, language: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerateTemplate}
                disabled={isGenerating || !newTemplate.industry || !newTemplate.tone}
                className="w-full"
              >
                {isGenerating ? 'Génération en cours...' : 'Générer le template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(templates as any[]).map((template: AITemplate) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.category}</p>
                </div>
                {template.aiGenerated && (
                  <Badge variant="secondary">
                    <Wand2 className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {template.performanceScore && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Score: {template.performanceScore}%</span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <p>Utilisé {template.usageCount} fois</p>
                  {template.successRate && (
                    <p>Taux de succès: {template.successRate}%</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(template.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOptimizeTemplate(template)}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    Optimiser
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      {showPreview && selectedTemplate && (
        <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Aperçu du template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Sujet :</h3>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedTemplate.subject}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Contenu :</h3>
                <ScrollArea className="h-64 border rounded p-4">
                  <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</pre>
                </ScrollArea>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(null)}>
                  Fermer
                </Button>
                <Button onClick={() => handleSaveTemplate(selectedTemplate)}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AITemplateManager;
