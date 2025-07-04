import React from 'react';
import { UserProfile } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

interface EditPersonalFormProps {
  formData: Partial<UserProfile>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EditPersonalForm: React.FC<EditPersonalFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Informations Personnelles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            placeholder="Ex: Jean"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            placeholder="Ex: Dupont"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Titre du profil</Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          placeholder="Ex: Développeur Full-Stack"
        />
      </div>
      <div>
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          name="location"
          value={formData.location || ''}
          onChange={handleInputChange}
          placeholder="Ex: Paris, France"
        />
      </div>
      <div>
        <Label htmlFor="summary">Résumé</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formData.summary || ''}
          onChange={handleInputChange}
          placeholder="Parlez un peu de vous, de votre parcours et de vos ambitions..."
          rows={5}
        />
      </div>
    </div>
  );
};

export default EditPersonalForm;
