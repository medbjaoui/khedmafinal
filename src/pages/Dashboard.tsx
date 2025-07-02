import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Zap
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
function timeAgo(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
    case 'CDI': return 'bg-green-100 text-green-800 border-green-200';
    case 'CDD': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Stage': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Alternance': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Freelance': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Component pour les cartes de statistiques
const StatCard = ({ title, value, change, changeType, icon: Icon, color }: any) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`} />
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        color === 'blue' ? 'bg-blue-100' :
        color === 'green' ? 'bg-green-100' :
        color === 'orange' ? 'bg-orange-100' :
        color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
      }`}>
        <Icon className={`h-6 w-6 ${
          color === 'blue' ? 'text-blue-600' :
          color === 'green' ? 'text-green-600' :
          color === 'orange' ? 'text-orange-600' :
          color === 'purple' ? 'text-purple-600' : 'text-gray-600'
        }`} />
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
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (user) {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Statistiques utilisateur
  const completionPercentage = typeof profileCompletion === 'number' ? profileCompletion : 75;
  const userStats = {
    appliedJobs: applications?.length || 0,
    savedJobs: 12, // Remplacer par données réelles
    profileCompletion: completionPercentage,
    newOpportunities: 8
  };

  // Offres récentes (top 3)
  const recentJobs = jobs?.slice(0, 3) || [];

  // Candidatures récentes
  const recentApplications = applications?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-8 p-6">
        {/* Header avec bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-8 text-primary-foreground relative overflow-hidden"
        >
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      Bonjour, {profile?.firstName || user?.firstName || 'Utilisateur'} ! 👋
                    </h1>
                    <p className="text-primary-foreground/80 text-lg">
                      Prêt à découvrir de nouvelles opportunités ?
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    variant="secondary"
                    onClick={() => navigate('/jobs')}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher un emploi
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </Button>
                </div>
              </div>
              
              {/* Indicateur de complétion du profil */}
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profil complété</span>
                    <span className="text-lg font-bold">{userStats.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${userStats.profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-primary-foreground/70 mt-2">
                    {userStats.profileCompletion < 100 ? 'Complétez pour plus de visibilité' : 'Excellent profil !'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Candidatures envoyées"
            value={userStats.appliedJobs}
            change="+3 cette semaine"
            changeType="positive"
            icon={Send}
            color="blue"
          />
          <StatCard
            title="Offres sauvegardées"
            value={userStats.savedJobs}
            change="2 nouvelles"
            changeType="positive"
            icon={Star}
            color="orange"
          />
          <StatCard
            title="Profil complété"
            value={`${userStats.profileCompletion}%`}
            change={userStats.profileCompletion < 100 ? "À finaliser" : "Complet"}
            changeType={userStats.profileCompletion < 100 ? "neutral" : "positive"}
            icon={Target}
            color="green"
          />
          <StatCard
            title="Nouvelles opportunités"
            value={userStats.newOpportunities}
            change="Correspondances"
            changeType="positive"
            icon={Zap}
            color="purple"
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Offres recommandées */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Offres recommandées</h2>
                    <p className="text-sm text-muted-foreground">Basées sur votre profil</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/jobs')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentJobs.map((job: any, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/jobs`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-2">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeAgo(job.posted_date || job.created_at)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {recentJobs.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Aucune offre disponible pour le moment</p>
                  <Button className="mt-4" onClick={() => navigate('/jobs')}>
                    Parcourir les offres
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Sidebar avec activités récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Candidatures récentes */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Activité récente</h3>
                  <p className="text-sm text-muted-foreground">Vos dernières actions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        Candidature envoyée
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(app.applied_date || app.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentApplications.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">Aucune activité récente</p>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/applications')}
              >
                Voir toutes mes candidatures
              </Button>
            </Card>

            {/* Recommandations */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Conseils</h3>
                  <p className="text-sm text-muted-foreground">Pour améliorer votre profil</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {recommendations?.slice(0, 3).map((rec: any) => (
                  <div key={rec.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Complétez votre profil</p>
                        <p className="text-xs text-muted-foreground mt-1">Ajoutez vos compétences et expériences</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/profile')}
              >
                Améliorer mon profil
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;