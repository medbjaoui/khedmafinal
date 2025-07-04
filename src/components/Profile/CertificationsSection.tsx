import React from 'react';
import { motion } from 'framer-motion';
import { Certification } from '../../store/slices/profileSlice';
import { Plus, Award, Calendar, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, onAdd, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        <button
          onClick={onAdd}
          className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {(certifications?.length || 0) > 0 ? (
        <div className="space-y-6">
          {certifications?.map((cert) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{cert.name}</h4>
                  <p className="text-blue-600 font-medium">{cert.issuer}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Délivrée le {format(new Date(cert.issueDate), 'MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onEdit(cert.id)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                  Voir la certification
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <Award className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune certification</h3>
          <p className="mt-1 text-sm text-gray-500">Ajoutez vos certifications pour renforcer votre crédibilité.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Ajouter une certification
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificationsSection;
