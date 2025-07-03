import React, { useState } from 'react';
import { Plus, X, Star, Zap, BrainCircuit, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skill } from '../../store/slices/profileSlice';

interface SkillsManagerProps {
  skills: Skill[];
  onAddSkill: (skill: Omit<Skill, 'verified'>) => Promise<void>;
  onRemoveSkill: (skillName: string) => Promise<void>;
}

const categoryIcons = {
  Technique: <Zap className="w-4 h-4" />,
  Linguistique: <Languages className="w-4 h-4" />,
  'Soft Skills': <BrainCircuit className="w-4 h-4" />,
  Outils: <Star className="w-4 h-4" />,
};

const SkillsManager: React.FC<SkillsManagerProps> = ({ skills, onAddSkill, onRemoveSkill }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'verified'>>({
    name: '',
    level: 'Intermédiaire',
    category: 'Technique',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSkill({ name: '', level: 'Intermédiaire', category: 'Technique' });
  };

  const handleSave = async () => {
    if (!newSkill.name) return;
    setIsLoading(true);
    try {
      await onAddSkill(newSkill);
      handleCancel();
    } catch (error) {
      console.error("Failed to add skill", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (skillName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la compétence "${skillName}" ?`)) {
        await onRemoveSkill(skillName);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Compétences</h3>
        {!isAdding && (
          <button 
            onClick={handleAddClick}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom de la compétence (ex: React)"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
                <option>Expert</option>
              </select>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as Skill['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Technique</option>
                <option>Linguistique</option>
                <option>Soft Skills</option>
                <option>Outils</option>
              </select>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">{isLoading ? 'Ajout...' : 'Enregistrer'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex items-center bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200"
            >
              {categoryIcons[skill.category]}
              <span className="mx-2">{skill.name} - {skill.level}</span>
              <button onClick={() => handleRemove(skill.name)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4 text-blue-500 hover:text-blue-700" />
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Aucune compétence ajoutée pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default SkillsManager;
