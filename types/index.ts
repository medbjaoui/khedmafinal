// Types de base pour le système multi-agents KhedmaFinal

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  version: string;
  isActive: boolean;
  configuration: Record<string, any>;
  capabilities: string[];
  dependencies: string[];
  resourceLimits: ResourceLimits;
}

export interface ResourceLimits {
  maxConcurrentTasks: number;
  maxMemoryMB: number;
  timeoutSeconds: number;
  maxRetries: number;
}

export enum AgentType {
  CV_ANALYZER = 'cv_analyzer',
  MATCHING = 'matching',
  CONTENT_WRITER = 'content_writer',
  SUPPORT = 'support',
  MODERATION = 'moderation',
  ANALYTICS = 'analytics'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 8,
  CRITICAL = 10
}

export interface AgentTask {
  id: string;
  agentType: AgentType;
  taskType: string;
  inputData: any;
  outputData?: any;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  userId?: string;
  correlationId?: string;
  retryCount: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface AgentEvent {
  id: string;
  eventType: string;
  sourceAgent: string;
  targetAgent?: string;
  payload: any;
  timestamp: Date;
  correlationId: string;
  priority: TaskPriority;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentType: AgentType;
  taskType: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  dependencies: string[];
  condition?: string;
  retryPolicy: RetryPolicy;
  timeoutSeconds: number;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  configuration: Record<string, any>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt?: Date;
  userId?: string;
  inputData: any;
  outputData?: any;
  stepExecutions: StepExecution[];
  errorMessage?: string;
}

export interface StepExecution {
  stepId: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt?: Date;
  inputData: any;
  outputData?: any;
  errorMessage?: string;
  retryCount: number;
}

// Types spécifiques aux agents

export interface CVAnalysisInput {
  fileBuffer: ArrayBuffer;
  fileName: string;
  fileType: string;
  userId: string;
  analysisType: 'basic' | 'advanced' | 'complete';
}

export interface CVAnalysisOutput {
  extractedText: string;
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  recommendations: Recommendation[];
  qualityScore: number;
  completenessScore: number;
  improvementSuggestions: string[];
}

export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  description?: string;
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  verified: boolean;
}

export interface Language {
  name: string;
  level: 'basic' | 'conversational' | 'fluent' | 'native';
  certifications?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
}

export interface Recommendation {
  type: 'skill_gap' | 'experience_enhancement' | 'format_improvement' | 'keyword_optimization';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number; // 1-10 scale
}

export interface MatchingInput {
  candidateProfile: CandidateProfile;
  jobOffer: JobOffer;
  matchingCriteria: MatchingCriteria;
}

export interface MatchingOutput {
  overallScore: number;
  detailedScores: DetailedMatchingScores;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceLevel: number;
}

export interface CandidateProfile {
  id: string;
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  preferences: CandidatePreferences;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: JobRequirements;
  benefits: string[];
  salaryRange?: SalaryRange;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
}

export interface JobRequirements {
  requiredSkills: RequiredSkill[];
  preferredSkills: RequiredSkill[];
  minimumExperience: number;
  educationLevel: string;
  languages: LanguageRequirement[];
  certifications?: string[];
}

export interface RequiredSkill {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
  weight: number; // 1-10 importance scale
}

export interface LanguageRequirement {
  name: string;
  level: 'basic' | 'conversational' | 'fluent' | 'native';
  isRequired: boolean;
}

export interface CandidatePreferences {
  preferredLocations: string[];
  salaryExpectation?: SalaryRange;
  contractTypes: string[];
  remoteWork: boolean;
  travelWillingness: number; // 0-100 percentage
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'monthly' | 'yearly';
}

export interface MatchingCriteria {
  skillsWeight: number;
  experienceWeight: number;
  educationWeight: number;
  locationWeight: number;
  salaryWeight: number;
  languageWeight: number;
  strictRequirements: boolean;
}

export interface DetailedMatchingScores {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  salaryScore: number;
  languageScore: number;
  culturalFitScore: number;
}

export interface ContentGenerationInput {
  type: 'job_description' | 'cover_letter' | 'profile_summary' | 'marketing_content';
  context: any;
  style: ContentStyle;
  language: 'fr' | 'ar' | 'en';
  targetAudience: string;
}

export interface ContentStyle {
  tone: 'professional' | 'casual' | 'enthusiastic' | 'formal';
  length: 'short' | 'medium' | 'long';
  keywords: string[];
  industry: string;
  companySize: 'startup' | 'sme' | 'large' | 'multinational';
}

export interface ContentGenerationOutput {
  generatedContent: string;
  alternativeVersions: string[];
  keywords: string[];
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
}

export interface SupportInput {
  message: string;
  userId?: string;
  sessionId: string;
  context: SupportContext;
  language: 'fr' | 'ar' | 'en';
}

export interface SupportContext {
  currentPage: string;
  userType: 'candidate' | 'employer' | 'admin';
  previousMessages: SupportMessage[];
  userProfile?: any;
}

export interface SupportMessage {
  id: string;
  message: string;
  isFromUser: boolean;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export interface SupportOutput {
  response: string;
  intent: string;
  confidence: number;
  suggestedActions: SuggestedAction[];
  escalateToHuman: boolean;
  followUpQuestions: string[];
}

export interface SuggestedAction {
  type: 'navigation' | 'form_fill' | 'external_link' | 'contact';
  label: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface ModerationInput {
  content: string;
  contentType: 'job_offer' | 'profile' | 'message' | 'review';
  userId: string;
  metadata: Record<string, any>;
}

export interface ModerationOutput {
  isApproved: boolean;
  riskScore: number;
  detectedIssues: ModerationIssue[];
  suggestedActions: ModerationAction[];
  confidence: number;
}

export interface ModerationIssue {
  type: 'spam' | 'inappropriate' | 'fraud' | 'personal_info' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
}

export interface ModerationAction {
  type: 'approve' | 'reject' | 'flag' | 'edit' | 'quarantine';
  reason: string;
  automaticAction: boolean;
}

export interface AnalyticsInput {
  analysisType: 'trend_analysis' | 'performance_metrics' | 'predictive_analysis' | 'user_behavior';
  timeRange: TimeRange;
  filters: AnalyticsFilters;
  userId?: string;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilters {
  userType?: 'candidate' | 'employer';
  location?: string[];
  industry?: string[];
  jobLevel?: string[];
  customFilters?: Record<string, any>;
}

export interface AnalyticsOutput {
  insights: Insight[];
  metrics: Metric[];
  predictions: Prediction[];
  recommendations: AnalyticsRecommendation[];
  visualizations: Visualization[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  benchmark?: number;
}

export interface Prediction {
  metric: string;
  predictedValue: number;
  confidence: number;
  timeHorizon: string;
  factors: string[];
}

export interface AnalyticsRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  category: string;
}

export interface Visualization {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'table';
  title: string;
  data: any;
  configuration: Record<string, any>;
}

// Types pour la gestion des erreurs et la résilience

export interface AgentError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  agentType: AgentType;
  taskId?: string;
  recoverable: boolean;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
  successCount: number;
}

export interface HealthCheck {
  agentType: AgentType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  details: Record<string, any>;
}

// Types pour la configuration et le monitoring

export interface AgentMetrics {
  agentType: AgentType;
  tasksProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  currentLoad: number;
  memoryUsage: number;
  lastActivity: Date;
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  systemLoad: number;
  timestamp: Date;
}

