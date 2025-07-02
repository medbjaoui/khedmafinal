import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Mail, 
  FileText, 
  ExternalLink, 
  Download,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Building,
  User,
  Phone
} from 'lucide-react';
import { Application } from '../../store/slices/applicationsSlice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'sent': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'viewed': return <Eye className="h-5 w-5 text-yellow-500" />;
      case 'interview': return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'rejected': return <X className="h-5 w-5 text-red-500" />;
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'sent': return 'Candidature envoyée';
      case 'viewed': return 'Candidature vue';
      case 'interview': return 'Entretien programmé';
      case 'rejected': return 'Candidature refusée';
      case 'accepted': return 'Candidature acceptée';
      default: return 'En attente';
    }
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{application.jobTitle}</h2>
                  <p className="text-blue-100">{application.company}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Statut de la candidature</h3>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="font-medium">{getStatusLabel(application.status)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Date de candidature</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(application.appliedDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Type</p>
                        <p className="font-medium text-gray-900">
                          {application.type === 'automatic' ? '🤖 Automatique' : '👤 Manuelle'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Source</p>
                        <p className="font-medium text-gray-900">{application.source}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Email envoyé</p>
                        <p className="font-medium text-gray-900">
                          {application.emailSent ? '✅ Oui' : '❌ Non'}
                        </p>
                      </div>
                    </div>

                    {application.interviewDate && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-800">
                          <MessageSquare className="h-5 w-5" />
                          <span className="font-medium">Entretien programmé</span>
                        </div>
                        <p className="text-green-700 mt-1">
                          {format(new Date(application.interviewDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Lettre de motivation</h3>
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {application.coverLetter}
                      </pre>
                    </div>
                  </div>

                  {/* Response */}
                  {application.response && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Réponse de l'entreprise</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800 font-medium">
                            Reçu le {format(new Date(application.responseDate!), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-gray-700">{application.response}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Company Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations entreprise</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{application.company}</p>
                          <p className="text-sm text-gray-600">Entreprise</p>
                        </div>
                      </div>
                      
                      {application.companyEmail && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{application.companyEmail}</p>
                            <p className="text-sm text-gray-600">Email de contact</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{application.source}</p>
                          <p className="text-sm text-gray-600">Source de l'offre</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pièces jointes</h3>
                    <div className="space-y-2">
                      {application.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">{attachment}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronologie</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Candidature envoyée</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(application.appliedDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>

                      {application.readReceipt && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email lu</p>
                            <p className="text-xs text-gray-600">Accusé de réception reçu</p>
                          </div>
                        </div>
                      )}

                      {application.responseDate && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Réponse reçue</p>
                            <p className="text-xs text-gray-600">
                              {format(new Date(application.responseDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      )}

                      {application.interviewDate && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Entretien programmé</p>
                            <p className="text-xs text-gray-600">
                              {format(new Date(application.interviewDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {application.notes && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes personnelles</h3>
                      <p className="text-sm text-gray-700">{application.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Fermer
              </button>
              
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Modifier
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Relancer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationDetailsModal;