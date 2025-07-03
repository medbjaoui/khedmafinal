import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CVTemplate from './CVTemplate';

const CVBuilder: React.FC = () => {
  const { profile } = useAppSelector((state) => state.profile);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    if (!profile) return;

    setIsGenerating(true);

    const templateElement = document.getElementById('cv-template-container');
    if (!templateElement) {
        console.error('CV template element not found');
        setIsGenerating(false);
        return;
    }

    const canvas = await html2canvas(templateElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    const width = pdfWidth;
    const height = width / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`CV_${profile.firstName}_${profile.lastName}.pdf`);

    setIsGenerating(false);
  };

  if (!profile) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">CV Builder</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Utilisez les informations de votre profil pour générer un CV professionnel. Choisissez un modèle et téléchargez-le au format PDF.
      </p>
      
      <div className="mt-4">
        <button 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          onClick={generatePdf}
          disabled={isGenerating}
        >
          {isGenerating ? 'Génération en cours...' : 'Télécharger le CV (PDF)'}
        </button>
      </div>

      {/* Hidden container for the template to be rendered for PDF generation */}
      <div id="cv-template-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <CVTemplate profile={profile} />
      </div>
    </div>
  );
};

export default CVBuilder;
