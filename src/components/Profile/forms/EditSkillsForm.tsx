import React, { useState } from 'react';
import { Skill } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { X, Plus } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';

interface EditSkillsFormProps {
  skills: Skill[];
  onAdd: (skillName: string) => void;
  onRemove: (skillName: string) => void;
}

const EditSkillsForm: React.FC<EditSkillsFormProps> = ({ skills, onAdd, onRemove }) => {
  const [newSkill, setNewSkill] = useState('');

  const handleAddClick = () => {
    if (newSkill.trim() && !skills.some(s => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      onAdd(newSkill.trim());
      setNewSkill('');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Compétences</h3>
      <div className="space-y-2">
        <Label htmlFor="skill-input">Ajouter une compétence</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="skill-input"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Ex: JavaScript, Gestion de projet..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddClick();
              }
            }}
          />
          <Button onClick={handleAddClick} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>
      
      {skills && skills.length > 0 && (
        <div>
          <Label>Vos compétences actuelles</Label>
          <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg border">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-sm font-medium py-1 px-3">
                {skill.name}
                <button
                  onClick={() => onRemove(skill.name)}
                  className="ml-2 rounded-full hover:bg-gray-300/50 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSkillsForm;
