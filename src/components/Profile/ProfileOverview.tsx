import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Edit3,
  TrendingUp
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfileOverview: React.FC = () => {
  const { profile, profileCompletion } = useAppSelector(state => state.profile);

  if (!profile) return null;

  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-blue-100 text-lg">{profile.title}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-blue-100">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Edit3 className="h-4 w-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Complétude du profil</h3>
            <span className={`text-2xl font-bold ${getCompletionColor(profileCompletion.overall)}`}>
              {profileCompletion.overall}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getCompletionBgColor(profileCompletion.overall)}`}
              style={{ width: `${profileCompletion.overall}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {Object.entries(profileCompletion.sections).map(([section, score]) => (
              <div key={section} className="text-center">
                <div className={`text-lg font-semibold ${getCompletionColor(score)}`}>
                  {score}%
                </div>
                <div className="text-gray-600 capitalize">
                  {section === 'personal' ? 'Personnel' :
                   section === 'professional' ? 'Professionnel' :
                   section === 'experience' ? 'Expérience' :
                   section === 'education' ? 'Formation' : 'Compétences'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.experiences.length}</p>
              <p className="text-sm text-gray-600">Expériences</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.education.length}</p>
              <p className="text-sm text-gray-600">Formations</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.skills.length}</p>
              <p className="text-sm text-gray-600">Compétences</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.certifications.length}</p>
              <p className="text-sm text-gray-600">Certifications</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé professionnel</h3>
        <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
      </motion.div>

      {/* Contact & Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.location}</span>
            </div>
            {profile.dateOfBirth && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {format(new Date(profile.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens professionnels</h3>
          <div className="space-y-3">
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span>Site web</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {profile.portfolio && (
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-green-600 hover:text-green-700 transition-colors"
              >
                <Briefcase className="h-5 w-5" />
                <span>Portfolio</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Languages */}
      {profile.languages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Langues</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.languages.map((language, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{language.name}</p>
                <p className="text-sm text-gray-600">{language.level}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileOverview;