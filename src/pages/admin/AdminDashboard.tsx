import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  Loader2,
  UserPlus,
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setAdminStats } from '../../store/slices/adminSlice';

// Types
interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  createdAt: string;
  resolved: boolean;
}

interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  unresolvedAlerts: number;
}

interface UserRegistrationData {
  date: string;
  count: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  colorClass: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [userRegistrationData, setUserRegistrationData] = useState<UserRegistrationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessInfo = await SupabaseService.debugAdminAccess();
        if (!accessInfo.isAuthenticated) {
          navigate('/login');
          return;
        }
        if (!accessInfo.hasAdminRole) {
          setError("Vous n'avez pas les droits d'administrateur.");
          setLoading(false);
          return;
        }

        const [usersData, alertsData] = await Promise.all([
          SupabaseService.getUsers().catch(() => []),
          SupabaseService.getSystemAlerts().catch(() => [])
        ]);

        // Process stats
        const sevenDaysAgo = subDays(new Date(), 7);
        const newUsers = usersData.filter((u: any) => new Date(u.created_at) >= sevenDaysAgo);
        const unresolvedAlerts = alertsData.filter((a: any) => !a.resolved);
        const currentStats = {
          totalUsers: usersData.length,
          newUsersLast7Days: newUsers.length,
          unresolvedAlerts: unresolvedAlerts.length,
        };
        setStats(currentStats);
        dispatch(setAdminStats({ totalUsers: currentStats.totalUsers, unresolvedAlerts: currentStats.unresolvedAlerts }));

        // Process recent users
        setRecentUsers(usersData
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((u: any) => ({ id: u.id, email: u.email || 'N/A', createdAt: u.created_at }))
        );

        // Process system alerts
        setSystemAlerts(alertsData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(a => ({ ...a, createdAt: a.created_at }))
        );

        // Process user registration chart data
        const registrationCounts = usersData.reduce((acc: any, user: any) => {
          const date = format(new Date(user.created_at), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(registrationCounts)
          .map(([date, count]) => ({ date, count: count as number }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUserRegistrationData(chartData);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, dispatch]);

  const StatCard = ({ icon, title, value, description, colorClass, trend }: StatCardProps) => (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative overflow-hidden"
    >
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-4 rounded-2xl ${colorClass} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
              trend.isPositive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              <TrendingUp 
                className={`h-3 w-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`}
              />
              {trend.value}%
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/60">{description}</p>
        </div>
      </div>
    </motion.div>
  );

  const AlertLevelIndicator = ({ level }: { level: string }) => {
    const levelInfo: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
      error: { color: 'text-red-600', icon: <AlertTriangle size={16} />, bg: 'bg-red-100' },
      warning: { color: 'text-yellow-600', icon: <AlertTriangle size={16} />, bg: 'bg-yellow-100' },
      success: { color: 'text-green-600', icon: <CheckCircle size={16} />, bg: 'bg-green-100' },
      info: { color: 'text-blue-600', icon: <AlertTriangle size={16} />, bg: 'bg-blue-100' },
    };
    const { color, icon, bg } = levelInfo[level] || levelInfo.info;
    return (
      <div className={`p-2 rounded-full ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-red-800">Erreur d'accès</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Modern Admin Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      Dashboard Administrateur
                    </h1>
                    <p className="text-xl text-white/90">
                      Centre de contrôle et monitoring système
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-white/15 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-white" />
                      <div>
                        <span className="text-sm font-medium text-white/80">Dernière mise à jour</span>
                        <p className="text-lg font-bold text-white">
                          {format(new Date(), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div>
                        <span className="text-sm font-medium text-white/80">Statut</span>
                        <p className="text-lg font-bold text-white">En ligne</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard 
            icon={<Users size={28} className="text-white" />} 
            title="Utilisateurs Totaux" 
            value={stats?.totalUsers ?? 'N/A'} 
            description="Base d'utilisateurs active"
            colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            icon={<UserPlus size={28} className="text-white" />} 
            title="Nouveaux Inscrits" 
            value={stats?.newUsersLast7Days ?? 'N/A'} 
            description="7 derniers jours"
            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            icon={<AlertTriangle size={28} className="text-white" />} 
            title="Alertes Système" 
            value={stats?.unresolvedAlerts ?? 'N/A'} 
            description="Nécessitent une attention"
            colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard 
            icon={<Activity size={28} className="text-white" />} 
            title="Système" 
            value="Opérationnel" 
            description="Statut global"
            colorClass="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </motion.div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Croissance Utilisateurs</h2>
                  <p className="text-sm text-gray-500 mt-1">Évolution des inscriptions au fil du temps</p>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">30 jours</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userRegistrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => format(new Date(str), 'd MMM', { locale: fr })}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={{ stroke: '#E5E7EB' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: fr })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      fill="url(#colorGradient)" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Actions Rapides</h3>
              <p className="text-sm text-gray-500 mt-1">Accès direct aux fonctions</p>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => navigate('/admin/users')} 
                className="w-full group flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 border border-blue-200"
              >
                <div className="p-2 bg-blue-500 rounded-lg mr-3 group-hover:bg-blue-600 transition-colors">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Utilisateurs</p>
                  <p className="text-xs text-gray-600">Gestion complète</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/system')} 
                className="w-full group flex items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-lg transition-all duration-200 border border-emerald-200"
              >
                <div className="p-2 bg-emerald-500 rounded-lg mr-3 group-hover:bg-emerald-600 transition-colors">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Système</p>
                  <p className="text-xs text-gray-600">État & config</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/reports')} 
                className="w-full group flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-200 border border-purple-200"
              >
                <div className="p-2 bg-purple-500 rounded-lg mr-3 group-hover:bg-purple-600 transition-colors">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Rapports</p>
                  <p className="text-xs text-gray-600">Analytics détaillés</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activity & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Utilisateurs Récents</h3>
                  <p className="text-sm text-gray-500 mt-1">Dernières inscriptions</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.length > 0 ? recentUsers.map(user => (
                  <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(user.createdAt), 'd MMM yyyy • HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun utilisateur récent</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Alertes Système</h3>
                  <p className="text-sm text-gray-500 mt-1">Notifications importantes</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemAlerts.length > 0 ? systemAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <AlertLevelIndicator level={alert.level} />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {format(new Date(alert.createdAt), 'd MMM • HH:mm', { locale: fr })}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          alert.resolved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {alert.resolved ? 'Résolue' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                    <p>Aucune alerte système</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
