import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Flag,
  User,
  Briefcase,
  FileText,
  Phone,
  Mail,
  Target,
  MessageSquare
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'interview' | 'followup' | 'application' | 'profile' | 'research' | 'networking';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  company?: string;
  jobTitle?: string;
  createdDate: string;
  completedDate?: string;
  notes?: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Entretien chez TechCorp',
      description: 'Entretien technique pour le poste de Développeur Full Stack',
      type: 'interview',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-20T14:00:00',
      company: 'TechCorp Tunisia',
      jobTitle: 'Développeur Full Stack',
      createdDate: '2024-01-15T10:00:00',
      notes: 'Préparer les questions techniques sur React et Node.js'
    },
    {
      id: '2',
      title: 'Relancer Digital Solutions',
      description: 'Candidature envoyée il y a 1 semaine sans réponse',
      type: 'followup',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-22T09:00:00',
      company: 'Digital Solutions',
      jobTitle: 'Chef de Projet Digital',
      createdDate: '2024-01-14T16:30:00'
    },
    {
      id: '3',
      title: 'Mettre à jour le profil LinkedIn',
      description: 'Ajouter les nouvelles compétences et expériences',
      type: 'profile',
      priority: 'low',
      status: 'in_progress',
      dueDate: '2024-01-25T18:00:00',
      createdDate: '2024-01-12T11:00:00'
    },
    {
      id: '4',
      title: 'Rechercher entreprises fintech',
      description: 'Identifier 10 entreprises fintech en Tunisie',
      type: 'research',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-24T17:00:00',
      createdDate: '2024-01-13T14:20:00'
    },
    {
      id: '5',
      title: 'Préparer CV pour startup',
      description: 'Adapter le CV pour les postes en startup',
      type: 'application',
      priority: 'high',
      status: 'completed',
      dueDate: '2024-01-18T12:00:00',
      createdDate: '2024-01-10T09:15:00',
      completedDate: '2024-01-17T15:30:00'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Task['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  console.log('showAddModal state:', showAddModal); // Remove unused warning
  

  const getTaskIcon = (type: Task['type']) => {
    const icons = {
      interview: MessageSquare,
      followup: Phone,
      application: FileText,
      profile: User,
      research: Target,
      networking: Mail
    };
    return icons[type] || Clock;
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-blue-600'
    };
    return colors[priority];
  };

  const getStatusLabel = (status: Task['status']) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminée',
      overdue: 'En retard'
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    const labels = {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Faible'
    };
    return labels[priority];
  };

  const getTypeLabel = (type: Task['type']) => {
    const labels = {
      interview: 'Entretien',
      followup: 'Relance',
      application: 'Candidature',
      profile: 'Profil',
      research: 'Recherche',
      networking: 'Réseau'
    };
    return labels[type];
  };

  const isOverdue = (dueDate: string, status: Task['status']) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === 'all' || 
      (filter === 'overdue' ? isOverdue(task.dueDate, task.status) : task.status === filter);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesType && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in_progress' :
                         task.status === 'in_progress' ? 'completed' : 'pending';
        
        return {
          ...task,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
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
            Gestion des Tâches
          </h1>
          <p className="text-gray-600">
            Organisez et suivez toutes vos tâches liées à votre recherche d'emploi
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle tâche</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: taskStats.total, color: 'bg-gray-100 text-gray-800' },
          { label: 'En attente', value: taskStats.pending, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'En cours', value: taskStats.inProgress, color: 'bg-blue-100 text-blue-800' },
          { label: 'Terminées', value: taskStats.completed, color: 'bg-green-100 text-green-800' },
          { label: 'En retard', value: taskStats.overdue, color: 'bg-red-100 text-red-800' }
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
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="overdue">En retard</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="interview">Entretien</option>
            <option value="followup">Relance</option>
            <option value="application">Candidature</option>
            <option value="profile">Profil</option>
            <option value="research">Recherche</option>
            <option value="networking">Réseau</option>
          </select>
        </div>
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, index) => {
            const Icon = getTaskIcon(task.type);
            const isTaskOverdue = isOverdue(task.dueDate, task.status);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                  isTaskOverdue ? 'border-red-200' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <h3 className={`font-semibold ${
                          task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={isTaskOverdue ? 'text-red-600 font-medium' : ''}>
                            {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{getTypeLabel(task.type)}</span>
                        </div>
                        
                        {task.company && (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{task.company}</span>
                          </div>
                        )}
                      </div>
                      
                      {task.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{task.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Edit3 className="h-4 w-4" />
                        <span>Modifier</span>
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                ? 'Aucune tâche ne correspond à vos critères de recherche'
                : 'Vous n\'avez pas encore de tâches'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer votre première tâche
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Tasks;