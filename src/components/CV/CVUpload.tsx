import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { uploadCVStart, uploadCVSuccess, uploadCVFailure } from '../../store/slices/cvSlice';
import { UserProfile, setProfile } from '../../store/slices/profileSlice';

import { CVService } from '../../services/cvService';

const CVUpload: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [analysisResults, setAnalysisResults] = useState<{
    profile: UserProfile;
    analysis: any;
    file: File;
  } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file || !currentUser?.id) return;

    setUploading(true);
    dispatch(uploadCVStart());

    try {
      console.log('Starting CV analysis for file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Only extract and analyze, don't update profile yet
      const { profile, analysis } = await CVService.extractAndAnalyzeCV(file);
      
      console.log('Analysis completed successfully');
      console.log('Extracted profile:', profile);
      console.log('Analysis results:', analysis);
      
      // Store results for user review
      setAnalysisResults({ profile, analysis, file });
      
      // Update CV slice with analysis results
      const analysisData = analysis as any;
      dispatch(uploadCVSuccess({
        id: `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        strengths: analysisData.recommendations?.filter((rec: any) => rec.category === 'profile').map((rec: any) => rec.title) || [],
        skills: profile.skills.map((s: any) => s.name),
        recommendations: analysisData.recommendations?.map((rec: any) => rec.title) || [],
        score: profile.completionScore,
        summary: profile.summary,
      }));
    } catch (error: any) {
      console.error('CV upload and analysis failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      dispatch(uploadCVFailure(error.message || 'Failed to upload and analyze CV.'));
    } finally {
      setUploading(false);
    }
  }, [dispatch, currentUser?.id]);

  const handleAcceptProfile = async () => {
    if (!analysisResults || !currentUser?.id) return;
    
    try {
      // Now update the profile with the analyzed data
      const { profile: updatedProfile } = await CVService.updateProfileWithCVData(currentUser.id, analysisResults.profile, analysisResults.file);
      setAnalysisResults(null);
      
      // Update the profile in Redux store
      dispatch(setProfile(updatedProfile));
      
      // Show success message
      setSuccessMessage('Profil mis à jour avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleRejectProfile = () => {
    setAnalysisResults(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

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
                  <p className="text-gray-900">{analysisResults.profile.skills.map(s => s.name).join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Score de complétude</label>
                  <p className="text-gray-900">{analysisResults.profile.completionScore}%</p>
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

  return (
    <div className="max-w-2xl mx-auto">
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
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analyse en cours...</h3>
              <p className="text-gray-600">Notre IA analyse votre CV</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Glissez votre CV ici
              </h3>
              <p className="text-gray-600">
                ou cliquez pour sélectionner un fichier
              </p>
            </div>
            <div className="flex justify-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Choisir un fichier
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Formats acceptés: PDF, DOC, DOCX, TXT (max 5MB)
            </p>
          </div>
        )}
      </motion.div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Analyse instantanée</h4>
          <p className="text-sm text-gray-600">
            Obtenez une analyse complète en quelques secondes
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Recommandations IA</h4>
          <p className="text-sm text-gray-600">
            Des conseils personnalisés pour améliorer votre CV
          </p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Score de compatibilité</h4>
          <p className="text-sm text-gray-600">
            Découvrez votre match avec les offres d'emploi
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVUpload;