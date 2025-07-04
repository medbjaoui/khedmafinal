import React from 'react';
import { Education } from '../../store/slices/profileSlice';
import { Plus, GraduationCap, Calendar, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface EducationSectionProps {
  education: Education[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ education, onAdd, onEdit }) => {
  const formatEndDate = (edu: Education) => {
    if (edu.current) return 'Présent';
    if (edu.endDate) return format(new Date(edu.endDate), 'MMM yyyy', { locale: fr });
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Formation</CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        {(education?.length || 0) > 0 ? (
          <div className="space-y-6">
            {education.map((edu, index) => (
              <React.Fragment key={edu.id}>
                <div className="flex gap-4">
                  <div className="mt-1 h-8 w-8 flex-shrink-0">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                        <p className="text-sm text-primary font-medium">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">{edu.field}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(edu.startDate), 'MMM yyyy', { locale: fr })} - {formatEndDate(edu)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(edu.id)} className="flex-shrink-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    {edu.description && (
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{edu.description}</p>
                    )}
                  </div>
                </div>
                {index < education.length - 1 && <Separator className="my-6" />} 
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">Aucune formation ajoutée</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ajoutez vos diplômes pour valoriser votre profil.</p>
            <Button size="sm" className="mt-4" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationSection;
