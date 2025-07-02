import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { Link } from 'react-router-dom';
import StatsCard from '../components/Dashboard/StatsCard';

const Overview: React.FC = () => {
  const { applications } = useAppSelector(state => state.applications);
  const { current: currentCV } = useAppSelector(state => state.cv);
  const { jobs } = useAppSelector(state => state.jobs);
  const { profile, profileCompletion } = useAppSelector(state => state.profile);
  const { user } = useAppSelector(state => state.auth);

  const thisWeekApplications = applications.filter(app => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const appDate = new Date(app.appliedDate);
    return appDate >= weekAgo;
  }).length;

  const interviewsThisWeek = applications.filter(app => {
    if (!app.interviewDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const interviewDate = new Date(app.interviewDate);
    return interviewDate <= weekFromNow && interviewDate >= new Date();
  }).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const quickActions = [
    {
      title: 'Rechercher des emplois',
      description: 'Découvrir de nouvelles opportunités',
      icon: Target,
      color: 'blue',
      link: '/jobs',
      count: jobs.length
    },
    {
      title: 'Analyser mon CV',
      description: 'Optimiser votre profil',
      icon: TrendingUp,
      color: 'orange',
      link: '/cv-analysis',
      score: currentCV?.score
    },
    {
      title: 'Mes candidatures',
      description: 'Suivre vos demandes',
      icon: Activity,
      color: 'green',
      link: '/applications',
      count: applications.length
    },
    {
      title: 'Statistiques',
      description: 'Analyser vos performances',
      icon: BarChart3,
      color: 'purple',
      link: '/analytics',
      rate: applications.length > 0 ? Math.round((applications.filter(app => app.status === 'interview').length / applications.length) * 100) : 0
    }
  ];

  const upcomingTasks = [
    {
      id: '1',
      title: 'Entretien chez TechCorp',
      description: 'Développeur Full Stack',
      time: 'Demain 14:00',
      priority: 'high',
      type: 'interview'
    },
    {
      id: '2',
      title: 'Relancer Digital Solutions',
      description: 'Candidature envoyée il y a 1 semaine',
      time: 'Dans 2 jours',
      priority: 'medium',
      type: 'followup'
    },
    {
      id: '3',
      title: 'Mettre à jour le profil',
      description: 'Ajouter nouvelles compétences',
      time: 'Cette semaine',
      priority: 'low',
      type: 'profile'
    }
  ];

  const achievements = [
    {
      title: 'Premier entretien',
      description: 'Félicitations pour votre premier entretien !',
      icon: Award,
      earned: applications.some(app => app.status === 'interview'),
      date: '2024-01-15'
    },
    {
      title: 'Profil optimisé',
      description: 'Profil complété à plus de 80%',
      icon: CheckCircle,
      earned: profileCompletion.overall >= 80,
      date: '2024-01-10'
    },
    {
      title: 'CV analysé',
      description: 'Premier CV analysé avec succès',
      icon: TrendingUp,
      earned: !!currentCV,
      date: '2024-01-05'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()} {user?.firstName} ! 👋
          </h1>
          <p className="text-blue-100 mb-4">
            Voici un aperçu de votre progression dans votre recherche d'emploi
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Profil actif</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>{thisWeekApplications} candidatures cette semaine</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>{interviewsThisWeek} entretien(s) à venir</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Candidatures totales"
          value={applications.length}
          change={`+${thisWeekApplications} cette semaine`}
          changeType="positive"
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Taux de réponse"
          value={`${applications.length > 0 ? Math.round((applications.filter(app => app.status !== 'sent').length / applications.length) * 100) : 0}%`}
          change="Derniers 30 jours"
          changeType="neutral"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Entretiens programmés"
          value={interviewsThisWeek}
          change="Cette semaine"
          changeType={interviewsThisWeek > 0 ? "positive" : "neutral"}
          icon={Calendar}
          color="orange"
        />
        <StatsCard
          title="Score profil"
          value={`${profileCompletion.overall}%`}
          change={profileCompletion.overall >= 80 ? "Excellent" : "À améliorer"}
          changeType={profileCompletion.overall >= 80 ? "positive" : "neutral"}
          icon={Target}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Actions rapides</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600',
                orange: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-600',
                green: 'border-green-200 hover:border-green-300 hover:bg-green-50 text-green-600',
                purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600'
              };
              
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={action.link}
                    className={`block p-4 border-2 rounded-lg transition-all group ${colorClasses[action.color as keyof typeof colorClasses]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                      {action.count !== undefined && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {action.count}
                        </span>
                      )}
                      {action.score !== undefined && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {action.score}/100
                        </span>
                      )}
                      {action.rate !== undefined && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {action.rate}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Accéder</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Tâches à venir</span>
          </h3>
          
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => {
              const priorityColors = {
                high: 'border-red-200 bg-red-50',
                medium: 'border-yellow-200 bg-yellow-50',
                low: 'border-blue-200 bg-blue-50'
              };
              
              const priorityDots = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-blue-500'
              };
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-3 border rounded-lg ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${priorityDots[task.priority as keyof typeof priorityDots]}`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{task.time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <Link 
            to="/tasks"
            className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors block text-center"
          >
            Voir toutes les tâches
          </Link>
        </motion.div>
      </div>

      {/* Achievements & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Réalisations</span>
          </h3>
          
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-green-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <p className="text-xs text-green-600 mt-1">
                          Obtenu le {new Date(achievement.date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Profile Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Progression du profil</span>
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {profileCompletion.overall}%
              </div>
              <p className="text-sm text-gray-600">Profil complété</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion.overall}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(profileCompletion.sections).map(([section, score]) => (
                <div key={section} className="text-center">
                  <div className={`text-lg font-semibold ${
                    score >= 80 ? 'text-green-600' : 
                    score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {score}%
                  </div>
                  <div className="text-gray-600 capitalize text-xs">
                    {section === 'personal' ? 'Personnel' :
                     section === 'professional' ? 'Professionnel' :
                     section === 'experience' ? 'Expérience' :
                     section === 'education' ? 'Formation' : 'Compétences'}
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              to="/profile"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors block text-center"
            >
              Améliorer mon profil
            </Link>
          </div>
        </motion.div>
      </div>

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
              💡 Conseils personnalisés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <p className="font-medium mb-1">Optimisez votre visibilité</p>
                <p>Complétez votre profil à 100% pour augmenter vos chances</p>
              </div>
              <div>
                <p className="font-medium mb-1">Restez actif</p>
                <p>Postulez régulièrement, visez 5-10 candidatures par semaine</p>
              </div>
              <div>
                <p className="font-medium mb-1">Personnalisez vos candidatures</p>
                <p>Adaptez chaque lettre de motivation à l'entreprise</p>
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

export default Overview;