
  import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Filter,
  Search,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { Application, updateFilters, clearFilters, deleteApplication, startApplicationProcess, setApplications, addTemplate } from '../store/slices/applicationsSlice';
import ApplicationCard from '../components/Applications/ApplicationCard';
import ApplicationDetailsModal from '../components/Applications/ApplicationDetailsModal';
import ApplicationStats from '../components/Applications/ApplicationStats';
import { SupabaseService } from '../services/supabaseService';
import { TemplateService } from '../services/templateService';

const Applications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applications, filters, loading } = useAppSelector(state => state.applications);
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { id: 'list', label: 'Mes candidatures', icon: Send },
    { id: 'stats', label: 'Statistiques', icon: Filter },
  ];

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    dispatch(startApplicationProcess());
    try {
      const data = await SupabaseService.getUserApplications(user.id);
      dispatch(setApplications(data));
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      // Note: setApplications handles loading state, so we don't need a separate failure action
    }
  }, [dispatch, user?.id]);

  const initializeTemplates = useCallback(async () => {
    if (!user?.id) return;
    try {
      const templates = await TemplateService.initializeDefaultTemplates(user.id);
      templates.forEach(template => {
        dispatch(addTemplate(template));
      });
    } catch (error: any) {
      console.error('Failed to initialize templates:', error);
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    fetchApplications();
    initializeTemplates();
  }, [fetchApplications, initializeTemplates]);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleDeleteApplication = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        await SupabaseService.deleteApplication(id);
        dispatch(deleteApplication(id));
      } catch (error: any) {
        console.error("Error deleting application:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  const handleEditApplication = (application: Application) => {
    setSelectedApplication(application);
    // Open edit modal (to be implemented)
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesType = !filters.type || app.type === filters.type;
    const matchesCompany = !filters.company || 
      app.company.toLowerCase().includes(filters.company.toLowerCase());
    
    let matchesDateRange = true;
    if (filters.dateRange) {
      const appDate = new Date(app.appliedDate);
      
      switch (filters.dateRange) {
        case 'week': {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDateRange = appDate >= weekAgo;
          break;
        }
        case 'month': {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDateRange = appDate >= monthAgo;
          break;
        }
        case '3months': {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          matchesDateRange = appDate >= threeMonthsAgo;
          break;
        }
      }
    }
    
    return matchesStatus && matchesType && matchesCompany && matchesDateRange;
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
          Mes Candidatures
        </h1>
        <p className="text-gray-600">
          Suivez et gérez toutes vos candidatures en un seul endroit
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-1"
      >
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'list' | 'stats')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'stats' && <ApplicationStats />}
        
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Filtres ({filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''})
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>{showFilters ? 'Masquer' : 'Afficher'} les filtres</span>
                </button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="draft">Brouillon</option>
                      <option value="sent">Envoyée</option>
                      <option value="viewed">Vue</option>
                      <option value="interview">Entretien</option>
                      <option value="rejected">Refusée</option>
                      <option value="accepted">Acceptée</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous les types</option>
                      <option value="manual">Manuelle</option>
                      <option value="automatic">Automatique</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes les périodes</option>
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="3months">3 derniers mois</option>
                    </select>
                  </div>

                  {/* Company Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={filters.company}
                        onChange={(e) => handleFilterChange('company', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {(filters.status || filters.type || filters.dateRange || filters.company) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredApplications.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <ApplicationCard
                      application={application}
                      onEdit={handleEditApplication}
                      onDelete={handleDeleteApplication}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {applications.length === 0 ? 'Aucune candidature' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {applications.length === 0 
                    ? 'Vous n\'avez pas encore envoyé de candidature'
                    : 'Aucune candidature ne correspond à vos critères'
                  }
                </p>
                {applications.length === 0 && (
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Découvrir les offres
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
        />
      )}
    </div>
  );
};

export default Applications;