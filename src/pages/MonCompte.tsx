import React, { useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import UpdatePasswordForm from '../components/Auth/UpdatePasswordForm';
import ProfileEditModal from '../components/Profile/ProfileEditModal';
import { Edit3, Key } from 'lucide-react';

const MonCompte: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Compte</h1>
      {user ? (
        <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto space-y-6">
          {/* Infos utilisateur */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="block text-gray-500 text-sm">Nom complet</span>
              <button onClick={() => setShowEdit(true)} className="text-blue-600 flex items-center space-x-1">
                <Edit3 className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            </div>
            <span className="font-medium text-lg">{user.firstName} {user.lastName}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">Rôle</span>
            <span className="font-medium">{user.role}</span>
          </div>
          {profile && (
            <>
              <div>
                <span className="block text-gray-500 text-sm">Téléphone</span>
                <span className="font-medium">{profile.phone || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Date de naissance</span>
                <span className="font-medium">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Localisation</span>
                <span className="font-medium">{profile.location || 'Non renseignée'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-sm">Titre professionnel</span>
                <span className="font-medium">{profile.title || 'Non renseigné'}</span>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              <Key className="h-4 w-4" />
              <span>Changer le mot de passe</span>
            </button>
          </div>

          {/* Modale d'édition du profil */}
          {showEdit && profile && (
            <ProfileEditModal profile={profile} onClose={() => setShowEdit(false)} />
          )}

          {/* Formulaire de changement de mot de passe */}
          {showPassword && (
            <div className="mt-6">
              <UpdatePasswordForm />
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-700">Aucune donnée utilisateur trouvée.</p>
      )}
    </div>
  );
};

export default MonCompte;
