import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink, Edit3, Calendar } from 'lucide-react';
import { UserProfile } from '../../store/slices/profileSlice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface AboutSectionProps {
  profile: UserProfile | null;
  onEdit: () => void;
}

const InfoItem: React.FC<{ icon: React.ElementType, text: string | null | undefined }> = ({ icon: Icon, text }) => {
  if (!text) return null;
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
};

const LinkItem: React.FC<{ icon: React.ElementType, href: string | null | undefined, text: string }> = ({ icon: Icon, href, text }) => {
  if (!href) return null;
  return (
    <Button variant="link" asChild className="p-0 h-auto text-sm">
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center">
        <Icon className="h-4 w-4 mr-2" />
        {text}
      </a>
    </Button>
  );
};

const AboutSection: React.FC<AboutSectionProps> = ({ profile, onEdit }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>À propos</CardTitle>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {profile?.summary && (
          <p className="text-sm text-muted-foreground mb-6 whitespace-pre-wrap">
            {profile.summary}
          </p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoItem icon={Mail} text={profile?.email} />
          <InfoItem icon={Phone} text={profile?.phone} />
          <InfoItem icon={MapPin} text={profile?.location} />
          {profile?.dateOfBirth && (
            <InfoItem 
              icon={Calendar} 
              text={format(new Date(profile.dateOfBirth), 'd MMMM yyyy', { locale: fr })} 
            />
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <LinkItem icon={Linkedin} href={profile?.linkedin} text="LinkedIn" />
          <LinkItem icon={Github} href={profile?.github} text="GitHub" />
          <LinkItem icon={Globe} href={profile?.website} text="Site Web" />
          <LinkItem icon={ExternalLink} href={profile?.portfolio?.[0]?.url} text="Portfolio" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
