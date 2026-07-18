import type {
  ChatHistoryResponse,
  DashboardSummaryResponse,
  ReportDetailResponse,
  ReportRiskResponse,
  ReportSummaryResponse,
} from "@/lib/report-mappers";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function uploadReport(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ report_id: string; message: string; extracted_text: string }>('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function extractReportText(text: string) {
  return request<{ parameters: Array<{ name: string; value: number; unit: string; normal_range: string; status: string }> }>('/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export async function predictReport(parameters: Array<{ name: string; value: number; unit: string; normal_range: string; status: string }>, reportId?: string) {
  return request<{ predictions: ReportRiskResponse[] }>('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parameters, report_id: reportId }),
  });
}

export async function explainReport(parameters: Array<{ name: string; value: number; unit: string; normal_range: string; status: string }>, predictions: ReportRiskResponse[], reportId: string) {
  return request<{
    explanation: string;
    lifestyle_suggestions: string[];
    recommendations: string[];
    shap_values?: Record<string, number>;
    top_features?: Array<{ parameter?: string; feature?: string; contribution?: number; contribution_score?: number; shap_value?: number; value?: number }>;
    feature_importance_visualization_data?: Array<{ feature: string; importance: number; direction: string }>;
  }>('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_id: reportId, parameters, predictions }),
  });
}

export async function chatWithReport(message: string, reportId?: string) {
  return request<{ response: string }>('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, report_id: reportId }),
  });
}

export async function streamChatWithReport(message: string, reportId?: string) {
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, report_id: reportId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return response;
}

export async function fetchChatHistory(reportId?: string, reportContext = "") {
  const params = new URLSearchParams();
  if (reportId) {
    params.set("report_id", reportId);
  }
  if (reportContext) {
    params.set("report_context", reportContext);
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<ChatHistoryResponse>(`/chat/history${suffix}`);
}

export async function fetchDashboardSummary() {
  return request<DashboardSummaryResponse>("/dashboard/summary");
}

export async function fetchReports() {
  return request<ReportSummaryResponse[]>("/reports");
}

export async function fetchReport(reportId: string) {
  return request<ReportDetailResponse>(`/report/${reportId}`);
}

export async function deleteReport(reportId: string) {
  return request<{ status: string }>(`/report/${reportId}`, { method: 'DELETE' });
}

export async function fetchSettings() {
  return request<any>("/settings");
}

export async function updateSettings(settings: any) {
  return request<any>("/settings", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
