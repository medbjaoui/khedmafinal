import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Calendar,
  ExternalLink,
  Bookmark,
  Send,
  Star,
  Users,
  Briefcase,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Job } from '../../store/slices/jobsSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { saveJob, unsaveJob } from '../../store/slices/jobsSlice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onApply: (job: Job) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job,
  onApply
}) => {
  const dispatch = useAppDispatch();
  const { applications } = useAppSelector(state => state.applications);
  const [activeTab, setActiveTab] = useState<'description' | 'company' | 'requirements'>('description');

  const hasApplied = applications.some(app => app.jobId === job.id);

  const handleSaveToggle = () => {
    if (job.saved) {
      dispatch(unsaveJob(job.id));
    } else {
      dispatch(saveJob(job.id));
    }
  };

  const handleApply = () => {
    onApply(job);
    onClose();
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {job.company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <p className="text-blue-100">{job.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{timeAgo(job.postedDate)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)} text-gray-800`}>
                      {job.type}
                    </span>
                    {job.matchScore && (
                      <div className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-yellow-100 font-medium">{job.matchScore}% match</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'description', label: 'Description', icon: FileText },
                  { id: 'company', label: 'Entreprise', icon: Building },
                  { id: 'requirements', label: 'Exigences', icon: CheckCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description du poste</h3>
                    <p className="text-gray-700 leading-relaxed">{job.description}</p>
                  </div>

                  {job.salary && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">Rémunération</span>
                      </div>
                      <p className="text-green-800 mt-1">{job.salary}</p>
                    </div>
                  )}

                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Avantages</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {job.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos de {job.company}</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{job.company}</h4>
                          <p className="text-gray-600">Entreprise technologique</p>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {job.company} est une entreprise innovante spécialisée dans le développement de solutions technologiques. 
                        Nous accompagnons nos clients dans leur transformation digitale avec une équipe d'experts passionnés.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Taille</span>
                      </div>
                      <p className="text-gray-700">50-200 employés</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Briefcase className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Secteur</span>
                      </div>
                      <p className="text-gray-700">Technologies</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Compétences requises</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Profil recherché</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">Diplôme en informatique ou équivalent</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">3+ années d'expérience dans le domaine</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">Excellentes compétences en communication</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">Capacité à travailler en équipe</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ExternalLink className="h-4 w-4" />
                <span>Source: {job.source}</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    job.saved
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${job.saved ? 'fill-current' : ''}`} />
                  <span>{job.saved ? 'Sauvegardé' : 'Sauvegarder'}</span>
                </button>
                
                {hasApplied ? (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Candidature envoyée</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Postuler maintenant</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailsModal;