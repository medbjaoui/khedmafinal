import React, { useState } from 'react';
import { Experience } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface EditExperienceFormProps {
  onAdd: (experience: Omit<Experience, 'id'>) => void;
  onCancel: () => void;
}

const emptyExperience: Omit<Experience, 'id'> = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  location: '',
  achievements: [''],
};

const EditExperienceForm: React.FC<EditExperienceFormProps> = ({ onAdd, onCancel }) => {
  const [newExperience, setNewExperience] = useState(emptyExperience);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setNewExperience(prev => ({ ...prev, current: checked }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const achievements = [...newExperience.achievements];
    achievements[index] = value;
    setNewExperience(prev => ({ ...prev, achievements }));
  };

  const addAchievementField = () => {
    setNewExperience(prev => ({ ...prev, achievements: [...prev.achievements, ''] }));
  };

  const removeAchievementField = (index: number) => {
    if (newExperience.achievements.length <= 1) return;
    const achievements = [...newExperience.achievements];
    achievements.splice(index, 1);
    setNewExperience(prev => ({ ...prev, achievements }));
  };

  const handleSubmit = () => {
    onAdd(newExperience);
    setNewExperience(emptyExperience);
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">Ajouter une expérience</h4>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" name="company" value={newExperience.company} onChange={handleInputChange} placeholder="Ex: Google" />
          </div>
          <div>
            <Label htmlFor="position">Poste</Label>
            <Input id="position" name="position" value={newExperience.position} onChange={handleInputChange} placeholder="Ex: Ingénieur Logiciel" />
          </div>
          <div>
            <Label htmlFor="startDate">Date de début</Label>
            <Input id="startDate" name="startDate" type="date" value={newExperience.startDate} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input id="endDate" name="endDate" type="date" value={newExperience.endDate} onChange={handleInputChange} disabled={newExperience.current} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="current" checked={newExperience.current} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="current">Poste actuel</Label>
        </div>
        <div>
          <Label htmlFor="location">Localisation</Label>
          <Input id="location" name="location" value={newExperience.location || ''} onChange={handleInputChange} placeholder="Ex: Paris, France" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={newExperience.description} onChange={handleInputChange} placeholder="Décrivez vos missions et responsabilités..." rows={4} />
        </div>
        <div>
          <Label>Réalisations</Label>
          <div className="space-y-3">
            {newExperience.achievements.map((ach, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={ach}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  placeholder={`Réalisation #${index + 1}`}
                />
                <Button variant="ghost" size="icon" onClick={() => removeAchievementField(index)} disabled={newExperience.achievements.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addAchievementField} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une réalisation
          </Button>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit}>Ajouter l'expérience</Button>
      </div>
    </div>
  );
};

export default EditExperienceForm;
