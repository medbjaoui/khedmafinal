import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  Mail,
  Calendar,
  MoreVertical,
  UserPlus,
  Download,
  Upload,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'User' | 'Premium';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  applicationsCount: number;
  profileCompletion: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'Admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: '2024-01-15T10:30:00.000Z',
      applicationsCount: 15,
      profileCompletion: 95
    },
    {
      id: '2',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      email: 'ahmed.benali@email.com',
      role: 'Premium',
      status: 'active',
      createdAt: '2024-01-05T00:00:00.000Z',
      lastLogin: '2024-01-14T15:20:00.000Z',
      applicationsCount: 23,
      profileCompletion: 88
    },
    {
      id: '3',
      firstName: 'Fatma',
      lastName: 'Trabelsi',
      email: 'fatma.trabelsi@email.com',
      role: 'User',
      status: 'active',
      createdAt: '2024-01-10T00:00:00.000Z',
      lastLogin: '2024-01-13T09:15:00.000Z',
      applicationsCount: 8,
      profileCompletion: 72
    },
    {
      id: '4',
      firstName: 'Mohamed',
      lastName: 'Gharbi',
      email: 'mohamed.gharbi@email.com',
      role: 'User',
      status: 'inactive',
      createdAt: '2024-01-08T00:00:00.000Z',
      applicationsCount: 3,
      profileCompletion: 45
    },
    {
      id: '5',
      firstName: 'Leila',
      lastName: 'Mansouri',
      email: 'leila.mansouri@email.com',
      role: 'User',
      status: 'suspended',
      createdAt: '2024-01-12T00:00:00.000Z',
      lastLogin: '2024-01-12T14:45:00.000Z',
      applicationsCount: 12,
      profileCompletion: 67
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User' | 'Premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => u.role === 'Admin').length,
    premium: users.filter(u => u.role === 'Premium').length
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'Premium': return <Shield className="h-4 w-4 text-yellow-600" />;
      default: return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleUserAction = (userId: string, action: 'edit' | 'suspend' | 'activate' | 'delete') => {
    switch (action) {
      case 'edit':
        console.log('Edit user:', userId);
        break;
      case 'suspend':
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'suspended' as const } : user
        ));
        break;
      case 'activate':
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'active' as const } : user
        ));
        break;
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          setUsers(users.filter(user => user.id !== userId));
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nouvel utilisateur</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: userStats.total, color: 'bg-gray-100 text-gray-800' },
          { label: 'Actifs', value: userStats.active, color: 'bg-green-100 text-green-800' },
          { label: 'Inactifs', value: userStats.inactive, color: 'bg-gray-100 text-gray-800' },
          { label: 'Suspendus', value: userStats.suspended, color: 'bg-red-100 text-red-800' },
          { label: 'Admins', value: userStats.admins, color: 'bg-red-100 text-red-800' },
          { label: 'Premium', value: userStats.premium, color: 'bg-yellow-100 text-yellow-800' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className={`text-sm px-2 py-1 rounded-full ${stat.color}`}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="Admin">Admin</option>
            <option value="Premium">Premium</option>
            <option value="User">Utilisateur</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Candidatures</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Profil</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Dernière connexion</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">
                      {user.applicationsCount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            user.profileCompletion >= 80 ? 'bg-green-500' :
                            user.profileCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${user.profileCompletion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{user.profileCompletion}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {user.lastLogin ? 
                        new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Jamais'
                      }
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Suspendre"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                          title="Activer"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUsers;