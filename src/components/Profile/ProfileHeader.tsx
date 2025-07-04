import React from 'react';
import { Download, Edit3, FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';

// Types remain the same for now, can be refactored later if needed
interface Profile {
  firstName?: string;
  lastName?: string;
  title?: string;
  profilePictureUrl?: string;
}

interface User {
  firstName?: string;
  lastName?: string;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  user: User | null;
  profileCompletion: number;
  onEdit: () => void;
  onDownloadCV: () => void;
  onManageCoverLetters: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  user, 
  profileCompletion, 
  onEdit, 
  onDownloadCV,
  onManageCoverLetters
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const fullName = `${profile?.firstName || user?.firstName || ''} ${profile?.lastName || user?.lastName || ''}`.trim();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarImage src={profile?.profilePictureUrl} alt={fullName} />
              <AvatarFallback>{getInitials(profile?.firstName || user?.firstName, profile?.lastName || user?.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{fullName || 'Utilisateur Anonyme'}</h1>
              <p className="text-md text-muted-foreground">{profile?.title || 'Titre non défini'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-shrink-0">
            <Button onClick={onEdit}><Edit3 className="mr-2 h-4 w-4"/>Modifier</Button>
            <Button variant="outline" onClick={onDownloadCV}><Download className="mr-2 h-4 w-4"/>CV</Button>
            <Button variant="outline" onClick={onManageCoverLetters}><FileText className="mr-2 h-4 w-4"/>Lettres</Button>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-muted-foreground">Complétion du profil</p>
            <p className="text-sm font-bold text-primary">{profileCompletion}%</p>
          </div>
          <Progress value={profileCompletion} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
