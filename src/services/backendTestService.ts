import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
  timestamp: string;
}

export interface TableInfo {
  tableName: string;
  count: number;
  columns: string[];
  sampleData: any[];
  hasRLS: boolean;
  error?: string;
}

export interface SystemHealth {
  database: boolean;
  auth: boolean;
  storage: boolean;
  functions: boolean;
  rls: boolean;
  timestamp: string;
}

export class BackendTestService {
  
  /**
   * Test la connexion à la base de données Supabase
   */
  static async testDatabaseConnection(): Promise<TestResult> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        return {
          name: 'Connexion Base de Données',
          status: 'error',
          message: `Erreur de connexion: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'Connexion Base de Données',
        status: 'success',
        message: 'Connexion à la base de données réussie',
        data: { connected: true },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Connexion Base de Données',
        status: 'error',
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test l'authentification utilisateur
   */
  static async testAuthentication(): Promise<TestResult> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return {
          name: 'Authentification',
          status: 'error',
          message: `Erreur d'authentification: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      if (!user) {
        return {
          name: 'Authentification',
          status: 'error',
          message: 'Aucun utilisateur connecté',
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'Authentification',
        status: 'success',
        message: `Utilisateur connecté: ${user.email}`,
        data: {
          userId: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'User'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Authentification',
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test les permissions RLS (Row Level Security)
   */
  static async testRLSPermissions(): Promise<TestResult> {
    try {
      const tablesToTest = [
        'user_profiles',
        'applications',
        'notifications',
        'jobs',
        'cv_versions'
      ];

      const results = [];

      for (const table of tablesToTest) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          results.push({
            table,
            hasAccess: !error,
            error: error?.message
          });
        } catch (err) {
          results.push({
            table,
            hasAccess: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue'
          });
        }
      }

      const successCount = results.filter(r => r.hasAccess).length;
      const totalCount = results.length;

      return {
        name: 'Permissions RLS',
        status: successCount > 0 ? 'success' : 'error',
        message: `Accès autorisé à ${successCount}/${totalCount} tables`,
        data: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Permissions RLS',
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test le système de stockage
   */
  static async testStorage(): Promise<TestResult> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        return {
          name: 'Système de Stockage',
          status: 'error',
          message: `Erreur de stockage: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'Système de Stockage',
        status: 'success',
        message: `${buckets.length} buckets disponibles`,
        data: buckets.map(b => ({ name: b.name, public: b.public })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Système de Stockage',
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Récupère les informations détaillées d'une table
   */
  static async getTableInfo(tableName: string): Promise<TableInfo> {
    try {
      // Compter les enregistrements
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return {
          tableName,
          count: 0,
          columns: [],
          sampleData: [],
          hasRLS: false,
          error: countError.message
        };
      }

      // Récupérer un échantillon de données
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);

      if (sampleError) {
        return {
          tableName,
          count: count || 0,
          columns: [],
          sampleData: [],
          hasRLS: false,
          error: sampleError.message
        };
      }

      // Extraire les colonnes du premier enregistrement
      const columns = sampleData && sampleData.length > 0 ? 
        Object.keys(sampleData[0]) : [];

      return {
        tableName,
        count: count || 0,
        columns,
        sampleData: sampleData || [],
        hasRLS: true, // Assume RLS is enabled if we can access data
        error: undefined
      };
    } catch (error) {
      return {
        tableName,
        count: 0,
        columns: [],
        sampleData: [],
        hasRLS: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Test une Edge Function
   */
  static async testEdgeFunction(functionName: string, testPayload: any = { test: true }): Promise<TestResult> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testPayload
      });

      if (error) {
        return {
          name: `Edge Function: ${functionName}`,
          status: 'error',
          message: `Erreur: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: `Edge Function: ${functionName}`,
        status: 'success',
        message: 'Fonction exécutée avec succès',
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: `Edge Function: ${functionName}`,
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Récupère les statistiques système
   */
  static async getSystemStats(): Promise<{
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalNotifications: number;
    activeUsers: number;
    recentActivity: any[];
  }> {
    try {
      const [
        { count: totalUsers },
        { count: totalJobs },
        { count: totalApplications },
        { count: totalNotifications },
        { data: recentActivity }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase
          .from('applications')
          .select('*, user_profiles(first_name, last_name), jobs(title, company)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Calculer les utilisateurs actifs (connectés dans les dernières 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday.toISOString());

      return {
        totalUsers: totalUsers || 0,
        totalJobs: totalJobs || 0,
        totalApplications: totalApplications || 0,
        totalNotifications: totalNotifications || 0,
        activeUsers: activeUsers || 0,
        recentActivity: recentActivity || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalNotifications: 0,
        activeUsers: 0,
        recentActivity: []
      };
    }
  }

  /**
   * Effectue un test de santé global du système
   */
  static async performHealthCheck(): Promise<SystemHealth> {
    try {
      const [
        dbTest,
        authTest,
        storageTest,
        rlsTest
      ] = await Promise.all([
        this.testDatabaseConnection(),
        this.testAuthentication(),
        this.testStorage(),
        this.testRLSPermissions()
      ]);

      // Test basique des fonctions
      const functionTest = await this.testEdgeFunction('sign-in-with-log');

      return {
        database: dbTest.status === 'success',
        auth: authTest.status === 'success',
        storage: storageTest.status === 'success',
        functions: functionTest.status === 'success',
        rls: rlsTest.status === 'success',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        database: false,
        auth: false,
        storage: false,
        functions: false,
        rls: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Génère un rapport complet du système
   */
  static async generateSystemReport(): Promise<{
    health: SystemHealth;
    stats: any;
    tables: TableInfo[];
    functions: TestResult[];
  }> {
    try {
      const health = await this.performHealthCheck();
      const stats = await this.getSystemStats();

      // Tester les principales tables
      const mainTables = [
        'user_profiles',
        'jobs',
        'applications',
        'notifications',
        'cv_versions',
        'skills',
        'experiences',
        'education'
      ];

      const tables = await Promise.all(
        mainTables.map(table => this.getTableInfo(table))
      );

      // Tester les principales fonctions
      const mainFunctions = [
        'sign-in-with-log',
        'send-application-email',
        'cv-analysis',
        'job-matching',
        'notifications'
      ];

      const functions = await Promise.all(
        mainFunctions.map(func => this.testEdgeFunction(func))
      );

      return {
        health,
        stats,
        tables,
        functions
      };
    } catch (error) {
      throw new Error(`Erreur lors de la génération du rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

export default BackendTestService; 