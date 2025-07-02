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
  const { profileCompletion } = useAppSelector(state => state.profile);
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
      {/* Welcome Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.4),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.3),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-8 right-24 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20"
        />
        
        <div className="relative z-10 px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Greeting avec emoji animé */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 mb-3"
              >
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                  className="text-4xl"
                >
                  👋
                </motion.span>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  {getGreeting()} {user?.firstName} !
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-blue-100 mb-6 font-medium"
              >
                Tableau de bord de votre recherche d'emploi intelligente
              </motion.p>
              
              {/* Status Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm font-medium text-white">Profil actif</div>
                    <div className="text-xs text-green-200">En ligne maintenant</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{thisWeekApplications}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Cette semaine</div>
                    <div className="text-xs text-yellow-200">Candidatures envoyées</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{interviewsThisWeek}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Entretiens</div>
                    <div className="text-xs text-purple-200">À venir cette semaine</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Achievement Badge */}
            {profileCompletion.overall >= 80 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center transform rotate-12 shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-xl flex items-center justify-center">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white text-xs font-bold text-gray-800 px-2 py-1 rounded-full shadow-lg">
                    TOP
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                <div className="text-sm text-blue-600 font-medium">+{thisWeekApplications} cette semaine</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Candidatures</h3>
              <p className="text-sm text-gray-600">Total des candidatures envoyées</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {applications.length > 0 ? Math.round((applications.filter(app => app.status !== 'sent').length / applications.length) * 100) : 0}%
                </div>
                <div className="text-sm text-green-600 font-medium">Derniers 30 jours</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Taux de réponse</h3>
              <p className="text-sm text-gray-600">Réponses reçues</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{interviewsThisWeek}</div>
                <div className={`text-sm font-medium ${interviewsThisWeek > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                  Cette semaine
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Entretiens</h3>
              <p className="text-sm text-gray-600">Programmés</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{profileCompletion.overall}%</div>
                <div className={`text-sm font-medium ${profileCompletion.overall >= 80 ? 'text-purple-600' : 'text-gray-500'}`}>
                  {profileCompletion.overall >= 80 ? "Excellent" : "À améliorer"}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Score profil</h3>
              <p className="text-sm text-gray-600">Complétude</p>
            </div>
          </div>
        </motion.div>
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

      {/* Tips Section Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <div className="relative border border-emerald-200/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent mb-2">
                💡 Conseils IA personnalisés
              </h3>
              <p className="text-gray-600">Recommandations basées sur votre profil et vos objectifs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-emerald-900">Optimisez votre visibilité</h4>
              </div>
              <p className="text-sm text-emerald-800">Complétez votre profil à 100% pour augmenter vos chances de 3x</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-blue-900">Restez actif</h4>
              </div>
              <p className="text-sm text-blue-800">Postulez régulièrement, visez 5-10 candidatures par semaine</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-purple-900">Personnalisez vos candidatures</h4>
              </div>
              <p className="text-sm text-purple-800">Adaptez chaque lettre de motivation à l'entreprise cible</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-orange-900">Suivez vos candidatures</h4>
              </div>
              <p className="text-sm text-orange-800">Relancez après 1-2 semaines sans réponse pour montrer votre motivation</p>
            </motion.div>
          </div>
          
          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex justify-center mt-6"
          >
            <button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Obtenir plus de conseils IA</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;