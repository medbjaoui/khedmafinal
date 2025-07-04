import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const LoadingFallback = ({ text = 'Chargement...' }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

// HOC pour wrapper les composants lazy avec Suspense
export const withLazyLoading = <P extends object>(
  LazyComponent: ComponentType<P>,
  fallbackText?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback text={fallbackText} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded components pour les pages principales
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyProfile = lazy(() => import('../pages/Profile'));
export const LazyJobs = lazy(() => import('../pages/Jobs'));
export const LazyApplications = lazy(() => import('../pages/Applications'));
export const LazyCVAnalysis = lazy(() => import('../pages/CVAnalysis'));
export const LazyCVGenerator = lazy(() => import('../pages/CVGenerator'));
export const LazyAnalytics = lazy(() => import('../pages/Analytics'));
export const LazySavedJobs = lazy(() => import('../pages/SavedJobs'));
export const LazySettings = lazy(() => import('../pages/Settings'));
export const LazyTasks = lazy(() => import('../pages/Tasks'));
export const LazyReports = lazy(() => import('../pages/Reports'));

// Lazy loaded admin components
export const LazyAdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
export const LazyAdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
export const LazyAdminJobs = lazy(() => import('../pages/admin/AdminJobs'));
export const LazyAdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
export const LazyAdminSystem = lazy(() => import('../pages/admin/AdminSystem'));
export const LazyAdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
export const LazyAdminLogs = lazy(() => import('../pages/admin/AdminLogs'));

// Lazy loaded components pour les modals lourds
export const LazyApplicationModal = lazy(() => import('../components/Applications/ApplicationModal'));
export const LazyJobDetailsModal = lazy(() => import('../components/Jobs/JobDetailsModal'));
export const LazyProfileEditModal = lazy(() => import('../components/Profile/ProfileEditModal'));
export const LazyAITemplateManager = lazy(() => import('../components/Applications/AITemplateManager'));
export const LazyNotificationCenter = lazy(() => import('../components/Notifications/NotificationCenter'));

// Wrapped components avec loading states
export const Dashboard = withLazyLoading(LazyDashboard, 'Chargement du tableau de bord...');
export const Profile = withLazyLoading(LazyProfile, 'Chargement du profil...');
export const Jobs = withLazyLoading(LazyJobs, 'Chargement des offres...');
export const Applications = withLazyLoading(LazyApplications, 'Chargement des candidatures...');
export const CVAnalysis = withLazyLoading(LazyCVAnalysis, 'Chargement de l\'analyse CV...');
export const CVGenerator = withLazyLoading(LazyCVGenerator, 'Chargement du générateur de CV...');
export const Analytics = withLazyLoading(LazyAnalytics, 'Chargement des statistiques...');
export const SavedJobs = withLazyLoading(LazySavedJobs, 'Chargement des favoris...');
export const Settings = withLazyLoading(LazySettings, 'Chargement des paramètres...');
export const Tasks = withLazyLoading(LazyTasks, 'Chargement des tâches...');
export const Reports = withLazyLoading(LazyReports, 'Chargement des rapports...');

// Admin components
export const AdminDashboard = withLazyLoading(LazyAdminDashboard, 'Chargement administration...');
export const AdminUsers = withLazyLoading(LazyAdminUsers, 'Chargement des utilisateurs...');
export const AdminJobs = withLazyLoading(LazyAdminJobs, 'Chargement de la gestion emplois...');
export const AdminAnalytics = withLazyLoading(LazyAdminAnalytics, 'Chargement analytics admin...');
export const AdminSystem = withLazyLoading(LazyAdminSystem, 'Chargement système...');
export const AdminSettings = withLazyLoading(LazyAdminSettings, 'Chargement paramètres admin...');
export const AdminLogs = withLazyLoading(LazyAdminLogs, 'Chargement des logs...');

// Modal components
export const ApplicationModal = withLazyLoading(LazyApplicationModal, 'Chargement formulaire...');
export const JobDetailsModal = withLazyLoading(LazyJobDetailsModal, 'Chargement détails...');
export const ProfileEditModal = withLazyLoading(LazyProfileEditModal, 'Chargement édition...');
export const AITemplateManager = withLazyLoading(LazyAITemplateManager, 'Chargement templates IA...');
export const NotificationCenter = withLazyLoading(LazyNotificationCenter, 'Chargement notifications...');
