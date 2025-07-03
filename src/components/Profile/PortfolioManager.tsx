import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addPortfolioItem, updatePortfolioItem, removePortfolioItem, PortfolioItem } from '../../store/slices/profileSlice';
import { CVService } from '../../services/cvService';

const PortfolioManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formState, setFormState] = useState({ id: '', title: '', description: '', url: '', imageUrl: '', tags: '' });

  useEffect(() => {
    if (editingItem) {
      setFormState({
        id: editingItem.id,
        title: editingItem.title,
        description: editingItem.description,
        url: editingItem.url || '',
        imageUrl: editingItem.imageUrl || '',
        tags: editingItem.tags.join(', '),
      });
    } else {
      setFormState({ id: '', title: '', description: '', url: '', imageUrl: '', tags: '' });
    }
  }, [editingItem]);

  const handleSave = async () => {
    if (!user?.id || !formState.title) {
      toast.error('Le titre est requis.');
      return;
    }

    const { id, ...portfolioData } = { 
      ...formState, 
      tags: formState.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      if (editingItem && editingItem.id) {
        await CVService.updatePortfolioItemInProfile(user.id, editingItem.id, portfolioData);
        dispatch(updatePortfolioItem({ id: editingItem.id, data: portfolioData }));
        toast.success('Projet mis à jour!');
      } else {
        const addedItem = await CVService.addPortfolioItemToProfile(user.id, portfolioData);
        dispatch(addPortfolioItem(addedItem));
        toast.success('Projet ajouté!');
      }
      setEditingItem(null);
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde du projet.');
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!user?.id) return;
    try {
      await CVService.removePortfolioItemFromProfile(user.id, itemId);
      dispatch(removePortfolioItem(itemId));
      toast.success('Projet supprimé!');
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleAddNew = () => {
    setEditingItem({ id: '', title: '', description: '', url: '', imageUrl: '', tags: [] });
  };

  const renderForm = () => (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <h4 className="font-bold mb-2">{editingItem && editingItem.id ? 'Modifier le projet' : 'Ajouter un projet'}</h4>
      <input type="text" placeholder="Titre" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <textarea placeholder="Description" value={formState.description} onChange={e => setFormState({ ...formState, description: e.target.value })} className="w-full p-2 border rounded mb-2"></textarea>
      <input type="text" placeholder="URL du projet" value={formState.url} onChange={e => setFormState({ ...formState, url: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <input type="text" placeholder="URL de l'image" value={formState.imageUrl} onChange={e => setFormState({ ...formState, imageUrl: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <input type="text" placeholder="Tags (séparés par virgules)" value={formState.tags} onChange={e => setFormState({ ...formState, tags: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Enregistrer</button>
      <button onClick={() => setEditingItem(null)} className="ml-2 text-gray-500">Annuler</button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Portfolio</h3>
        {!editingItem && <button onClick={handleAddNew} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Ajouter un projet</button>}
      </div>
      
      {editingItem !== null && renderForm()}

      {profile?.portfolio?.map((item: PortfolioItem) => (
        <div key={item.id} className="mb-4 p-4 border rounded-md flex justify-between items-start">
          <div>
            <h4 className="font-bold">{item.title}</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">Voir le projet</a>}
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag: string) => <span key={tag} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{tag}</span>)}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <button onClick={() => setEditingItem(item)} className="text-blue-500 mr-2">Modifier</button>
            <button onClick={() => handleRemove(item.id)} className="text-red-500">Supprimer</button>
          </div>
        </div>
      ))}

      {profile?.portfolio?.length === 0 && !editingItem && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Aucun projet dans votre portfolio pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
