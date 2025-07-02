import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Users,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState({
    applications: {
      total: 47,
      thisMonth: 12,
      lastMonth: 15,
      pending: 8,
      interviews: 5,
      offers: 2
    },
    performance: {
      responseRate: 68,
      interviewRate: 24,
      offerRate: 8,
      avgResponseTime: 5.2
    },
    trending: {
      topSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
      popularCompanies: ['TechCorp', 'InnovateLab', 'DataFlow', 'CloudTech', 'StartupX']
    }
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const StatCard = ({ icon: Icon, title, value, description, trend, color }: any) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {trend && (
              <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
                {trend > 0 ? '+' : ''}{trend}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Suivez vos performances et optimisez votre recherche d'emploi avec des données précises
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Briefcase}
            title="Candidatures Totales"
            value={analyticsData.applications.total}
            description="Depuis le début"
            trend={15}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Clock}
            title="Ce Mois"
            value={analyticsData.applications.thisMonth}
            description="Nouvelles candidatures"
            trend={-12}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Award}
            title="Entretiens"
            value={analyticsData.applications.interviews}
            description="En cours"
            trend={25}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Target}
            title="Offres Reçues"
            value={analyticsData.applications.offers}
            description="Cette année"
            trend={100}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Taux de Réponse
                  </CardTitle>
                  <CardDescription>Performance de vos candidatures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux de réponse</span>
                      <span className="text-sm text-gray-600">{analyticsData.performance.responseRate}%</span>
                    </div>
                    <Progress value={analyticsData.performance.responseRate} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux d'entretien</span>
                      <span className="text-sm text-gray-600">{analyticsData.performance.interviewRate}%</span>
                    </div>
                    <Progress value={analyticsData.performance.interviewRate} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux d'offre</span>
                      <span className="text-sm text-gray-600">{analyticsData.performance.offerRate}%</span>
                    </div>
                    <Progress value={analyticsData.performance.offerRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Répartition des Statuts
                  </CardTitle>
                  <CardDescription>État de vos candidatures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="font-medium">En attente</span>
                      <Badge variant="secondary">{analyticsData.applications.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-medium">Entretiens</span>
                      <Badge variant="secondary">{analyticsData.applications.interviews}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-medium">Offres</span>
                      <Badge variant="secondary">{analyticsData.applications.offers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Compétences Populaires</CardTitle>
                  <CardDescription>Compétences les plus demandées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.trending.topSkills.map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium">{skill}</span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Entreprises Populaires</CardTitle>
                  <CardDescription>Où vous postulez le plus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.trending.popularCompanies.map((company, index) => (
                      <div key={company} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium">{company}</span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle>Timeline d'Activité</CardTitle>
                <CardDescription>Votre activité de recherche d'emploi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    Timeline des candidatures et entretiens à venir...
                    <div className="mt-4">
                      <Activity className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;