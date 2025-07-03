import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  UserPlus,
  Download,
  Ban,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { AdminService, User } from '../../services/adminService';
import UserManagementModal, { UserData } from '../../components/admin/UserManagementModal';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, suspended: 0, admin: 0, premium: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await AdminService.getUsers({
        page: 1,
        pageSize: 50,
        search: searchTerm,
        // role: roleFilter === 'all' ? undefined : roleFilter, // Role filter in backend if available
        // status: statusFilter === 'all' ? undefined : statusFilter, // Status filter in backend if available
      });

      const filteredData = data
        .filter(u => roleFilter === 'all' || u.role?.toLowerCase() === roleFilter.toLowerCase())
        .filter(u => statusFilter === 'all' || u.status.toLowerCase() === statusFilter.toLowerCase());

      setUsers(filteredData);

      // Update stats
      const total = count || 0;
      const active = data.filter(u => u.status === 'active').length;
      const inactive = data.filter(u => u.status === 'inactive').length;
      const suspended = data.filter(u => u.status === 'suspended').length;
      const admin = data.filter(u => u.role === 'Admin').length;
      const premium = data.filter(u => u.role === 'Premium').length;
      setStats({ total, active, inactive, suspended, admin, premium });

    } catch (err) {
      toast.error('Erreur lors de la récupération des utilisateurs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (mode: 'create' | 'edit', user: User | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

    const handleSaveUser = async (userData: UserData) => {

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        if (modalMode === 'edit' && selectedUser) {
          await AdminService.updateUser(selectedUser.id, {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
          });
        } else {
          await AdminService.createUser(userData);
        }
        await fetchUsers();
        handleCloseModal();
        resolve();
      } catch (err) {
        console.error('Error saving user:', err);
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Enregistrement en cours...',
      success: 'Utilisateur enregistré avec succès!',
            error: "Erreur lors de l'enregistrement.",
    }).finally(() => {});
  };

    const handleDeleteUser = (userId: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur ?`)) return;

    const promise = AdminService.deleteUser(userId).then(() => fetchUsers());

    toast.promise(promise, {
      loading: 'Suppression en cours...',
      success: 'Utilisateur supprimé avec succès!',
      error: 'Erreur lors de la suppression.',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'premium': return <Shield className="h-4 w-4 text-yellow-600" />;
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
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">Gérez les utilisateurs, leurs rôles et leurs permissions.</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={() => handleOpenModal('create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[ 
          { title: 'Total', value: stats.total, icon: Users },
          { title: 'Actifs', value: stats.active, icon: CheckCircle },
          { title: 'Admins', value: stats.admin, icon: ShieldCheck },
          { title: 'Premium', value: stats.premium, icon: Shield },
          { title: 'Inactifs', value: stats.inactive, icon: XCircle },
          { title: 'Suspendus', value: stats.suspended, icon: Ban },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="premium">Premium</option>
            <option value="user">Utilisateur</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Dernière connexion</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'Jamais'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModal('edit', user)} className="p-1 text-gray-400 hover:text-blue-600"><Edit3 className="h-4 w-4" /></button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
                <UserManagementModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          user={selectedUser}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default AdminUsers;