import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import StatsCard from '../Dashboard/StatsCard';

const ApplicationStats: React.FC = () => {
  const { applications, stats } = useAppSelector(state => state.applications);

  const thisWeekApplications = applications.filter(app => {
    const appDate = new Date(app.appliedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return appDate >= weekAgo;
  }).length;

  const thisMonthApplications = applications.filter(app => {
    const appDate = new Date(app.appliedDate);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return appDate >= monthAgo;
  }).length;

  const averageResponseTime = applications
    .filter(app => app.responseDate)
    .reduce((acc, app) => {
      const applied = new Date(app.appliedDate);
      const responded = new Date(app.responseDate!);
      const days = Math.floor((responded.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
      return acc + days;
    }, 0) / applications.filter(app => app.responseDate).length || 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total candidatures"
          value={stats.total}
          change={`+${thisWeekApplications} cette semaine`}
          changeType={thisWeekApplications > 0 ? 'positive' : 'neutral'}
          icon={Send}
          color="blue"
        />
        
        <StatsCard
          title="Taux de réponse"
          value={`${stats.responseRate}%`}
          change={stats.responseRate > 30 ? 'Excellent' : stats.responseRate > 15 ? 'Bon' : 'À améliorer'}
          changeType={stats.responseRate > 30 ? 'positive' : stats.responseRate > 15 ? 'neutral' : 'negative'}
          icon={TrendingUp}
          color="green"
        />
        
        <StatsCard
          title="Entretiens obtenus"
          value={stats.interviews}
          change={`${Math.round((stats.interviews / stats.total) * 100)}% du total`}
          changeType="positive"
          icon={MessageSquare}
          color="orange"
        />
        
        <StatsCard
          title="En attente"
          value={stats.pending}
          change="Réponses attendues"
          changeType="neutral"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ce mois-ci</h3>
              <p className="text-sm text-gray-600">Performance mensuelle</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Candidatures envoyées</span>
              <span className="font-semibold text-gray-900">{thisMonthApplications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Objectif mensuel</span>
              <span className="font-semibold text-gray-900">20</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((thisMonthApplications / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {thisMonthApplications >= 20 ? 'Objectif atteint !' : `${20 - thisMonthApplications} candidatures restantes`}
            </p>
          </div>
        </motion.div>

        {/* Response Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analyse des réponses</h3>
              <p className="text-sm text-gray-600">Temps de réponse moyen</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {averageResponseTime > 0 ? Math.round(averageResponseTime) : '-'}
              </div>
              <p className="text-sm text-gray-600">jours en moyenne</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Réponses positives</span>
                <span className="font-medium text-green-600">
                  {applications.filter(app => app.status === 'interview' || app.status === 'accepted').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Réponses négatives</span>
                <span className="font-medium text-red-600">
                  {applications.filter(app => app.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Taux de succès</h3>
              <p className="text-sm text-gray-600">Entretiens vs candidatures</p>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.total > 0 ? Math.round((stats.interviews / stats.total) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">d'entretiens obtenus</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Candidatures automatiques</span>
              <span className="font-medium">
                {applications.filter(app => app.type === 'automatic').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Candidatures manuelles</span>
              <span className="font-medium">
                {applications.filter(app => app.type === 'manual').length}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 className="font-semibold text-blue-900 mb-3">
          💡 Conseils pour améliorer vos candidatures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Personnalisation</p>
            <p>Adaptez chaque lettre à l'entreprise et au poste</p>
          </div>
          <div>
            <p className="font-medium mb-1">Suivi</p>
            <p>Relancez après 1-2 semaines sans réponse</p>
          </div>
          <div>
            <p className="font-medium mb-1">Timing</p>
            <p>Postulez en début de semaine, entre 9h et 11h</p>
          </div>
          <div>
            <p className="font-medium mb-1">Qualité</p>
            <p>Mieux vaut 5 candidatures ciblées que 20 génériques</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationStats;