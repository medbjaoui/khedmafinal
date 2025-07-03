import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Star, CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { clearCV } from '../store/slices/cvSlice';
import { CVService } from '../services/cvService';
import CVUpload from '../components/CV/CVUpload';

const CVAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const { current, loading } = useAppSelector(state => state.cv);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const handleDownloadReport = async () => {
    if (!current) return;
    
    setDownloadingReport(true);
    try {
      const reportContent = await CVService.generateAnalysisReport(current);
      const fileName = `rapport_analyse_${current.fileName.replace(/\.[^/.]+$/, "")}_${new Date().toISOString().split('T')[0]}.txt`;
      CVService.downloadReport(reportContent, fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleNewAnalysis = () => {
    dispatch(clearCV());
  };

  const calculateDetailedScores = () => {
    if (!current) return { content: 75, format: 80, keywords: 70, readability: 85 };
    
    // Utiliser les scores réels de l'analyse CV si disponibles
    const analysisData = current.analysisData;
    if (analysisData && analysisData.detailedScores) {
      return {
        content: analysisData.detailedScores.content || 75,
        format: analysisData.detailedScores.format || 80,
        keywords: analysisData.detailedScores.keywords || 70,
        readability: analysisData.detailedScores.readability || 85
      };
    }

    // Calcul basé sur les données disponibles du CV
    const baseScore = current.score || 75;
    
    // Score de contenu basé sur la présence d'informations
    const contentScore = Math.min(
      (current.strengths?.length || 0) * 15 + 
      (current.skills?.length || 0) * 2 + 
      (current.summary ? 20 : 0), 
      100
    );
    
    // Score de format basé sur la structure
    const formatScore = Math.min(baseScore + 10, 100);
    
    // Score de mots-clés basé sur les compétences identifiées
    const keywordsScore = Math.min((current.skills?.length || 0) * 5, 100);
    
    // Score de lisibilité basé sur le score global
    const readabilityScore = Math.min(baseScore + 5, 100);

    return {
      content: Math.round(contentScore),
      format: Math.round(formatScore),
      keywords: Math.round(keywordsScore),
      readability: Math.round(readabilityScore)
    };
  };

  if (!current && !loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analyse de CV par IA
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les forces de votre CV et obtenez des recommandations personnalisées 
            pour maximiser vos chances de décrocher l'emploi de vos rêves.
          </p>
        </div>
        <CVUpload />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{current?.fileName}</h1>
              <p className="text-gray-600">
                Analysé le {new Date(current?.uploadDate || '').toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{current?.score}/100</span>
            </div>
            <p className="text-sm text-gray-600">Score global</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            Évaluation détaillée
          </h2>
          
          <div className="space-y-4">
            {(() => {
              const scores = calculateDetailedScores();
              return (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Contenu</span>
                      <span className="text-sm font-medium">{Math.round(scores.content)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${scores.content >= 80 ? 'bg-green-600' : scores.content >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${scores.content}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Format</span>
                      <span className="text-sm font-medium">{Math.round(scores.format)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${scores.format >= 80 ? 'bg-green-600' : scores.format >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${scores.format}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Mots-clés</span>
                      <span className="text-sm font-medium">{Math.round(scores.keywords)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${scores.keywords >= 80 ? 'bg-green-600' : scores.keywords >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${scores.keywords}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Lisibilité</span>
                      <span className="text-sm font-medium">{Math.round(scores.readability)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${scores.readability >= 80 ? 'bg-green-600' : scores.readability >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${scores.readability}%` }} />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Points forts
          </h2>
          
          <div className="space-y-3">
            {current?.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{strength}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            Recommandations
          </h2>
          
          <div className="space-y-3">
            {current?.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compétences identifiées
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {current?.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Résumé de l'analyse
          </h2>
          
          <p className="text-gray-700 leading-relaxed">
            {current?.summary}
          </p>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center space-x-4"
      >
        <button 
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {downloadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Génération...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Télécharger le rapport</span>
            </>
          )}
        </button>
        <button 
          onClick={handleNewAnalysis}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Analyser un nouveau CV</span>
        </button>
      </motion.div>
    </div>
  );
};

export default CVAnalysis;