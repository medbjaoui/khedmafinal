import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Upload, 
  Target, 
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
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
  Camera,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { updateProfile, addExperience, addEducation, addSkill, addCertification, removeExperience, removeEducation, removeSkill, removeCertification, fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../store/slices/profileSlice';
import { SupabaseService } from '../services/supabaseService';
import CVUploadZone from '../components/Profile/CVUploadZone';
import CoverLettersManagement from '../components/Profile/CoverLettersManagement';
import { useRecommendations } from '../hooks/useRecommendations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, profileCompletion } = useAppSelector(state => state.profile);
  const { user } = useAppSelector(state => state.auth);
  const { 
    activeRecommendations, 
    completedRecommendations, 
    loading: recommendationsLoading, 
    error: recommendationsError,
    generateAIRecommendations,
    markRecommendationCompleted,
    dismissRecommendation 
  } = useRecommendations();

  useEffect(() => {
    const loadProfile = async () => {
      if (!profile && user?.id) {
        dispatch(fetchProfileStart());
        try {
          const userProfile = await SupabaseService.getUserProfile(user.id);
          if (userProfile) {
            dispatch(fetchProfileSuccess(userProfile));
          } else {
            dispatch(fetchProfileFailure("Profile not found"));
          }
        } catch (error: any) {
          console.error("Error loading profile:", error);
          dispatch(fetchProfileFailure(error.message));
        }
      }
    };
    loadProfile();
  }, [dispatch, user?.id, profile]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'upload' | 'recommendations' | 'cover-letters'>('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    // Personal Info
    firstName: profile?.firstName || user?.firstName || '',
    lastName: profile?.lastName || user?.lastName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    dateOfBirth: profile?.dateOfBirth || '',
    title: profile?.title || '',
    summary: profile?.summary || '',
    
    // Links
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    website: profile?.website || '',
    portfolio: profile?.portfolio || '',
    
    // New Experience
    newExperience: {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      location: '',
      achievements: ['']
    },
    
    // New Education
    newEducation: {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    },
    
    // New Skill
    newSkill: {
      name: '',
      level: 'Intermédiaire' as const,
      category: 'Technique' as const
    },
    
    // New Certification
    newCertification: {
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: ''
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Parse URL query parameters to set active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'edit') setActiveTab('edit');
    if (tab === 'upload') setActiveTab('upload');
    if (tab === 'recommendations') setActiveTab('recommendations');
    if (tab === 'cover-letters') setActiveTab('cover-letters');
  }, [location]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData((prev: any) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        dateOfBirth: profile.dateOfBirth || '',
        title: profile.title || '',
        summary: profile.summary || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        website: profile.website || '',
        portfolio: profile.portfolio || ''
      }));
    }
  }, [profile, user]);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: User },
    { id: 'edit', label: 'Modifier le profil', icon: Edit3 },
    { id: 'upload', label: 'Importer CV', icon: Upload },
    { id: 'cover-letters', label: 'Mes Lettres', icon: FileText },
    { id: 'recommendations', label: 'Recommandations', icon: Target },
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as Record<string, unknown>,
        [field]: value
      }
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const achievements = [...(formData.newExperience.achievements || [''])];
    achievements[index] = value;
    
    setFormData((prev: any) => ({
      ...prev,
      newExperience: {
        ...prev.newExperience,
        achievements
      }
    }));
  };

  const addAchievementField = () => {
    setFormData((prev: any) => ({
      ...prev,
      newExperience: {
        ...prev.newExperience,
        achievements: [...prev.newExperience.achievements, '']
      }
    }));
  };

  const removeAchievementField = (index: number) => {
    const achievements = [...formData.newExperience.achievements];
    achievements.splice(index, 1);
    
    setFormData((prev: any) => ({
      ...prev,
      newExperience: {
        ...prev.newExperience,
        achievements
      }
    }));
  };

  const handleSaveSection = (section: string) => {
    if (section === 'personal') {
      if (profile) {
        dispatch(updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          dateOfBirth: formData.dateOfBirth,
          title: formData.title,
          summary: formData.summary,
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website,
          portfolio: formData.portfolio
        }));
      }
      setSuccessMessage('Informations personnelles mises à jour avec succès !');
    }
    
    setEditingSection(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddExperience = () => {
    if (formData.newExperience.company && formData.newExperience.position) {
      dispatch(addExperience({
        id: Date.now().toString(),
        ...formData.newExperience,
        achievements: formData.newExperience.achievements.filter((a: string) => a.trim())
      }));
      
      setFormData((prev: any) => ({
        ...prev,
        newExperience: {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          location: '',
          achievements: ['']
        }
      }));
      
      setEditingSection(null);
      setSuccessMessage('Expérience ajoutée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleAddEducation = () => {
    if (formData.newEducation.institution && formData.newEducation.degree) {
      dispatch(addEducation({
        id: Date.now().toString(),
        ...formData.newEducation
      }));
      
      setFormData((prev: any) => ({
        ...prev,
        newEducation: {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      }));
      
      setEditingSection(null);
      setSuccessMessage('Formation ajoutée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.name) {
      dispatch(addSkill({
        ...formData.newSkill,
        verified: false
      }));
      
      setFormData((prev: any) => ({
        ...prev,
        newSkill: {
          name: '',
          level: 'Intermédiaire',
          category: 'Technique'
        }
      }));
      
      setEditingSection(null);
      setSuccessMessage('Compétence ajoutée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleAddCertification = () => {
    if (formData.newCertification.name && formData.newCertification.issuer) {
      dispatch(addCertification({
        id: Date.now().toString(),
        ...formData.newCertification
      }));
      
      setFormData((prev: any) => ({
        ...prev,
        newCertification: {
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: ''
        }
      }));
      
      setEditingSection(null);
      setSuccessMessage('Certification ajoutée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRemoveExperience = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      dispatch(removeExperience(id));
      setSuccessMessage('Expérience supprimée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRemoveEducation = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      dispatch(removeEducation(id));
      setSuccessMessage('Formation supprimée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRemoveSkill = (name: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      dispatch(removeSkill(name));
      setSuccessMessage('Compétence supprimée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRemoveCertification = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      dispatch(removeCertification(id));
      setSuccessMessage('Certification supprimée avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const toggleExpandSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleDownloadCV = async () => {
    if (!profile?.cvFilePath || !user?.id) return;

    try {
      const publicUrl = await SupabaseService.getFileUrl('cvs', profile.cvFilePath);
      window.open(publicUrl, '_blank');
      setSuccessMessage('CV téléchargé avec succès !');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      setSuccessMessage('Erreur lors du téléchargement du CV.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDeleteCV = async () => {
    if (!profile?.cvFilePath || !user?.id) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre CV ? Cette action est irréversible.')) {
      try {
        await SupabaseService.deleteFile('cvs', profile.cvFilePath);
        // Met à jour le profil côté backend (Supabase)
        await SupabaseService.updateUserProfile(user.id, { cvFilePath: undefined });
        // Met à jour le store Redux
        dispatch(updateProfile({ cvFilePath: undefined }));
        setSuccessMessage('CV supprimé avec succès !');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error: any) {
        console.error('Error deleting CV:', error);
        setSuccessMessage('Erreur lors de la suppression du CV.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing_info':
        return <AlertCircle className="h-3 w-3" />;
      case 'improvement':
        return <TrendingUp className="h-3 w-3" />;
      case 'optimization':
        return <Target className="h-3 w-3" />;
      case 'formatting':
        return <Edit3 className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <Check className="h-5 w-5" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative group">
                <User className="h-10 w-10 text-white" />
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <Camera className="h-6 w-6 text-white" />
                 </div>
               </div>
               <div className="text-white">
                 <h1 className="text-2xl font-bold">
                   {profile?.firstName || 'Prénom'} {profile?.lastName || 'Nom'}
                 </h1>
                 <p className="text-blue-100 text-lg">{profile?.title || 'Titre professionnel'}</p>
                 <div className="flex items-center space-x-4 mt-2 text-sm text-blue-100">
                   <div className="flex items-center space-x-1">
                     <MapPin className="h-4 w-4" />
                     <span>{profile?.location || 'Non spécifié'}</span>
                   </div>
                   <div className="flex items-center space-x-1">
                     <Mail className="h-4 w-4" />
                     <span>{profile?.email || 'Email non renseigné'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveTab('edit');
                setEditingSection('personal');
                navigate('/profile?tab=edit');
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Complétude du profil</h3>
            <span className={`text-2xl font-bold ${
              profileCompletion.overall >= 80 ? 'text-green-600' :
              profileCompletion.overall >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {profileCompletion.overall}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                profileCompletion.overall >= 80 ? 'bg-green-600' :
                profileCompletion.overall >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${profileCompletion.overall}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {Object.entries(profileCompletion.sections).map(([section, score]) => (
              <div key={section} className="text-center">
                <div className={`text-lg font-semibold ${
                  score >= 80 ? 'text-green-600' :
                  score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-1"
      >
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'overview' | 'edit' | 'upload' | 'recommendations');
                  navigate(`/profile?tab=${tab.id}`);
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé professionnel</h3>
              <p className="text-gray-700 leading-relaxed">{profile.summary || 'Aucun résumé professionnel. Ajoutez un résumé pour améliorer votre profil.'}</p>
            </motion.div>

            {/* CV Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CV</h3>
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    navigate('/profile?tab=upload');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Gérer</span>
                </button>
              </div>
              
              {profile.cvFilePath ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {profile.originalCVFileName || 'CV.pdf'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Dernière mise à jour : {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString('fr-FR') : 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadCV}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                    >
                      <Download className="h-3 w-3" />
                      <span>Télécharger</span>
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={async () => {
                        if (profile?.cvFilePath) {
                          const publicUrl = await SupabaseService.getFileUrl('cvs', profile.cvFilePath);
                          window.open(publicUrl, '_blank');
                        }
                      }}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Voir</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Aucun CV uploadé</p>
                    <p className="text-sm text-gray-600">
                      Ajoutez votre CV pour améliorer votre profil
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact & Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{profile.phone || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{profile.location || 'Non spécifié'}</span>
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
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens professionnels</h3>
                <div className="space-y-3">
                  {profile.linkedin ? (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-400">
                      <Linkedin className="h-5 w-5" />
                      <span>LinkedIn non spécifié</span>
                    </div>
                  )}
                  
                  {profile.github ? (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-400">
                      <Github className="h-5 w-5" />
                      <span>GitHub non spécifié</span>
                    </div>
                  )}
                  
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span>Site web</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-400">
                      <Globe className="h-5 w-5" />
                      <span>Site web non spécifié</span>
                    </div>
                  )}
                  
                  {profile.portfolio ? (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Briefcase className="h-5 w-5" />
                      <span>Portfolio</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </a>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-400">
                      <Briefcase className="h-5 w-5" />
                      <span>Portfolio non spécifié</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Experiences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Expériences professionnelles</h3>
                <button
                  onClick={() => {
                    setActiveTab('edit');
                    setEditingSection('experience');
                    navigate('/profile?tab=edit');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {profile.experiences.length > 0 ? (
                <div className="space-y-6">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{exp.position}</h4>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(exp.startDate), 'MMM yyyy', { locale: fr })} - 
                                {exp.current ? ' Présent' : format(new Date(exp.endDate!), ' MMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            {exp.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{exp.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('edit');
                            setEditingSection('experience');
                            navigate('/profile?tab=edit');
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {exp.description && (
                        <p className="text-gray-700 mt-3 mb-3">{exp.description}</p>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 mb-2">Réalisations clés :</p>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                                <span className="text-gray-700">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Aucune expérience professionnelle</p>
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditingSection('experience');
                      navigate('/profile?tab=edit');
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une expérience</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Formation</h3>
                <button
                  onClick={() => {
                    setActiveTab('edit');
                    setEditingSection('education');
                    navigate('/profile?tab=edit');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{edu.degree}</h4>
                          <p className="text-blue-600 font-medium">{edu.institution}</p>
                          <p className="text-gray-700 mt-1">{edu.field}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(edu.startDate), 'yyyy', { locale: fr })} - 
                              {edu.current ? ' En cours' : format(new Date(edu.endDate!), ' yyyy', { locale: fr })}
                            </span>
                          </div>
                          {edu.grade && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Mention :</span> {edu.grade}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('edit');
                            setEditingSection('education');
                            navigate('/profile?tab=edit');
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {edu.description && (
                        <p className="text-gray-700 mt-3">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Aucune formation</p>
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditingSection('education');
                      navigate('/profile?tab=edit');
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une formation</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Compétences</h3>
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditingSection('skills');
                      navigate('/profile?tab=edit');
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>

                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center space-x-2 group"
                      >
                        <span className="text-blue-800 font-medium">{skill.name}</span>
                        <span className="text-xs text-blue-600 bg-white px-2 py-0.5 rounded-full">{skill.level}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">Aucune compétence</p>
                    <button
                      onClick={() => {
                        setActiveTab('edit');
                        setEditingSection('skills');
                        navigate('/profile?tab=edit');
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter des compétences</span>
                    </button>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Langues</h3>
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditingSection('languages');
                      navigate('/profile?tab=edit');
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>

                {profile.languages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.languages.map((language, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">{language.name}</p>
                        <p className="text-sm text-gray-600">{language.level}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">Aucune langue</p>
                    <button
                      onClick={() => {
                        setActiveTab('edit');
                        setEditingSection('languages');
                        navigate('/profile?tab=edit');
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter des langues</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Certifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                <button
                  onClick={() => {
                    setActiveTab('edit');
                    setEditingSection('certifications');
                    navigate('/profile?tab=edit');
                  }}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {profile.certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                          <p className="text-blue-600">{cert.issuer}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(cert.issueDate), 'MMM yyyy', { locale: fr })}
                              {cert.expiryDate && ` - ${format(new Date(cert.expiryDate), 'MMM yyyy', { locale: fr })}`}
                            </span>
                          </div>
                          {cert.credentialId && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">ID :</span> {cert.credentialId}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveCertification(cert.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Aucune certification</p>
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditingSection('certifications');
                      navigate('/profile?tab=edit');
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une certification</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
        
        {activeTab === 'edit' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Informations personnelles</span>
                </h3>
                {editingSection === 'personal' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveSection('personal')}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Sauvegarder</span>
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Annuler</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSection('personal')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                )}
              </div>

              {editingSection === 'personal' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre professionnel</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Résumé professionnel</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/votre-profil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/votre-profil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://votre-site.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://votre-portfolio.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.firstName} {profile.lastName}</p>
                        <p className="text-sm text-gray-600">Nom complet</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.email}</p>
                        <p className="text-sm text-gray-600">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.phone || 'Non renseigné'}</p>
                        <p className="text-sm text-gray-600">Téléphone</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.location || 'Non renseigné'}</p>
                        <p className="text-sm text-gray-600">Localisation</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{profile.title || 'Non renseigné'}</p>
                        <p className="text-sm text-gray-600">Titre professionnel</p>
                      </div>
                    </div>
                    {profile.dateOfBirth && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(profile.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          <p className="text-sm text-gray-600">Date de naissance</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => toggleExpandSection('experience')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 w-full"
                >
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span>Expériences professionnelles</span>
                  {expandedSection === 'experience' ? 
                    <ChevronUp className="h-5 w-5 ml-auto" /> : 
                    <ChevronDown className="h-5 w-5 ml-auto" />
                  }
                </button>
                {expandedSection === 'experience' && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'experience' ? null : 'experience')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>

              {expandedSection === 'experience' && (
                <>
                  {editingSection === 'experience' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Nouvelle expérience</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                          <input
                            type="text"
                            value={formData.newExperience.company}
                            onChange={(e) => handleNestedInputChange('newExperience', 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                          <input
                            type="text"
                            value={formData.newExperience.position}
                            onChange={(e) => handleNestedInputChange('newExperience', 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                          <input
                            type="date"
                            value={formData.newExperience.startDate}
                            onChange={(e) => handleNestedInputChange('newExperience', 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                          <input
                            type="date"
                            value={formData.newExperience.endDate}
                            onChange={(e) => handleNestedInputChange('newExperience', 'endDate', e.target.value)}
                            disabled={formData.newExperience.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.newExperience.current}
                              onChange={(e) => handleNestedInputChange('newExperience', 'current', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Poste actuel</span>
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                          <input
                            type="text"
                            value={formData.newExperience.location}
                            onChange={(e) => handleNestedInputChange('newExperience', 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ville, Pays"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={formData.newExperience.description}
                            onChange={(e) => handleNestedInputChange('newExperience', 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Réalisations</label>
                          {formData.newExperience.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => handleAchievementChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Décrivez une réalisation importante"
                              />
                              <button
                                type="button"
                                onClick={() => removeAchievementField(index)}
                                className="text-red-500 hover:text-red-700"
                                disabled={formData.newExperience.achievements.length <= 1}
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addAchievementField}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Ajouter une réalisation</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleAddExperience}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profile.experiences.map((exp, index) => (
                      <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(exp.startDate), 'MMM yyyy', { locale: fr })} - 
                              {exp.current ? ' Présent' : format(new Date(exp.endDate!), ' MMM yyyy', { locale: fr })}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => toggleExpandSection('education')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 w-full"
                >
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Formation</span>
                  {expandedSection === 'education' ? 
                    <ChevronUp className="h-5 w-5 ml-auto" /> : 
                    <ChevronDown className="h-5 w-5 ml-auto" />
                  }
                </button>
                {expandedSection === 'education' && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'education' ? null : 'education')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>

              {expandedSection === 'education' && (
                <>
                  {editingSection === 'education' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Nouvelle formation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={formData.newEducation.institution}
                            onChange={(e) => handleNestedInputChange('newEducation', 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
                          <input
                            type="text"
                            value={formData.newEducation.degree}
                            onChange={(e) => handleNestedInputChange('newEducation', 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Domaine d'étude</label>
                          <input
                            type="text"
                            value={formData.newEducation.field}
                            onChange={(e) => handleNestedInputChange('newEducation', 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                          <input
                            type="date"
                            value={formData.newEducation.startDate}
                            onChange={(e) => handleNestedInputChange('newEducation', 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                          <input
                            type="date"
                            value={formData.newEducation.endDate}
                            onChange={(e) => handleNestedInputChange('newEducation', 'endDate', e.target.value)}
                            disabled={formData.newEducation.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.newEducation.current}
                              onChange={(e) => handleNestedInputChange('newEducation', 'current', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">En cours</span>
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                          <textarea
                            value={formData.newEducation.description}
                            onChange={(e) => handleNestedInputChange('newEducation', 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleAddEducation}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profile.education.map((edu) => (
                      <div key={edu.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                            <p className="text-blue-600 font-medium">{edu.institution}</p>
                            <p className="text-sm text-gray-700">{edu.field}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(edu.startDate), 'yyyy', { locale: fr })} - 
                              {edu.current ? ' En cours' : format(new Date(edu.endDate!), ' yyyy', { locale: fr })}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRemoveEducation(edu.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => toggleExpandSection('skills')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 w-full"
                >
                  <Award className="h-5 w-5 text-blue-600" />
                  <span>Compétences</span>
                  {expandedSection === 'skills' ? 
                    <ChevronUp className="h-5 w-5 ml-auto" /> : 
                    <ChevronDown className="h-5 w-5 ml-auto" />
                  }
                </button>
                {expandedSection === 'skills' && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'skills' ? null : 'skills')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>

              {expandedSection === 'skills' && (
                <>
                  {editingSection === 'skills' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Nouvelle compétence</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                          <input
                            type="text"
                            value={formData.newSkill.name}
                            onChange={(e) => handleNestedInputChange('newSkill', 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                          <select
                            value={formData.newSkill.level}
                            onChange={(e) => handleNestedInputChange('newSkill', 'level', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Débutant">Débutant</option>
                            <option value="Intermédiaire">Intermédiaire</option>
                            <option value="Avancé">Avancé</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                          <select
                            value={formData.newSkill.category}
                            onChange={(e) => handleNestedInputChange('newSkill', 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Technique">Technique</option>
                            <option value="Soft Skills">Soft Skills</option>
                            <option value="Outils">Outils</option>
                            <option value="Linguistique">Linguistique</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleAddSkill}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center space-x-2 group"
                      >
                        <span className="text-blue-800 font-medium">{skill.name}</span>
                        <span className="text-xs text-blue-600 bg-white px-2 py-0.5 rounded-full">{skill.level}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Certifications Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => toggleExpandSection('certifications')}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 w-full"
                >
                  <Award className="h-5 w-5 text-blue-600" />
                  <span>Certifications</span>
                  {expandedSection === 'certifications' ? 
                    <ChevronUp className="h-5 w-5 ml-auto" /> : 
                    <ChevronDown className="h-5 w-5 ml-auto" />
                  }
                </button>
                {expandedSection === 'certifications' && (
                  <button
                    onClick={() => setEditingSection(editingSection === 'certifications' ? null : 'certifications')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>

              {expandedSection === 'certifications' && (
                <>
                  {editingSection === 'certifications' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Nouvelle certification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                          <input
                            type="text"
                            value={formData.newCertification.name}
                            onChange={(e) => handleNestedInputChange('newCertification', 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organisme</label>
                          <input
                            type="text"
                            value={formData.newCertification.issuer}
                            onChange={(e) => handleNestedInputChange('newCertification', 'issuer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'obtention</label>
                          <input
                            type="date"
                            value={formData.newCertification.issueDate}
                            onChange={(e) => handleNestedInputChange('newCertification', 'issueDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (optionnel)</label>
                          <input
                            type="date"
                            value={formData.newCertification.expiryDate}
                            onChange={(e) => handleNestedInputChange('newCertification', 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">ID de certification (optionnel)</label>
                          <input
                            type="text"
                            value={formData.newCertification.credentialId}
                            onChange={(e) => handleNestedInputChange('newCertification', 'credentialId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleAddCertification}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.certifications.map((cert) => (
                      <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                            <p className="text-blue-600">{cert.issuer}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(cert.issueDate), 'MMM yyyy', { locale: fr })}
                              {cert.expiryDate && ` - ${format(new Date(cert.expiryDate), 'MMM yyyy', { locale: fr })}`}
                            </p>
                            {cert.credentialId && (
                              <p className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveCertification(cert.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <CVUploadZone />
            
            {!profile?.cvFilePath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun CV uploadé</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore uploadé de CV. Utilisez la zone d'upload ci-dessus pour ajouter votre CV.
                </p>
                <div className="text-sm text-gray-500">
                  Formats supportés : PDF, DOC, DOCX, TXT
                </div>
              </motion.div>
            )}
            
            {profile?.cvFilePath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Votre CV actuel</h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      CV sauvegardé
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom du fichier</label>
                      <p className="text-gray-900 font-medium">
                        {profile.originalCVFileName || 'CV.pdf'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dernière mise à jour</label>
                      <p className="text-gray-900">
                        {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Non spécifié'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Score de complétude</label>
                      <p className="text-gray-900 font-medium">
                        {profile.completionScore || 0}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Statut</label>
                      <p className="text-gray-900">
                        {profile.cvFilePath ? 'Disponible' : 'Non disponible'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleDownloadCV}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger CV</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (profile?.cvFilePath) {
                        const publicUrl = await SupabaseService.getFileUrl('cvs', profile.cvFilePath);
                        window.open(publicUrl, '_blank');
                      }
                    }}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Voir en ligne</span>
                  </button>
                  <button
                    onClick={handleDeleteCV}
                    className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer CV</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* No recommendations message */}
            {activeRecommendations.length === 0 && completedRecommendations.length === 0 && !recommendationsLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune recommandation disponible
                </h3>
                <p className="text-gray-600 mb-4">
                  Cliquez sur "Actualiser" pour générer des recommandations personnalisées basées sur votre profil.
                </p>
                <button
                  onClick={generateAIRecommendations}
                  disabled={recommendationsLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {recommendationsLoading ? 'Génération...' : 'Générer des recommandations'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cover-letters' && (
          <div className="space-y-6">
            <CoverLettersManagement />
          </div>
        )}
        
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Header with AI generation button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommandations IA</h2>
                <p className="text-gray-600 mt-1">
                  Recommandations personnalisées basées sur votre profil
                </p>
              </div>
              <button
                onClick={generateAIRecommendations}
                disabled={recommendationsLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {recommendationsLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Target className="h-4 w-4" />
                )}
                <span>{recommendationsLoading ? 'Génération...' : 'Actualiser'}</span>
              </button>
            </div>

            {/* Error message */}
            {recommendationsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">{recommendationsError}</p>
                </div>
              </div>
            )}

            {/* Active Recommendations */}
            {activeRecommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recommandations actives ({activeRecommendations.length})
                  </h3>
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
                  {activeRecommendations.map((recommendation, index) => {
                    const getPriorityColor = (priority: string) => {
                      switch (priority) {
                        case 'high': return 'border-red-200 bg-red-50';
                        case 'medium': return 'border-yellow-200 bg-yellow-50';
                        case 'low': return 'border-blue-200 bg-blue-50';
                        default: return 'border-gray-200 bg-gray-50';
                      }
                    };

                    const getPriorityIcon = (priority: string) => {
                      switch (priority) {
                        case 'high': return <AlertCircle className="h-5 w-5 text-red-500" />;
                        case 'medium': return <TrendingUp className="h-5 w-5 text-yellow-500" />;
                        case 'low': return <Target className="h-5 w-5 text-blue-500" />;
                        default: return <Target className="h-5 w-5 text-gray-500" />;
                      }
                    };
                    
                    return (
                      <motion.div
                        key={recommendation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
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
                                  <ChevronRight className="h-4 w-4" />
                                  <span>{recommendation.action}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      // Handle recommendation action based on category
                                      if (recommendation.category === 'profile') {
                                        setActiveTab('edit');
                                        setEditingSection('personal');
                                      } else if (recommendation.category === 'experience') {
                                        setActiveTab('edit');
                                        setEditingSection('experience');
                                      } else if (recommendation.category === 'education') {
                                        setActiveTab('edit');
                                        setEditingSection('education');
                                      } else if (recommendation.category === 'skills') {
                                        setActiveTab('edit');
                                        setEditingSection('skills');
                                      }
                                    }}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    Appliquer
                                  </button>
                                  <button
                                    onClick={() => markRecommendationCompleted(recommendation.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                  >
                                    Terminé
                                  </button>
                                  <button
                                    onClick={() => dismissRecommendation(recommendation.id)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                                  >
                                    Ignorer
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
                  {completedRecommendations.map((recommendation) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;