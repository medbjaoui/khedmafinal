import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, Zap, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';
import { userNavConfig, adminNavConfig, NavItem } from '../../config/nav';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItemLink: React.FC<{ item: NavItem; onClose: () => void }> = ({ item, onClose }) => (
  <li>
    <NavLink
      to={item.path}
      onClick={onClose} // Close sidebar on mobile nav click
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-primary/10 text-primary'
        )
      }
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  </li>
);

const NavSection: React.FC<{ title: string; items: NavItem[]; onClose: () => void }> = ({ title, items, onClose }) => (
  <div className="px-3 py-2">
    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">{title}</h2>
    <ul className="space-y-1">
      {items.map((item) => <NavItemLink key={item.path} item={item} onClose={onClose} />)}
    </ul>
  </div>
);

const SidebarContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'Admin';
  const navConfig = isAdmin ? adminNavConfig : userNavConfig;

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="">KhedmaClair</span>
        </Link>
        <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <NavSection title="Menu" items={navConfig.main} onClose={onClose} />
        <NavSection title="Analyse" items={navConfig.analytics} onClose={onClose} />
        <NavSection title="Compte" items={navConfig.settings} onClose={onClose} />
      </nav>
      {!isAdmin && (
        <div className="mt-auto p-4">
          <div className="relative rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Mode Pro</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Débloquez toutes les fonctionnalités IA avancées.
            </p>
            <Button size="sm" className="w-full">Découvrir Pro</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-40 h-full w-72 border-r bg-background lg:hidden"
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 z-30 h-full w-64 border-r bg-background">
        <SidebarContent onClose={() => {}} />
      </aside>
    </>
  );
};

export default Sidebar;