import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  user?: string;
  details?: any;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    level: 'info',
    source: 'AUTH',
    message: 'Utilisateur connecté avec succès',
    user: 'john.doe@example.com'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'warning',
    source: 'API',
    message: 'Limite de taux d\'API approchée',
    details: { endpoint: '/api/jobs', requests: 95, limit: 100 }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'error',
    source: 'DATABASE',
    message: 'Erreur de connexion à la base de données',
    details: { error: 'Connection timeout', duration: '30s' }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'success',
    source: 'BACKUP',
    message: 'Sauvegarde automatique terminée',
    details: { size: '2.4GB', duration: '45s' }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    level: 'info',
    source: 'USER',
    message: 'Nouveau profil créé',
    user: 'jane.smith@example.com'
  }
];

const AdminLogs: React.FC = () => {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const refreshLogs = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const uniqueSources = [...new Set(logs.map(log => log.source))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journaux Système</h1>
          <p className="text-muted-foreground mt-1">
            Surveillance et analyse des événements système
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={refreshLogs}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button 
            onClick={exportLogs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">Tous les niveaux</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Erreur</option>
            <option value="success">Succès</option>
          </select>

          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">Toutes les sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-muted-foreground">
            <Activity className="h-4 w-4 mr-2" />
            {filteredLogs.length} entrées trouvées
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun log trouvé avec les filtres actuels</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg border ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {log.source}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        </span>
                        {log.user && (
                          <span className="text-sm text-muted-foreground flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {log.user}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-foreground font-medium mb-2">
                        {log.message}
                      </p>
                      
                      {log.details && (
                        <div className="bg-muted p-3 rounded-lg">
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminLogs;