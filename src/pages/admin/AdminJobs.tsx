import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Building,
  Calendar,
  Clock,
  Users,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Freelance' | 'Stage';
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'expired';
  posted_date: string;
  expires_at?: string;
  applicants: number;
  views: number;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Développeur Full Stack Senior',
    company: 'TechCorp',
    location: 'Paris, France',
    type: 'CDI',
    salary: '55000-70000 EUR',
    description: 'Nous recherchons un développeur full stack expérimenté...',
    requirements: ['React', 'Node.js', '5+ ans d\'expérience'],
    benefits: ['Télétravail', 'Assurance santé', 'Formation'],
    status: 'active',
    posted_date: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 23,
    views: 156
  },
  {
    id: '2',
    title: 'Designer UI/UX',
    company: 'CreativeStudio',
    location: 'Lyon, France',
    type: 'CDD',
    salary: '40000-50000 EUR',
    description: 'Rejoignez notre équipe créative pour concevoir...',
    requirements: ['Figma', 'Adobe Creative Suite', '3+ ans d\'expérience'],
    benefits: ['Horaires flexibles', 'Équipement fourni'],
    status: 'active',
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 15,
    views: 89
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'DataInsights',
    location: 'Remote',
    type: 'CDI',
    salary: '60000-80000 EUR',
    description: 'Analysez et exploitez les données pour...',
    requirements: ['Python', 'Machine Learning', 'SQL'],
    benefits: ['100% Remote', 'Stock options', 'Formation continue'],
    status: 'inactive',
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 8,
    views: 45
  }
];

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CDD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Freelance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Stage': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setJobs(jobs.map(job => 
      job.id === id 
        ? { ...job, status: job.status === 'active' ? 'inactive' : 'active' }
        : job
    ));
  };

  const jobStats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    inactive: jobs.filter(j => j.status === 'inactive').length,
    expired: jobs.filter(j => j.status === 'expired').length,
    totalApplicants: jobs.reduce((sum, job) => sum + job.applicants, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.views, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Offres d'Emploi</h1>
          <p className="text-muted-foreground mt-1">
            Administration et modération des offres d'emploi
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Offre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{jobStats.total}</p>
            <p className="text-sm text-muted-foreground">Total Offres</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{jobStats.active}</p>
            <p className="text-sm text-muted-foreground">Actives</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{jobStats.inactive}</p>
            <p className="text-sm text-muted-foreground">Inactives</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{jobStats.expired}</p>
            <p className="text-sm text-muted-foreground">Expirées</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{jobStats.totalApplicants}</p>
            <p className="text-sm text-muted-foreground">Candidatures</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{jobStats.totalViews}</p>
            <p className="text-sm text-muted-foreground">Vues</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
            <option value="expired">Expirées</option>
          </select>

          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Freelance">Freelance</option>
            <option value="Stage">Stage</option>
          </select>

          <div className="flex items-center text-sm text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" />
            {filteredJobs.length} offres trouvées
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune offre trouvée avec les filtres actuels</p>
            </div>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <Badge className={getTypeColor(job.type)}>
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="h-4 w-4 mr-2" />
                      {job.company}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(job.posted_date), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium">{job.salary}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {job.applicants} candidatures
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {job.views} vues
                    </div>
                    {job.expires_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Expire le {format(new Date(job.expires_at), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => handleToggleStatus(job.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      job.status === 'active' 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {job.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminJobs;