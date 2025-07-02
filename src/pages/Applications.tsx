
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Mail,
  Calendar,
  Building2,
  User,
  FileText,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setApplications, addApplication } from '../store/slices/applicationsSlice';
import { SupabaseService } from '../services/supabaseService';
import ApplicationModal from '../components/Applications/ApplicationModal';
import ApplicationDetailsModal from '../components/Applications/ApplicationDetailsModal';

const Applications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applications } = useAppSelector((state) => state.applications);
  const { user } = useAppSelector((state) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    pending: { 
      label: 'En attente', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      icon: Clock,
      count: applications.filter(app => app.status === 'pending').length
    },
    interview: { 
      label: 'Entretien', 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      icon: User,
      count: applications.filter(app => app.status === 'interview').length
    },
    accepted: { 
      label: 'Acceptée', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      icon: CheckCircle2,
      count: applications.filter(app => app.status === 'accepted').length
    },
    rejected: { 
      label: 'Refusée', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      icon: XCircle,
      count: applications.filter(app => app.status === 'rejected').length
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      if (user) {
        try {
          setLoading(true);
          const data = await SupabaseService.getUserApplications(user.id);
          dispatch(setApplications(data));
        } catch (error) {
          console.error('Error loading applications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadApplications();
  }, [dispatch, user]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    thisMonth: applications.filter(app => {
      const appDate = new Date(app.applied_date);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length,
    responseRate: applications.length > 0 
      ? Math.round((applications.filter(app => app.status !== 'pending').length / applications.length) * 100)
      : 0,
    interviews: applications.filter(app => app.status === 'interview' || app.status === 'accepted').length
  };

  const StatCard = ({ icon: Icon, title, value, description, trend, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
              <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
                {trend > 0 ? '+' : ''}{trend}%
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ApplicationCard = ({ application }: { application: any }) => {
    const status = statusConfig[application.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.01 }}
        className="group cursor-pointer"
        onClick={() => setSelectedApplication(application)}
      >
        <Card className="h-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border-0 group-hover:border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600">
                  {application.job_title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {application.company}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${status.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {application.notes || 'Aucune note ajoutée'}
            </div>
            
            {application.interview_date && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Calendar className="h-4 w-4" />
                Entretien le {new Date(application.interview_date).toLocaleDateString('fr-FR')}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(application.applied_date).toLocaleDateString('fr-FR')}
              </div>
              
              {application.cover_letter && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FileText className="h-3 w-3" />
                  Lettre jointe
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
              Mes Candidatures
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Suivez l'évolution de vos candidatures et optimisez votre recherche
            </p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Candidature
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Briefcase}
            title="Total Candidatures"
            value={stats.total}
            description="Depuis le début"
            trend={15}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Calendar}
            title="Ce Mois"
            value={stats.thisMonth}
            description="Nouvelles candidatures"
            trend={-5}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Taux de Réponse"
            value={`${stats.responseRate}%`}
            description="Réponses reçues"
            trend={12}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={User}
            title="Entretiens"
            value={stats.interviews}
            description="Obtenus"
            trend={25}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition par Statut</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <config.icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold">{config.count}</div>
                  <div className="text-sm text-gray-600">{config.label}</div>
                  <Progress 
                    value={applications.length > 0 ? (config.count / applications.length) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par entreprise ou poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 min-w-[150px]"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} ({config.count})
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres avancés
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Content */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Toutes ({applications.length})
            </TabsTrigger>
            {Object.entries(statusConfig).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <config.icon className="h-4 w-4" />
                {config.label} ({config.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={statusFilter} className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  {applications.length === 0 ? (
                    <>
                      <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucune candidature
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Commencez votre recherche d'emploi en ajoutant votre première candidature
                      </p>
                      <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une candidature
                      </Button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun résultat
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Aucune candidature ne correspond à vos critères de recherche
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredApplications.map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(newApplication) => {
            dispatch(addApplication(newApplication));
            setIsModalOpen(false);
          }}
        />

        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            isOpen={!!selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdate={(updatedApplication) => {
              // Handle update logic here
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Applications;
