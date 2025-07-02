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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp 
              className={`h-4 w-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`}
            />
            {trend.value}%
          </div>
        )}
      </div>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-lg text-gray-600">
                Vue d'ensemble des performances système et activités utilisateurs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-sm text-gray-500">Dernière mise à jour</span>
                <p className="font-semibold text-gray-900">
                  {format(new Date(), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Users size={24} className="text-white" />} 
            title="Utilisateurs Totaux" 
            value={stats?.totalUsers ?? 'N/A'} 
            description="Base d'utilisateurs active"
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            icon={<UserPlus size={24} className="text-white" />} 
            title="Nouveaux Inscrits" 
            value={stats?.newUsersLast7Days ?? 'N/A'} 
            description="7 derniers jours"
            colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            icon={<Shield size={24} className="text-white" />} 
            title="Alertes Système" 
            value={stats?.unresolvedAlerts ?? 'N/A'} 
            description="Nécessitent une attention"
            colorClass="bg-gradient-to-r from-amber-500 to-amber-600"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard 
            icon={<Activity size={24} className="text-white" />} 
            title="Système" 
            value="Opérationnel" 
            description="Statut global"
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>

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
