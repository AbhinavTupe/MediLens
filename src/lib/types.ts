export type ParameterStatus = "normal" | "borderline" | "critical";

export interface ExtractedParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  status: ParameterStatus;
}

export type RiskSeverity = "low" | "moderate" | "high";

export interface FeatureImportancePoint {
  feature: string;
  importance: number;
  direction: "positive" | "negative" | "neutral";
}

export interface ShapValueMap {
  [feature: string]: number;
}

export interface DiseaseRisk {
  id: string;
  name: string;
  probability: number; // 0-100
  confidence: number; // 0-100
  severity: RiskSeverity;
  summary: string;
  predictedClass?: string;
  modelMetrics?: Record<string, unknown>;
  shapValues?: ShapValueMap;
  topFeatures?: FeatureContribution[];
  featureImportanceVisualizationData?: FeatureImportancePoint[];
  humanReadableExplanation?: string;
}

export interface FeatureContribution {
  parameter: string;
  contribution: number; // -100 to 100
  contributionScore?: number;
  shapValue?: number;
  value?: number;
  direction?: "positive" | "negative";
}

export interface ReportSummary {
  id: string;
  patientName: string;
  hospital: string;
  reportDate: string;
  reportType: string;
  status: "normal" | "attention" | "critical";
  riskScore: number;
  totalParameters: number;
  abnormalParameters: number;
}

export interface FullReport extends ReportSummary {
  parameters: ExtractedParameter[];
  risks: DiseaseRisk[];
  contributions: FeatureContribution[];
  aiExplanation: string;
  lifestyleSuggestions: string[];
  recommendations: string[];
  shapValues?: ShapValueMap;
  topFeatures?: FeatureContribution[];
  featureImportanceVisualizationData?: FeatureImportancePoint[];
  radarData: { subject: string; value: number; fullMark: number }[];
  trend: { month: string; score: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  reportId?: string;
  messages: ChatMessage[];
  suggestedQuestions: string[];
}

export interface DashboardActivity {
  id: string;
  label: string;
  time: string;
}

export interface DashboardSummary {
  reportCount: number;
  highRiskCount: number;
  normalCount: number;
  conversationCount: number;
  healthScore: number;
  trend: { month: string; score: number }[];
  recentActivity: DashboardActivity[];
  recentReports: ReportSummary[];
}
