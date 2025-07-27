-- Script SQL pour l'extension de la base de données KhedmaFinal
-- Support du système multi-agents IA

-- ============================================================================
-- TABLES POUR LA CONFIGURATION ET GESTION DES AGENTS
-- ============================================================================

-- Table pour la configuration des agents
CREATE TABLE IF NOT EXISTS agent_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL UNIQUE,
    configuration JSONB NOT NULL DEFAULT 
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Contraintes
    CONSTRAINT valid_agent_type CHECK (
        agent_type IN ('cv_analyzer', 'matching', 'content_writer', 'support', 'moderation', 'analytics')
    )
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_agent_configurations_type ON agent_configurations(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_active ON agent_configurations(is_active);

-- ============================================================================
-- TABLES POUR LA GESTION DES TÂCHES ET WORKFLOWS
-- ============================================================================

-- Table pour les tâches des agents
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    correlation_id UUID,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées pour le monitoring
    execution_time_ms INTEGER,
    memory_usage_mb INTEGER,
    
    -- Contraintes
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    ),
    CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10),
    CONSTRAINT valid_agent_type_task CHECK (
        agent_type IN ('cv_analyzer', 'matching', 'content_writer', 'support', 'moderation', 'analytics')
    )
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_type ON agent_tasks(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_id ON agent_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_correlation ON agent_tasks(correlation_id);

-- Table pour les workflows multi-agents
CREATE TABLE IF NOT EXISTS agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    workflow_definition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table pour l'exécution des workflows
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES agent_workflows(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'running',
    input_data JSONB NOT NULL,
    output_data JSONB,
    step_executions JSONB DEFAULT '[]',
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_workflow_status CHECK (
        status IN ('running', 'completed', 'failed', 'cancelled')
    )
);

-- ============================================================================
-- TABLES POUR LA COMMUNICATION INTER-AGENTS
-- ============================================================================

-- Table pour les événements et messages entre agents
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    source_agent VARCHAR(50) NOT NULL,
    target_agent VARCHAR(50),
    payload JSONB NOT NULL DEFAULT 
    correlation_id UUID,
    priority INTEGER DEFAULT 5,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_event_priority CHECK (priority BETWEEN 1 AND 10)
);

-- Index pour le traitement des événements
CREATE INDEX IF NOT EXISTS idx_agent_events_processed ON agent_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_events_target ON agent_events(target_agent);
CREATE INDEX IF NOT EXISTS idx_agent_events_correlation ON agent_events(correlation_id);

-- Table pour les messages inter-agents
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_agent VARCHAR(50) NOT NULL,
    target_agent VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT 
    correlation_id UUID,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- TABLES POUR LES RÉSULTATS SPÉCIALISÉS DES AGENTS
-- ============================================================================

-- Table pour les résultats d'analyse de CV
CREATE TABLE IF NOT EXISTS cv_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES agent_tasks(id),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    analysis_data JSONB NOT NULL,
    quality_score INTEGER,
    completeness_score INTEGER,
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_quality_score CHECK (quality_score BETWEEN 0 AND 100),
    CONSTRAINT valid_completeness_score CHECK (completeness_score BETWEEN 0 AND 100)
);

-- Index pour les analyses de CV
CREATE INDEX IF NOT EXISTS idx_cv_analysis_user_id ON cv_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_created_at ON cv_analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_quality_score ON cv_analysis_results(quality_score);

-- Table pour les résultats de matching
CREATE TABLE IF NOT EXISTS matching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES auth.users(id),
    job_id UUID, -- Référence vers la table jobs existante
    task_id UUID REFERENCES agent_tasks(id),
    overall_score DECIMAL(5,2),
    detailed_scores JSONB NOT NULL,
    explanation TEXT,
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    confidence_level DECIMAL(3,2),
    matching_criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_overall_score CHECK (overall_score BETWEEN 0 AND 100),
    CONSTRAINT valid_confidence_level CHECK (confidence_level BETWEEN 0 AND 1)
);

-- Index pour les résultats de matching
CREATE INDEX IF NOT EXISTS idx_matching_candidate_id ON matching_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_matching_job_id ON matching_results(job_id);
CREATE INDEX IF NOT EXISTS idx_matching_overall_score ON matching_results(overall_score);
CREATE INDEX IF NOT EXISTS idx_matching_created_at ON matching_results(created_at);

-- Table pour les contenus générés
CREATE TABLE IF NOT EXISTS generated_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    task_id UUID REFERENCES agent_tasks(id),
    content_type VARCHAR(50) NOT NULL,
    context_data JSONB,
    generated_content TEXT NOT NULL,
    alternative_versions JSONB DEFAULT '[]',
    quality_metrics JSONB DEFAULT 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_content_type CHECK (
        content_type IN ('job_description', 'cover_letter', 'profile_summary', 'marketing_content')
    )
);

-- Table pour les conversations de support
CREATE TABLE IF NOT EXISTS support_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    messages JSONB DEFAULT '[]',
    context_data JSONB DEFAULT 
    status VARCHAR(20) DEFAULT 'active',
    escalated_to_human BOOLEAN DEFAULT false,
    satisfaction_rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_conversation_status CHECK (
        status IN ('active', 'closed', 'escalated')
    ),
    CONSTRAINT valid_satisfaction_rating CHECK (
        satisfaction_rating IS NULL OR satisfaction_rating BETWEEN 1 AND 5
    )
);

-- Index pour les conversations de support
CREATE INDEX IF NOT EXISTS idx_support_conversations_session ON support_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);

-- ============================================================================
-- TABLES POUR LE MONITORING ET LES MÉTRIQUES
-- ============================================================================

-- Table pour les métriques des agents
CREATE TABLE IF NOT EXISTS agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT 
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_agent_type_metrics CHECK (
        agent_type IN ('cv_analyzer', 'matching', 'content_writer', 'support', 'moderation', 'analytics')
    )
);

-- Index pour les métriques (partitionné par temps pour les performances)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_type ON agent_metrics(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_recorded_at ON agent_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_name ON agent_metrics(metric_name);

-- Table pour les vérifications de santé des agents
CREATE TABLE IF NOT EXISTS agent_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    error_rate DECIMAL(5,4),
    details JSONB DEFAULT 
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_health_status CHECK (
        status IN ('healthy', 'degraded', 'unhealthy')
    ),
    CONSTRAINT valid_agent_type_health CHECK (
        agent_type IN ('cv_analyzer', 'matching', 'content_writer', 'support', 'moderation', 'analytics')
    )
);

-- Table pour l'utilisation des APIs externes
CREATE TABLE IF NOT EXISTS external_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL,
    api_provider VARCHAR(50) NOT NULL,
    api_endpoint VARCHAR(200),
    request_count INTEGER DEFAULT 1,
    total_tokens INTEGER,
    cost_usd DECIMAL(10,4),
    response_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    date_hour TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('hour', NOW()),
    
    CONSTRAINT valid_api_provider CHECK (
        api_provider IN ('google_gemini', 'google_document_ai', 'groq', 'openai')
    )
);

-- Index pour l'usage des APIs
CREATE INDEX IF NOT EXISTS idx_external_api_usage_date_hour ON external_api_usage(date_hour);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_agent_type ON external_api_usage(agent_type);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_provider ON external_api_usage(api_provider);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_agent_configurations_updated_at 
    BEFORE UPDATE ON agent_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_workflows_updated_at 
    BEFORE UPDATE ON agent_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_conversations_updated_at 
    BEFORE UPDATE ON support_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour envoyer des notifications entre agents
CREATE OR REPLACE FUNCTION notify_agent_message()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('agent_messages', NEW.target_agent);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les notifications de messages
CREATE TRIGGER agent_message_notification
    AFTER INSERT ON agent_messages
    FOR EACH ROW EXECUTE FUNCTION notify_agent_message();

-- Fonction pour envoyer des notifications d'événements
CREATE OR REPLACE FUNCTION notify_agent_event()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('agent_events', COALESCE(NEW.target_agent, 'all'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les notifications d'événements
CREATE TRIGGER agent_event_notification
    AFTER INSERT ON agent_events
    FOR EACH ROW EXECUTE FUNCTION notify_agent_event();

-- Fonction pour calculer les métriques de performance des tâches
CREATE OR REPLACE FUNCTION calculate_task_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer le temps d'exécution si la tâche est terminée
    IF NEW.status = 'completed' AND NEW.started_at IS NOT NULL THEN
        NEW.execution_time_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer les métriques
CREATE TRIGGER calculate_agent_task_metrics
    BEFORE UPDATE ON agent_tasks
    FOR EACH ROW EXECUTE FUNCTION calculate_task_metrics();

-- ============================================================================
-- VUES POUR LES RAPPORTS ET ANALYTICS
-- ============================================================================

-- Vue pour les statistiques des agents
CREATE OR REPLACE VIEW agent_statistics AS
SELECT 
    agent_type,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
    AVG(execution_time_ms) FILTER (WHERE status = 'completed') as avg_execution_time_ms,
    AVG(retry_count) as avg_retry_count,
    MAX(created_at) as last_task_created
FROM agent_tasks
GROUP BY agent_type;

-- Vue pour les métriques de performance quotidiennes
CREATE OR REPLACE VIEW daily_agent_performance AS
SELECT 
    DATE(created_at) as date,
    agent_type,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
    AVG(execution_time_ms) FILTER (WHERE status = 'completed') as avg_execution_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) 
        FILTER (WHERE status = 'completed') as p95_execution_time_ms
FROM agent_tasks
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), agent_type
ORDER BY date DESC, agent_type;

-- Vue pour les conversations de support actives
CREATE OR REPLACE VIEW active_support_conversations AS
SELECT 
    sc.*,
    u.email as user_email,
    JSONB_ARRAY_LENGTH(sc.messages) as message_count,
    (sc.messages->-1->>'timestamp')::timestamp as last_message_at
FROM support_conversations sc
LEFT JOIN auth.users u ON sc.user_id = u.id
WHERE sc.status = 'active'
ORDER BY sc.updated_at DESC;

-- ============================================================================
-- POLITIQUES DE SÉCURITÉ (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_api_usage ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs normaux
-- Permettre aux utilisateurs de lire et créer leurs propres tâches
CREATE POLICY "Users can view their own tasks" ON agent_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON agent_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de lire leurs propres résultats d'analyse de CV
CREATE POLICY "Users can view their own CV analysis results" ON cv_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de lire leurs propres résultats de matching
CREATE POLICY "Users can view their own matching results" ON matching_results
    FOR SELECT USING (auth.uid() = candidate_id);

-- Permettre aux utilisateurs de lire leurs propres contenus générés
CREATE POLICY "Users can view their own generated content" ON generated_contents
    FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de lire, créer et mettre à jour leurs propres conversations de support
CREATE POLICY "Users can view their own support conversations" ON support_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support conversations" ON support_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support conversations" ON support_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les administrateurs (à adapter selon vos rôles)
-- Assurez-vous que la table 'auth.users' a une colonne 'raw_user_meta_data' de type JSONB
-- et que le rôle 'admin' est stocké comme '{"role": "admin"}' ou similaire.
-- Alternativement, utilisez un système de rôles basé sur des tables de jointure si plus complexe.

-- Fonction d'aide pour vérifier le rôle d'administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Politiques pour les administrateurs
CREATE POLICY "Admins can manage agent configurations" ON agent_configurations
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all agent tasks" ON agent_tasks
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage agent workflows" ON agent_workflows
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all workflow executions" ON workflow_executions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all agent events" ON agent_events
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all agent messages" ON agent_messages
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all CV analysis results" ON cv_analysis_results
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all matching results" ON matching_results
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all generated contents" ON generated_contents
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all support conversations" ON support_conversations
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all metrics" ON agent_metrics
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all health checks" ON agent_health_checks
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all external API usage" ON external_api_usage
    FOR SELECT USING (is_admin());

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Configuration initiale des agents
INSERT INTO agent_configurations (agent_type, configuration, is_active) VALUES
('cv_analyzer', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 5,
    "maxMemoryMB": 512,
    "timeoutSeconds": 300,
    "maxRetries": 3,
    "capabilities": ["pdf_extraction", "word_extraction", "structured_analysis", "skill_categorization"],
    "analysisDepth": "complete",
    "qualityThresholds": {
        "completeness": 40,
        "quality": 60
    },
    "supportedFormats": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "maxFileSizeMB": 10
}', true),

('matching', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 10,
    "maxMemoryMB": 256,
    "timeoutSeconds": 180,
    "maxRetries": 3,
    "capabilities": ["skills_matching", "experience_analysis", "semantic_analysis"],
    "defaultWeights": {
        "skills": 0.35,
        "experience": 0.25,
        "education": 0.15,
        "location": 0.10,
        "salary": 0.10,
        "language": 0.05
    },
    "matchingThresholds": {
        "strong": 80,
        "moderate": 60,
        "weak": 40
    }
}', true),

('content_writer', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 8,
    "maxMemoryMB": 256,
    "timeoutSeconds": 120,
    "maxRetries": 3,
    "capabilities": ["text_generation", "multilingual_support", "style_adaptation"],
    "supportedLanguages": ["fr", "ar", "en"],
    "contentTypes": ["job_description", "cover_letter", "profile_summary", "marketing_content"],
    "qualityChecks": {
        "grammar": true,
        "spelling": true,
        "coherence": true
    }
}', true),

('support', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 15,
    "maxMemoryMB": 128,
    "timeoutSeconds": 60,
    "maxRetries": 2,
    "capabilities": ["conversation_handling", "intent_recognition", "multilingual_support"],
    "supportedLanguages": ["fr", "ar"],
    "escalationThresholds": {
        "complexityScore": 0.8,
        "sentimentScore": 0.3,
        "conversationLength": 10
    },
    "responseStyle": {
        "tone": "helpful",
        "formality": "professional",
        "maxResponseLength": 500
    }
}', true),

('moderation', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 20,
    "maxMemoryMB": 128,
    "timeoutSeconds": 30,
    "maxRetries": 2,
    "capabilities": ["content_classification", "fraud_detection", "policy_enforcement"],
    "moderationRules": {
        "inappropriateContent": true,
        "fraudDetection": true,
        "personalInfoExposure": true,
        "spamDetection": true
    },
    "actionThresholds": {
        "autoReject": 0.9,
        "flagForReview": 0.7,
        "autoApprove": 0.3
    }
}', true),

('analytics', '{
    "version": "1.0.0",
    "maxConcurrentTasks": 5,
    "maxMemoryMB": 1024,
    "timeoutSeconds": 600,
    "maxRetries": 3,
    "capabilities": ["trend_analysis", "predictive_modeling", "data_visualization"],
    "analysisTypes": ["trend_analysis", "performance_metrics", "predictive_analysis", "user_behavior"],
    "dataRetention": {
        "rawData": "90 days",
        "aggregatedData": "2 years",
        "insights": "indefinite"
    }
}', true)

ON CONFLICT (agent_type) DO UPDATE SET
    configuration = EXCLUDED.configuration,
    updated_at = NOW();

-- ============================================================================
-- FONCTIONS UTILITAIRES POUR L'APPLICATION
-- ============================================================================

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_agent_statistics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'cv_analyses', (
            SELECT COUNT(*) FROM cv_analysis_results 
            WHERE user_id = user_uuid
        ),
        'matchings', (
            SELECT COUNT(*) FROM matching_results 
            WHERE candidate_id = user_uuid
        ),
        'generated_contents', (
            SELECT COUNT(*) FROM generated_contents 
            WHERE user_id = user_uuid
        ),
        'support_conversations', (
            SELECT COUNT(*) FROM support_conversations 
            WHERE user_id = user_uuid
        ),
        'avg_cv_quality_score', (
            SELECT AVG(quality_score) FROM cv_analysis_results 
            WHERE user_id = user_uuid
        ),
        'avg_matching_score', (
            SELECT AVG(overall_score) FROM matching_results 
            WHERE candidate_id = user_uuid
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_agent_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Supprimer les tâches terminées de plus de 30 jours
    DELETE FROM agent_tasks 
    WHERE status IN ('completed', 'failed') 
    AND completed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Supprimer les métriques de plus de 90 jours
    DELETE FROM agent_metrics 
    WHERE recorded_at < NOW() - INTERVAL '90 days';
    
    -- Supprimer les vérifications de santé de plus de 7 jours
    DELETE FROM agent_health_checks 
    WHERE checked_at < NOW() - INTERVAL '7 days';
    
    -- Supprimer les événements traités de plus de 7 jours
    DELETE FROM agent_events 
    WHERE processed = true 
    AND processed_at < NOW() - INTERVAL '7 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un job de nettoyage automatique (nécessite l'extension pg_cron)
-- SELECT cron.schedule('cleanup-agent-data', '0 2 * * *', 'SELECT cleanup_old_agent_data();');

COMMENT ON TABLE agent_configurations IS 'Configuration des agents IA du système multi-agents';
COMMENT ON TABLE agent_tasks IS 'Tâches exécutées par les agents IA';
COMMENT ON TABLE agent_workflows IS 'Définitions des workflows multi-agents';
COMMENT ON TABLE workflow_executions IS 'Exécutions des workflows multi-agents';
COMMENT ON TABLE agent_events IS 'Événements du système multi-agents';
COMMENT ON TABLE agent_messages IS 'Messages entre agents';
COMMENT ON TABLE cv_analysis_results IS 'Résultats d''analyse de CV par l''agent CV Analyzer';
COMMENT ON TABLE matching_results IS 'Résultats de matching par l''agent Matching';
COMMENT ON TABLE generated_contents IS 'Contenus générés par l''agent Content Writer';
COMMENT ON TABLE support_conversations IS 'Conversations avec l''agent de support client';
COMMENT ON TABLE agent_metrics IS 'Métriques de performance des agents';
COMMENT ON TABLE agent_health_checks IS 'Vérifications de santé des agents';
COMMENT ON TABLE external_api_usage IS 'Utilisation des APIs externes par les agents';


