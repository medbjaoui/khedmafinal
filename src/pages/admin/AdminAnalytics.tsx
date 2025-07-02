import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Activity,
  Download
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const mockData = {
  userGrowth: Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MM/dd'),
    users: Math.floor(Math.random() * 50) + 20,
    applications: Math.floor(Math.random() * 30) + 10
  })),
  topSkills: [
    { name: 'JavaScript', value: 45, color: '#3B82F6' },
    { name: 'React', value: 38, color: '#10B981' },
    { name: 'Python', value: 32, color: '#F59E0B' },
    { name: 'Node.js', value: 28, color: '#8B5CF6' },
    { name: 'TypeScript', value: 25, color: '#EF4444' }
  ],
  jobCategories: [
    { category: 'Développement Web', count: 145 },
    { category: 'Mobile', count: 89 },
    { category: 'Data Science', count: 67 },
    { category: 'DevOps', count: 54 },
    { category: 'Design UI/UX', count: 43 }
  ]
};

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Administrateur</h1>
          <p className="text-muted-foreground mt-1">
            Insights et statistiques détaillées de la plateforme
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Utilisateurs Actifs" 
          value="2,847" 
          change="+12.5%" 
          trend="up"
          icon={Users} 
        />
        <StatCard 
          title="Candidatures" 
          value="1,432" 
          change="+8.3%" 
          trend="up"
          icon={FileText} 
        />
        <StatCard 
          title="Taux d'Engagement" 
          value="73.2%" 
          change="+5.1%" 
          trend="up"
          icon={Activity} 
        />
        <StatCard 
          title="Temps Moyen/Session" 
          value="24m 32s" 
          change="-2.4%" 
          trend="down"
          icon={Clock} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Croissance Utilisateurs</h3>
              <p className="text-sm text-muted-foreground">Nouveaux utilisateurs et candidatures</p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorUsers)"
                  name="Utilisateurs"
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="hsl(var(--accent))" 
                  fill="url(#colorApplications)"
                  name="Candidatures"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Skills */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Compétences Populaires</h3>
              <p className="text-sm text-muted-foreground">Top 5 des compétences demandées</p>
            </div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData.topSkills}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {mockData.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Job Categories */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Catégories d'Emploi</h3>
            <p className="text-sm text-muted-foreground">Distribution des offres par secteur</p>
          </div>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData.jobCategories} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;