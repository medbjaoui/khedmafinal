import React from 'react';
import { Experience } from '../../store/slices/profileSlice';
import { Plus, Calendar, MapPin, Edit3, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, onAdd, onEdit }) => {
  const formatEndDate = (exp: Experience) => {
    if (exp.current) return 'Présent';
    if (exp.endDate) return format(new Date(exp.endDate), 'MMM yyyy', { locale: fr });
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expériences professionnelles</CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        {(experiences?.length || 0) > 0 ? (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <React.Fragment key={exp.id}>
                <div className="flex gap-4">
                  <div className="mt-1 h-8 w-8 flex-shrink-0">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{exp.position}</h4>
                        <p className="text-sm text-primary font-medium">{exp.company}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(exp.startDate), 'MMM yyyy', { locale: fr })} - {formatEndDate(exp)}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(exp.id)} className="flex-shrink-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    {exp.description && (
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                </div>
                {index < experiences.length - 1 && <Separator className="my-6" />} 
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">Aucune expérience ajoutée</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ajoutez vos expériences pour attirer les recruteurs.</p>
            <Button size="sm" className="mt-4" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une expérience
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExperienceSection;
