import { createClient } from '@supabase/supabase-js';
import {
  AgentConfig,
  AgentTask,
  AgentEvent,
  WorkflowDefinition,
  WorkflowExecution,
  TaskStatus,
  TaskPriority,
  AgentType,
  AgentError,
  CircuitBreakerState,
  HealthCheck,
  AgentMetrics,
  SystemMetrics
} from '../types/index.js';

/**
 * Orchestrateur principal pour le système multi-agents KhedmaFinal
 * Gère la coordination, l'exécution et le monitoring des agents IA
 */
export class AgentOrchestrator {
  private supabase: any;
  private agents: Map<AgentType, AgentConfig> = new Map();
  private circuitBreakers: Map<AgentType, CircuitBreakerState> = new Map();
  private taskQueue: AgentTask[] = [];
  private runningTasks: Map<string, AgentTask> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private healthChecks: Map<AgentType, HealthCheck> = new Map();
  private metrics: Map<AgentType, AgentMetrics> = new Map();
  private isRunning: boolean = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeOrchestrator();
  }

  /**
   * Initialise l'orchestrateur et charge la configuration des agents
   */
  private async initializeOrchestrator(): Promise<void> {
    try {
      console.log('🚀 Initialisation de l\'orchestrateur multi-agents...');
      
      // Charger la configuration des agents depuis la base de données
      await this.loadAgentConfigurations();
      
      // Initialiser les circuit breakers
      this.initializeCircuitBreakers();
      
      // Démarrer les listeners d'événements
      this.setupEventListeners();
      
      // Démarrer le processeur de tâches
      this.startTaskProcessor();
      
      // Démarrer le monitoring de santé
      this.startHealthMonitoring();
      
      console.log('✅ Orchestrateur initialisé avec succès');
      this.isRunning = true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'orchestrateur:', error);
      throw error;
    }
  }

  /**
   * Charge la configuration des agents depuis la base de données
   */
  private async loadAgentConfigurations(): Promise<void> {
    const { data: configs, error } = await this.supabase
      .from('agent_configurations')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Erreur lors du chargement des configurations: ${error.message}`);
    }

    for (const config of configs) {
      const agentConfig: AgentConfig = {
        id: config.id,
        name: config.agent_type,
        type: config.agent_type as AgentType,
        version: config.configuration.version || '1.0.0',
        isActive: config.is_active,
        configuration: config.configuration,
        capabilities: config.configuration.capabilities || [],
        dependencies: config.configuration.dependencies || [],
        resourceLimits: {
          maxConcurrentTasks: config.configuration.maxConcurrentTasks || 5,
          maxMemoryMB: config.configuration.maxMemoryMB || 512,
          timeoutSeconds: config.configuration.timeoutSeconds || 300,
          maxRetries: config.configuration.maxRetries || 3
        }
      };

      this.agents.set(agentConfig.type, agentConfig);
      console.log(`📋 Agent configuré: ${agentConfig.name} (${agentConfig.type})`);
    }
  }

  /**
   * Initialise les circuit breakers pour tous les agents
   */
  private initializeCircuitBreakers(): void {
    for (const [agentType] of this.agents) {
      this.circuitBreakers.set(agentType, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0
      });
    }
  }

  /**
   * Configure les listeners d'événements pour la communication inter-agents
   */
  private setupEventListeners(): void {
    // Écouter les notifications PostgreSQL pour les nouveaux messages
    this.supabase
      .channel('agent_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'agent_messages' },
        (payload: any) => this.handleAgentMessage(payload.new)
      )
      .subscribe();

    // Écouter les nouvelles tâches
    this.supabase
      .channel('agent_tasks')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_tasks' },
        (payload: any) => this.handleNewTask(payload.new)
      )
      .subscribe();
  }

  /**
   * Démarre le processeur de tâches en arrière-plan
   */
  private startTaskProcessor(): void {
    setInterval(async () => {
      if (this.taskQueue.length > 0) {
        await this.processPendingTasks();
      }
    }, 1000); // Vérifier toutes les secondes
  }

  /**
   * Démarre le monitoring de santé des agents
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.performHealthChecks();
      await this.updateMetrics();
    }, 30000); // Vérifier toutes les 30 secondes
  }

  /**
   * Exécute une tâche sur un agent spécifique
   */
  public async executeTask(
    agentType: AgentType,
    taskType: string,
    inputData: any,
    priority: TaskPriority = TaskPriority.NORMAL,
    userId?: string
  ): Promise<string> {
    try {
      // Vérifier si l'agent est disponible
      if (!this.isAgentAvailable(agentType)) {
        throw new Error(`Agent ${agentType} non disponible`);
      }

      // Créer la tâche
      const task: AgentTask = {
        id: crypto.randomUUID(),
        agentType,
        taskType,
        inputData,
        status: TaskStatus.PENDING,
        priority,
        createdAt: new Date(),
        userId,
        correlationId: crypto.randomUUID(),
        retryCount: 0,
        metadata: {}
      };

      // Sauvegarder la tâche en base de données
      const { error } = await this.supabase
        .from('agent_tasks')
        .insert([{
          id: task.id,
          agent_type: task.agentType,
          task_type: task.taskType,
          input_data: task.inputData,
          status: task.status,
          priority: task.priority,
          user_id: task.userId,
          correlation_id: task.correlationId
        }]);

      if (error) {
        throw new Error(`Erreur lors de la sauvegarde de la tâche: ${error.message}`);
      }

      // Ajouter à la queue de traitement
      this.addTaskToQueue(task);

      console.log(`📝 Tâche créée: ${task.id} pour l'agent ${agentType}`);
      return task.id;
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la tâche:', error);
      throw error;
    }
  }

  /**
   * Ajoute une tâche à la queue de traitement
   */
  private addTaskToQueue(task: AgentTask): void {
    // Insérer la tâche selon sa priorité
    const insertIndex = this.taskQueue.findIndex(t => t.priority < task.priority);
    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
  }

  /**
   * Traite les tâches en attente
   */
  private async processPendingTasks(): Promise<void> {
    const availableTasks = this.taskQueue.filter(task => 
      this.canProcessTask(task.agentType)
    );

    for (const task of availableTasks.slice(0, 5)) { // Traiter max 5 tâches à la fois
      await this.processTask(task);
    }
  }

  /**
   * Vérifie si un agent peut traiter une nouvelle tâche
   */
  private canProcessTask(agentType: AgentType): boolean {
    const config = this.agents.get(agentType);
    if (!config) return false;

    const runningTasksCount = Array.from(this.runningTasks.values())
      .filter(task => task.agentType === agentType).length;

    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (circuitBreaker?.state === 'OPEN') {
      return this.shouldAttemptReset(circuitBreaker);
    }

    return runningTasksCount < config.resourceLimits.maxConcurrentTasks;
  }

  /**
   * Traite une tâche spécifique
   */
  private async processTask(task: AgentTask): Promise<void> {
    try {
      // Retirer de la queue et ajouter aux tâches en cours
      this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
      this.runningTasks.set(task.id, task);

      // Mettre à jour le statut
      task.status = TaskStatus.RUNNING;
      task.startedAt = new Date();

      await this.updateTaskStatus(task);

      console.log(`🔄 Traitement de la tâche ${task.id} par l'agent ${task.agentType}`);

      // Exécuter la tâche via l'Edge Function appropriée
      const result = await this.callAgentFunction(task);

      // Marquer comme terminée
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.outputData = result;

      await this.updateTaskStatus(task);
      this.runningTasks.delete(task.id);

      // Mettre à jour les métriques de succès
      this.updateCircuitBreakerSuccess(task.agentType);

      console.log(`✅ Tâche ${task.id} terminée avec succès`);

      // Émettre un événement de completion
      await this.emitEvent({
        id: crypto.randomUUID(),
        eventType: 'task_completed',
        sourceAgent: task.agentType,
        payload: { taskId: task.id, result },
        timestamp: new Date(),
        correlationId: task.correlationId || crypto.randomUUID(),
        priority: task.priority
      });

    } catch (error) {
      await this.handleTaskError(task, error as Error);
    }
  }

  /**
   * Appelle la fonction Edge appropriée pour l'agent
   */
  private async callAgentFunction(task: AgentTask): Promise<any> {
    const functionName = this.getAgentFunctionName(task.agentType);
    const config = this.agents.get(task.agentType);
    
    if (!config) {
      throw new Error(`Configuration non trouvée pour l'agent ${task.agentType}`);
    }

    const timeoutMs = config.resourceLimits.timeoutSeconds * 1000;
    
    // Créer une promesse avec timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de la tâche')), timeoutMs);
    });

    const executionPromise = this.supabase.functions.invoke(functionName, {
      body: {
        taskType: task.taskType,
        inputData: task.inputData,
        configuration: config.configuration,
        correlationId: task.correlationId
      }
    });

    const response = await Promise.race([executionPromise, timeoutPromise]);
    
    if (response.error) {
      throw new Error(`Erreur de l'agent: ${response.error.message}`);
    }

    return response.data;
  }

  /**
   * Obtient le nom de la fonction Edge pour un type d'agent
   */
  private getAgentFunctionName(agentType: AgentType): string {
    const functionMap: Record<AgentType, string> = {
      [AgentType.CV_ANALYZER]: 'cv-analyzer-agent',
      [AgentType.MATCHING]: 'matching-agent',
      [AgentType.CONTENT_WRITER]: 'content-writer-agent',
      [AgentType.SUPPORT]: 'support-agent',
      [AgentType.MODERATION]: 'moderation-agent',
      [AgentType.ANALYTICS]: 'analytics-agent'
    };

    return functionMap[agentType];
  }

  /**
   * Gère les erreurs de tâche avec retry automatique
   */
  private async handleTaskError(task: AgentTask, error: Error): Promise<void> {
    console.error(`❌ Erreur lors du traitement de la tâche ${task.id}:`, error);

    task.retryCount++;
    task.errorMessage = error.message;

    const config = this.agents.get(task.agentType);
    const maxRetries = config?.resourceLimits.maxRetries || 3;

    if (task.retryCount < maxRetries) {
      // Retry avec backoff exponentiel
      const delayMs = Math.pow(2, task.retryCount) * 1000;
      
      setTimeout(() => {
        task.status = TaskStatus.PENDING;
        this.addTaskToQueue(task);
      }, delayMs);

      console.log(`🔄 Retry de la tâche ${task.id} dans ${delayMs}ms (tentative ${task.retryCount}/${maxRetries})`);
    } else {
      // Marquer comme échouée définitivement
      task.status = TaskStatus.FAILED;
      task.completedAt = new Date();
      
      await this.updateTaskStatus(task);
      this.runningTasks.delete(task.id);

      // Mettre à jour le circuit breaker
      this.updateCircuitBreakerFailure(task.agentType);

      // Émettre un événement d'échec
      await this.emitEvent({
        id: crypto.randomUUID(),
        eventType: 'task_failed',
        sourceAgent: task.agentType,
        payload: { taskId: task.id, error: error.message },
        timestamp: new Date(),
        correlationId: task.correlationId || crypto.randomUUID(),
        priority: TaskPriority.HIGH
      });
    }
  }

  /**
   * Met à jour le statut d'une tâche en base de données
   */
  private async updateTaskStatus(task: AgentTask): Promise<void> {
    const { error } = await this.supabase
      .from('agent_tasks')
      .update({
        status: task.status,
        output_data: task.outputData,
        started_at: task.startedAt?.toISOString(),
        completed_at: task.completedAt?.toISOString(),
        retry_count: task.retryCount,
        error_message: task.errorMessage
      })
      .eq('id', task.id);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut de la tâche:', error);
    }
  }

  /**
   * Vérifie si un agent est disponible
   */
  private isAgentAvailable(agentType: AgentType): boolean {
    const config = this.agents.get(agentType);
    if (!config || !config.isActive) return false;

    const circuitBreaker = this.circuitBreakers.get(agentType);
    return circuitBreaker?.state !== 'OPEN';
  }

  /**
   * Met à jour le circuit breaker en cas de succès
   */
  private updateCircuitBreakerSuccess(agentType: AgentType): void {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (circuitBreaker) {
      circuitBreaker.successCount++;
      circuitBreaker.failureCount = 0;
      
      if (circuitBreaker.state === 'HALF_OPEN') {
        circuitBreaker.state = 'CLOSED';
        console.log(`🔓 Circuit breaker fermé pour l'agent ${agentType}`);
      }
    }
  }

  /**
   * Met à jour le circuit breaker en cas d'échec
   */
  private updateCircuitBreakerFailure(agentType: AgentType): void {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (circuitBreaker) {
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = new Date();

      if (circuitBreaker.failureCount >= 5) {
        circuitBreaker.state = 'OPEN';
        circuitBreaker.nextAttemptTime = new Date(Date.now() + 60000); // 1 minute
        console.log(`🔒 Circuit breaker ouvert pour l'agent ${agentType}`);
      }
    }
  }

  /**
   * Vérifie si on doit tenter de réinitialiser un circuit breaker
   */
  private shouldAttemptReset(circuitBreaker: CircuitBreakerState): boolean {
    if (circuitBreaker.state === 'OPEN' && circuitBreaker.nextAttemptTime) {
      if (new Date() >= circuitBreaker.nextAttemptTime) {
        circuitBreaker.state = 'HALF_OPEN';
        return true;
      }
    }
    return false;
  }

  /**
   * Émet un événement dans le système
   */
  private async emitEvent(event: AgentEvent): Promise<void> {
    // Sauvegarder l'événement en base
    const { error } = await this.supabase
      .from('agent_events')
      .insert([{
        id: event.id,
        event_type: event.eventType,
        source_agent: event.sourceAgent,
        target_agent: event.targetAgent,
        payload: event.payload,
        correlation_id: event.correlationId,
        priority: event.priority
      }]);

    if (error) {
      console.error('Erreur lors de l\'émission de l\'événement:', error);
    }

    // Notifier les listeners locaux
    const listeners = this.eventListeners.get(event.eventType) || [];
    for (const listener of listeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error('Erreur dans un listener d\'événement:', error);
      }
    }
  }

  /**
   * Gère les messages inter-agents
   */
  private async handleAgentMessage(message: any): Promise<void> {
    console.log(`📨 Message reçu pour l'agent ${message.target_agent}:`, message.message_type);
    
    // Traiter le message selon son type
    switch (message.message_type) {
      case 'task_request':
        await this.handleTaskRequest(message);
        break;
      case 'data_request':
        await this.handleDataRequest(message);
        break;
      case 'status_update':
        await this.handleStatusUpdate(message);
        break;
      default:
        console.warn(`Type de message non géré: ${message.message_type}`);
    }
  }

  /**
   * Gère les nouvelles tâches ajoutées en base
   */
  private async handleNewTask(taskData: any): Promise<void> {
    const task: AgentTask = {
      id: taskData.id,
      agentType: taskData.agent_type,
      taskType: taskData.task_type,
      inputData: taskData.input_data,
      status: taskData.status,
      priority: taskData.priority,
      createdAt: new Date(taskData.created_at),
      userId: taskData.user_id,
      correlationId: taskData.correlation_id,
      retryCount: taskData.retry_count || 0,
      metadata: taskData.metadata || {}
    };

    this.addTaskToQueue(task);
  }

  /**
   * Effectue les vérifications de santé des agents
   */
  private async performHealthChecks(): Promise<void> {
    for (const [agentType, config] of this.agents) {
      try {
        const startTime = Date.now();
        
        // Appeler l'endpoint de health check de l'agent
        const response = await this.supabase.functions.invoke(
          this.getAgentFunctionName(agentType),
          {
            body: { taskType: 'health_check' }
          }
        );

        const responseTime = Date.now() - startTime;
        
        const healthCheck: HealthCheck = {
          agentType,
          status: response.error ? 'unhealthy' : 'healthy',
          lastCheck: new Date(),
          responseTime,
          errorRate: this.calculateErrorRate(agentType),
          details: response.data || {}
        };

        this.healthChecks.set(agentType, healthCheck);

      } catch (error) {
        const healthCheck: HealthCheck = {
          agentType,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorRate: 1.0,
          details: { error: (error as Error).message }
        };

        this.healthChecks.set(agentType, healthCheck);
      }
    }
  }

  /**
   * Calcule le taux d'erreur pour un agent
   */
  private calculateErrorRate(agentType: AgentType): number {
    const circuitBreaker = this.circuitBreakers.get(agentType);
    if (!circuitBreaker) return 0;

    const totalAttempts = circuitBreaker.successCount + circuitBreaker.failureCount;
    return totalAttempts > 0 ? circuitBreaker.failureCount / totalAttempts : 0;
  }

  /**
   * Met à jour les métriques du système
   */
  private async updateMetrics(): Promise<void> {
    for (const [agentType] of this.agents) {
      const runningTasks = Array.from(this.runningTasks.values())
        .filter(task => task.agentType === agentType);

      const metrics: AgentMetrics = {
        agentType,
        tasksProcessed: await this.getTasksProcessedCount(agentType),
        averageProcessingTime: await this.getAverageProcessingTime(agentType),
        successRate: 1 - this.calculateErrorRate(agentType),
        errorRate: this.calculateErrorRate(agentType),
        currentLoad: runningTasks.length,
        memoryUsage: 0, // À implémenter selon les besoins
        lastActivity: new Date()
      };

      this.metrics.set(agentType, metrics);
    }
  }

  /**
   * Obtient le nombre de tâches traitées pour un agent
   */
  private async getTasksProcessedCount(agentType: AgentType): Promise<number> {
    const { count } = await this.supabase
      .from('agent_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('agent_type', agentType)
      .in('status', ['completed', 'failed']);

    return count || 0;
  }

  /**
   * Obtient le temps de traitement moyen pour un agent
   */
  private async getAverageProcessingTime(agentType: AgentType): Promise<number> {
    const { data } = await this.supabase
      .from('agent_tasks')
      .select('started_at, completed_at')
      .eq('agent_type', agentType)
      .eq('status', 'completed')
      .not('started_at', 'is', null)
      .not('completed_at', 'is', null)
      .limit(100);

    if (!data || data.length === 0) return 0;

    const totalTime = data.reduce((sum, task) => {
      const start = new Date(task.started_at).getTime();
      const end = new Date(task.completed_at).getTime();
      return sum + (end - start);
    }, 0);

    return totalTime / data.length;
  }

  /**
   * Obtient les métriques système globales
   */
  public getSystemMetrics(): SystemMetrics {
    const totalTasks = this.taskQueue.length + this.runningTasks.size;
    const completedTasks = Array.from(this.metrics.values())
      .reduce((sum, metric) => sum + metric.tasksProcessed, 0);

    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.healthChecks.values())
        .filter(hc => hc.status === 'healthy').length,
      totalTasks: totalTasks + completedTasks,
      pendingTasks: this.taskQueue.length,
      completedTasks,
      failedTasks: 0, // À calculer selon les besoins
      averageResponseTime: Array.from(this.healthChecks.values())
        .reduce((sum, hc) => sum + hc.responseTime, 0) / this.healthChecks.size,
      systemLoad: this.runningTasks.size,
      timestamp: new Date()
    };
  }

  /**
   * Ajoute un listener d'événement
   */
  public addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Supprime un listener d'événement
   */
  public removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Arrête l'orchestrateur proprement
   */
  public async shutdown(): Promise<void> {
    console.log('🛑 Arrêt de l\'orchestrateur...');
    this.isRunning = false;

    // Attendre que toutes les tâches en cours se terminent
    while (this.runningTasks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Orchestrateur arrêté proprement');
  }

  // Méthodes utilitaires pour les handlers de messages
  private async handleTaskRequest(message: any): Promise<void> {
    // Implémenter la logique de traitement des demandes de tâches
  }

  private async handleDataRequest(message: any): Promise<void> {
    // Implémenter la logique de traitement des demandes de données
  }

  private async handleStatusUpdate(message: any): Promise<void> {
    // Implémenter la logique de traitement des mises à jour de statut
  }
}

