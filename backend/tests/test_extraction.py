from io import BytesIO

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.extraction_service import ExtractionService


client = TestClient(app)


def test_extracts_supported_parameters_from_text():
    service = ExtractionService()
    sample_text = """
    Complete Blood Count
    Hemoglobin: 10.8 g/dL
    RBC Count: 4.1 million/uL
    WBC Count: 11800 /uL
    Platelets: 410000 /uL
    Glucose: 96 mg/dL
    Creatinine: 1.2 mg/dL
    Cholesterol: 178 mg/dL
    """

    result = service.extract_parameters(sample_text)

    names = {item["name"] for item in result["parameters"]}
    assert "Hemoglobin" in names
    assert "Glucose" in names
    assert "Creatinine" in names
    assert result["parameters"][0]["value"] == 10.8


def test_upload_endpoint_creates_report_record():
    response = client.post(
        "/upload",
        files={"file": ("sample.pdf", BytesIO(b"%PDF-1.4\n%test pdf"), "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["report_id"]
    assert payload["message"] == "Report uploaded successfully"
