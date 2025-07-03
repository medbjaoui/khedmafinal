import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { startCVExtraction, updateExtractionProgress, cvExtractionSuccess, cvExtractionFailure, setProfile } from '../../store/slices/profileSlice';
import { CVService } from '../../services/cvService';
import { SupabaseService } from '../../services/supabaseService';
import { useNavigate } from 'react-router-dom';

const CVUploadZone: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { extractionLoading, extractionProgress, extractionError } = useAppSelector(state => state.profile);
  const [dragOver, setDragOver] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [analysisResults, setAnalysisResults] = useState<{
    profile: any;
    analysis: any;
    file: File;
  } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      processFile(file);
    }
  }, []);

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Format non supporté. Veuillez utiliser PDF ou DOCX.');
      return false;
    }

    if (file.size > maxSize) {
      alert('Fichier trop volumineux. Maximum 5MB.');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!user) {
      dispatch(cvExtractionFailure('Utilisateur non authentifié.'));
      return;
    }

    dispatch(startCVExtraction());
    
    try {
      // Use CVService to extract and analyze CV
      const { profile, analysis } = await CVService.extractAndAnalyzeCV(file);
      
      // Store results for user review instead of automatically updating
      setAnalysisResults({ profile, analysis, file });
      
      dispatch(updateExtractionProgress(100));
    } catch (error) {
      dispatch(cvExtractionFailure(error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleAcceptProfile = async () => {
    if (!analysisResults || !user?.id) return;
    
    try {
      console.log('Starting profile update process...');
      console.log('User ID:', user.id);
      console.log('Analysis results:', analysisResults);
      
      // Show loading state
      dispatch(startCVExtraction());
      
      console.log('Calling CVService.updateProfileWithCVData...');
      // Update the profile with the analyzed data and upload CV to storage
      const updatedProfile = await CVService.updateProfileWithCVData(user.id, analysisResults.profile, analysisResults.file);
      console.log('CVService.updateProfileWithCVData completed');
      console.log('Updated profile:', updatedProfile);
      
      setAnalysisResults(null);
      
      console.log('Dispatching setProfile...');
      // Update the profile in Redux store
      dispatch(setProfile(updatedProfile));
      console.log('setProfile dispatched successfully');
      
      // Stop loading state by dispatching success with minimal data
      dispatch(cvExtractionSuccess({
        profile: updatedProfile,
        analysisResults: {
          extractedText: '',
          confidence: 100,
          detectedSections: [],
          processingTime: 0
        },
        recommendations: []
      }));
      
      // Show success message with CV URL
      const cvUrl = updatedProfile.cvFilePath;
      const cvFileName = updatedProfile.originalCVFileName;
      setSuccessMessage(`Profil et CV mis à jour avec succès ! CV sauvegardé: ${cvFileName} (${cvUrl ? 'URL générée' : 'Erreur URL'})`);
      setShowSuccess(true);
      
      // Reload profile from database to get the latest data
      if (user?.id) {
        try {
          const freshProfile = await SupabaseService.getUserProfile(user.id);
          if (freshProfile) {
            dispatch(setProfile(freshProfile));
          }
        } catch (error) {
          console.error('Error reloading profile:', error);
        }
      }
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/profile');
      }, 2000);
      
      console.log('Profile update process completed successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      dispatch(cvExtractionFailure(error.message || 'Erreur lors de la mise à jour du profil'));
    }
  };

  const handleRejectProfile = () => {
    setAnalysisResults(null);
  };

  const resetUpload = () => {
    dispatch(cvExtractionFailure(''));
  };

  // Show analysis results if available
  if (analysisResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Résultats de l'analyse du CV
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleRejectProfile}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Refuser
              </button>
              <button
                onClick={handleAcceptProfile}
                className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-2" />
                Accepter et mettre à jour le profil
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Données extraites du CV
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom complet</label>
                  <p className="text-gray-900">{analysisResults.profile.firstName} {analysisResults.profile.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{analysisResults.profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <p className="text-gray-900">{analysisResults.profile.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Localisation</label>
                  <p className="text-gray-900">{analysisResults.profile.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Titre</label>
                  <p className="text-gray-900">{analysisResults.profile.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Compétences</label>
                  <p className="text-gray-900">{analysisResults.profile.skills.map((s: any) => s.name).join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Score de complétude</label>
                  <p className="text-gray-900">{analysisResults.profile.completionScore}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fichier CV</label>
                  <p className="text-gray-900">{analysisResults.file.name}</p>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Analyse IA
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Points forts</label>
                  <ul className="text-sm text-gray-900 list-disc list-inside">
                    {(analysisResults.analysis as any).recommendations
                      ?.filter((rec: any) => rec.category === 'profile')
                      .slice(0, 3)
                      .map((rec: any, index: number) => (
                        <li key={index}>{rec.title}</li>
                      )) || []}
                  </ul>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Recommandations</label>
                  <ul className="text-sm text-gray-900 list-disc list-inside">
                    {(analysisResults.analysis as any).recommendations
                      ?.slice(0, 3)
                      .map((rec: any, index: number) => (
                        <li key={index}>{rec.title}</li>
                      )) || []}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> En acceptant, ces données seront automatiquement ajoutées à votre profil. 
              Vous pourrez les modifier ultérieurement dans les paramètres de votre profil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (extractionLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyse en cours...
            </h3>
            <p className="text-gray-600 mb-4">
              Notre IA analyse votre CV et extrait les informations
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                initial={{ width: 0 }}
                animate={{ width: `${extractionProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{extractionProgress}% terminé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${extractionProgress >= 30 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${extractionProgress >= 30 ? 'text-green-600' : 'text-gray-400'}`} />
              <p>Extraction du texte</p>
            </div>
            <div className={`p-3 rounded-lg ${extractionProgress >= 70 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${extractionProgress >= 70 ? 'text-green-600' : 'text-gray-400'}`} />
              <p>Analyse IA</p>
            </div>
            <div className={`p-3 rounded-lg ${extractionProgress >= 100 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${extractionProgress >= 100 ? 'text-green-600' : 'text-gray-400'}`} />
              <p>Génération du profil</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Importez votre CV
            </h3>
            <p className="text-gray-600 mb-4">
              Glissez votre CV ici ou cliquez pour sélectionner
            </p>
          </div>

          <div className="flex justify-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Choisir un fichier</span>
            </label>
          </div>

          <p className="text-sm text-gray-500">
            Formats acceptés: PDF, DOC, DOCX • Maximum 5MB
          </p>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {extractionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Erreur lors de l'analyse
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {extractionError}
                </p>
              </div>
              <button
                onClick={resetUpload}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Extraction automatique</h4>
          <p className="text-sm text-gray-600">
            IA avancée pour extraire toutes vos informations professionnelles
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Profil structuré</h4>
          <p className="text-sm text-gray-600">
            Création automatique d'un profil complet et organisé
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Recommandations IA</h4>
          <p className="text-sm text-gray-600">
            Conseils personnalisés pour optimiser votre profil
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVUploadZone;