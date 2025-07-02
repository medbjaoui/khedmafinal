import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../../services/supabaseService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
          SupabaseService.getUsers({ limit: 1000 }),
          SupabaseService.getSystemAlerts({ limit: 100 })
        ]);

        // Process stats
        const sevenDaysAgo = subDays(new Date(), 7);
        const newUsers = usersData.filter(u => new Date(u.created_at) >= sevenDaysAgo);
        const unresolvedAlerts = alertsData.filter(a => !a.resolved);
        const currentStats = {
          totalUsers: usersData.length,
          newUsersLast7Days: newUsers.length,
          unresolvedAlerts: unresolvedAlerts.length,
        };
        setStats(currentStats);
        dispatch(setAdminStats({ totalUsers: currentStats.totalUsers, unresolvedAlerts: currentStats.unresolvedAlerts }));

        // Process recent users
        setRecentUsers(usersData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(u => ({ id: u.id, email: u.email || 'N/A', createdAt: u.created_at }))
        );

        // Process system alerts
        setSystemAlerts(alertsData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(a => ({ ...a, createdAt: a.created_at }))
        );

        // Process user registration chart data
        const registrationCounts = usersData.reduce((acc, user) => {
          const date = format(new Date(user.created_at), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(registrationCounts)
          .map(([date, count]) => ({ date, count }))
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

  const StatCard = ({ icon, title, value, description, colorClass }) => (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start`}>
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  const AlertLevelIndicator = ({ level }) => {
    const levelInfo = {
      error: { color: 'red-500', icon: <AlertTriangle size={16} /> },
      warning: { color: 'yellow-500', icon: <AlertTriangle size={16} /> },
      success: { color: 'green-500', icon: <CheckCircle size={16} /> },
      info: { color: 'blue-500', icon: <AlertTriangle size={16} /> },
    };
    const { color, icon } = levelInfo[level] || levelInfo.info;
    return <span className={`text-${color}`}>{icon}</span>;
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
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
          <p className="text-lg text-gray-600 mt-1">Vue d'ensemble des activités et de la santé du système.</p>
        </header>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Users size={24} className="text-white" />} 
            title="Total des Utilisateurs" 
            value={stats?.totalUsers ?? 'N/A'} 
            description="Nombre total d'utilisateurs enregistrés"
            colorClass="bg-blue-500"
          />
          <StatCard 
            icon={<UserPlus size={24} className="text-white" />} 
            title="Nouveaux Utilisateurs" 
            value={stats?.newUsersLast7Days ?? 'N/A'} 
            description="Inscriptions des 7 derniers jours"
            colorClass="bg-green-500"
          />
          <StatCard 
            icon={<AlertTriangle size={24} className="text-white" />} 
            title="Alertes Non Résolues" 
            value={stats?.unresolvedAlerts ?? 'N/A'} 
            description="Alertes système nécessitant une action"
            colorClass="bg-red-500"
          />
        </div>

        {/* Charts and Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution des Inscriptions</h2>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userRegistrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => format(new Date(str), 'd MMM', { locale: fr })}
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                    labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: fr })}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="count" name="Inscriptions" stroke="#3B82F6" fill="#BFDBFE" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Accès Rapide</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/admin/users')} className="w-full flex items-center p-3 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors">
                <Users className="mr-3 text-blue-600" size={20} />
                <span className="font-medium text-gray-800">Gestion des Utilisateurs</span>
              </button>
              <button onClick={() => navigate('/admin/system')} className="w-full flex items-center p-3 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors">
                <Settings className="mr-3 text-blue-600" size={20} />
                <span className="font-medium text-gray-800">État du Système</span>
              </button>
              <button onClick={() => navigate('/admin/reports')} className="w-full flex items-center p-3 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors">
                <FileText className="mr-3 text-blue-600" size={20} />
                <span className="font-medium text-gray-800">Rapports et Analyses</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Derniers Utilisateurs Inscrits</h2>
            <ul className="divide-y divide-gray-200">
              {recentUsers.map(user => (
                <li key={user.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{user.email}</p>
                    <p className="text-sm text-gray-500">Inscrit le {format(new Date(user.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Alertes Système Récentes</h2>
            <ul className="divide-y divide-gray-200">
              {systemAlerts.map(alert => (
                <li key={alert.id} className="py-3 flex items-start">
                  <AlertLevelIndicator level={alert.level} />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <p className="text-sm text-gray-500">{format(new Date(alert.createdAt), 'd MMM yyyy, HH:mm', { locale: fr })} - {alert.resolved ? 'Résolue' : 'Non résolue'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
