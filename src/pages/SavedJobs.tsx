import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bookmark, 
  Search, 
  MapPin, 
  ExternalLink,
  Send,
  Trash2,
  Eye,
  Star,
  Building,
  Clock,
  DollarSign,
  MoreVertical
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { unsaveJob, fetchJobsStart, fetchSavedJobsSuccess } from '../store/slices/jobsSlice';
import { SupabaseService } from '../services/supabaseService';

const SavedJobs: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const { savedJobs } = useAppSelector(state => state.jobs);
  const { applications } = useAppSelector(state => state.applications);
  const { user } = useAppSelector(state => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'CDI' | 'CDD' | 'Stage' | 'Freelance'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'match' | 'company'>('date');

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user?.id) return;
      dispatch(fetchJobsStart());
      try {
        const data = await SupabaseService.getSavedJobs(user.id);
        dispatch(fetchSavedJobsSuccess(data || []));
      } catch (error: unknown) {
        console.error("Error fetching saved jobs:", error);
      }
    };

    fetchSavedJobs();
  }, [dispatch, user?.id]);

  // Filter and sort saved jobs
  
    const filteredJobs = savedJobs
    .filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || job.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'date':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });

  const handleUnsaveJob = async (jobId: string) => {
    if (!user?.id) return;
    try {
      await SupabaseService.unsaveJob(user.id, jobId);
      dispatch(unsaveJob(jobId));
    } catch (error: any) {
      console.error("Error unsaving job:", error);
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-green-100 text-green-800';
      case 'CDD': return 'bg-blue-100 text-blue-800';
      case 'Stage': return 'bg-purple-100 text-purple-800';
      case 'Freelance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Offres sauvegardées
        </h1>
        <p className="text-gray-600">
          Retrouvez toutes les offres d'emploi que vous avez sauvegardées ({savedJobs.length} offres)
        </p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'CDI' | 'CDD' | 'Stage' | 'Freelance')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'match' | 'company')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date de publication</option>
            <option value="match">Score de correspondance</option>
            <option value="company">Entreprise</option>
          </select>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all p-6 relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Job Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeAgo(job.postedDate)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                    {job.type}
                  </span>
                  {job.matchScore && (
                    <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium text-yellow-700">{job.matchScore}% match</span>
                    </div>
                  )}
                </div>

                {job.salary && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">{job.salary}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.slice(0, 3).map((req, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {req}
                  </span>
                ))}
                {job.requirements.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{job.requirements.length - 3} autres
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <ExternalLink className="h-4 w-4" />
                  <span>{job.source}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUnsaveJob(job.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {hasApplied(job.id) ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
                      <Send className="h-3 w-3" />
                      <span>Candidature envoyée</span>
                    </span>
                  ) : (
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1">
                      <Send className="h-3 w-3" />
                      <span>Postuler</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-white rounded-lg border border-gray-200"
        >
          <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {savedJobs.length === 0 ? 'Aucune offre sauvegardée' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-600 mb-4">
            {savedJobs.length === 0 
              ? 'Commencez par sauvegarder des offres qui vous intéressent'
              : 'Aucune offre ne correspond à vos critères de recherche'
            }
          </p>
          {savedJobs.length === 0 && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Découvrir les offres
            </button>
          )}
        </motion.div>
      )}

      {/* Tips */}
      {savedJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Bookmark className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Conseils pour vos offres sauvegardées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-1">Organisez vos favoris</p>
                  <p>Triez par score de correspondance pour prioriser vos candidatures</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Candidatez rapidement</p>
                  <p>Les meilleures offres partent vite, ne tardez pas à postuler</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Suivez les entreprises</p>
                  <p>Recherchez d'autres offres chez les entreprises qui vous intéressent</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Préparez vos candidatures</p>
                  <p>Adaptez votre CV et lettre de motivation pour chaque offre</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SavedJobs;