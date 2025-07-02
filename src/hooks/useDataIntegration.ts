import { useState, useEffect } from 'react';
import { DataIntegrationService } from '../services/dataIntegrationService';

interface DataIntegrationStatus {
  status: 'loading' | 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  summary: string[];
}

export const useDataIntegration = () => {
  const [status, setStatus] = useState<DataIntegrationStatus>({
    status: 'loading',
    issues: [],
    recommendations: [],
    summary: []
  });

  useEffect(() => {
    const checkDataIntegration = async () => {
      try {
        const healthCheck = await DataIntegrationService.performHealthCheck();
        
        setStatus({
          status: healthCheck.overall,
          issues: [
            ...healthCheck.database.details.issues,
            ...healthCheck.dataSources.details.issues
          ],
          recommendations: healthCheck.dataSources.details.recommendations || [],
          summary: healthCheck.summary
        });
      } catch (error) {
        setStatus({
          status: 'critical',
          issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          recommendations: ['Check your database connection and configuration'],
          summary: ['Data integration health check failed']
        });
      }
    };

    checkDataIntegration();
  }, []);

  return status;
};