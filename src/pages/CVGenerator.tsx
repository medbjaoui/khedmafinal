import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { RootState } from '../store';
import { ClassicTemplate } from '../components/CV/Templates/ClassicTemplate';
import { Button } from '../components/ui/button';

const CVGenerator: React.FC = () => {
  const userProfile = useSelector((state: RootState) => state.profile.userProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | null>('classic');

  const templates = [
    { id: 'classic', name: 'Classique Professionnel', component: ClassicTemplate },
    // Ajoutez d'autres modèles ici
  ];

  const renderSelectedTemplate = () => {
    if (!userProfile) return null;

    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplate profile={userProfile} />;
      default:
        return null;
    }
  };

  if (!userProfile) {
    return <div>Veuillez d'abord compléter votre profil ou analyser un CV.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Générateur de CV</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-2">Choisissez un modèle</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <Button 
                key={template.id} 
                onClick={() => setSelectedTemplate(template.id as 'classic')}
                variant={selectedTemplate === template.id ? 'default' : 'outline'}
              >
                {template.name}
              </Button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-8">
                <PDFDownloadLink
                  document={renderSelectedTemplate()!}
                  fileName={`CV_${userProfile.lastName}_${userProfile.firstName}.pdf`}
                >
                  {({ loading }) => (
                    <Button disabled={loading}>
                      {loading ? 'Génération en cours...' : 'Télécharger le CV en PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
            </div>
          )}
        </div>

        <div className="md:col-span-2 h-[80vh]">
          <h2 className="text-xl font-semibold mb-2">Aperçu</h2>
          {selectedTemplate && (
            <PDFViewer width="100%" height="100%">
              {renderSelectedTemplate()!}
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;
