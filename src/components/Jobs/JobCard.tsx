import React from 'react';
import { MapPin, Clock, Bookmark, ExternalLink, Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job } from '../../store/slices/jobsSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { saveJob, unsaveJob } from '../../store/slices/jobsSlice';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  onApply: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onApply }) => {
  const dispatch = useAppDispatch();
  const { applications } = useAppSelector(state => state.applications);

  const hasApplied = applications.some(app => app.jobId === job.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.saved) {
      dispatch(unsaveJob(job.id));
    } else {
      dispatch(saveJob(job.id));
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(job);
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

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">
              {job.company.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {job.matchScore && (
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">{job.matchScore}%</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveToggle}
            className={`p-2 rounded-full transition-colors ${
              job.saved 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${job.saved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{timeAgo(job.postedDate)}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
          {job.type}
        </span>
      </div>

      {job.salary && (
        <div className="mb-3">
          <span className="text-sm font-medium text-green-600">{job.salary}</span>
        </div>
      )}

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

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

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <ExternalLink className="h-4 w-4" />
          <span>{job.source}</span>
        </div>
        
        <div className="flex space-x-2">
          {hasApplied ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
              <Send className="h-4 w-4" />
              <span>Candidature envoyée</span>
            </span>
          ) : (
            <button 
              onClick={handleApply}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Send className="h-4 w-4" />
              <span>Postuler</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;