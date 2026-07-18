from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ExtractedParameterInput(BaseModel):
    name: str
    value: float
    unit: str = ""
    normal_range: str = ""
    status: str = "normal"


class ShapFeatureContributionInput(BaseModel):
    feature: str
    parameter: str
    contribution_score: float
    shap_value: float
    value: Optional[float] = None


class ShapVisualizationDataInput(BaseModel):
    feature: str
    importance: float
    direction: str


class PredictionInput(BaseModel):
    name: str
    probability: float
    confidence: float
    severity: str
    summary: str
    predicted_class: Optional[str] = None
    model_metrics: Optional[Dict[str, Any]] = None
    shap_values: Optional[Dict[str, float]] = None
    top_features: Optional[List[ShapFeatureContributionInput]] = None
    feature_importance_visualization_data: Optional[List[ShapVisualizationDataInput]] = None
    human_readable_explanation: Optional[str] = None


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ExtractResponse(BaseModel):
    parameters: List[ExtractedParameterInput]


class PredictRequest(BaseModel):
    parameters: List[ExtractedParameterInput]
    report_id: Optional[str] = None


class PredictResponse(BaseModel):
    predictions: List[PredictionInput]


class ExplainRequest(BaseModel):
    report_id: str
    parameters: List[ExtractedParameterInput]
    predictions: List[PredictionInput]


class ExplainResponse(BaseModel):
    explanation: str
    lifestyle_suggestions: List[str]
    recommendations: List[str]
    shap_values: Optional[Dict[str, float]] = None
    top_features: Optional[List[ShapFeatureContributionInput]] = None
    feature_importance_visualization_data: Optional[List[ShapVisualizationDataInput]] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    report_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    report_id: Optional[str] = None
    messages: List[ChatMessageResponse]
    suggested_questions: List[str]


class ReportSummaryResponse(BaseModel):
    id: str
    patient_name: str
    hospital: str
    report_date: str
    report_type: str
    status: str
    risk_score: int
    total_parameters: int
    abnormal_parameters: int


class DashboardActivityResponse(BaseModel):
    id: str
    label: str
    time: str


class DashboardSummaryResponse(BaseModel):
    report_count: int
    high_risk_count: int
    normal_count: int
    conversation_count: int
    health_score: int
    trend: List[Dict[str, Any]]
    recent_activity: List[DashboardActivityResponse]
    recent_reports: List[ReportSummaryResponse]


class UploadResponse(BaseModel):
    report_id: str
    message: str
    extracted_text: str = ""


class SettingsNotification(BaseModel):
    email: bool = True
    high_risk: bool = True
    weekly: bool = False
    updates: bool = False


class Settings(BaseModel):
    theme: str = "system"
    ai_provider: str = "groq"
    notifications: SettingsNotification = Field(default_factory=SettingsNotification)
