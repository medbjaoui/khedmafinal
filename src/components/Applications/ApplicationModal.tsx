import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Edit3, 
  FileText, 
  Mail, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Wand2,
  Eye,
  Download,
  Bot,
  Sparkles,
  Upload
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Job } from '../../store/slices/jobsSlice';
import { Application, ApplicationTemplate } from '../../store/slices/applicationsSlice';
import { 
  startGeneratingLetter, 
  letterGenerationSuccess,
  startSendingEmail,
  emailSentSuccess,
  emailSentFailure
} from '../../store/slices/applicationsSlice';
import { ApplicationService } from '../../services/applicationService';
import { SupabaseService, supabase } from '../../services/supabaseService';
import AIChat from '../AI/AIChat';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  existingApplication?: Application;
  onApplicationAdded?: (newApplication: Application) => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  existingApplication,
  onApplicationAdded
}) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.profile);
  const { user } = useAppSelector(state => state.auth);
  const { templates, generatingLetter, sendingEmail } = useAppSelector(state => state.applications);

  const isManualAdd = !job;

  const [step, setStep] = useState<'template' | 'customize' | 'review' | 'send' | 'ai-assist'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [applicationType, setApplicationType] = useState<'manual' | 'automatic'>('manual');
  const [emailSent, setEmailSent] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');

  useEffect(() => {
    if (isOpen && profile) {
      const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
      
      setManualJobTitle(existingApplication?.jobTitle || '');
      setManualCompany(existingApplication?.company || '');
      setCoverLetter(existingApplication?.coverLetter || '');
      setSelectedTemplate(defaultTemplate);
      setCompanyEmail(existingApplication?.companyEmail || (job ? ApplicationService.extractCompanyEmail(job) : ''));

      if (job && defaultTemplate) {
        setEmailSubject(ApplicationService.generateEmailSubject(job, profile, defaultTemplate));
      } else {
        setEmailSubject(existingApplication?.jobTitle ? `Candidature pour ${existingApplication.jobTitle}` : '');
      }
      
      if (existingApplication) {
        setStep('review');
      } else {
        setStep(isManualAdd ? 'customize' : 'template');
      }
    }
  }, [isOpen, job, profile, templates, existingApplication, isManualAdd]);

  const handleGenerateLetter = async () => {
    if (!selectedTemplate || !profile) return;

    dispatch(startGeneratingLetter());

    try {
      const letter = await ApplicationService.generateCoverLetter(
        job, 
        profile, 
        selectedTemplate, 
        customInstructions
      );
      setCoverLetter(letter);
      dispatch(letterGenerationSuccess({ applicationId: '', letter }));
      setStep('review');
    } catch (error) {
      console.error('Error generating letter:', error);
    }
  };

  const handleSendApplication = async () => {
    if (!profile || !user || (!coverLetter && !coverLetterFile)) return;

    const jobTitle = isManualAdd ? manualJobTitle : job.title;
    const company = isManualAdd ? manualCompany : job.company;

    if (!jobTitle || !company) {
      dispatch(emailSentFailure('Le titre du poste et le nom de l\'entreprise sont requis.'));
      return;
    }

    dispatch(startSendingEmail());

    let coverLetterFilePath: string | undefined;
    if (coverLetterFile) {
      try {
        const filePath = `cover_letters/${user.id}/${job?.id || 'manual'}/${Date.now()}_${coverLetterFile.name}`;
        await SupabaseService.uploadFile('cover_letters', filePath, coverLetterFile);
        coverLetterFilePath = filePath;
      } catch (error: any) {
        dispatch(emailSentFailure('Erreur lors du téléversement de la lettre de motivation.'));
        return;
      }
    }

    // 1. Create a draft application in the database
    const newApplicationData = {
      jobId: job?.id,
      jobTitle,
      company,
      status: 'draft' as const,
      type: applicationType as 'manual' | 'automatic',
      coverLetter: coverLetter || '',
      coverLetterFilePath,
      companyEmail,
      customMessage: customInstructions,
      attachments: profile.cvFilePath ? [profile.cvFilePath] : [],
      source: job?.source || 'Manual',
      appliedDate: new Date().toISOString(),
      emailSent: false
    };

    try {
      const newApplication = await SupabaseService.addApplication(user.id, newApplicationData) as Application | null;

      if (!newApplication) {
        dispatch(emailSentFailure('Erreur lors de la création de la candidature'));
        return;
      }

      // 2. Try to invoke the Edge Function to send the email (if available)
      try {
        const { data, error } = await supabase.functions.invoke('send-application-email', {
          body: { applicationId: newApplication.id },
        });

        if (!error && data) {
          // 3. Update the application in the store with the final status
          await SupabaseService.updateApplication(newApplication.id, { 
            status: 'sent', 
            emailId: data.emailId,
            emailSent: true
          });
          dispatch(emailSentSuccess({ applicationId: newApplication.id, emailId: data.emailId }));
        } else {
          // Mark as sent locally even if edge function fails
          await SupabaseService.updateApplication(newApplication.id, { 
            status: 'sent',
            emailSent: true
          });
          dispatch(emailSentSuccess({ applicationId: newApplication.id, emailId: '' }));
        }
      } catch (edgeError) {
        // Edge function failed, but still mark application as sent
        console.warn('Edge function failed, marking application as sent locally:', edgeError);
        await SupabaseService.updateApplication(newApplication.id, { 
          status: 'sent',
          emailSent: true
        });
        dispatch(emailSentSuccess({ applicationId: newApplication.id, emailId: '' }));
      }

      setEmailSent(true);

      setTimeout(() => {
        onClose();
        setEmailSent(false);
        setStep('template');
        setCoverLetter('');
        setCoverLetterFile(null);
        setCustomInstructions('');
      }, 2000);

    } catch (error: any) {
      dispatch(emailSentFailure(error.message || 'Erreur lors de l\'envoi de la candidature'));
    }
  };

  const handleClose = () => {
    onClose();
    setStep('template');
    setCoverLetter('');
    setCustomInstructions('');
    setEmailSent(false);
    setShowAIAssist(false);
  };

  const handleAIResponse = (response: string) => {
    setCoverLetter(response);
    setShowAIAssist(false);
    setStep('review');
  };

  if (!profile) return null;

  const aiSuggestions = [
    "Génère une lettre de motivation pour ce poste",
    "Adapte ma lettre au style de l'entreprise",
    "Améliore le ton de ma candidature",
    "Ajoute des éléments techniques spécifiques"
  ];

  const aiContext = `Contexte de candidature:
Poste: ${job?.title || manualJobTitle}
Entreprise: ${job?.company || manualCompany}
Description: ${job?.description || 'N/A'}
Exigences: ${job?.requirements?.join(', ') || 'N/A'}

Profil candidat:
Nom: ${profile.firstName} ${profile.lastName}
Titre: ${profile.title}
Expérience: ${profile.experiences.length} postes
Compétences: ${profile.skills.map(s => s.name).join(', ')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Postuler à l'offre</h2>
                  <p className="text-blue-100">{job ? `${job.title} - ${job.company}` : 'Nouvelle candidature manuelle'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAIAssist(!showAIAssist)}
                    className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Assistant IA</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Main Content */}
              <div className={`${showAIAssist ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    {[
                      { id: 'template', label: 'Modèle', icon: FileText },
                      { id: 'customize', label: 'Personnaliser', icon: Edit3 },
                      { id: 'review', label: 'Réviser', icon: Eye },
                      { id: 'send', label: 'Envoyer', icon: Send }
                    ].map((stepItem, index) => {
                      const Icon = stepItem.icon;
                      const isActive = step === stepItem.id;
                      const isCompleted = ['template', 'customize', 'review'].indexOf(step) > ['template', 'customize', 'review'].indexOf(stepItem.id);

                      return (
                        <div key={stepItem.id} className="flex items-center">
                          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-blue-100 text-blue-700' :
                            isCompleted ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{stepItem.label}</span>
                          </div>
                          {index < 3 && (
                            <div className={`w-8 h-0.5 mx-2 ${
                              isCompleted ? 'bg-green-300' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {emailSent ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Candidature envoyée !
                      </h3>
                      <p className="text-gray-600">
                        Votre candidature a été envoyée avec succès à {job.company}.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Template Selection */}
                      {step === 'template' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Choisir un modèle de lettre
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {templates.map((template) => (
                                <div
                                  key={template.id}
                                  onClick={() => setSelectedTemplate(template)}
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selectedTemplate?.id === template.id
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                                    {template.isDefault && (
                                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Par défaut
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-3">
                                    {template.content.substring(0, 150)}...
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Type de candidature</h4>
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="manual"
                                  checked={applicationType === 'manual'}
                                  onChange={(e) => setApplicationType(e.target.value as 'manual')}
                                  className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Manuelle</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="automatic"
                                  checked={applicationType === 'automatic'}
                                  onChange={(e) => setApplicationType(e.target.value as 'automatic')}
                                  className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Automatique (IA)</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customization */}
                      {step === 'customize' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Personnaliser votre candidature
                            </h3>

                            <div className="space-y-4">
                              {isManualAdd && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Titre du poste
                                    </label>
                                    <input
                                      type="text"
                                      value={manualJobTitle}
                                      onChange={(e) => setManualJobTitle(e.target.value)}
                                      placeholder="ex: Développeur React"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Nom de l'entreprise
                                    </label>
                                    <input
                                      type="text"
                                      value={manualCompany}
                                      onChange={(e) => setManualCompany(e.target.value)}
                                      placeholder="ex: Acme Inc."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email de l'entreprise
                                </label>
                                <input
                                  type="email"
                                  value={companyEmail}
                                  onChange={(e) => setCompanyEmail(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="recrutement@entreprise.com"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Objet de l'email
                                </label>
                                <input
                                  type="text"
                                  value={emailSubject}
                                  onChange={(e) => setEmailSubject(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Instructions personnalisées (optionnel)
                                </label>
                                <textarea
                                  value={customInstructions}
                                  onChange={(e) => setCustomInstructions(e.target.value)}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ajoutez des éléments spécifiques que vous souhaitez mentionner..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Review */}
                      {step === 'review' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Réviser votre lettre de motivation
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowAIAssist(true)}
                                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Bot className="h-4 w-4" />
                                <span>Assistant IA</span>
                              </button>
                              <button
                                onClick={handleGenerateLetter}
                                disabled={generatingLetter}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {generatingLetter ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4" />
                                )}
                                <span>{generatingLetter ? 'Génération...' : 'Régénérer'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <Mail className="h-5 w-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">À: {companyEmail}</p>
                                <p className="text-sm text-gray-600">Objet: {emailSubject}</p>
                              </div>
                            </div>

                            <textarea
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={15}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Pièces jointes</h4>
                            {profile.cvFilePath ? (
                              <div className="flex items-center space-x-2 text-sm text-blue-700">
                                <FileText className="h-4 w-4" />
                                <span>CV - {profile.firstName}_{profile.lastName}.pdf</span>
                                <Download 
                                  className="h-4 w-4 ml-auto cursor-pointer hover:text-blue-900" 
                                  onClick={() => {
                                    const url = SupabaseService.getFileUrl('cvs', profile.cvFilePath!);
                                    window.open(url, '_blank');
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                                <AlertCircle className="h-4 w-4" />
                                <span>Aucun CV téléchargé. Veuillez compléter votre profil.</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-blue-700 mt-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="cover-letter-upload"
                              />
                              <label
                                htmlFor="cover-letter-upload"
                                className="flex items-center space-x-2 cursor-pointer hover:text-blue-900"
                              >
                                <Upload className="h-4 w-4" />
                                <span>{coverLetterFile ? coverLetterFile.name : 'Joindre une lettre de motivation'}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                {!emailSent && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Annuler
                    </button>

                    <div className="flex space-x-3">
                      {step !== 'template' && (
                        <button
                          onClick={() => {
                            if (step === 'customize') setStep('template');
                            if (step === 'review') setStep('customize');
                            if (step === 'send') setStep('review');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Précédent
                        </button>
                      )}

                      {step === 'template' && (
                        <button
                          onClick={() => setStep('customize')}
                          disabled={!selectedTemplate}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Suivant
                        </button>
                      )}

                      {step === 'customize' && (
                        <button
                          onClick={handleGenerateLetter}
                          disabled={generatingLetter || !companyEmail || !emailSubject}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {generatingLetter ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Génération...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              <span>Générer la lettre</span>
                            </>
                          )}
                        </button>
                      )}

                      {step === 'review' && (
                        <button
                          onClick={handleSendApplication}
                          disabled={sendingEmail || !coverLetter.trim()}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {sendingEmail ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Envoi...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>Envoyer la candidature</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Assistant Sidebar */}
              <AnimatePresence>
                {showAIAssist && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '33.333333%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-gray-200 bg-gray-50 overflow-hidden"
                  >
                    <div className="h-full">
                      <AIChat
                        placeholder="Demandez de l'aide pour votre candidature..."
                        suggestions={aiSuggestions}
                        onResponse={handleAIResponse}
                        context={aiContext}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;