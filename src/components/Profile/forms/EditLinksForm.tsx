import React from 'react';
import { UserProfile } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface EditLinksFormProps {
  formData: Partial<UserProfile>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditLinksForm: React.FC<EditLinksFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
       <h3 className="text-lg font-medium text-gray-900">Liens Externes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            value={formData.linkedin || ''}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/votre-profil"
          />
        </div>
        <div>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            type="url"
            value={formData.github || ''}
            onChange={handleInputChange}
            placeholder="https://github.com/votre-profil"
          />
        </div>
        <div>
          <Label htmlFor="website">Site Web</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website || ''}
            onChange={handleInputChange}
            placeholder="https://votre-site.com"
          />
        </div>
      </div>
    </div>
  );
};

export default EditLinksForm;
