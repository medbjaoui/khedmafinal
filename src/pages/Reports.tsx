import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Users,
  Briefcase,
  Clock,
  Target,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState({
    overview: {
      totalApplications: 47,
      interviews: 12,
      offers: 3,
      responseRate: 68,
      avgResponseTime: 5.2,
      topCompanies: ['TechCorp', 'InnovateLab', 'DataFlow'],
      topSkills: ['React', 'TypeScript', 'Node.js']
    },
    weekly: {
      applications: [8, 12, 5, 9, 15, 7, 11],
      interviews: [2, 3, 1, 2, 4, 1, 2],
      responses: [3, 8, 2, 6, 10, 4, 7]
    },
    monthly: {
      january: { applications: 15, interviews: 4, offers: 1 },
      december: { applications: 12, interviews: 3, offers: 0 },
      november: { applications: 20, interviews: 5, offers: 2 }
    }
  });

  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async (type: string) => {
    setIsLoading(true);
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Simuler le téléchargement
    const element = document.createElement('a');
    const file = new Blob(['Rapport généré avec succès'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `rapport-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const ReportCard = ({ title, description, icon: Icon, data, trend, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardHeader className="pb-3">
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
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{data}</div>
          <div className="text-sm text-gray-500">Par rapport au mois dernier</div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StatCard = ({ title, value, subtitle, progress }: any) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 mb-2">{subtitle}</div>
      {progress !== undefined && (
        <Progress value={progress} className="h-1" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rapports & Analytics
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Analysez vos performances et exportez vos données
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="year">Cette année</option>
            </select>

            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Candidatures"
            description="Total des candidatures"
            icon={Briefcase}
            data={reportData.overview.totalApplications}
            trend={15}
            color="from-blue-500 to-blue-600"
          />
          <ReportCard
            title="Entretiens"
            description="Entretiens obtenus"
            icon={Users}
            data={reportData.overview.interviews}
            trend={25}
            color="from-green-500 to-green-600"
          />
          <ReportCard
            title="Offres"
            description="Offres reçues"
            icon={Target}
            data={reportData.overview.offers}
            trend={50}
            color="from-purple-500 to-purple-600"
          />
          <ReportCard
            title="Taux de réponse"
            description="Pourcentage de réponses"
            icon={TrendingUp}
            data={`${reportData.overview.responseRate}%`}
            trend={8}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Activité Hebdomadaire
                  </CardTitle>
                  <CardDescription>Vos candidatures des 7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard
                      title="Candidatures"
                      value="67"
                      subtitle="Cette semaine"
                      progress={75}
                    />
                    <StatCard
                      title="Réponses"
                      value="23"
                      subtitle="Réponses reçues"
                      progress={45}
                    />
                    <StatCard
                      title="Entretiens"
                      value="8"
                      subtitle="Programmés"
                      progress={30}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Répartition par Statut
                  </CardTitle>
                  <CardDescription>État de vos candidatures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">En attente</div>
                        <div className="text-sm text-gray-500">Candidatures envoyées</div>
                      </div>
                      <Badge variant="secondary">28</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">En cours</div>
                        <div className="text-sm text-gray-500">Processus actifs</div>
                      </div>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Finalisées</div>
                        <div className="text-sm text-gray-500">Offres/Refus</div>
                      </div>
                      <Badge variant="secondary">7</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Métriques de Performance</CardTitle>
                  <CardDescription>Vos KPIs de recherche d'emploi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux de réponse</span>
                      <span className="text-sm text-gray-600">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux d'entretien</span>
                      <span className="text-sm text-gray-600">26%</span>
                    </div>
                    <Progress value={26} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taux de conversion</span>
                      <span className="text-sm text-gray-600">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Temps de réponse moyen</span>
                      <span className="text-sm text-gray-600">5.2 jours</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Évolution Mensuelle</CardTitle>
                  <CardDescription>Progression de vos candidatures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Janvier 2024</div>
                        <div className="text-sm text-gray-500">15 candidatures, 4 entretiens</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">+25%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium">Décembre 2023</div>
                        <div className="text-sm text-gray-500">12 candidatures, 3 entretiens</div>
                      </div>
                      <Badge variant="secondary">-15%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium">Novembre 2023</div>
                        <div className="text-sm text-gray-500">20 candidatures, 5 entretiens</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">+10%</Badge>
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
                  <CardTitle>Entreprises Populaires</CardTitle>
                  <CardDescription>Où vous postulez le plus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.overview.topCompanies.map((company, index) => (
                      <div key={company} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{company}</div>
                          <div className="text-sm text-gray-500">{5 - index} candidatures</div>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Compétences Recherchées</CardTitle>
                  <CardDescription>Technologies les plus demandées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.overview.topSkills.map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{skill}</div>
                          <div className="text-sm text-gray-500">{15 - index * 2} offres</div>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Rapport Complet</CardTitle>
                  <CardDescription>Export de toutes vos données</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Inclut candidatures, entretiens, statistiques et analyses
                  </div>
                  <Button 
                    onClick={() => generateReport('complet')}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Télécharger PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Données Candidatures</CardTitle>
                  <CardDescription>Export CSV des candidatures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Format Excel avec toutes les candidatures et leurs statuts
                  </div>
                  <Button 
                    onClick={() => generateReport('candidatures')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Télécharger CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Rapport Analytics</CardTitle>
                  <CardDescription>Statistiques détaillées</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Graphiques et métriques de performance
                  </div>
                  <Button 
                    onClick={() => generateReport('analytics')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Télécharger PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Rapports Automatiques</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Configurez des rapports hebdomadaires ou mensuels automatiques par email
                    </p>
                  </div>
                  <Button variant="outline" className="bg-white dark:bg-gray-800">
                    Configurer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;