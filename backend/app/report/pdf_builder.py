"""ReportLab PDF report — compact alternative to Word output."""
from __future__ import annotations
import io


def generate_pdf_report(analysis: dict, docs: list[dict]) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle, HRFlowable)
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units  import cm
    except ImportError as exc:
        raise RuntimeError("reportlab not installed") from exc

    buf    = io.BytesIO()
    pdoc   = SimpleDocTemplate(buf, pagesize=A4,
                                rightMargin=2*cm, leftMargin=2*cm,
                                topMargin=2.5*cm, bottomMargin=2.5*cm)
    styles = getSampleStyleSheet()
    story  = []

    f       = analysis.get("financials", {})
    dec     = analysis.get("decision",   {})
    score   = analysis.get("credit_score", 0)
    rating  = analysis.get("credit_rating", "N/A")
    rec     = dec.get("recommendation", "N/A")
    company = f.get("company_name", "Unknown Company")
    curr    = f.get("currency", "")
    az      = analysis.get("altman_z") or {}

    _DARK = colors.HexColor("#1E4D8C")
    _RC   = {"APPROVE": colors.HexColor("#27AE60"),
             "CONDITIONAL": colors.HexColor("#E67E22"),
             "DECLINE": colors.HexColor("#C0392B")}.get(rec, colors.grey)

    H1  = ParagraphStyle("H1",  parent=styles["Heading1"], fontSize=16, textColor=_DARK, spaceAfter=6)
    H2  = ParagraphStyle("H2",  parent=styles["Heading2"], fontSize=12, textColor=_DARK, spaceAfter=4)
    BAN = ParagraphStyle("BAN", parent=styles["Normal"],   fontSize=13, textColor=_RC,   spaceAfter=10)
    NB  = ParagraphStyle("NB",  parent=styles["Normal"],   fontSize=9,  spaceAfter=3)

    story += [
        Paragraph("Credit Analysis Report", H1),
        Paragraph(company, styles["Heading2"]),
        HRFlowable(width="100%", thickness=1, color=_DARK),
        Spacer(1, 0.3*cm),
        Paragraph(f"Decision: {rec}  |  Score: {score}/100 ({rating})  |  Z′: {az.get('z_score','N/A')}", BAN),
    ]
    if dec.get("narrative"):
        story.append(Paragraph(dec["narrative"], NB))
    story.append(Spacer(1, 0.4*cm))

    story.append(Paragraph("Key Financial Metrics", H2))
    rows = [["Metric", "Value"]]
    for key, label in [
        ("revenue","Revenue"),("operating_profit","Op. Profit"),("net_profit","Net Profit"),
        ("total_assets","Total Assets"),("net_assets","Equity"),
        ("equity_ratio","Equity Ratio (%)"),("current_ratio","Current Ratio"),
        ("roe","ROE (%)"),("roa","ROA (%)"),("dscr","DSCR"),
        ("revenue_growth_pct","Revenue Growth (%)"),
    ]:
        val = f.get(key)
        if val is not None:
            rows.append([label, f"{val:,.2f}"])
    rows.append(["Currency / Unit", f"{curr} / {f.get('unit','')}"])

    t = Table(rows, colWidths=[8*cm, 6*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,0), _DARK),
        ("TEXTCOLOR",     (0,0),(-1,0), colors.white),
        ("FONTNAME",      (0,0),(-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0),(-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.white, colors.HexColor("#EBF0FA")]),
        ("GRID",          (0,0),(-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0,0),(-1,-1), 4),
        ("BOTTOMPADDING", (0,0),(-1,-1), 4),
    ]))
    story += [t, Spacer(1, 0.5*cm)]

    for heading, items in [
        ("Strengths",           dec.get("strengths",   [])),
        ("Risk Factors",        dec.get("risks",        [])),
        ("Approval Conditions", dec.get("conditions",   [])),
    ]:
        if items:
            story.append(Paragraph(heading, H2))
            story += [Paragraph(f"• {i}", NB) for i in items]

    story += [
        Spacer(1, 0.5*cm),
        Paragraph("Documents Reviewed", H2),
        *[Paragraph(f"• {d['filename']}", NB) for d in docs],
    ]

    pdoc.build(story)
    buf.seek(0)
    return buf.getvalue()