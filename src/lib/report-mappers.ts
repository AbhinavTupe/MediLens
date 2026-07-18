import type {
  DashboardSummary,
  DiseaseRisk,
  ExtractedParameter,
  FeatureContribution,
  FeatureImportancePoint,
  FullReport,
  ChatHistory,
  ReportSummary,
} from "./types";

export interface ReportSummaryResponse {
  id: string;
  patient_name: string;
  hospital: string;
  report_date: string;
  report_type: string;
  status: string;
  risk_score: number;
  total_parameters: number;
  abnormal_parameters: number;
}

export interface ReportParameterResponse {
  id?: string;
  name: string;
  value: number;
  unit?: string;
  normalRange?: string;
  normal_range?: string;
  status?: string;
}

export interface ReportRiskResponse {
  id?: string;
  name: string;
  probability: number;
  confidence: number;
  severity?: string;
  summary: string;
  predicted_class?: string;
  model_metrics?: Record<string, unknown>;
  shap_values?: Record<string, number>;
  top_features?: ReportContributionResponse[];
  feature_importance_visualization_data?: ReportFeatureImportanceResponse[];
  human_readable_explanation?: string;
}

export interface ReportContributionResponse {
  parameter?: string;
  feature?: string;
  contribution?: number;
  contribution_score?: number;
  shap_value?: number;
  value?: number;
  direction?: "positive" | "negative" | "neutral";
}

export interface ReportFeatureImportanceResponse {
  feature: string;
  importance: number;
  direction: "positive" | "negative" | "neutral";
}

export interface ReportDetailResponse {
  id: string;
  patientName: string;
  hospital: string;
  reportDate: string;
  reportType: string;
  status: string;
  riskScore: number;
  totalParameters: number;
  abnormalParameters: number;
  parameters?: ReportParameterResponse[];
  risks?: ReportRiskResponse[];
  contributions?: ReportContributionResponse[];
  aiExplanation?: string;
  lifestyleSuggestions?: string[];
  recommendations?: string[];
  shapValues?: Record<string, number>;
  topFeatures?: ReportContributionResponse[];
  featureImportanceVisualizationData?: ReportFeatureImportanceResponse[];
  radarData?: { subject: string; value: number; fullMark: number }[];
  trend?: { month: string; score: number }[];
}

export interface DashboardActivityResponse {
  id: string;
  label: string;
  time: string;
}

export interface DashboardSummaryResponse {
  report_count: number;
  high_risk_count: number;
  normal_count: number;
  conversation_count: number;
  health_score: number;
  trend: { month: string; score: number }[];
  recent_activity: DashboardActivityResponse[];
  recent_reports: ReportSummaryResponse[];
}

export interface ChatMessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  report_id?: string | null;
  messages: ChatMessageResponse[];
  suggested_questions: string[];
}

function normalizeParameterStatus(status?: string): ExtractedParameter["status"] {
  if (status === "borderline" || status === "critical") {
    return status;
  }
  return "normal";
}

function normalizeRiskSeverity(severity?: string): DiseaseRisk["severity"] {
  if (severity === "moderate" || severity === "high") {
    return severity;
  }
  return "low";
}

function mapContribution(item: ReportContributionResponse, index: number, sourceId: string): FeatureContribution {
  const score = item.contribution_score ?? item.contribution ?? 0;
  const parameter = item.parameter ?? item.feature ?? fallbackId("feature", sourceId, index);
  return {
    parameter,
    contribution: score,
    contributionScore: score,
    shapValue: item.shap_value,
    value: item.value,
    direction: item.direction === "positive" || item.direction === "negative" ? item.direction : score >= 0 ? "positive" : "negative",
  };
}

function mapFeatureImportance(item: ReportFeatureImportanceResponse): FeatureImportancePoint {
  return {
    feature: item.feature,
    importance: item.importance,
    direction: item.direction,
  };
}

function fallbackId(prefix: string, sourceId: string, index: number): string {
  return `${sourceId}-${prefix}-${index}`;
}

export function mapReportSummaryResponse(item: ReportSummaryResponse): ReportSummary {
  return {
    id: item.id,
    patientName: item.patient_name,
    hospital: item.hospital,
    reportDate: item.report_date,
    reportType: item.report_type,
    status: item.status as ReportSummary["status"],
    riskScore: item.risk_score,
    totalParameters: item.total_parameters,
    abnormalParameters: item.abnormal_parameters,
  };
}

export function mapReportDetailResponse(item: ReportDetailResponse): FullReport {
  const topFeatures = item.topFeatures?.map((feature, index) => mapContribution(feature, index, item.id)) ?? [];
  const contributions = (item.contributions?.length ? item.contributions : item.topFeatures)?.map((feature, index) =>
    mapContribution(feature, index, item.id)
  ) ?? topFeatures;
  const shapValues = item.shapValues ?? item.risks?.[0]?.shap_values ?? {};
  const featureImportanceVisualizationData = item.featureImportanceVisualizationData
    ? item.featureImportanceVisualizationData.map(mapFeatureImportance)
    : item.risks?.[0]?.feature_importance_visualization_data?.map(mapFeatureImportance) ?? [];

  return {
    id: item.id,
    patientName: item.patientName,
    hospital: item.hospital,
    reportDate: item.reportDate,
    reportType: item.reportType,
    status: item.status as FullReport["status"],
    riskScore: item.riskScore,
    totalParameters: item.totalParameters,
    abnormalParameters: item.abnormalParameters,
    parameters:
      item.parameters?.map((parameter, index) => ({
        id: parameter.id ?? fallbackId("param", item.id, index),
        name: parameter.name,
        value: parameter.value,
        unit: parameter.unit ?? "",
        normalRange: parameter.normalRange ?? parameter.normal_range ?? "",
        status: normalizeParameterStatus(parameter.status),
      })) ?? [],
    risks:
      item.risks?.map((risk, index) => ({
        id: risk.id ?? fallbackId("risk", item.id, index),
        name: risk.name,
        probability: risk.probability,
        confidence: risk.confidence,
        severity: normalizeRiskSeverity(risk.severity),
        summary: risk.summary,
        predictedClass: risk.predicted_class,
        modelMetrics: risk.model_metrics,
        shapValues: risk.shap_values,
        topFeatures: risk.top_features?.map((feature, featureIndex) => mapContribution(feature, featureIndex, risk.id ?? item.id)),
        featureImportanceVisualizationData: risk.feature_importance_visualization_data?.map(mapFeatureImportance),
        humanReadableExplanation: risk.human_readable_explanation,
      })) ?? [],
    contributions,
    aiExplanation:
      item.aiExplanation ??
      item.risks?.find((risk) => risk.human_readable_explanation)?.human_readable_explanation ??
      "AI explanation pending.",
    lifestyleSuggestions: item.lifestyleSuggestions ?? [],
    recommendations: item.recommendations ?? [],
    shapValues,
    topFeatures,
    featureImportanceVisualizationData,
    radarData: item.radarData ?? [],
    trend: item.trend ?? [],
  };
}

export function mapDashboardSummaryResponse(item: DashboardSummaryResponse): DashboardSummary {
  return {
    reportCount: item.report_count,
    highRiskCount: item.high_risk_count,
    normalCount: item.normal_count,
    conversationCount: item.conversation_count,
    healthScore: item.health_score,
    trend: item.trend ?? [],
    recentActivity: item.recent_activity.map((activity) => ({
      id: activity.id,
      label: activity.label,
      time: activity.time,
    })),
    recentReports: item.recent_reports.map(mapReportSummaryResponse),
  };
}

export function mapChatHistoryResponse(item: ChatHistoryResponse): ChatHistory {
  return {
    reportId: item.report_id ?? undefined,
    messages: item.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    })),
    suggestedQuestions: item.suggested_questions,
  };
}
