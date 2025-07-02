import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Send, 
  Bookmark, 
  Settings,
  TrendingUp,
  X,
  User,
  Zap,
  Shield,
  Users,
  BarChart3,
  CheckSquare,
  FileBarChart,
  ChevronDown,
  ChevronUp,
  Database,
  Server,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { applications } = useAppSelector(state => state.applications);
  const { jobs } = useAppSelector(state => state.jobs);
  const { user } = useAppSelector(state => state.auth);
  const { totalUsers, unresolvedAlerts } = useAppSelector((state: RootState) => state.admin);
  const [expandedSection, setExpandedSection] = React.useState<string | null>('main');

  // Navigation items for regular users
  const userMainNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/profile', icon: User, label: 'Mon Profil', badge: null },
    { path: '/cv-analysis', icon: FileText, label: 'Analyse CV', badge: null },
    { path: '/jobs', icon: Briefcase, label: "Offres d'emploi", badge: jobs.length > 0 ? `${jobs.length}` : null },
    { path: '/applications', icon: Send, label: 'Candidatures', badge: applications.length > 0 ? `${applications.length}` : null },
    { path: '/saved', icon: Bookmark, label: 'Favoris', badge: null },
  ];

  const documentsItems = [
    { path: '/profile?tab=upload', icon: FileText, label: 'Mes CVs', badge: null },
    { path: '/profile?tab=cover-letters', icon: FileText, label: 'Mes Lettres de Motivation', badge: null },
  ];

  // Navigation items for admin users
  const adminMainNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', badge: null },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs', badge: totalUsers !== null ? `${totalUsers}` : null },
    { path: '/admin/system', icon: Server, label: 'Système', badge: unresolvedAlerts !== null ? `${unresolvedAlerts}` : null },
    { path: '/admin/jobs', icon: Briefcase, label: 'Gestion Offres', badge: null },
  ];

  const analyticsItems = [
    { path: '/analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { path: '/tasks', icon: CheckSquare, label: 'Tâches', badge: null },
    { path: '/reports', icon: FileBarChart, label: 'Rapports', badge: null },
  ];

  const adminAnalyticsItems = [
    { path: '/admin/analytics', icon: BarChart3, label: 'Statistiques', badge: null },
    { path: '/admin/logs', icon: FileBarChart, label: 'Journaux', badge: null },
  ];

  const settingsItems = [
    { path: '/settings', icon: Settings, label: 'Paramètres', badge: null },
  ];

  const adminSettingsItems = [
    { path: '/admin/settings', icon: Settings, label: 'Configuration', badge: null },
    { path: '/admin/database', icon: Database, label: 'Base de données', badge: null },
    { path: '/admin/security', icon: Shield, label: 'Sécurité', badge: null },
  ];

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const isAdmin = user?.role === 'Admin';

  // Choose the appropriate navigation items based on user role
  const mainNavItems = isAdmin ? adminMainNavItems : userMainNavItems;
  const analyticsNavItems = isAdmin ? adminAnalyticsItems : analyticsItems;
  const settingsNavItems = isAdmin ? adminSettingsItems : settingsItems;

  const NavSection = ({ title, items, sectionId }: { title: string; items: typeof mainNavItems; sectionId: string }) => (
    <div className="mb-4">
      <button 
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider"
      >
        <span>{title}</span>
        {expandedSection === sectionId ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
        }
      </button>
      
      <AnimatePresence>
        {expandedSection === sectionId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <nav className="space-y-1 mt-2">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={() =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group mx-2 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon
                        className={`h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed on desktop, slide in/out on mobile */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="fixed left-0 top-0 z-50 w-70 h-full bg-white shadow-xl border-r border-gray-200 flex flex-col lg:relative lg:translate-x-0"
      >
        {/* Mobile close button */}
        <div className="flex justify-end items-center p-4 border-b border-gray-200 lg:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <NavLink to="/profile" className="block group">
            <div className="flex items-center space-x-3 cursor-pointer group-hover:bg-blue-50 rounded-lg p-2 transition">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-sm">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavSection title="Principal" items={mainNavItems} sectionId="main" />
          {!isAdmin && <NavSection title="Mes Documents" items={documentsItems} sectionId="documents" />}
          <NavSection title={isAdmin ? "Statistiques" : "Analytics & Suivi"} items={analyticsNavItems} sectionId="analytics" />
          <NavSection title={isAdmin ? "Administration" : "Paramètres"} items={settingsNavItems} sectionId="settings" />
          {isAdmin && <NavSection title="Debug" items={[
            { path: '/test-cv-upload', icon: Activity, label: 'Test Upload CV', badge: null },
            { path: '/pdf-test', icon: FileText, label: 'Test PDF Extraction', badge: null }
          ]} sectionId="debug" />}
        </div>

        {/* Footer - Only show for non-admin users */}
        {!isAdmin && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Mode Pro
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Débloquez toutes les fonctionnalités IA avancées
              </p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm">
                Découvrir Pro
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;