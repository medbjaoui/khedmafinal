import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchJobsStart, fetchJobsSuccess, fetchJobsFailure, updateFilters } from '../store/slices/jobsSlice';
import { Job } from '../store/slices/jobsSlice';
import { SupabaseService } from '../services/supabaseService';
import JobCard from '../components/Jobs/JobCard';
import JobDetailsModal from '../components/Jobs/JobDetailsModal';
import ApplicationModal from '../components/Applications/ApplicationModal';

const Jobs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading, filters } = useAppSelector(state => state.jobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [jobToApply, setJobToApply] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      dispatch(fetchJobsStart());
      try {
        const jobsData = await SupabaseService.getJobs();
        dispatch(fetchJobsSuccess(jobsData));
      } catch (error: any) {
        dispatch(fetchJobsFailure(error.message));
      }
    };

    fetchJobs();
  }, [dispatch]);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleApplyToJob = (job: Job) => {
    setJobToApply(job);
    setShowApplicationModal(true);
    setShowJobDetails(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || job.type === filters.type;
    const matchesKeywords = !filters.keywords || 
      job.title.toLowerCase().includes(filters.keywords.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.keywords.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(filters.keywords.toLowerCase()));
    
    return matchesLocation && matchesType && matchesKeywords;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Offres d'emploi en Tunisie
        </h1>
        <p className="text-gray-600">
          Découvrez {jobs.length} opportunités correspondant à votre profil
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Mots-clés..."
              value={filters.keywords}
              onChange={(e) => handleFilterChange('keywords', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Toutes les villes</option>
              <option value="Tunis">Tunis</option>
              <option value="Sfax">Sfax</option>
              <option value="Sousse">Sousse</option>
              <option value="Monastir">Monastir</option>
              <option value="Nabeul">Nabeul</option>
            </select>
          </div>

          {/* Job Type */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          {/* Salary */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filters.salary}
              onChange={(e) => handleFilterChange('salary', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Tous les salaires</option>
              <option value="1000-2000">1000 - 2000 TND</option>
              <option value="2000-3000">2000 - 3000 TND</option>
              <option value="3000-5000">3000 - 5000 TND</option>
              <option value="5000+">5000+ TND</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
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
            >
              <JobCard
                job={job}
                onClick={() => handleJobClick(job)}
                onApply={handleApplyToJob}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Aucune offre ne correspond à vos critères</p>
          <button 
            onClick={() => dispatch(updateFilters({ keywords: '', location: '', type: '', salary: '' }))}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <JobDetailsModal
          isOpen={showJobDetails}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onApply={handleApplyToJob}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && jobToApply && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setJobToApply(null);
          }}
          job={jobToApply}
        />
      )}
    </div>
  );
};

export default Jobs;