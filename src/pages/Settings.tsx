
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useAppSelector } from '../hooks/redux';

const Settings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.first_name + ' ' + user?.last_name || '',
      email: user?.email || '',
      phone: '',
      bio: '',
      location: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      weeklyReports: false,
      applicationUpdates: true,
      interviewReminders: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      dataSharing: false
    },
    appearance: {
      theme: 'system',
      language: 'fr',
      timezone: 'Europe/Paris'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    // Afficher un message de succès
  };

  const handleExportData = () => {
    // Simuler l'export des données
    const element = document.createElement('a');
    const file = new Blob(['Données utilisateur exportées'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Paramètres
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos préférences et configurez votre expérience
          </p>
        </motion.div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informations Personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de profil et vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value }
                      })}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value }
                      })}
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value }
                      })}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={settings.profile.location}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, location: e.target.value }
                      })}
                      placeholder="Paris, France"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <textarea
                    id="bio"
                    value={settings.profile.bio}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, bio: e.target.value }
                    })}
                    placeholder="Décrivez-vous en quelques mots..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 min-h-[100px] resize-y"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Sécurité du Compte
                </CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe et gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="w-full md:w-auto">
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  Préférences de Notification
                </CardTitle>
                <CardDescription>
                  Choisissez comment et quand vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Notifications par email</div>
                        <div className="text-sm text-gray-500">Recevez des emails pour les mises à jour importantes</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailNotifications: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Notifications push</div>
                        <div className="text-sm text-gray-500">Notifications instantanées sur votre appareil</div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, pushNotifications: checked }
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Alertes spécifiques</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nouvelles offres d'emploi</span>
                      <Switch
                        checked={settings.notifications.jobAlerts}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, jobAlerts: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mises à jour de candidatures</span>
                      <Switch
                        checked={settings.notifications.applicationUpdates}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, applicationUpdates: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rappels d'entretiens</span>
                      <Switch
                        checked={settings.notifications.interviewReminders}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, interviewReminders: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rapports hebdomadaires</span>
                      <Switch
                        checked={settings.notifications.weeklyReports}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, weeklyReports: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Confidentialité et Données
                </CardTitle>
                <CardDescription>
                  Contrôlez qui peut voir vos informations et comment vos données sont utilisées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Visibilité du profil</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={settings.privacy.profileVisibility === 'public'}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
                          })}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Public - Visible par tous</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={settings.privacy.profileVisibility === 'private'}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
                          })}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Privé - Visible uniquement par vous</span>
                      </label>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Informations visibles</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Afficher l'email</span>
                      <Switch
                        checked={settings.privacy.showEmail}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, showEmail: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Afficher le téléphone</span>
                      <Switch
                        checked={settings.privacy.showPhone}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, showPhone: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Partage de données pour améliorer le service</span>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, dataSharing: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Zone de danger</h4>
                  <div className="space-y-3">
                    <Button variant="outline" onClick={handleExportData} className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter mes données
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Apparence et Préférences
                </CardTitle>
                <CardDescription>
                  Personnalisez l'interface selon vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Thème</Label>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: 'light' }
                        })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          settings.appearance.theme === 'light' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <div className="text-sm font-medium">Clair</div>
                      </button>
                      
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: 'dark' }
                        })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          settings.appearance.theme === 'dark' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                        <div className="text-sm font-medium">Sombre</div>
                      </button>
                      
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: 'system' }
                        })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          settings.appearance.theme === 'system' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Monitor className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <div className="text-sm font-medium">Système</div>
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <select
                        id="language"
                        value={settings.appearance.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <select
                        id="timezone"
                        value={settings.appearance.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, timezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
