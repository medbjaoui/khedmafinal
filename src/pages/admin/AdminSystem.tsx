import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  HardDrive, 
  Cpu, 
  MemoryStick as Memory, 
  Network, 
  Users, 
  FileText, 
  Settings, 
  RefreshCw, 
  Download, 
   
  Trash2, 
  Lock, 
  Unlock, 
  Zap,
  Bot,
  Brain,
  Info
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import AIModelSelector from '../../components/AI/AIModelSelector';
import { SupabaseService } from '../../services/supabaseService';
import { updateSettings } from '../../store/slices/aiSlice';

// Define interfaces for fetched data
interface SystemMetrics {
  uptime: string;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: string;
  activeUsers: number;
  totalUsers: number;
  todayApplications: number;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'warning' | 'error';
  uptime: string;
  lastCheck: string;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
}

interface BackupStatus {
  id: string;
  name: string;
  date: string;
  size: string;
  status: 'completed' | 'failed';
}

const AdminSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'logs' | 'backup' | 'security' | 'ai'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for real data
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [recentLogs, setRecentLogs] = useState<SystemLog[]>([]);
  const [backupStatuses, setBackupStatuses] = useState<BackupStatus[]>([]);

  const { usage, settings } = useAppSelector(state => state.ai);
  const dispatch = useAppDispatch();

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: Activity },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'logs', label: 'Journaux', icon: FileText },
    { id: 'backup', label: 'Sauvegardes', icon: Database },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'ai', label: 'IA & Modèles', icon: Bot }
  ];

  const fetchSystemData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [metrics, services, logs, backups] = await Promise.all([
        SupabaseService.getSystemMetrics(),
        SupabaseService.getServiceStatuses(),
        SupabaseService.getRecentSystemLogs(),
        SupabaseService.getBackupStatuses(),
      ]);
      setServiceStatuses(services.map(s => ({
        ...s,
        status: s.status as 'running' | 'warning' | 'error'
      })));
      setRecentLogs(logs.map(l => ({
        ...l,
        level: l.level as 'info' | 'warning' | 'error'
      })));
      setBackupStatuses(backups.map(b => ({
        ...b,
        status: b.status as 'completed' | 'failed'
      })));
      setSystemMetrics({
        ...metrics,
        activeUsers: 42,
        totalUsers: 120,
        todayApplications: 8
      });
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données système.');
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Administration Système
          </h1>
          <p className="text-gray-600">
            Surveillez et gérez l'infrastructure de KhedmaClair
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4 sm:mt-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </motion.div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps de fonctionnement</p>
              <p className="text-lg font-semibold text-gray-900">{systemMetrics?.uptime || '-'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              <p className="text-lg font-semibold text-gray-900">{systemMetrics?.activeUsers}/{systemMetrics?.totalUsers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Candidatures aujourd'hui</p>
              <p className="text-lg font-semibold text-gray-900">{systemMetrics?.todayApplications}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Cpu className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Charge système</p>
              <p className="text-lg font-semibold text-gray-900">{systemMetrics?.systemLoad}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-1"
      >
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">État des services</h3>
              <div className="space-y-4">
                {serviceStatuses.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      Vérifié il y a {service.lastCheck}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation des ressources</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">CPU</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.systemLoad}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics?.systemLoad}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Memory className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Mémoire</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics?.memoryUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Disque</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${systemMetrics?.diskUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Réseau</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.networkTraffic} GB/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Journaux système</h3>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Exporter</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span>Vider</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-900">{log.message}</span>
                    <span className="text-xs text-gray-500">[{log.source}]</span>
                  </div>
                  <span className="text-xs text-gray-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des sauvegardes</h3>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Database className="h-4 w-4" />
                <span>Nouvelle sauvegarde</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Taille</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupStatuses.map((backup) => (
                    <tr key={backup.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{backup.name}</td>
                      <td className="py-3 px-4 text-gray-600">{backup.date}</td>
                      <td className="py-3 px-4 text-gray-600">{backup.size}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {backup.status === 'completed' ? 'Terminée' : 'Échouée'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h3>
              <div className="space-y-4">
                {[
                  { label: 'Authentification à deux facteurs', enabled: true },
                  { label: 'Chiffrement des données', enabled: true },
                  { label: 'Logs de sécurité', enabled: true },
                  { label: 'Blocage automatique IP', enabled: false },
                  { label: 'Notifications de sécurité', enabled: true }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {setting.enabled ? 
                        <Lock className="h-4 w-4 text-green-600" /> : 
                        <Unlock className="h-4 w-4 text-red-600" />
                      }
                      <span className="text-sm text-gray-900">{setting.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes de sécurité</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Tentatives de connexion suspectes</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">5 tentatives échouées depuis la même IP</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Certificat SSL valide</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Expire dans 89 jours</p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Firewall actif</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Dernière mise à jour il y a 2 heures</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bot className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Configuration des modèles IA</h3>
              </div>
              
              <AIModelSelector showSettings={true} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Statistiques d'utilisation IA</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total requêtes</p>
                      <p className="text-2xl font-bold text-gray-900">{usage.totalRequests}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total tokens</p>
                      <p className="text-2xl font-bold text-gray-900">{usage.totalTokens.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <p className="font-medium text-blue-900">Utilisation par modèle</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">Groq Llama</span>
                        <span className="text-sm font-medium text-blue-800">65%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">Gemini 2.0</span>
                        <span className="text-sm font-medium text-blue-800">25%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }} />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">Mode Démo</span>
                        <span className="text-sm font-medium text-blue-800">10%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>Paramètres avancés</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Température par défaut
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => dispatch(updateSettings({ temperature: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 (Précis)</span>
                      <span>{settings.temperature}</span>
                      <span>2 (Créatif)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tokens maximum
                    </label>
                    <select
                      value={settings.maxTokens}
                      onChange={(e) => dispatch(updateSettings({ maxTokens: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="512">512 tokens</option>
                      <option value="1024">1024 tokens</option>
                      <option value="2048">2048 tokens</option>
                      <option value="4096">4096 tokens</option>
                      <option value="8192">8192 tokens</option>
                    </select>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Limites d'utilisation</h4>
                        <p className="text-sm text-gray-600">Définir des quotas par utilisateur</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={true}
                          className="sr-only peer"
                          onChange={() => {}}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tokens par jour (utilisateur standard)
                      </label>
                      <input
                        type="number"
                        value="10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Fonctionnalités IA disponibles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                    <div>
                      <p className="font-medium mb-1">Génération de lettres</p>
                      <p>Lettres de motivation personnalisées</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Analyse de CV</p>
                      <p>Analyse intelligente et recommandations</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Assistant conversationnel</p>
                      <p>Chat IA pour conseils carrière</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Optimisation profil</p>
                      <p>Suggestions d'amélioration automatiques</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Matching emplois</p>
                      <p>Correspondance intelligente avec offres</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Analyse de tendances</p>
                      <p>Insights sur le marché de l'emploi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">CPU</span>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.systemLoad}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics?.systemLoad > 80 ? 'bg-red-500' : 
                        systemMetrics?.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${systemMetrics?.systemLoad}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Mémoire</span>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics?.memoryUsage > 80 ? 'bg-red-500' : 
                        systemMetrics?.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${systemMetrics?.memoryUsage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Disque</span>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics?.diskUsage > 80 ? 'bg-red-500' : 
                        systemMetrics?.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${systemMetrics?.diskUsage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Réseau</span>
                    <span className="text-sm font-medium text-gray-900">{systemMetrics?.networkTraffic} GB/h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: '40%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes de performance</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Utilisation mémoire élevée</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    L'utilisation de la mémoire a dépassé 65% pendant plus de 30 minutes.
                  </p>
                  <div className="flex justify-end mt-2">
                    <button className="text-xs text-yellow-700 font-medium hover:text-yellow-800">
                      Analyser →
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Temps de réponse optimal</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Le temps de réponse moyen est de 120ms, en dessous du seuil de 200ms.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Optimisation recommandée</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Envisagez d'optimiser les requêtes de base de données pour améliorer les performances.
                  </p>
                  <div className="flex justify-end mt-2">
                    <button className="text-xs text-blue-700 font-medium hover:text-blue-800">
                      Voir les détails →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSystem;