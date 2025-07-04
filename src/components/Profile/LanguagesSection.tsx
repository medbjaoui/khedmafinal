import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../../store/slices/profileSlice';
import { Plus, Globe } from 'lucide-react';

interface LanguagesSectionProps {
  languages: Language[];
  onAdd: () => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages, onAdd }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Langues</h3>
        <button
          onClick={onAdd}
          className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {(languages?.length || 0) > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {languages?.map((language, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">{language.name}</p>
              <p className="text-sm text-gray-600">{language.level}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <Globe className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune langue</h3>
          <p className="mt-1 text-sm text-gray-500">Ajoutez les langues que vous maîtrisez.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter une langue
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LanguagesSection;
