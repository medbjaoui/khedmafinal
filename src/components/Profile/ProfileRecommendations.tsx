import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  X, 
  ArrowRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { markRecommendationCompleted, dismissRecommendation } from '../../store/slices/profileSlice';

const ProfileRecommendations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { recommendations } = useAppSelector(state => state.profile);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium': return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Lightbulb className="h-5 w-5 text-blue-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing_info': return <AlertCircle className="h-4 w-4" />;
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'formatting': return <FileText className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const activeRecommendations = recommendations.filter(rec => !rec.completed);
  const completedRecommendations = recommendations.filter(rec => rec.completed);

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
      >
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Excellent travail !
        </h3>
        <p className="text-gray-600">
          Votre profil est optimisé. Nous générerons de nouvelles recommandations au fur et à mesure.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Recommendations */}
      {activeRecommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recommandations ({activeRecommendations.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Priorité haute</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Moyenne</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Faible</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {activeRecommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getPriorityIcon(recommendation.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {recommendation.title}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-60">
                            {getTypeIcon(recommendation.type)}
                            <span className="ml-1 capitalize">{recommendation.category}</span>
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <ArrowRight className="h-4 w-4" />
                            <span>{recommendation.action}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => dispatch(markRecommendationCompleted(recommendation.id))}
                              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Terminé
                            </button>
                            <button
                              onClick={() => dispatch(dismissRecommendation(recommendation.id))}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Recommendations */}
      {completedRecommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Recommandations terminées ({completedRecommendations.length})</span>
          </h3>
          
          <div className="space-y-3">
            {completedRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-green-700">
                      {recommendation.description}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(dismissRecommendation(recommendation.id))}
                    className="text-green-400 hover:text-green-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Conseils pour optimiser votre profil
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mettez à jour régulièrement vos expériences et compétences</li>
              <li>• Utilisez des mots-clés pertinents pour votre secteur</li>
              <li>• Quantifiez vos réalisations avec des chiffres concrets</li>
              <li>• Maintenez un profil LinkedIn actif et cohérent</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileRecommendations;