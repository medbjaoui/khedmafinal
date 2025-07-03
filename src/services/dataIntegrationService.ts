import { SupabaseService } from './supabaseService';
import { supabase } from '../integrations/supabase/client';

/**
 * Service to handle data integration and ensure all components use real data
 */
export class DataIntegrationService {
  
  /**
   * Validate that all required database tables exist and have proper structure
   */
  static async validateDatabaseSchema(): Promise<{
    valid: boolean;
    missingTables: string[];
    issues: string[];
  }> {
    const issues: string[] = [];
    const missingTables: string[] = [];

    try {
      // Check core tables exist by trying to query them
      const tableChecks = [
        { name: 'user_profiles', query: () => supabase.from('user_profiles').select('id').limit(1) },
        { name: 'jobs', query: () => supabase.from('jobs').select('id').limit(1) },
        { name: 'applications', query: () => supabase.from('applications').select('id').limit(1) },
        { name: 'experiences', query: () => supabase.from('experiences').select('id').limit(1) },
        { name: 'education', query: () => supabase.from('education').select('id').limit(1) },
        { name: 'skills', query: () => supabase.from('skills').select('id').limit(1) },
        { name: 'languages', query: () => supabase.from('languages').select('id').limit(1) },
        { name: 'certifications', query: () => supabase.from('certifications').select('id').limit(1) },
        { name: 'saved_jobs', query: () => supabase.from('saved_jobs').select('id').limit(1) },
      ];

      for (const check of tableChecks) {
        try {
          await check.query();
        } catch (error: any) {
          if (error.code === '42P01') { // Table does not exist
            missingTables.push(check.name);
          } else if (error.code === 'PGRST116' || error.message.includes('403') || error.message.includes('42501')) {
            console.log(`Table ${check.name} access denied - this is OK`);
          } else if (error.code === 'PGRST200' || error.message.includes('relationship') || error.message.includes('foreign key')) {
            console.log(`Table ${check.name} relationship issue - this is OK`);
          } else {
            issues.push(`Table ${check.name}: ${error.message}`);
          }
        }
      }

      // Check optional tables (won't mark as missing, just log)
      const optionalTables = [
        { name: 'system_alerts', query: () => supabase.from('system_alerts').select('id').limit(1) },
        { name: 'system_logs', query: () => supabase.from('system_logs').select('id').limit(1) },
        { name: 'ai_settings', query: () => supabase.from('ai_settings').select('id').limit(1) },
        { name: 'ai_usage', query: () => supabase.from('ai_usage').select('id').limit(1) },
        { name: 'recommendations', query: () => supabase.from('recommendations').select('id').limit(1) },
      ];

      for (const check of optionalTables) {
        try {
          await check.query();
        } catch (error: any) {
          if (error.code === '42P01') {
            console.log(`Optional table ${check.name} not found - this is OK`);
          } else if (error.code === 'PGRST116' || error.status === 403) {
            console.log(`Optional table ${check.name} access denied (admin only) - this is OK`);
          } else {
            issues.push(`Optional table ${check.name}: ${error.message}`);
          }
        }
      }

      return {
        valid: missingTables.length === 0,
        missingTables,
        issues
      };

    } catch (error) {
      return {
        valid: false,
        missingTables: [],
        issues: [`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Check that all services are properly configured to use real data
   */
  static async validateDataSources(): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check AI service configuration
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!groqKey && !geminiKey) {
        issues.push('No AI API keys configured - AI features will use mock responses');
        recommendations.push('Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to environment variables');
      }

      // Check Supabase configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        issues.push('Supabase not properly configured');
        recommendations.push('Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
      }

      // Test database connection
      try {
        await supabase.from('user_profiles').select('id').limit(1);
      } catch (error) {
        issues.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return {
        valid: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      return {
        valid: false,
        issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check your environment configuration and database setup']
      };
    }
  }

  /**
   * Initialize default data for development/testing
   */
  static async initializeDefaultData(userId: string): Promise<void> {
    try {
      // Check if user has any existing data
      const profile = await SupabaseService.getUserProfile(userId);
      if (!profile) {
        console.log('User profile will be created on first access');
        return;
      }

      // Initialize templates if none exist
      try {
        const { TemplateService } = await import('./templateService');
        await TemplateService.initializeDefaultTemplates(userId);
      } catch (error) {
        console.log('Template initialization skipped:', error);
      }

      // Add sample recommendations if none exist
      try {
        const recommendations = await SupabaseService.getUserRecommendations(userId);
        if (recommendations.length === 0) {
          await SupabaseService.addRecommendation(userId, {
            type: 'profile',
            priority: 'high',
            title: 'Complétez votre profil',
            description: 'Ajoutez vos expériences et compétences pour améliorer vos candidatures',
            action: 'complete_profile',
            category: 'setup'
          });
        }
      } catch (error) {
        console.log('Recommendations initialization skipped:', error);
      }

    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  /**
   * Perform comprehensive data integration health check
   */
  static async performHealthCheck(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    database: { status: string; details: any };
    dataSources: { status: string; details: any };
    summary: string[];
  }> {
    const summary: string[] = [];
    
    // Check database schema
    const dbCheck = await this.validateDatabaseSchema();
    const dbStatus = dbCheck.valid ? 'healthy' : 
                    dbCheck.missingTables.length > 0 ? 'critical' : 'warning';
    
    if (!dbCheck.valid) {
      summary.push(`Database issues: ${dbCheck.missingTables.length} missing tables, ${dbCheck.issues.length} issues`);
    }

    // Check data sources
    const dsCheck = await this.validateDataSources();
    const dsStatus = dsCheck.valid ? 'healthy' : 'warning';
    
    if (!dsCheck.valid) {
      summary.push(`Configuration issues: ${dsCheck.issues.length} problems found`);
    }

    // Determine overall status
    const overall: 'healthy' | 'warning' | 'critical' = 
      dbStatus === 'critical' ? 'critical' :
      (dbStatus === 'warning' || dsStatus === 'warning') ? 'warning' : 'healthy';

    if (overall === 'healthy') {
      summary.push('All data integration checks passed');
    }

    return {
      overall,
      database: { status: dbStatus, details: dbCheck },
      dataSources: { status: dsStatus, details: dsCheck },
      summary
    };
  }
}