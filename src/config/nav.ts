import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Send,
  Bookmark,
  TrendingUp,
  Settings,
  User,
  Shield,
  Server,
  Users,
  BarChart3,
  FileSignature,
} from 'lucide-react';

export type NavItem = {
  path: string;
  icon: React.ElementType;
  label: string;
};

export const userNavConfig: { main: NavItem[], analytics: NavItem[], settings: NavItem[] } = {
  main: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jobs', icon: Briefcase, label: "Offres d'emploi" },
    { path: '/applications', icon: Send, label: 'Candidatures' },
    { path: '/saved', icon: Bookmark, label: 'Favoris' },
    { path: '/cv-analysis', icon: FileText, label: 'Analyse CV' },
    { path: '/cv-generator', icon: FileSignature, label: 'Générateur CV' },
  ],
  analytics: [
    { path: '/analytics', icon: TrendingUp, label: 'Statistiques' },
  ],
  settings: [
    { path: '/profile', icon: User, label: 'Mon Profil' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ],
};

export const adminNavConfig: { main: NavItem[], analytics: NavItem[], settings: NavItem[] } = {
  main: [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/jobs', icon: Briefcase, label: 'Gestion Offres' },
  ],
  analytics: [
    { path: '/admin/analytics', icon: BarChart3, label: 'Statistiques' },
  ],
  settings: [
    { path: '/admin/system', icon: Server, label: 'Système' },
    { path: '/admin/security', icon: Shield, label: 'Sécurité' },
    { path: '/admin/settings', icon: Settings, label: 'Configuration' },
  ],
};
