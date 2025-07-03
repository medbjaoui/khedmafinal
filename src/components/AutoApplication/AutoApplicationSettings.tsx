import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Zap, 
  MapPin, 
  Building2, 
  Search, 
  X, 
  Plus,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Bell,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useAppSelector } from '../../hooks/redux';
import { AutoApplicationService, AutoApplicationSettings } from '../../services/autoApplicationService';
import { toast } from 'sonner';

interface AutoApplicationSettingsProps {
  onSettingsChange?: (settings: AutoApplicationSettings) => void;
}

const AutoApplicationSettings: React.FC<AutoApplicationSettingsProps> = ({ onSettingsChange }) => {
  const { user } = useAppSelector(state => state.auth);
  const [settings, setSettings] = useState<AutoApplicationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await AutoApplicationService.getAutoApplicationSettings(user!.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await AutoApplicationService.updateAutoApplicationSettings(
        user.id, 
        settings
      );
      setSettings(updatedSettings);
      onSettingsChange?.(updatedSettings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = (type: 'required' | 'excluded') => {
    if (!newKeyword.trim() || !settings) return;

    const updatedSettings = { ...settings };
    if (type === 'required') {
      updatedSettings.requiredKeywords = [...settings.requiredKeywords, newKeyword.trim()];
    } else {
      updatedSettings.excludedKeywords = [...settings.excludedKeywords, newKeyword.trim()];
    }
    
    setSettings(updatedSettings);
    setNewKeyword('');
  };

  const removeKeyword = (type: 'required' | 'excluded', index: number) => {
    if (!settings) return;

    const updatedSettings = { ...settings };
    if (type === 'required') {
      updatedSettings.requiredKeywords = settings.requiredKeywords.filter((_, i) => i !== index);
    } else {
      updatedSettings.excludedKeywords = settings.excludedKeywords.filter((_, i) => i !== index);
    }
    
    setSettings(updatedSettings);
  };

  const addLocation = () => {
    if (!newLocation.trim() || !settings) return;

    setSettings({
      ...settings,
      preferredLocations: [...settings.preferredLocations, newLocation.trim()]
    });
    setNewLocation('');
  };

  const removeLocation = (index: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      preferredLocations: settings.preferredLocations.filter((_, i) => i !== index)
    });
  };

  const addExcludedCompany = () => {
    if (!newCompany.trim() || !settings) return;

    setSettings({
      ...settings,
      excludedCompanies: [...settings.excludedCompanies, newCompany.trim()]
    });
    setNewCompany('');
  };

  const removeExcludedCompany = (index: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      excludedCompanies: settings.excludedCompanies.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Impossible de charger les paramètres</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Postulation Automatique
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configurez vos paramètres de candidature automatique
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Clock className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </Button>
      </div>

      {/* Activation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Activation
          </CardTitle>
          <CardDescription>
            Activez ou désactivez la postulation automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-enabled">Postulation automatique</Label>
              <p className="text-sm text-gray-500">
                Permet à l'IA de postuler automatiquement aux offres correspondantes
              </p>
            </div>
            <Switch
              id="auto-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-send">Envoi automatique</Label>
                <p className="text-sm text-gray-500">
                  Envoyer les candidatures sans validation manuelle
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={settings.autoSend}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSend: checked })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Limites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Limites et Contrôles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-applications">Candidatures max par jour</Label>
              <Input
                id="max-applications"
                type="number"
                min="1"
                max="50"
                value={settings.maxApplicationsPerDay}
                onChange={(e) => setSettings({
                  ...settings,
                  maxApplicationsPerDay: parseInt(e.target.value) || 10
                })}
              />
            </div>
            <div>
              <Label htmlFor="experience-level">Niveau d'expérience</Label>
              <Select
                value={settings.experienceLevel}
                onValueChange={(value: any) => setSettings({
                  ...settings,
                  experienceLevel: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Intermédiaire</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-salary">Salaire minimum (DT)</Label>
              <Input
                id="min-salary"
                type="number"
                placeholder="Ex: 1500"
                value={settings.minSalary || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  minSalary: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label htmlFor="max-salary">Salaire maximum (DT)</Label>
              <Input
                id="max-salary"
                type="number"
                placeholder="Ex: 5000"
                value={settings.maxSalary || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  maxSalary: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localisations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localisations Préférées
          </CardTitle>
          <CardDescription>
            Ajoutez les villes où vous souhaitez travailler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Tunis, Sfax, Sousse"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
            <Button onClick={addLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.preferredLocations.map((location, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {location}
                <button
                  onClick={() => removeLocation(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Types de contrats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Types de Contrats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['CDI', 'CDD', 'Stage', 'Freelance'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`job-type-${type}`}
                  checked={settings.jobTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({
                        ...settings,
                        jobTypes: [...settings.jobTypes, type]
                      });
                    } else {
                      setSettings({
                        ...settings,
                        jobTypes: settings.jobTypes.filter(t => t !== type)
                      });
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor={`job-type-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mots-clés requis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Mots-clés Requis
          </CardTitle>
          <CardDescription>
            Les offres doivent contenir au moins un de ces mots-clés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: React, Python, Marketing"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword('required')}
            />
            <Button onClick={() => addKeyword('required')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.requiredKeywords.map((keyword, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {keyword}
                <button
                  onClick={() => removeKeyword('required', index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mots-clés exclus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="h-5 w-5" />
            Mots-clés Exclus
          </CardTitle>
          <CardDescription>
            Les offres contenant ces mots-clés seront ignorées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Vente, Télémarketing"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword('excluded')}
            />
            <Button onClick={() => addKeyword('excluded')} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.excludedKeywords.map((keyword, index) => (
              <Badge key={index} variant="destructive" className="flex items-center gap-1">
                {keyword}
                <button
                  onClick={() => removeKeyword('excluded', index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entreprises exclues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Entreprises Exclues
          </CardTitle>
          <CardDescription>
            Les offres de ces entreprises seront ignorées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nom de l'entreprise"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExcludedCompany()}
            />
            <Button onClick={addExcludedCompany} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.excludedCompanies.map((company, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {company}
                <button
                  onClick={() => removeExcludedCompany(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <div>
                <Label htmlFor="notif-email">Notifications par email</Label>
                <p className="text-sm text-gray-500">Recevoir des emails pour les nouvelles candidatures</p>
              </div>
            </div>
            <Switch
              id="notif-email"
              checked={settings.notificationPreferences.email}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  email: checked
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <div>
                <Label htmlFor="notif-push">Notifications push</Label>
                <p className="text-sm text-gray-500">Notifications dans l'application</p>
              </div>
            </div>
            <Switch
              id="notif-push"
              checked={settings.notificationPreferences.push}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  push: checked
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <div>
                <Label htmlFor="notif-sms">Notifications SMS</Label>
                <p className="text-sm text-gray-500">Recevoir des SMS pour les réponses importantes</p>
              </div>
            </div>
            <Switch
              id="notif-sms"
              checked={settings.notificationPreferences.sms}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                notificationPreferences: {
                  ...settings.notificationPreferences,
                  sms: checked
                }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoApplicationSettings; 