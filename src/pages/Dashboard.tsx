import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Send, 
  TrendingUp, 
  MapPin,
  Star,
  Clock,
  Target,
  User,
  Activity,
  Eye,
  ChevronRight,
  Search,
  BookOpen,
  Zap,
  Calendar,
  Award,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Coffee
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

import { fetchJobsStart, fetchJobsSuccess, fetchJobsFailure } from '../store/slices/jobsSlice';
import { setApplications } from '../store/slices/applicationsSlice';
import { setProfile } from '../store/slices/profileSlice';
import { SupabaseService } from '../services/supabaseService';

// Fonction utilitaire pour afficher "il y a X ..."
function timeAgo(dateString: string | Date | null | undefined) {
  if (!dateString) {
    return 'Date inconnue';
  }
  let date: Date;
  if (typeof dateString === 'string') {
    date = new Date(dateString);
  } else if (dateString instanceof Date) {
    date = dateString;
  } else {
    return 'Date invalide';
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Date invalide';
  }
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `il y a ${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

// Couleur pour le type d'offre d'emploi
function getTypeColor(type: string) {
  switch (type) {
    case 'CDI': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100';
    case 'CDD': return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100';
    case 'Stage': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100';
    case 'Alternance': return 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100';
    case 'Freelance': return 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100';
    default: return 'bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100';
  }
}

// Component pour les cartes de statistiques améliorées
const StatCard = ({ title, value, change, changeType, icon: Icon, color, gradient }: any) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className="group relative overflow-hidden"
  >
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
    <div className="relative bg-white/80 backdrop-blur-sm p-7 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl ${
          color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
          color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
          color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
        } shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</p>
        {change && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
              changeType === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${
                changeType === 'negative' ? 'rotate-180' : ''
              }`} />
              <span>{change}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  const { profile, recommendations, profileCompletion } = useAppSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [newOpportunities, setNewOpportunities] = useState(0);
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (user) {
        try {
          dispatch(fetchJobsStart());
          const [
            jobsData, 
            applicationsData, 
            profileData,
            savedJobsData,
            recommendationsData
          ] = await Promise.all([
            SupabaseService.getJobs(),
            SupabaseService.getUserApplications(user.id),
            SupabaseService.getUserProfile(user.id),
            SupabaseService.getSavedJobs(user.id),
            SupabaseService.getUserRecommendations(user.id)
          ]);
          
          dispatch(fetchJobsSuccess(jobsData));
          dispatch(setApplications(applicationsData));
          if (profileData) {
            dispatch(setProfile(profileData));
          }
          
          // Définir les données dynamiques
          setSavedJobsCount(savedJobsData.length);
          setUserRecommendations(recommendationsData);
          
          // Calculer les nouvelles opportunités basées sur le profil utilisateur
          const matchingJobs = jobsData.filter(job => {
            if (!profileData) return false;
            
            // Logique de correspondance basée sur les compétences et le titre
            const userSkills = profileData.skills?.map(s => s.name.toLowerCase()) || [];
            const userTitle = profileData.title?.toLowerCase() || '';
            
            const jobDescription = job.description.toLowerCase();
            const jobTitle = job.title.toLowerCase();
            
            // Vérifier si le job correspond aux compétences ou au titre
            const skillMatch = userSkills.some(skill => 
              jobDescription.includes(skill) || jobTitle.includes(skill)
            );
            
            const titleMatch = userTitle && (
              jobTitle.includes(userTitle) || 
              jobDescription.includes(userTitle)
            );
            
            return skillMatch || titleMatch;
          });
          
          setNewOpportunities(matchingJobs.length);
          
        } catch (error: any) {
          console.error("Error loading user data:", error);
          dispatch(fetchJobsFailure(error.message));
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Chargement de votre espace...</p>
          <p className="text-sm text-gray-500 mt-2">Préparation de vos données personnalisées</p>
        </motion.div>
      </div>
    );
  }

  // Statistiques utilisateur
  const completionPercentage = typeof profileCompletion === 'number' ? profileCompletion : 
    (profile?.completionScore || 0);
  const userStats = {
    appliedJobs: applications?.length || 0,
    savedJobs: savedJobsCount,
    profileCompletion: completionPercentage,
    newOpportunities: newOpportunities
  };

  // Offres récentes (top 3)
  const recentJobs = jobs?.slice(0, 3) || [];
  const recentApplications = applications?.slice(0, 3) || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Bonjour', emoji: '☀️', color: 'from-amber-400 to-orange-500' };
    if (hour < 17) return { text: 'Bon après-midi', emoji: '🌤️', color: 'from-blue-400 to-indigo-500' };
    return { text: 'Bonsoir', emoji: '🌙', color: 'from-indigo-500 to-purple-600' };
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${greeting.color} rounded-3xl p-8 text-white relative`}>
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="flex-1 mb-6 lg:mb-0">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4 mb-4"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-2xl">{greeting.emoji}</span>
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold">
                        {greeting.text}, {profile?.firstName || user?.firstName || 'Utilisateur'} !
                      </h1>
                      <p className="text-lg text-white/90 mt-1">
                        {currentTime.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-white/90 mb-6 max-w-2xl"
                  >
                    Découvrez de nouvelles opportunités et propulsez votre carrière vers de nouveaux horizons ✨
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Button 
                      size="lg"
                      onClick={() => navigate('/jobs')}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <Search className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Explorer les emplois
                      <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/profile')}
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <User className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Mon profil
                    </Button>
                  </motion.div>
                </div>
                
                {/* Profile Completion Widget */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="lg:ml-8"
                >
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-white" />
                        <span className="text-sm font-semibold text-white">Profil complété</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{userStats.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${userStats.profileCompletion}%` }}
                        transition={{ duration: 1, delay: 1 }}
                        className="bg-white rounded-full h-3 shadow-sm"
                      ></motion.div>
                    </div>
                    <p className="text-xs text-white/80">
                      {userStats.profileCompletion < 100 ? 
                        'Complétez pour maximiser vos opportunités' : 
                        'Profil excellent ! Continuez sur cette lancée 🎉'
                      }
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Candidatures envoyées"
            value={userStats.appliedJobs}
            change="+3 cette semaine"
            changeType="positive"
            icon={Send}
            color="blue"
            gradient="bg-gradient-to-br from-blue-500/10 to-blue-600/10"
          />
          <StatCard
            title="Offres sauvegardées"
            value={userStats.savedJobs}
            change="2 nouvelles"
            changeType="positive"
            icon={Star}
            color="orange"
            gradient="bg-gradient-to-br from-orange-500/10 to-orange-600/10"
          />
          <StatCard
            title="Profil complété"
            value={`${userStats.profileCompletion}%`}
            change={userStats.profileCompletion < 100 ? "À finaliser" : "Complet"}
            changeType={userStats.profileCompletion < 100 ? "neutral" : "positive"}
            icon={Target}
            color="green"
            gradient="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10"
          />
          <StatCard
            title="Nouvelles opportunités"
            value={userStats.newOpportunities}
            change="Correspondances"
            changeType="positive"
            icon={Zap}
            color="purple"
            gradient="bg-gradient-to-br from-purple-500/10 to-purple-600/10"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Offres recommandées</h2>
                    <p className="text-gray-600 mt-1">Sélectionnées spécialement pour vous</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/jobs')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Voir tout
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {recentJobs.map((job: any, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group p-6 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/jobs`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {job.title}
                            </h3>
                            <Badge className={`${getTypeColor(job.type)} font-medium`}>
                              {job.type}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-6 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {timeAgo(job.posted_date || job.created_at)}
                            </div>
                          </div>
                          <p className="text-gray-700 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {recentJobs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre disponible</h3>
                  <p className="text-gray-600 mb-6">Nous recherchons les meilleures opportunités pour vous</p>
                  <Button 
                    onClick={() => navigate('/jobs')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Parcourir les offres
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Activité récente</h3>
                  <p className="text-gray-600 text-sm">Vos dernières actions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentApplications.map((app: any, index) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        Candidature envoyée
                      </p>
                      <p className="text-xs text-gray-600">
                        {timeAgo(app.applied_date || app.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {recentApplications.length === 0 && (
                  <div className="text-center py-8">
                    <Coffee className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">Aucune activité récente</p>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300"
                onClick={() => navigate('/applications')}
              >
                Voir toutes mes candidatures
              </Button>
            </div>

            {/* Tips & Recommendations */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Conseils personnalisés</h3>
                  <p className="text-gray-600 text-sm">Pour booster votre profil</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {userRecommendations?.slice(0, 3).map((rec: any, index) => (
                  <motion.div 
                    key={rec.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mt-2 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {(!userRecommendations || userRecommendations.length === 0) && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Complétez votre profil</p>
                          <p className="text-xs text-gray-600 mt-1">Ajoutez vos compétences et expériences pour maximiser vos opportunités</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Optimisez votre CV</p>
                          <p className="text-xs text-gray-600 mt-1">Utilisez notre outil d'analyse pour améliorer votre CV</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Explorez les opportunités</p>
                          <p className="text-xs text-gray-600 mt-1">Découvrez les offres qui correspondent à votre profil</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300 group"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Améliorer mon profil
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
