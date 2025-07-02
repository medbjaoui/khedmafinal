import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Mail, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  MoreVertical,
  Edit3,
  Trash2
} from 'lucide-react';
import { Application } from '../../store/slices/applicationsSlice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  onViewDetails: (application: Application) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-4 w-4 text-gray-500" />;
      case 'sent': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'viewed': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'interview': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyée';
      case 'viewed': return 'Vue';
      case 'interview': return 'Entretien';
      case 'rejected': return 'Refusée';
      case 'accepted': return 'Acceptée';
      default: return 'En attente';
    }
  };

  const getTypeIcon = (type: Application['type']) => {
    return type === 'automatic' ? '🤖' : '👤';
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{application.jobTitle}</h3>
            <span className="text-lg">{getTypeIcon(application.type)}</span>
          </div>
          <p className="text-gray-600 mb-1">{application.company}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(application.appliedDate), 'dd MMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ExternalLink className="h-4 w-4" />
              <span>{application.source}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            <span>{getStatusLabel(application.status)}</span>
          </span>
          
          <div className="relative group">
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onViewDetails(application)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Voir détails</span>
              </button>
              <button
                onClick={() => onEdit(application)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => onDelete(application.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-2 mb-4">
        {application.emailSent && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Email envoyé</span>
            {application.readReceipt && (
              <span className="text-yellow-600">• Lu</span>
            )}
          </div>
        )}

        {application.interviewDate && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <MessageSquare className="h-4 w-4" />
            <span>
              Entretien prévu le {format(new Date(application.interviewDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
            </span>
          </div>
        )}

        {application.response && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-1">Réponse reçue :</p>
            <p className="text-sm text-gray-600 line-clamp-2">{application.response}</p>
            {application.responseDate && (
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(application.responseDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cover Letter Preview */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {application.coverLetter}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{application.attachments.length} pièce(s) jointe(s)</span>
        </div>
        
        <button
          onClick={() => onViewDetails(application)}
          className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          Voir détails →
        </button>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;