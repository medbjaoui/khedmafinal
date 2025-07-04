import React, { useState } from 'react';
import { Education } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

interface EditEducationFormProps {
  onAdd: (education: Omit<Education, 'id'>) => void;
  onCancel: () => void;
}

const emptyEducation: Omit<Education, 'id'> = {
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

const EditEducationForm: React.FC<EditEducationFormProps> = ({ onAdd, onCancel }) => {
  const [newEducation, setNewEducation] = useState(emptyEducation);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setNewEducation(prev => ({ ...prev, current: checked as boolean }));
  };

  const handleSubmit = () => {
    onAdd(newEducation);
    setNewEducation(emptyEducation);
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">Ajouter une formation</h4>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" name="institution" value={newEducation.institution} onChange={handleInputChange} placeholder="Ex: Université de Tunis" />
          </div>
          <div>
            <Label htmlFor="degree">Diplôme</Label>
            <Input id="degree" name="degree" value={newEducation.degree} onChange={handleInputChange} placeholder="Ex: Licence en Informatique" />
          </div>
        </div>
        <div>
          <Label htmlFor="field">Domaine d'étude</Label>
          <Input id="field" name="field" value={newEducation.field} onChange={handleInputChange} placeholder="Ex: Génie Logiciel" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Date de début</Label>
            <Input id="startDate" name="startDate" type="date" value={newEducation.startDate} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input id="endDate" name="endDate" type="date" value={newEducation.endDate} onChange={handleInputChange} disabled={newEducation.current} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="current-edu" checked={newEducation.current} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="current-edu">Je suis actuellement cette formation</Label>
        </div>
        <div>
          <Label htmlFor="description-edu">Description</Label>
          <Textarea id="description-edu" name="description" value={newEducation.description || ''} onChange={handleInputChange} placeholder="Décrivez la formation, les matières..." rows={3} />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit}>Ajouter la formation</Button>
      </div>
    </div>
  );
};

export default EditEducationForm;
