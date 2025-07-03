
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  Star,
  BookmarkPlus,
  ExternalLink,
  TrendingUp,
  Users,
  Building2,
  Zap,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobsStart, fetchJobsSuccess, fetchJobsFailure } from '../store/slices/jobsSlice';
import { SupabaseService } from '../services/supabaseService';
import JobCard from '../components/Jobs/JobCard';
import JobDetailsModal from '../components/Jobs/JobDetailsModal';

const Jobs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    remote: false,
    partTime: false,
    fullTime: false,
    contract: false
  });

  const jobStats = {
    total: jobs.length,
    newToday: jobs.filter(job => {
      const today = new Date();
      const jobDate = new Date(job.posted_date);
      return jobDate.toDateString() === today.toDateString();
    }).length,
    trending: Math.floor(jobs.length * 0.15),
    matched: Math.floor(jobs.length * 0.3)
  };

  useEffect(() => {
    const loadJobs = async () => {
      dispatch(fetchJobsStart());
      try {
        // Charger les offres d'emploi avec plus d'options
        const data = await SupabaseService.getJobs({
          limit: 100 // Limiter le nombre d'offres chargées
        });
        dispatch(fetchJobsSuccess(data));
        
        // Charger les emplois sauvegardés si utilisateur connecté
        if (user?.id) {
          const savedJobIds = await SupabaseService.getSavedJobs(user.id);
          // Marquer les emplois sauvegardés
          const jobsWithSavedStatus = data.map(job => ({
            ...job,
            saved: savedJobIds.includes(job.id)
          }));
          dispatch(fetchJobsSuccess(jobsWithSavedStatus));
        }
      } catch (err: any) {
        dispatch(fetchJobsFailure(err.message || 'Erreur lors du chargement des offres'));
      }
    };

    loadJobs();
  }, [dispatch, user?.id]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !selectedLocation || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = !selectedType || job.type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const toggleSaveJob = async (jobId: string) => {
    if (!user?.id) return;
    
    try {
      const isCurrentlySaved = savedJobs.includes(jobId);
      
      if (isCurrentlySaved) {
        await SupabaseService.unsaveJob(user.id, jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await SupabaseService.saveJob(user.id, jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
      
      // Mettre à jour le store Redux
      if (isCurrentlySaved) {
        dispatch(unsaveJob(jobId));
      } else {
        dispatch(saveJob(jobId));
      }
    } catch (error) {
      console.error('Error toggling job save status:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, color }: any) => (
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
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-sm text-gray-500">{title}</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
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
            Opportunités d'Emploi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez des milliers d'offres d'emploi adaptées à votre profil et construisez votre carrière
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Briefcase}
            title="Offres Disponibles"
            value={jobStats.total}
            description="Total des opportunités"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Zap}
            title="Nouvelles Aujourd'hui"
            value={jobStats.newToday}
            description="Fraîchement publiées"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Tendances"
            value={jobStats.trending}
            description="Postes populaires"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Target}
            title="Correspondances"
            value={jobStats.matched}
            description="Adaptées à votre profil"
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, entreprise ou mots-clés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-w-[150px]"
                  >
                    <option value="">Toutes les villes</option>
                    <option value="Paris">Paris</option>
                    <option value="Lyon">Lyon</option>
                    <option value="Marseille">Marseille</option>
                    <option value="Remote">Télétravail</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 min-w-[150px]"
                  >
                    <option value="">Tous les types</option>
                    <option value="full-time">Temps plein</option>
                    <option value="part-time">Temps partiel</option>
                    <option value="contract">Contrat</option>
                    <option value="internship">Stage</option>
                  </select>
                </div>

                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres avancés
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'Python', 'Remote', 'Junior', 'Senior'].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-200"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Toutes ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recommandées
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Récentes
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Sauvegardées ({savedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">Erreur: {error}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <Card className="h-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border-0 group-hover:border-blue-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600">
                                {job.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveJob(job.id);
                              }}
                              className="shrink-0"
                            >
                              <Star className={`h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary || 'Non spécifié'}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {job.skills?.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(job.posted_date).toLocaleDateString('fr-FR')}
                            </div>
                            <Badge 
                              className={`text-xs ${
                                job.type === 'full-time' ? 'bg-green-100 text-green-800' :
                                job.type === 'part-time' ? 'bg-blue-100 text-blue-800' :
                                job.type === 'contract' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune offre trouvée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Essayez de modifier vos critères de recherche
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommended">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Recommandations Personnalisées</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complétez votre profil pour recevoir des recommandations d'emploi personnalisées
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs
                .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
                .slice(0, 9)
                .map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <JobCard 
                      job={job} 
                      isSaved={savedJobs.includes(job.id)}
                      onToggleSave={() => toggleSaveJob(job.id)}
                      onClick={() => setSelectedJob(job)}
                    />
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            {savedJobs.length === 0 ? (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <BookmarkPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune offre sauvegardée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sauvegardez des offres d'emploi pour les retrouver facilement
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs
                  .filter(job => savedJobs.includes(job.id))
                  .map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <JobCard 
                        job={job} 
                        isSaved={true}
                        onToggleSave={() => toggleSaveJob(job.id)}
                        onClick={() => setSelectedJob(job)}
                      />
                    </motion.div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Job Details Modal */}
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default Jobs;
