import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Rocket, LogIn } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <Rocket className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-foreground">KhedmaClair</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/register">S'inscrire <LogIn className="ml-2 h-4 w-4" /></Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Button variant="outline" asChild>
                <Link to="/login">Accéder</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="relative container mx-auto text-center px-4 md:px-6">
          {/* Background Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-4 leading-tight">
            Plateforme intelligente de recherche d’emploi en Tunisie.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            L’application est en cours de développement. Revenez très bientôt pour découvrir une nouvelle façon de trouver votre prochain poste.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">Commencer l'aventure <Rocket className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} KhedmaClair. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
