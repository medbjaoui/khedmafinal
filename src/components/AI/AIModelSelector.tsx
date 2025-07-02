import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Zap, 
  Brain, 
  Settings, 
  Key, 
  CheckCircle, 
  Info
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setCurrentModel, updateSettings } from '../../store/slices/aiSlice';
import { AIModel } from '../../services/aiService';

interface AIModelSelectorProps {
  onModelChange?: (model: AIModel) => void;
  showSettings?: boolean;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({ 
  onModelChange, 
  showSettings = false 
}) => {
  const dispatch = useAppDispatch();
  const { currentModel, availableModels, settings, usage } = useAppSelector(state => state.ai);
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'Admin';

  // Si l'utilisateur n'est pas admin, ne pas afficher le composant
  if (!isAdmin) {
    return null;
  }

  const handleModelChange = (modelId: AIModel) => {
    dispatch(setCurrentModel(modelId));
    onModelChange?.(modelId);
  };

  const handleSettingsUpdate = (key: string, value: string) => {
    dispatch(updateSettings({ [key]: value }));
  };

  const getModelIcon = (modelId: AIModel) => {
    switch (modelId) {
      case 'groq-llama': return <Zap className="h-5 w-5" />;
      case 'gemini-2.0-flash': return <Brain className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  const getModelColor = (modelId: AIModel) => {
    switch (modelId) {
      case 'groq-llama': return 'border-orange-200 bg-orange-50 text-orange-700';
      case 'gemini-2.0-flash': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <Bot className="h-4 w-4" />
          <span>Modèle IA</span>
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {availableModels.map((model) => (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => model.enabled && handleModelChange(model.id)}
              disabled={!model.enabled}
              className={`p-3 border-2 rounded-lg transition-all text-left ${
                currentModel === model.id
                  ? `${getModelColor(model.id)} border-opacity-100`
                  : model.enabled
                  ? 'border-gray-200 hover:border-gray-300 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    currentModel === model.id ? 'bg-white bg-opacity-50' : 'bg-gray-100'
                  }`}>
                    {getModelIcon(model.id)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                    {model.requiresApiKey && !model.enabled && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-amber-600">
                        <Key className="h-3 w-3" />
                        <span>Clé API requise</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentModel === model.id && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {model.enabled ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Utilisation</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Requêtes</p>
            <p className="font-semibold text-gray-900">{usage.totalRequests}</p>
          </div>
          <div>
            <p className="text-gray-600">Tokens</p>
            <p className="font-semibold text-gray-900">{usage.totalTokens.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* API Settings */}
      {showSettings && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration API</span>
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clé API Groq
              </label>
              <input
                type="password"
                value={settings.groqApiKey}
                onChange={(e) => handleSettingsUpdate('groqApiKey', e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clé API Gemini
              </label>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => handleSettingsUpdate('geminiApiKey', e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Obtenir vos clés API :</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Groq :</strong> console.groq.com</li>
                  <li>• <strong>Gemini :</strong> makersuite.google.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModelSelector;