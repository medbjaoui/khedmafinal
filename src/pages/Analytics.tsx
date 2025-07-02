import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target,
  Eye,
  Send,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import StatsCard from '../components/Dashboard/StatsCard';

const Analytics: React.FC = () => {
  const { applications } = useAppSelector(state => state.applications);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'applications' | 'responses' | 'interviews'>('applications');

  // Calculate metrics based on time range
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3months': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange];
  };

  const filteredApplications = applications.filter(app => 
    new Date(app.appliedDate) >= getDateRange()
  );

  const metrics = {
    totalApplications: filteredApplications.length,
    responses: filteredApplications.filter(app => 
      app.status === 'viewed' || app.status === 'interview' || 
      app.status === 'rejected' || app.status === 'accepted'
    ).length,
    interviews: filteredApplications.filter(app => app.status === 'interview').length,
    rejections: filteredApplications.filter(app => app.status === 'rejected').length,
    acceptances: filteredApplications.filter(app => app.status === 'accepted').length,
    pending: filteredApplications.filter(app => app.status === 'sent').length
  };

  const responseRate = metrics.totalApplications > 0 ? 
    Math.round((metrics.responses / metrics.totalApplications) * 100) : 0;
  
  const interviewRate = metrics.responses > 0 ? 
    Math.round((metrics.interviews / metrics.responses) * 100) : 0;

  const successRate = metrics.totalApplications > 0 ? 
    Math.round((metrics.acceptances / metrics.totalApplications) * 100) : 0;

  // Generate chart data
  const generateChartData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === '3months' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayApplications = applications.filter(app => {
        const appDate = new Date(app.appliedDate);
        return appDate.toDateString() === date.toDateString();
      });
      
      data.push({
        date: date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: timeRange === 'year' ? 'short' : '2-digit' 
        }),
        applications: dayApplications.length,
        responses: dayApplications.filter(app => 
          app.status !== 'sent' && app.status !== 'draft'
        ).length,
        interviews: dayApplications.filter(app => app.status === 'interview').length
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => Math.max(d.applications, d.responses, d.interviews)));

  const companyStats = applications.reduce((acc, app) => {
    acc[app.company] = (acc[app.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const sourceStats = applications.reduce((acc, app) => {
    acc[app.source] = (acc[app.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Statistiques et Analytics
          </h1>
          <p className="text-gray-600">
            Analysez vos performances et optimisez votre stratégie de recherche d'emploi
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | '3months' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Candidatures envoyées"
          value={metrics.totalApplications}
          change={`${responseRate}% de taux de réponse`}
          changeType={responseRate > 30 ? "positive" : responseRate > 15 ? "neutral" : "negative"}
          icon={Send}
          color="blue"
        />
        <StatsCard
          title="Réponses reçues"
          value={metrics.responses}
          change={`${interviewRate}% mènent à un entretien`}
          changeType={interviewRate > 20 ? "positive" : interviewRate > 10 ? "neutral" : "negative"}
          icon={Eye}
          color="green"
        />
        <StatsCard
          title="Entretiens obtenus"
          value={metrics.interviews}
          change={`${Math.round((metrics.interviews / (metrics.totalApplications || 1)) * 100)}% du total`}
          changeType="positive"
          icon={MessageSquare}
          color="orange"
        />
        <StatsCard
          title="Taux de succès"
          value={`${successRate}%`}
          change={metrics.acceptances > 0 ? `${metrics.acceptances} offre(s)` : "Aucune offre"}
          changeType={successRate > 5 ? "positive" : "neutral"}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activité dans le temps</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'applications' | 'responses' | 'interviews')}
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="applications">Candidatures</option>
                <option value="responses">Réponses</option>
                <option value="interviews">Entretiens</option>
              </select>
            </div>
          </div>
          
          <div className="h-64 flex items-end space-x-1">
            {chartData.map((data, index) => {
              const value = data[selectedMetric];
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${data.date}: ${value} ${selectedMetric}`}
                  />
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {data.date}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition des statuts</h3>
          
          <div className="space-y-4">
            {[
              { label: 'En attente', value: metrics.pending, color: 'bg-yellow-500', icon: Clock },
              { label: 'Vues', value: metrics.responses - metrics.interviews - metrics.rejections - metrics.acceptances, color: 'bg-blue-500', icon: Eye },
              { label: 'Entretiens', value: metrics.interviews, color: 'bg-green-500', icon: MessageSquare },
              { label: 'Refusées', value: metrics.rejections, color: 'bg-red-500', icon: XCircle },
              { label: 'Acceptées', value: metrics.acceptances, color: 'bg-purple-500', icon: CheckCircle }
            ].map((status) => {
              const Icon = status.icon;
              const percentage = metrics.totalApplications > 0 ? 
                Math.round((status.value / metrics.totalApplications) * 100) : 0;
              
              return (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{status.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{status.value}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-medium text-gray-900">{metrics.totalApplications} candidatures</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Entreprises les plus ciblées</h3>
          
          <div className="space-y-4">
            {topCompanies.map(([company, count]) => (
              <div key={company} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...topCompanies.map(([,c]) => c))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sources Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance par source</h3>
          
          <div className="space-y-4">
            {Object.entries(sourceStats).map(([source, count]) => {
              const sourceApplications = applications.filter(app => app.source === source);
              const sourceResponses = sourceApplications.filter(app => 
                app.status !== 'sent' && app.status !== 'draft'
              ).length;
              const responseRate = count > 0 ? Math.round((sourceResponses / count) * 100) : 0;
              
              return (
                <div key={source} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{source}</h4>
                    <span className="text-sm text-gray-600">{count} candidatures</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux de réponse</span>
                    <span className={`font-medium ${
                      responseRate > 30 ? 'text-green-600' : 
                      responseRate > 15 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {responseRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        responseRate > 30 ? 'bg-green-500' : 
                        responseRate > 15 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${responseRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">
              📊 Insights et recommandations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Optimisation du taux de réponse</p>
                <p>
                  {responseRate < 15 ? 
                    "Votre taux de réponse est faible. Personnalisez davantage vos candidatures." :
                    responseRate < 30 ?
                    "Bon taux de réponse ! Continuez à personnaliser vos candidatures." :
                    "Excellent taux de réponse ! Votre stratégie fonctionne bien."
                  }
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Meilleure source</p>
                <p>
                  {Object.entries(sourceStats).length > 0 ?
                    `${Object.entries(sourceStats).sort(([,a], [,b]) => b - a)[0][0]} est votre source la plus productive.` :
                    "Diversifiez vos sources de candidatures."
                  }
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Fréquence de candidature</p>
                <p>
                  {metrics.totalApplications < 5 ?
                    "Augmentez votre rythme de candidatures pour plus d'opportunités." :
                    "Bon rythme de candidatures ! Maintenez cette régularité."
                  }
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Suivi des candidatures</p>
                <p>
                  {metrics.pending > metrics.responses ?
                    "Beaucoup de candidatures en attente. Pensez à relancer." :
                    "Bon suivi de vos candidatures !"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;