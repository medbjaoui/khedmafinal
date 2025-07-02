import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';

const Reports: React.FC = () => {
  const { applications } = useAppSelector(state => state.applications);
  const { profile } = useAppSelector(state => state.profile);
  const { user } = useAppSelector(state => state.auth);
  
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'performance' | 'trends'>('summary');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  // Calculate metrics
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

  // Generate monthly data for trends
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.appliedDate);
        return appDate.getMonth() === date.getMonth() && 
               appDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        applications: monthApplications.length,
        responses: monthApplications.filter(app => app.status !== 'sent' && app.status !== 'draft').length,
        interviews: monthApplications.filter(app => app.status === 'interview').length
      });
    }
    
    return months;
  };

  const monthlyData = generateMonthlyData();

  const reportSections = {
    summary: {
      title: 'Rapport de synthèse',
      description: 'Vue d\'ensemble de votre activité de recherche d\'emploi',
      icon: BarChart3
    },
    detailed: {
      title: 'Rapport détaillé',
      description: 'Analyse approfondie de toutes vos candidatures',
      icon: FileText
    },
    performance: {
      title: 'Rapport de performance',
      description: 'Métriques et KPIs de votre recherche d\'emploi',
      icon: TrendingUp
    },
    trends: {
      title: 'Analyse des tendances',
      description: 'Évolution de vos performances dans le temps',
      icon: PieChart
    }
  };

  const handleExport = () => {
    // Simulate export functionality
    const reportData = {
      user: user,
      profile: profile,
      metrics: metrics,
      applications: filteredApplications,
      timeRange: timeRange,
      generatedAt: new Date().toISOString()
    };
    
    console.log('Exporting report:', reportData);
    
    // In a real application, this would trigger the actual export
    alert(`Rapport exporté en format ${exportFormat.toUpperCase()}`);
  };

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
            Rapports et Analyses
          </h1>
          <p className="text-gray-600">
            Générez des rapports détaillés sur votre recherche d'emploi
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>
          
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </motion.div>

      {/* Report Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(reportSections).map(([key, section]) => {
            const Icon = section.icon;
            return (
              <button
                key={key}
                onClick={() => setReportType(key as any)}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  reportType === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${
                  reportType === key ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <h4 className="font-medium text-gray-900 mb-1">{section.title}</h4>
                <p className="text-sm text-gray-600">{section.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        key={reportType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {reportType === 'summary' && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
                    <p className="text-sm text-gray-600">Candidatures</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
                    <p className="text-sm text-gray-600">Taux de réponse</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metrics.interviews}</p>
                    <p className="text-sm text-gray-600">Entretiens</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                    <p className="text-sm text-gray-600">Taux de succès</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution mensuelle</h3>
              <div className="h-64 flex items-end space-x-2">
                {monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => d.applications));
                  const height = maxValue > 0 ? (data.applications / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${data.month}: ${data.applications} candidatures`}
                      />
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {reportType === 'detailed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rapport détaillé des candidatures</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Poste</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Entreprise</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 font-medium">{app.jobTitle}</td>
                      <td className="py-3 px-4">{app.company}</td>
                      <td className="py-3 px-4">{app.source}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'interview' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {app.status === 'sent' ? 'Envoyée' :
                           app.status === 'viewed' ? 'Vue' :
                           app.status === 'interview' ? 'Entretien' :
                           app.status === 'rejected' ? 'Refusée' : 'Acceptée'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center">
                          {app.type === 'automatic' ? '🤖' : '👤'}
                          <span className="ml-1">
                            {app.type === 'automatic' ? 'Auto' : 'Manuel'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Indicateurs de performance</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux de réponse</span>
                    <span className="text-sm font-medium text-gray-900">{responseRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        responseRate > 30 ? 'bg-green-500' : 
                        responseRate > 15 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${responseRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux d'entretien</span>
                    <span className="text-sm font-medium text-gray-900">{interviewRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        interviewRate > 20 ? 'bg-green-500' : 
                        interviewRate > 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${interviewRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taux de succès</span>
                    <span className="text-sm font-medium text-gray-900">{successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        successRate > 5 ? 'bg-green-500' : 
                        successRate > 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(successRate, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommandations</h3>
              
              <div className="space-y-4">
                {responseRate < 15 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Taux de réponse faible</p>
                      <p className="text-sm text-red-700">Personnalisez davantage vos candidatures</p>
                    </div>
                  </div>
                )}
                
                {interviewRate < 10 && metrics.responses > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Peu d'entretiens</p>
                      <p className="text-sm text-yellow-700">Améliorez votre CV et profil</p>
                    </div>
                  </div>
                )}
                
                {metrics.totalApplications < 5 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Activité faible</p>
                      <p className="text-sm text-blue-700">Augmentez votre rythme de candidatures</p>
                    </div>
                  </div>
                )}
                
                {responseRate >= 30 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Excellent taux de réponse</p>
                      <p className="text-sm text-green-700">Continuez sur cette voie !</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {reportType === 'trends' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Analyse des tendances</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h4 className="font-medium text-gray-900 mb-4">Évolution sur 12 mois</h4>
                <div className="h-64 flex items-end space-x-1">
                  {monthlyData.map((data, index) => {
                    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.applications, d.responses, d.interviews)));
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                        <div className="w-full flex flex-col space-y-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${(data.applications / maxValue) * 200}px` }}
                            title={`${data.month}: ${data.applications} candidatures`}
                          />
                          <div 
                            className="w-full bg-green-500"
                            style={{ height: `${(data.responses / maxValue) * 200}px` }}
                            title={`${data.month}: ${data.responses} réponses`}
                          />
                          <div 
                            className="w-full bg-orange-500"
                            style={{ height: `${(data.interviews / maxValue) * 200}px` }}
                            title={`${data.month}: ${data.interviews} entretiens`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                          {data.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Candidatures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Réponses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-600">Entretiens</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Tendances clés</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Meilleur mois</p>
                    <p className="text-sm text-gray-600">
                      {monthlyData.reduce((best, current) => 
                        current.applications > best.applications ? current : best
                      ).month}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Moyenne mensuelle</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(monthlyData.reduce((sum, data) => sum + data.applications, 0) / monthlyData.length)} candidatures
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Progression</p>
                    <p className="text-sm text-gray-600">
                      {monthlyData[monthlyData.length - 1]?.applications > monthlyData[monthlyData.length - 2]?.applications ? 
                        '📈 En hausse' : '📉 En baisse'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;