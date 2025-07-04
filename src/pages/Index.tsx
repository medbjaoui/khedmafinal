
import {
  Activity,  Briefcase,  Users,  DollarSign,  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const StatCard = ({ title, value, icon: Icon, trend, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Index = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bonjour, {user?.user_metadata?.full_name || 'Utilisateur'} 👋</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vues de profil" value="1,234" icon={Users} description="+20.1% depuis le mois dernier" />
        <StatCard title="Candidatures" value="57" icon={Briefcase} description="+12.5% depuis le mois dernier" />
        <StatCard title="Recherches actives" value="12" icon={Activity} description="+2 depuis la semaine dernière" />
        <StatCard title="Salaire moyen visé" value="2,500 TND" icon={DollarSign} description="Basé sur vos candidatures" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Offres d'emploi récentes</CardTitle>
            <CardDescription>Les dernières opportunités correspondant à votre profil.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent jobs list */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">Développeur Full-Stack</p>
                    <p className="text-sm text-muted-foreground">GoMyCode - Tunis, Tunisie</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/jobs">Voir <ArrowUpRight className="h-4 w-4 ml-2"/></Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Complétez votre profil</CardTitle>
            <CardDescription>Un profil complet attire plus de recruteurs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
                <p className="text-5xl font-bold text-primary">75%</p>
                <p className="text-sm text-muted-foreground">Profil complété</p>
            </div>
            <p className="text-center text-sm mb-4">Ajoutez vos certifications pour atteindre les 100% !</p>
            <Button className="w-full" asChild>
                <Link to="/profile">Améliorer mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
