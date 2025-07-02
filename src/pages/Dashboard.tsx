import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Send, 
  TrendingUp, 
  FileText, 
  Calendar,
  ArrowRight,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Target,
  User,
  Activity,
  Award,
  Users,
  Server,
  Shield,
  Eye,
  Mail,
  ChevronRight,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { Link, useNavigate } from 'react-router-dom';
import StatsCard from '../components/Dashboard/StatsCard';

import { fetchJobsStart, fetchJobsSuccess, fetchJobsFailure } from '../store/slices/jobsSlice';
import { setApplications } from '../store/slices/applicationsSlice';
import { setProfile } from '../store/slices/profileSlice';
import { SupabaseService } from '../services/supabaseService';

interface SystemAlert {
  created_at: string;
  id: string;
  level: 'success' | 'warning' | 'error';
  message: string;
  source: string;
}

interface LogEntry {
  created_at: string;
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Premium' | 'User';
  lastLogin: string | null;
  status: 'active' | 'inactive';
}

type ActivityColor = 'blue' | 'green' | 'purple' | 'orange';
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: ActivityColor;
}

// Fonction utilitaire pour afficher "il y a X ..."
function timeAgo(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? 's' : ''}`;
}

// Couleur pour le type d'offre d'emploi
function getTypeColor(type: string) {
  switch (type) {
    case 'CDI': return 'bg-green-100 text-green-800';
    case 'CDD': return 'bg-blue-100 text-blue-800';
    case 'Stage': return 'bg-yellow-100 text-yellow-800';
    case 'Alternance': return 'bg-purple-100 text-purple-800';
    case 'Freelance': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  const { profile, recommendations, profileCompletion } = useAppSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    users: 0,
    applications: 0,
    jobs: 0
  });
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs'>('overview');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (isAdmin) {
        try {
          // Load core admin data with error handling for each service
          const [users, applications, jobs] = await Promise.all([
            SupabaseService.getUsers().catch(err => {
              console.error('Error loading users:', err);
              return [];
            }),
            SupabaseService.getAllApplications().catch(err => {
              console.error('Error loading applications:', err);
              return [];
            }),
            SupabaseService.getJobs().catch(err => {
              console.error('Error loading jobs:', err);
              return [];
            })
          ]);

          setAdminStats({
            users: users.length,
            applications: applications.length,
            jobs: jobs.length
          });
          setUsersData(users);

          // Load optional admin data (may not exist in all setups)
          try {
            const alerts = await SupabaseService.getSystemAlerts();
            setSystemAlerts(alerts || []);
          } catch (alertError) {
            console.log('System alerts not available - this is OK for basic setups');
            setSystemAlerts([]);
          }

          try {
            const logs = await SupabaseService.getRecentLogs();
            setRecentLogs(logs || []);
          } catch (logError) {
            console.log('System logs not available - this is OK for basic setups');
            setRecentLogs([]);
          }

        } catch (error: any) {
          console.error("Error loading admin data:", error);
          // Set fallback empty data
          setAdminStats({ users: 0, applications: 0, jobs: 0 });
          setSystemAlerts([]);
          setRecentLogs([]);
          setUsersData([]);
        }
      } else if (user) {
        try {
          dispatch(fetchJobsStart());
          const [jobsData, applicationsData, profileData] = await Promise.all([
            SupabaseService.getJobs(),
            SupabaseService.getUserApplications(user.id),
            SupabaseService.getUserProfile(user.id),
          ]);
          dispatch(fetchJobsSuccess(jobsData));
          dispatch(setApplications(applicationsData));
          if (profileData) {
            dispatch(setProfile(profileData));
          }
          // recommendations are part of the profile slice, but loaded separately
          
        } catch (error: any) {
          console.error("Error loading user data:", error);
          dispatch(fetchJobsFailure(error.message));
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [dispatch, isAdmin, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Render admin dashboard
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Admin Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  Bienvenue, {user?.firstName} ! 
                  <span className="ml-2">👋</span>
                </h1>
                <p className="text-indigo-100 mb-4 text-lg">
                  Tableau de bord d'administration
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link 
                    to="/admin/users"
                    className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors inline-flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Gestion utilisateurs</span>
                  </Link>
                  <Link 
                    to="/admin/system"
                    className="border border-indigo-300 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors inline-flex items-center space-x-2"
                  >
                    <Server className="h-4 w-4" />
                    <span>État du système</span>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-indigo-500 bg-opacity-30 rounded-full flex items-center justify-center">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Utilisateurs actifs"
            value={adminStats.users.toString()}
            change="+12% ce mois"
            changeType="positive"
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Candidatures"
            value={adminStats.applications.toString()}
            change="+156 aujourd'hui"
            changeType="positive"
            icon={Send}
            color="blue"
          />
          <StatsCard
            title="Charge serveur"
            value="45%"
            change="Stable"
            changeType="neutral"
            icon={Server}
            color="green"
          />
          <StatsCard
            title="Offres actives"
            value={adminStats.jobs.toString()}
            change="+28 cette semaine"
            changeType="positive"
            icon={Briefcase}
            color="orange"
          />
        </div>

        {/* Admin Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Server className="h-5 w-5 text-purple-600" />
                <span>État des services</span>
              </h2>
              <Link 
                to="/admin/system"
                className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center space-x-1 transition-colors"
              >
                <span>Détails</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {Object.entries(systemAlerts.reduce((acc: Record<string, SystemAlert>, alert) => {
                if (!acc[alert.source] || new Date(alert.created_at) > new Date(acc[alert.source].created_at)) {
                  acc[alert.source] = alert;
                }
                return acc;
              }, {} as Record<string, SystemAlert>)).map(([source, alert]: [string, SystemAlert]) => (
                <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.level === 'success' ? 'bg-green-500' :
                      alert.level === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{source}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>Journaux récents</span>
            </h3>
            
            <div className="space-y-3">
              {recentLogs.map((log: any, index) => {
                const levelColors = {
                  info: 'bg-blue-100 text-blue-800',
                  warning: 'bg-yellow-100 text-yellow-800',
                  error: 'bg-red-100 text-red-800',
                  debug: 'bg-gray-100 text-gray-800'
                };
                
                return (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${levelColors[log.level as keyof typeof levelColors]}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString('fr-FR')}</span>
                    </div>
                    <p className="text-sm text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">[{log.source}]</p>
                  </div>
                );
              })}
            </div>
            
            <Link 
              to="/admin/logs"
              className="w-full mt-4 text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors block text-center"
            >
              Voir tous les journaux
            </Link>
          </motion.div>
        </div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Gestion des utilisateurs</span>
            </h2>
            <Link 
              to="/admin/users"
              className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center space-x-1 transition-colors"
            >
              <span>Voir tout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Utilisateur</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Rôle</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Dernière connexion</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usersData.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Admin Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">
                🔐 Conseils d'administration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <p className="font-medium mb-1">Sécurité</p>
                  <p>Vérifiez régulièrement les journaux de sécurité</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Performance</p>
                  <p>Surveillez l'utilisation des ressources système</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Maintenance</p>
                  <p>Planifiez les sauvegardes et mises à jour</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Support</p>
                  <p>Répondez rapidement aux demandes des utilisateurs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Regular user dashboard below
  const recentApplications = applications?.slice(0, 5) || [];
  const recommendedJobs = jobs?.slice(0, 3) || [];
  const activeRecommendations = recommendations?.filter(rec => !rec.completed).slice(0, 3) || [];

  

  const thisWeekApplications = applications?.filter(app => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const appDate = new Date(app.appliedDate);
    return appDate >= weekAgo;
  }).length || 0;

  const interviewsThisWeek = applications?.filter(app => {
    if (!app.interviewDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const interviewDate = new Date(app.interviewDate);
    return interviewDate <= weekFromNow && interviewDate >= new Date();
  }).length || 0;

  // Génération dynamique de l'activité récente utilisateur
  const recentActivities: ActivityItem[] = [];
  if (applications && applications.length > 0) {
    // Candidature envoyée
    const lastApp = applications[0];
    recentActivities.push({
      id: lastApp.id,
      type: 'application',
      title: 'Candidature envoyée',
      description: `${lastApp.jobTitle} chez ${lastApp.company}`,
      time: timeAgo(lastApp.appliedDate),
      icon: Send,
      color: 'blue'
    });
    // Entretien programmé (si existe)
    const interviewApp = applications.find(app => app.status === 'interview');
    if (interviewApp) {
      recentActivities.push({
        id: interviewApp.id + '-interview',
        type: 'interview',
        title: 'Entretien programmé',
        description: `${interviewApp.jobTitle} chez ${interviewApp.company}`,
        time: timeAgo(interviewApp.interviewDate || interviewApp.appliedDate),
        icon: Calendar,
        color: 'green'
      });
    }
  }
  // Profil mis à jour
  if (profile && profile.lastUpdated) {
    recentActivities.push({
      id: 'profile-update',
      type: 'profile',
      title: 'Profil mis à jour',
      description: 'Votre profil a été modifié',
      time: timeAgo(profile.lastUpdated),
      icon: User,
      color: 'purple'
    });
  }
  // CV analysé
  if (profile && profile.lastUpdated && profile.completionScore) {
    recentActivities.push({
      id: 'cv-analysis',
      type: 'cv',
      title: 'CV analysé',
      description: `Score : ${profile.completionScore}/100`,
      time: timeAgo(profile.lastUpdated),
      icon: FileText,
      color: 'orange'
    });
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const colorClasses: Record<ActivityColor, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()} {user?.firstName} ! 
                <span className="ml-2">👋</span>
              </h1>
              <p className="text-blue-100 mb-4 text-lg">
                Prêt à décrocher votre prochain emploi ?
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/jobs"
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Nouvelles offres</span>
                </Link>
                <Link 
                  to="/cv-analysis"
                  className="border border-blue-300 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Analyser CV</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center">
                <Target className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Candidatures envoyées"
          value={applications?.length || 0}
          change={`+${thisWeekApplications} cette semaine`}
          changeType="positive"
          icon={Send}
          color="blue"
        />
        <StatsCard
          title="Entretiens programmés"
          value={interviewsThisWeek}
          change="Cette semaine"
          changeType={interviewsThisWeek > 0 ? "positive" : "neutral"}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Profil complété"
          value={profile ? `${profileCompletion.overall}%` : "0%"}
          change={profile && profileCompletion.overall >= 80 ? "Excellent" : "À améliorer"}
          changeType={profile && profileCompletion.overall >= 80 ? "positive" : "neutral"}
          icon={User}
          color="purple"
        />
        <StatsCard
          title="Score CV"
          value={profile?.completionScore ? `${profile.completionScore}/100` : "N/A"}
          change={profile?.completionScore ? (profile.completionScore >= 80 ? "Très bon" : "Bon") : "Non analysé"}
          changeType={profile?.completionScore ? (profile.completionScore >= 80 ? "positive" : "neutral") : "neutral"}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Dashboard Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-1"
      >
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
            { id: 'applications', label: 'Candidatures', icon: Send },
            { id: 'jobs', label: 'Offres d\'emploi', icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'applications' | 'jobs')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Send className="h-5 w-5 text-blue-600" />
                <span>Candidatures récentes</span>
              </h2>
              <Link 
                to="/applications"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1 transition-colors"
              >
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <motion.div 
                    key={app.id} 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-gray-100"
                    onClick={() => navigate('/applications')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{app.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'interview' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {app.status === 'sent' ? 'Envoyée' :
                         app.status === 'viewed' ? 'Vue' :
                         app.status === 'interview' ? 'Entretien' :
                         app.status === 'rejected' ? 'Refusée' : 'Acceptée'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Aucune candidature encore</p>
                  <Link 
                    to="/jobs"
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    Découvrir les offres
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Activité récente</span>
            </h3>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start space-x-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[activity.color]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Il y a {activity.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <Link 
              to="/analytics"
              className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors block text-center"
            >
              Voir toute l'activité
            </Link>
          </motion.div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Recommandations</span>
              </h3>
              <Link 
                to="/profile?tab=recommendations"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1 transition-colors"
              >
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {activeRecommendations.length > 0 ? (
                activeRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`border rounded-lg p-4 ${
                      recommendation.priority === 'high' ? 'border-red-200 bg-red-50' :
                      recommendation.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {recommendation.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center text-xs text-blue-600 font-medium">
                          <span>{recommendation.action}</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Excellent travail !</p>
                  <p className="text-sm text-gray-600">Vous avez complété toutes les recommandations</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Offres recommandées</span>
              </h3>
              <Link 
                to="/jobs"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1 transition-colors"
              >
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <motion.div 
                    key={job.id} 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                    onClick={() => navigate('/jobs')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      {job.matchScore && (
                        <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium text-yellow-700">{job.matchScore}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(job.postedDate)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{job.requirements.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Aucune offre recommandée</p>
                  <p className="text-sm text-gray-600">Complétez votre profil pour recevoir des recommandations</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Applications Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Résumé des candidatures</h3>
                <p className="text-gray-600">Aperçu de vos candidatures récentes et leur statut</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Poste</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Entreprise</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Statut</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{app.jobTitle}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{app.company}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'interview' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {app.status === 'sent' ? 'Envoyée' :
                           app.status === 'viewed' ? 'Vue' :
                           app.status === 'interview' ? 'Entretien' :
                           app.status === 'rejected' ? 'Refusée' : 'Acceptée'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {app.type === 'automatic' ? '🤖 Auto' : '👤 Manuel'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                to="/applications"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center space-x-1"
              >
                <span>Voir toutes les candidatures</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Job Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recherche d'emploi</h3>
                <p className="text-gray-600">Trouvez les meilleures opportunités en Tunisie</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un poste, une entreprise..."
                    className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Toutes les villes</option>
                <option value="Tunis">Tunis</option>
                <option value="Sfax">Sfax</option>
                <option value="Sousse">Sousse</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les secteurs</option>
                <option value="IT">IT & Développement</option>
                <option value="Marketing">Marketing & Communication</option>
                <option value="Finance">Finance & Comptabilité</option>
              </select>
              
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filtrer</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate('/jobs')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {job.company.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    {job.matchScore && (
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-700">{job.matchScore}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{timeAgo(job.postedDate)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{job.requirements.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 font-medium">{job.salary}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1">
                      <Send className="h-3 w-3" />
                      <span>Postuler</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link 
                to="/jobs"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                <span>Voir toutes les offres</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <Award className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              💡 Conseils du jour
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <p className="font-medium mb-1">Optimisez votre profil</p>
                <p>Un profil complet augmente vos chances de 3x</p>
              </div>
              <div>
                <p className="font-medium mb-1">Postulez régulièrement</p>
                <p>Visez 5-10 candidatures par semaine</p>
              </div>
              <div>
                <p className="font-medium mb-1">Personnalisez vos lettres</p>
                <p>Adaptez chaque candidature à l'entreprise</p>
              </div>
              <div>
                <p className="font-medium mb-1">Suivez vos candidatures</p>
                <p>Relancez après 1-2 semaines sans réponse</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;