import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Users,
  Briefcase,
  FileText,
  Bell,
  Activity,
  Settings,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
  timestamp: string;
}

interface TableData {
  tableName: string;
  count: number;
  sampleData: any[];
  error?: string;
}

interface EdgeFunctionTest {
  name: string;
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  response?: any;
  error?: string;
}

const BackendTest: React.FC = () => {
  const [dbTests, setDbTests] = useState<TestResult[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [edgeFunctionTests, setEdgeFunctionTests] = useState<EdgeFunctionTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  const createTestResult = (name: string, status: 'success' | 'error' | 'loading', message: string, data?: any): TestResult => ({
    name,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });

  // Test de connexion à la base de données
  const testDatabaseConnection = async () => {
    setIsLoading(true);
    const tests: TestResult[] = [];

    try {
      // Test 1: Connexion basique
      tests.push(createTestResult('Connexion Supabase', 'loading', 'Test en cours...'));
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        tests[0] = createTestResult('Connexion Supabase', 'error', `Erreur: ${connectionError.message}`);
      } else {
        tests[0] = createTestResult('Connexion Supabase', 'success', 'Connexion réussie');
      }

      // Test 2: Authentification
      tests.push(createTestResult('Authentification', 'loading', 'Vérification...'));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        tests[1] = createTestResult('Authentification', 'success', `Utilisateur connecté: ${user.email}`, user);
      } else {
        tests[1] = createTestResult('Authentification', 'error', 'Aucun utilisateur connecté');
      }

      // Test 3: Permissions RLS
      tests.push(createTestResult('Permissions RLS', 'loading', 'Test des permissions...'));
      
      try {
        const { data: rlsTest, error: rlsError } = await supabase
          .from('user_profiles')
          .select('id, email, first_name')
          .limit(5);

        if (rlsError) {
          tests[2] = createTestResult('Permissions RLS', 'error', `Erreur RLS: ${rlsError.message}`);
        } else {
          tests[2] = createTestResult('Permissions RLS', 'success', `Accès autorisé (${rlsTest.length} enregistrements)`);
        }
      } catch (error) {
        tests[2] = createTestResult('Permissions RLS', 'error', `Erreur: ${error.message}`);
      }

      // Test 4: Storage
      tests.push(createTestResult('Storage', 'loading', 'Test du stockage...'));
      
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        
        if (storageError) {
          tests[3] = createTestResult('Storage', 'error', `Erreur Storage: ${storageError.message}`);
        } else {
          tests[3] = createTestResult('Storage', 'success', `Buckets disponibles: ${buckets.length}`, buckets);
        }
      } catch (error) {
        tests[3] = createTestResult('Storage', 'error', `Erreur: ${error.message}`);
      }

      setDbTests(tests);
    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test des données des tables
  const testTableData = async () => {
    setIsLoading(true);
    const tables = [
      'user_profiles',
      'jobs',
      'applications',
      'notifications',
      'skills',
      'experiences',
      'education',
      'cv_versions',
      'job_matches',
      'saved_jobs'
    ];

    const tableResults: TableData[] = [];

    for (const table of tables) {
      try {
        const { data: countData, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(3);

        if (countError || sampleError) {
          tableResults.push({
            tableName: table,
            count: 0,
            sampleData: [],
            error: countError?.message || sampleError?.message
          });
        } else {
          tableResults.push({
            tableName: table,
            count: countData?.length || 0,
            sampleData: sampleData || []
          });
        }
      } catch (error) {
        tableResults.push({
          tableName: table,
          count: 0,
          sampleData: [],
          error: error.message
        });
      }
    }

    setTableData(tableResults);
    setIsLoading(false);
  };

  // Test des Edge Functions
  const testEdgeFunctions = async () => {
    setIsLoading(true);
    const functions = [
      { name: 'CV Analysis', endpoint: 'cv-analysis' },
      { name: 'Job Matching', endpoint: 'job-matching' },
      { name: 'Notifications', endpoint: 'notifications' },
      { name: 'Sign In With Log', endpoint: 'sign-in-with-log' },
      { name: 'Send Application Email', endpoint: 'send-application-email' }
    ];

    const functionResults: EdgeFunctionTest[] = [];

    for (const func of functions) {
      try {
        functionResults.push({
          name: func.name,
          endpoint: func.endpoint,
          status: 'loading'
        });

        const { data, error } = await supabase.functions.invoke(func.endpoint, {
          body: { test: true }
        });

        if (error) {
          functionResults[functionResults.length - 1] = {
            name: func.name,
            endpoint: func.endpoint,
            status: 'error',
            error: error.message
          };
        } else {
          functionResults[functionResults.length - 1] = {
            name: func.name,
            endpoint: func.endpoint,
            status: 'success',
            response: data
          };
        }
      } catch (error) {
        functionResults[functionResults.length - 1] = {
          name: func.name,
          endpoint: func.endpoint,
          status: 'error',
          error: error.message
        };
      }
    }

    setEdgeFunctionTests(functionResults);
    setIsLoading(false);
  };

  // Récupération des statistiques système
  const loadSystemStats = async () => {
    try {
      const stats = {
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalNotifications: 0,
        recentActivity: []
      };

      // Compter les utilisateurs
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      stats.totalUsers = userCount || 0;

      // Compter les emplois
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      stats.totalJobs = jobCount || 0;

      // Compter les candidatures
      const { count: appCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });
      stats.totalApplications = appCount || 0;

      // Compter les notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });
      stats.totalNotifications = notifCount || 0;

      // Activité récente
      const { data: recentActivity } = await supabase
        .from('applications')
        .select('*, user_profiles(first_name, last_name), jobs(title, company)')
        .order('created_at', { ascending: false })
        .limit(5);

      stats.recentActivity = recentActivity || [];

      setSystemStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  const runAllTests = async () => {
    await testDatabaseConnection();
    await testTableData();
    await testEdgeFunctions();
    await loadSystemStats();
  };

  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'loading' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interface de Test Backend</h1>
          <p className="text-muted-foreground">
            Test complet de la connexion et des services backend
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Tester Tout
          </Button>
        </div>
      </div>

      {/* Statistiques système */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Emplois</p>
                  <p className="text-2xl font-bold">{systemStats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Candidatures</p>
                  <p className="text-2xl font-bold">{systemStats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Notifications</p>
                  <p className="text-2xl font-bold">{systemStats.totalNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">Base de Données</TabsTrigger>
          <TabsTrigger value="tables">Tables & Données</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="activity">Activité Récente</TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tests de Connexion Base de Données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testDatabaseConnection} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Tester Connexion
                </Button>

                <div className="space-y-2">
                  {dbTests.map((test, index) => (
                    <Alert key={index} className={
                      test.status === 'success' ? 'border-green-200' :
                      test.status === 'error' ? 'border-red-200' : 'border-blue-200'
                    }>
                      <div className="flex items-start gap-2">
                        <StatusIcon status={test.status} />
                        <div className="flex-1">
                          <h4 className="font-medium">{test.name}</h4>
                          <AlertDescription>{test.message}</AlertDescription>
                          {test.data && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-muted-foreground">
                                Voir les données
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(test.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                          {new Date(test.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tables et Données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testTableData} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  Charger les Données
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tableData.map((table, index) => (
                    <Card key={index} className={table.error ? 'border-red-200' : 'border-green-200'}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {table.tableName}
                          <Badge variant={table.error ? 'destructive' : 'default'}>
                            {table.error ? 'Erreur' : `${table.count} entrées`}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {table.error ? (
                          <p className="text-sm text-red-600">{table.error}</p>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Échantillon de données:
                            </p>
                            <ScrollArea className="h-32">
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(table.sampleData, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Edge Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testEdgeFunctions} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  Tester les Fonctions
                </Button>

                <div className="space-y-2">
                  {edgeFunctionTests.map((func, index) => (
                    <Alert key={index} className={
                      func.status === 'success' ? 'border-green-200' :
                      func.status === 'error' ? 'border-red-200' : 'border-blue-200'
                    }>
                      <div className="flex items-start gap-2">
                        <StatusIcon status={func.status} />
                        <div className="flex-1">
                          <h4 className="font-medium">{func.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Endpoint: {func.endpoint}
                          </p>
                          {func.error && (
                            <AlertDescription className="text-red-600">
                              Erreur: {func.error}
                            </AlertDescription>
                          )}
                          {func.response && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-muted-foreground">
                                Voir la réponse
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(func.response, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemStats?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {systemStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded border">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.user_profiles?.first_name} {activity.user_profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          a postulé pour {activity.jobs?.title} chez {activity.jobs?.company}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune activité récente</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackendTest; 