import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { SupabaseService } from '../../services/supabaseService';
import { updateProfile } from '../../store/slices/profileSlice';

interface CVFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  url: string;
  type: string;
}

const CVManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { profile } = useAppSelector(state => state.profile);
  
  const [cvFiles, setCvFiles] = useState<CVFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCVFiles();
  }, [user?.id]);

  const loadCVFiles = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get current CV from profile
      const files: CVFile[] = [];
      
      if (profile?.cvFilePath) {
        // Extract filename from path
        const urlParts = profile.cvFilePath.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        files.push({
          id: 'current',
          name: fileName,
          size: 0, // Size not available from URL
          uploadDate: profile.lastUpdated || new Date().toISOString(),
          url: profile.cvFilePath,
          type: 'application/pdf'
        });
      }
      
      setCvFiles(files);
    } catch (error) {
      console.error('Error loading CV files:', error);
      setError('Erreur lors du chargement des fichiers CV');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0] || !user?.id) return;
    
    const file = files[0];
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Le fichier est trop volumineux (limite: 5MB)');
      return;
    }
    
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez PDF, DOC ou DOCX.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Upload file to Supabase storage
      const timestamp = Date.now();
      const filePath = `cvs/${user.id}/${timestamp}_${file.name}`;
      
      await SupabaseService.uploadFile('cvs', filePath, file);
      const publicUrl = SupabaseService.getFileUrl('cvs', filePath);
      
      // Update profile with new CV path
      await SupabaseService.updateUserProfile(user.id, {
        cvFilePath: filePath, // Store the file path, not the public URL
        lastUpdated: new Date().toISOString()
      });
      
      // Update Redux store
      dispatch(updateProfile({ 
        cvFilePath: filePath,
        lastUpdated: new Date().toISOString()
      }));
      
      // Reload files
      await loadCVFiles();
      
    } catch (error) {
      console.error('Error uploading CV:', error);
      setError('Erreur lors du téléversement du CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (cvFile: CVFile) => {
    try {
      // For files stored with file path, get the public URL
      const downloadUrl = cvFile.url.startsWith('http') 
        ? cvFile.url 
        : SupabaseService.getFileUrl('cvs', cvFile.url);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cvFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CV:', error);
      setError('Erreur lors du téléchargement du CV');
    }
  };

  const handlePreview = (cvFile: CVFile) => {
    const previewUrl = cvFile.url.startsWith('http') 
      ? cvFile.url 
      : SupabaseService.getFileUrl('cvs', cvFile.url);
    
    setPreviewUrl(previewUrl);
  };

  const handleDelete = async (cvFile: CVFile) => {
    if (!user?.id) return;
    
    setDeleting(cvFile.id);
    setError(null);
    
    try {
      // Delete file from storage if it's a file path
      if (profile?.cvFilePath && !profile.cvFilePath.startsWith('http')) {
        await SupabaseService.deleteFile('cvs', profile.cvFilePath);
      }
      
      // Update profile to remove CV path
      await SupabaseService.updateUserProfile(user.id, {
        cvFilePath: '',
        lastUpdated: new Date().toISOString()
      });
      
      // Update Redux store
      dispatch(updateProfile({ 
        cvFilePath: '',
        lastUpdated: new Date().toISOString()
      }));
      
      // Reload files
      await loadCVFiles();
      
    } catch (error) {
      console.error('Error deleting CV:', error);
      setError('Erreur lors de la suppression du CV');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Taille inconnue';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Chargement des CV...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des CV</h3>
          <button
            onClick={loadCVFiles}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            id="cv-upload"
            disabled={uploading}
          />
          <label
            htmlFor="cv-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center space-y-3">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-blue-600" />
              )}
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? 'Téléversement en cours...' : 'Téléverser un nouveau CV'}
                </p>
                <p className="text-sm text-gray-600">
                  PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* CV Files List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes CV</h3>
        
        {cvFiles.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun CV téléversé</p>
            <p className="text-sm text-gray-500">Commencez par téléverser votre premier CV</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cvFiles.map((cvFile) => (
              <motion.div
                key={cvFile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{cvFile.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatFileSize(cvFile.size)}</span>
                      <span>{new Date(cvFile.uploadDate).toLocaleDateString('fr-FR')}</span>
                      {cvFile.id === 'current' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actuel
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreview(cvFile)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Aperçu"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(cvFile)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cvFile)}
                    disabled={deleting === cvFile.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    {deleting === cvFile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CV Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Aperçu du CV</h3>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border border-gray-300 rounded"
                  title="CV Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CVManager;