import React from 'react';
import toast from 'react-hot-toast';
import LoginHistory from './LoginHistory';
import SkillsManager from '../../components/Profile/SkillsManager';
import CVBuilder from '../../components/Profile/CVBuilder';
import PortfolioManager from '../../components/Profile/PortfolioManager';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addSkill, removeSkill, Skill } from '../../store/slices/profileSlice';
import { CVService } from '../../services/cvService';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);

  const handleAddSkill = async (newSkill: Omit<Skill, 'verified'>) => {
    if (!user || !profile) return;

    const skillToAdd: Skill = { ...newSkill, verified: false };

    // Prevent adding duplicate skills
    if (profile.skills.some(s => s.name.toLowerCase() === skillToAdd.name.toLowerCase())) {
        toast.error('Cette compétence existe déjà.');
        return;
    }

    try {
      dispatch(addSkill(skillToAdd)); // Optimistic update
      await CVService.addSkillToProfile(user.id, newSkill);
      toast.success('Compétence ajoutée !');
    } catch (error) {
      console.error('Failed to add skill:', error);
      toast.error("Erreur lors de l'ajout de la compétence.");
      dispatch(removeSkill(skillToAdd.name)); // Rollback
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    if (!user || !profile) return;

    const skillToRemove = profile.skills.find(s => s.name === skillName);
    if (!skillToRemove) return;

    try {
      dispatch(removeSkill(skillName)); // Optimistic update
      await CVService.removeSkillFromProfile(user.id, skillName);
      toast.success('Compétence supprimée !');
    } catch (error) {
      console.error('Failed to remove skill:', error);
      toast.error('Erreur lors de la suppression de la compétence.');
      dispatch(addSkill(skillToRemove)); // Rollback
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      <div className="space-y-8">
        {profile && (
          <SkillsManager 
            skills={profile.skills || []}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
        )}
        <CVBuilder />
        <PortfolioManager />
        <LoginHistory />
      </div>
    </div>
  );
};

export default ProfilePage;
