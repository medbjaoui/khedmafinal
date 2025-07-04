import React from 'react';
import { Skill } from '../../store/slices/profileSlice';
import { Plus, Award, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SkillsSectionProps {
  skills: Skill[];
  onAdd: () => void;
  onRemove: (skillName: string) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onAdd, onRemove }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compétences</CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        {(skills?.length || 0) > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 text-sm font-medium flex items-center gap-2">
                <span>{skill.name}</span>
                <span className="text-xs bg-background/60 text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {skill.level}
                </span>
                <button
                  onClick={() => onRemove(skill.name)}
                  className="text-muted-foreground hover:text-destructive rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Award className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">Aucune compétence ajoutée</h3>
            <p className="mt-1 text-sm text-muted-foreground">Listez vos compétences pour montrer ce que vous savez faire.</p>
            <Button size="sm" className="mt-4" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une compétence
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
