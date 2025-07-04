import React, { useState } from 'react';
import { Certification } from '../../../store/slices/profileSlice';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';

interface EditCertificationsFormProps {
  onAdd: (certification: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
}

const emptyCertification: Omit<Certification, 'id'> = {
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
};

const EditCertificationsForm: React.FC<EditCertificationsFormProps> = ({ onAdd, onCancel }) => {
  const [newCertification, setNewCertification] = useState(emptyCertification);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (newCertification.name && newCertification.issuer && newCertification.issueDate) {
      onAdd(newCertification);
      setNewCertification(emptyCertification);
    }
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-6">Ajouter une certification</h4>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cert-name">Nom de la certification</Label>
            <Input id="cert-name" name="name" value={newCertification.name} onChange={handleInputChange} placeholder="Ex: Certified Cloud Practitioner" />
          </div>
          <div>
            <Label htmlFor="cert-issuer">Organisme de délivrance</Label>
            <Input id="cert-issuer" name="issuer" value={newCertification.issuer} onChange={handleInputChange} placeholder="Ex: Amazon Web Services" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cert-issueDate">Date d'obtention</Label>
            <Input id="cert-issueDate" name="issueDate" type="date" value={newCertification.issueDate} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="cert-expiryDate">Date d'expiration (optionnel)</Label>
            <Input id="cert-expiryDate" name="expiryDate" type="date" value={newCertification.expiryDate || ''} onChange={handleInputChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="cert-credentialId">ID de la certification (optionnel)</Label>
          <Input id="cert-credentialId" name="credentialId" value={newCertification.credentialId || ''} onChange={handleInputChange} placeholder="Entrez l'ID de la certification" />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit}>Ajouter la certification</Button>
      </div>
    </div>
  );
};

export default EditCertificationsForm;
