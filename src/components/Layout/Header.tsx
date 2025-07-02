import React, { useState } from 'react';
import { Bell, Search, User, Menu, Settings, LogOut, ChevronDown, MessageSquare, Calendar, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const notifications = [
    {
      id: '1',
      title: 'Nouvelle candidature',
      message: 'Votre candidature chez TechCorp a été vue',
      time: '5 min',
      unread: true,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '2',
      title: 'Entretien programmé',
      message: 'Entretien chez Digital Solutions demain à 14h',
      time: '1h',
      unread: true,
      icon: Calendar,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '3',
      title: 'Profil mis à jour',
      message: 'Votre profil a été synchronisé avec succès',
      time: '2h',
      unread: false,
      icon: User,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: '4',
      title: 'Nouveau message',
      message: 'Vous avez reçu une réponse de CloudTech',
      time: '3h',
      unread: false,
      icon: MessageSquare,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Khedma<span className="text-blue-600">Clair</span>
              </h1>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un emploi, entreprise..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-16 bg-white p-4 border-b border-gray-200 shadow-md md:hidden z-50"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un emploi, entreprise..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-6 w-6" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <span className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                        Tout marquer comme lu
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-11"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors w-full text-center">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  {user ? (
                    <span className="text-blue-700 font-semibold text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'Profil'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        to="/profile"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mon Profil</span>
                      </Link>
                      <Link 
                        to="/settings"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications || showSearch) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
            setShowSearch(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header;