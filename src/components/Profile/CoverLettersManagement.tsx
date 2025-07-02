import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Trash2, AlertCircle, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Application } from '../../store/slices/applicationsSlice';
import { SupabaseService } from '../../services/supabaseService';
import { startApplicationProcess, setApplications } from '../../store/slices/applicationsSlice';

const CoverLettersManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { applications, loading, error } = useAppSelector(state => state.applications);
  const [selectedLetter, setSelectedLetter] = useState<Application | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;
      dispatch(startApplicationProcess());
      try {
        const userApplications = await SupabaseService.getUserApplications(user.id);
        dispatch(setApplications(userApplications));
      } catch (err: any) {
        console.error('Failed to fetch applications:', err);
        // Note: setApplications handles loading state, so we don't need a separate failure action
      }
    };
    loadApplications();
  }, [dispatch, user?.id]);

  const handleDownloadLetter = async (application: Application) => {
    if (!application.coverLetterFilePath) return;
    try {
      const publicUrl = await SupabaseService.getFileUrl('cover_letters', application.coverLetterFilePath);
      window.open(publicUrl, '_blank');
    } catch (err) {
      console.error('Error downloading cover letter:', err);
      alert('Erreur lors du téléchargement de la lettre de motivation.');
    }
  };

  const handleDeleteLetter = async (application: Application) => {
    if (!application.coverLetterFilePath) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette lettre de motivation ?')) {
      try {
        await SupabaseService.deleteFile('cover_letters', application.coverLetterFilePath);
        // Optionally, update the application in DB to clear coverLetterFilePath
        await SupabaseService.updateApplication(application.id, { coverLetterFilePath: undefined });
        // Refresh applications
        if (user?.id) {
          const userApplications = await SupabaseService.getUserApplications(user.id);
          dispatch(setApplications(userApplications));
        }
        alert('Lettre de motivation supprimée avec succès.');
      } catch (err) {
        console.error('Error deleting cover letter:', err);
        alert('Erreur lors de la suppression de la lettre de motivation.');
      }
    }
  };

  const letters = applications.filter(app => app.coverLetter || app.coverLetterFilePath);

  if (loading) {
    return <div className="text-center py-8">Chargement des lettres de motivation...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center space-x-3">
        <AlertCircle className="h-5 w-5" />
        <span>Erreur: {error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes Lettres de Motivation</h3>

      {letters.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucune lettre de motivation trouvée.</p>
          <p className="text-gray-600 text-sm mt-1">Générez-en une lors de l'envoi d'une candidature.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Lettre pour {app.jobTitle} chez {app.company}</p>
                <p className="text-sm text-gray-600">Envoyée le: {new Date(app.appliedDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                {app.coverLetter && (
                  <button
                    onClick={() => setSelectedLetter(app)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Voir la lettre"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                )}
                {app.coverLetterFilePath && (
                  <button
                    onClick={() => handleDownloadLetter(app)}
                    className="p-2 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                    title="Télécharger le fichier"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                {app.coverLetterFilePath && (
                  <button
                    onClick={() => handleDeleteLetter(app)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer le fichier"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Lettre de motivation pour {selectedLetter.jobTitle}</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedLetter.coverLetter}</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CoverLettersManagement;
