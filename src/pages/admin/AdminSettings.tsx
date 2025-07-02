import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Database,
  Palette,
  Bell,
  Key,
  Upload,
  Download
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingsSection[] = [
  {
    id: 'general',
    title: 'Paramètres Généraux',
    description: 'Configuration de base de la plateforme',
    icon: Globe
  },
  {
    id: 'email',
    title: 'Configuration Email',
    description: 'Paramètres SMTP et notifications',
    icon: Mail
  },
  {
    id: 'security',
    title: 'Sécurité',
    description: 'Authentification et permissions',
    icon: Shield
  },
  {
    id: 'database',
    title: 'Base de Données',
    description: 'Configuration et maintenance',
    icon: Database
  },
  {
    id: 'appearance',
    title: 'Apparence',
    description: 'Thèmes et personnalisation',
    icon: Palette
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Alertes et communications',
    icon: Bell
  }
];

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'KhedmaClair',
      siteDescription: 'Plateforme de recherche d\'emploi intelligente',
      maintenanceMode: false,
      registrationOpen: true,
      maxUsersPerCompany: 100
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@khedmaclair.com',
      fromName: 'KhedmaClair'
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 24,
      passwordMinLength: 8,
      requireSpecialChars: true,
      enableApiRateLimit: true,
      maxLoginAttempts: 5
    },
    database: {
      backupEnabled: true,
      backupInterval: 24,
      retentionDays: 30,
      compressionEnabled: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      customLogo: '',
      footerText: '© 2024 KhedmaClair. Tous droits réservés.'
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      userRegistration: true,
      applicationSubmitted: true,
      weeklyReports: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nom du Site
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description du Site
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">Mode Maintenance</label>
          <p className="text-sm text-muted-foreground">Activer pour la maintenance du site</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.maintenanceMode}
            onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">Inscriptions Ouvertes</label>
          <p className="text-sm text-muted-foreground">Permettre les nouvelles inscriptions</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.registrationOpen}
            onChange={(e) => updateSetting('general', 'registrationOpen', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Serveur SMTP
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Port SMTP
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Expéditeur
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nom Expéditeur
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">Authentification à Deux Facteurs</label>
          <p className="text-sm text-muted-foreground">Activer 2FA pour les administrateurs</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Durée de Session (heures)
        </label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Longueur Minimale du Mot de Passe
        </label>
        <input
          type="number"
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tentatives de Connexion Max
        </label>
        <input
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'email': return renderEmailSettings();
      case 'security': return renderSecuritySettings();
      default: 
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Sélectionnez une section pour configurer les paramètres</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuration Système</h1>
          <p className="text-muted-foreground mt-1">
            Paramètres généraux de la plateforme
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveStatus === 'saving' ? 'Sauvegarde...' : 
           saveStatus === 'saved' ? 'Sauvegardé!' : 
           saveStatus === 'error' ? 'Erreur' : 'Sauvegarder'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className={`text-xs ${
                        activeSection === section.id 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground'
                      }`}>
                        {section.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;