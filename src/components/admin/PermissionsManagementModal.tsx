import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'all';
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
}

interface PermissionsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  permissions: Permission[];
  onSave: (roleData: Role) => Promise<void>;
  mode: 'create' | 'edit';
}

const PermissionsManagementModal: React.FC<PermissionsManagementModalProps> = ({
  isOpen,
  onClose,
  role,
  permissions,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<Role>({
    id: '',
    name: '',
    description: '',
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Group permissions by resource
  const permissionsByResource: Record<string, Permission[]> = {};
  permissions.forEach(permission => {
    if (!permissionsByResource[permission.resource]) {
      permissionsByResource[permission.resource] = [];
    }
    permissionsByResource[permission.resource].push(permission);
  });

  useEffect(() => {
    if (role && mode === 'edit') {
      setFormData({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      // Reset form for create mode
      setFormData({
        id: '',
        name: '',
        description: '',
        permissions: []
      });
    }
    
    setError(null);
    setSuccess(false);
  }, [role, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleResourceToggle = (_resource: string, resourcePermissions: Permission[]) => {
    setFormData(prev => {
      const resourcePermissionIds = resourcePermissions.map(p => p.id);
      const allSelected = resourcePermissionIds.every(id => prev.permissions.includes(id));
      
      let newPermissions;
      if (allSelected) {
        // Remove all permissions for this resource
        newPermissions = prev.permissions.filter(id => !resourcePermissionIds.includes(id));
      } else {
        // Add all permissions for this resource
        const currentPermissions = new Set(prev.permissions);
        resourcePermissionIds.forEach(id => currentPermissions.add(id));
        newPermissions = Array.from(currentPermissions);
      }
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name.trim()) {
      setError('Le nom du rôle est requis');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      setSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'read': return 'Lecture';
      case 'write': return 'Écriture';
      case 'delete': return 'Suppression';
      case 'all': return 'Tous';
      default: return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return <Eye className="h-4 w-4" />;
      case 'write': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'all': return <Check className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
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
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6" />
                  <h2 className="text-xl font-bold">
                    {mode === 'create' ? 'Créer un rôle' : 'Modifier le rôle'}
                  </h2>
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
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {mode === 'create' ? 'Rôle créé avec succès !' : 'Rôle mis à jour avec succès !'}
                  </h3>
                  <p className="text-gray-600">
                    {mode === 'create' 
                      ? 'Le nouveau rôle a été créé avec les permissions sélectionnées.' 
                      : 'Les permissions du rôle ont été mises à jour.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Role Information */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du rôle
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                    
                    <div className="space-y-6">
                      {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => {
                        const allSelected = resourcePermissions.every(p => 
                          formData.permissions.includes(p.id)
                        );
                        
                        return (
                          <div key={resource} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div 
                              className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                              onClick={() => handleResourceToggle(resource, resourcePermissions)}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`p-1 rounded-full ${allSelected ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                  {allSelected ? (
                                    <Unlock className={`h-4 w-4 ${allSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  ) : (
                                    <Lock className={`h-4 w-4 ${allSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  )}
                                </div>
                                <h4 className="font-medium text-gray-900 capitalize">{resource}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  {resourcePermissions.filter(p => formData.permissions.includes(p.id)).length} / {resourcePermissions.length}
                                </span>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                  allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                }`}>
                                  {allSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {resourcePermissions.map(permission => (
                                  <div 
                                    key={permission.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handlePermissionToggle(permission.id)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className={`p-1 rounded-full ${
                                        formData.permissions.includes(permission.id) ? 'bg-blue-100' : 'bg-gray-100'
                                      }`}>
                                        {getActionIcon(permission.action)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                        <p className="text-xs text-gray-600">{getActionLabel(permission.action)}</p>
                                      </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                      formData.permissions.includes(permission.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                    }`}>
                                      {formData.permissions.includes(permission.id) && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{mode === 'create' ? 'Créer' : 'Enregistrer'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PermissionsManagementModal;