import textwrap
from typing import Any, Dict

import fitz


class PDFService:
    def extract_text(self, file_path: str) -> str:
        try:
            with fitz.open(file_path) as document:
                text_chunks: list[str] = []
                for page in document:
                    text_chunks.append(page.get_text())
                return "\n".join(text_chunks)
        except (fitz.FileDataError, fitz.EmptyFileError, ValueError, RuntimeError):
            return ""

    def build_report_pdf(self, report: Dict[str, Any]) -> bytes:
        document = fitz.open()
        page = document.new_page()
        cursor_y = 54

        def new_page() -> None:
            nonlocal page, cursor_y
            page = document.new_page()
            cursor_y = 54

        def ensure_space(line_count: int = 1, line_height: int = 16) -> None:
            nonlocal page, cursor_y
            if cursor_y + (line_count * line_height) > 786:
                new_page()

        def write_line(
            text: str,
            *,
            font_size: float = 11,
            color: tuple[float, float, float] = (0, 0, 0),
            gap_after: int = 0,
            font_name: str | None = None,
        ) -> None:
            nonlocal cursor_y
            ensure_space(1, int(font_size * 1.8))
            draw_kwargs = {}
            if font_name:
                draw_kwargs["fontname"] = font_name
            page.insert_text((48, cursor_y), text, fontsize=font_size, color=color, **draw_kwargs)
            cursor_y += int(font_size * 1.8) + gap_after

        def write_wrapped(
            text: str,
            *,
            font_size: float = 11,
            color: tuple[float, float, float] = (0, 0, 0),
            bullet: str | None = None,
        ) -> None:
            prefix = f"{bullet} " if bullet else ""
            wrapped_lines = textwrap.wrap(
                text,
                width=88,
                initial_indent=prefix,
                subsequent_indent=" " * len(prefix),
            ) or [prefix.rstrip()]
            for line in wrapped_lines:
                write_line(line, font_size=font_size, color=color)

        title_color = (0.16, 0.5, 0.25)

        write_line("MediLens Report Summary", font_size=20, color=title_color, gap_after=8)
        write_wrapped(
            f"Report ID: {report.get('id', 'Unknown')} | Patient: {report.get('patientName', 'Unknown')} | "
            f"Hospital: {report.get('hospital', 'Unknown')}",
            font_size=11,
        )
        write_wrapped(
            f"Date: {report.get('reportDate', 'Unknown')} | Type: {report.get('reportType', 'Unknown')} | "
            f"Status: {report.get('status', 'attention')} | Risk score: {report.get('riskScore', 0)}%",
            font_size=11,
        )
        write_line("", gap_after=4)

        trend = report.get("trend", [])
        if trend:
            trend_summary = ", ".join(f"{item.get('month', '')} {item.get('score', '')}" for item in trend)
            write_line("Health Score Trend", font_size=14, color=title_color, gap_after=2)
            write_wrapped(trend_summary, font_size=11)
            write_line("", gap_after=4)

        write_line("Extracted Parameters", font_size=14, color=title_color, gap_after=2)
        for parameter in report.get("parameters", []):
            write_wrapped(
                f"{parameter.get('name', 'Parameter')}: {parameter.get('value', '')} {parameter.get('unit', '')} "
                f"({parameter.get('status', 'normal')}) | Normal range: {parameter.get('normalRange', '')}",
                font_size=10.5,
                bullet="-",
            )
        write_line("", gap_after=2)

        write_line("Risk Predictions", font_size=14, color=title_color, gap_after=2)
        for risk in report.get("risks", []):
            write_wrapped(
                f"{risk.get('name', 'Risk')}: {risk.get('probability', 0)}% probability "
                f"({risk.get('severity', 'low')}) - {risk.get('summary', '')}",
                font_size=10.5,
                bullet="-",
            )
        write_line("", gap_after=2)

        explanation = report.get("aiExplanation") or "AI explanation pending."
        write_line("AI Explanation", font_size=14, color=title_color, gap_after=2)
        write_wrapped(explanation, font_size=11)
        write_line("", gap_after=4)

        suggestions = report.get("lifestyleSuggestions", [])
        if suggestions:
            write_line("Lifestyle Suggestions", font_size=14, color=title_color, gap_after=2)
            for suggestion in suggestions:
                write_wrapped(str(suggestion), font_size=10.5, bullet="-")
            write_line("", gap_after=2)

        recommendations = report.get("recommendations", [])
        if recommendations:
            write_line("General Recommendations", font_size=14, color=title_color, gap_after=2)
            for recommendation in recommendations:
                write_wrapped(str(recommendation), font_size=10.5, bullet="-")
            write_line("", gap_after=2)

        disclaimer = (
            "Disclaimer: This report is generated for informational purposes only and does not replace "
            "professional medical advice, diagnosis, or treatment."
        )
        write_line("Medical Disclaimer", font_size=14, color=title_color, gap_after=2)
        write_wrapped(disclaimer, font_size=10.5)

        try:
            return document.tobytes(deflate=True)
        finally:
            document.close()
