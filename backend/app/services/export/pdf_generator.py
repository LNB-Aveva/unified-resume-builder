"""Three ATS-friendly resume PDF templates via fpdf2 (classic, modern, minimal)."""

import unicodedata

from fpdf import FPDF
from fpdf.enums import XPos, YPos

from app.schemas.export import ResumeExportRequest

_PAGE_W  = 210
_MARGIN  = 18
_TOP     = 15
_LINE_H  = 5.5
_SECT_GAP = 5

_UNICODE_MAP = str.maketrans({
    "–": "-", "—": "-",
    "‘": "'", "’": "'",
    "“": '"', "”": '"',
    "•": "-", "·": "-",
    "…": "...", " ": " ",
})


def _s(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    return text.translate(_UNICODE_MAP).encode("latin-1", errors="replace").decode("latin-1")


class _ResumePDF(FPDF):
    def __init__(self):
        super().__init__(unit="mm", format="A4")
        self.set_margins(_MARGIN, _TOP, _MARGIN)
        self.set_auto_page_break(auto=True, margin=15)

    @property
    def w_eff(self) -> float:
        return _PAGE_W - 2 * _MARGIN

    def _two_col(self, left: str, right: str, left_style: str = "B",
                 left_size: float = 10, right_size: float = 9,
                 right_color: tuple = (100, 100, 100)) -> None:
        right_w = 40
        left_w = self.w_eff - right_w
        self.set_font("Helvetica", left_style, left_size)
        left_text = _s(left)
        while self.get_string_width(left_text) > left_w and len(left_text) > 4:
            left_text = left_text[:-4] + "..."
        self.cell(left_w, _LINE_H, left_text)
        self.set_font("Helvetica", "", right_size)
        self.set_text_color(*right_color)
        self.cell(right_w, _LINE_H, _s(right), align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(0, 0, 0)


def _build_classic(pdf: _ResumePDF, req: ResumeExportRequest) -> None:
    INDIGO   = (67, 56, 202)
    INDIGO_L = (199, 210, 254)
    DARK     = (26, 26, 26)
    GRAY     = (80, 80, 80)

    def h1(text: str) -> None:
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(*INDIGO)
        pdf.cell(pdf.w_eff, 9, _s(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(*DARK)

    def contact_row(parts: list[str]) -> None:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(pdf.w_eff, 4.5, _s("  |  ".join(parts)), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(*DARK)

    def section(title: str) -> None:
        pdf.ln(_SECT_GAP)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*INDIGO)
        pdf.cell(pdf.w_eff, 5, _s(title.upper()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y = pdf.get_y()
        pdf.set_draw_color(*INDIGO_L)
        pdf.set_line_width(0.4)
        pdf.line(_MARGIN, y, _PAGE_W - _MARGIN, y)
        pdf.ln(2)
        pdf.set_text_color(*DARK)

    h1(req.personal.full_name.strip())
    parts = [v for v in [req.personal.email, req.personal.phone,
                          req.personal.location, req.personal.linkedin,
                          req.personal.website] if v]
    if parts:
        contact_row(parts)
    pdf.ln(1)
    y = pdf.get_y()
    pdf.set_draw_color(*INDIGO)
    pdf.set_line_width(0.8)
    pdf.line(_MARGIN, y, _PAGE_W - _MARGIN, y)
    pdf.ln(3)

    if req.summary.strip():
        section("Professional Summary")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.summary.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if req.experience:
        section("Work Experience")
        for job in req.experience:
            pdf.ln(1)
            pdf._two_col(job.title, f"{job.start_date} - {job.end_date}")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(job.company), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)
            for b in job.bullets:
                b = b.strip().lstrip("-• ")
                if b:
                    pdf.set_font("Helvetica", "", 10)
                    pdf.multi_cell(pdf.w_eff, _LINE_H, _s(f"-  {b}"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(1)

    if req.education:
        section("Education")
        for edu in req.education:
            pdf.ln(1)
            degree = edu.degree + (f" -- {edu.field}" if edu.field else "")
            pdf._two_col(degree, edu.year)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(edu.institution), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)

    if req.skills.strip():
        section("Skills")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.skills.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def _build_modern(pdf: _ResumePDF, req: ResumeExportRequest) -> None:
    NAVY   = (15, 23, 42)
    TEAL   = (20, 184, 166)
    DARK   = (15, 23, 42)
    GRAY   = (100, 116, 139)
    WHITE  = (255, 255, 255)

    band_h = 28
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, _PAGE_W, band_h, style="F")

    pdf.set_xy(_MARGIN, 6)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*WHITE)
    pdf.cell(pdf.w_eff, 10, _s(req.personal.full_name.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    parts = [v for v in [req.personal.email, req.personal.phone,
                          req.personal.location, req.personal.linkedin,
                          req.personal.website] if v]
    if parts:
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(148, 163, 184)
        pdf.set_x(_MARGIN)
        pdf.multi_cell(pdf.w_eff, 4, _s("  *  ".join(parts)), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(band_h + 6)
    pdf.set_text_color(*DARK)

    def section(title: str) -> None:
        pdf.ln(_SECT_GAP)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*NAVY)
        pdf.cell(pdf.w_eff, 6, _s(title.upper()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y = pdf.get_y()
        pdf.set_draw_color(*TEAL)
        pdf.set_line_width(0.6)
        pdf.line(_MARGIN, y, _MARGIN + 30, y)
        pdf.ln(3)
        pdf.set_text_color(*DARK)

    if req.summary.strip():
        section("Summary")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.summary.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if req.experience:
        section("Experience")
        for job in req.experience:
            pdf.ln(1)
            pdf._two_col(job.title, f"{job.start_date} - {job.end_date}",
                         right_color=GRAY)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(job.company), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)
            for b in job.bullets:
                b = b.strip().lstrip("-• ")
                if b:
                    pdf.set_font("Helvetica", "", 10)
                    pdf.multi_cell(pdf.w_eff, _LINE_H, _s(f"-  {b}"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(1)

    if req.education:
        section("Education")
        for edu in req.education:
            pdf.ln(1)
            degree = edu.degree + (f", {edu.field}" if edu.field else "")
            pdf._two_col(degree, edu.year, right_color=GRAY)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(edu.institution), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)

    if req.skills.strip():
        section("Skills")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.skills.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def _build_minimal(pdf: _ResumePDF, req: ResumeExportRequest) -> None:
    BLACK   = (0, 0, 0)
    DARK    = (30, 30, 30)
    GRAY    = (120, 120, 120)
    LGRAY   = (200, 200, 200)

    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*BLACK)
    pdf.cell(pdf.w_eff, 12, _s(req.personal.full_name.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    parts = [v for v in [req.personal.email, req.personal.phone,
                          req.personal.location, req.personal.linkedin,
                          req.personal.website] if v]
    if parts:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(pdf.w_eff, 4.5, _s("  *  ".join(parts)), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(2)
    y = pdf.get_y()
    pdf.set_draw_color(*LGRAY)
    pdf.set_line_width(0.3)
    pdf.line(_MARGIN, y, _PAGE_W - _MARGIN, y)
    pdf.ln(4)
    pdf.set_text_color(*DARK)

    def section(title: str) -> None:
        pdf.ln(_SECT_GAP + 2)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(*GRAY)
        pdf.cell(pdf.w_eff, 5, _s(title.upper()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y2 = pdf.get_y()
        pdf.set_draw_color(*LGRAY)
        pdf.set_line_width(0.3)
        pdf.line(_MARGIN, y2, _PAGE_W - _MARGIN, y2)
        pdf.ln(3)
        pdf.set_text_color(*DARK)

    if req.summary.strip():
        section("Profile")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.summary.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if req.experience:
        section("Experience")
        for job in req.experience:
            pdf.ln(2)
            pdf._two_col(job.title, f"{job.start_date} - {job.end_date}",
                         left_size=10.5, right_size=9, right_color=GRAY)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(job.company), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)
            pdf.ln(1)
            for b in job.bullets:
                b = b.strip().lstrip("-• ")
                if b:
                    pdf.set_font("Helvetica", "", 10)
                    pdf.multi_cell(pdf.w_eff, _LINE_H, _s(f"—  {b}"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if req.education:
        section("Education")
        for edu in req.education:
            pdf.ln(2)
            degree = edu.degree + (f" -- {edu.field}" if edu.field else "")
            pdf._two_col(degree, edu.year,
                         left_size=10.5, right_size=9, right_color=GRAY)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(pdf.w_eff, 4.5, _s(edu.institution), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_text_color(*DARK)

    if req.skills.strip():
        section("Skills")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, _s(req.skills.strip()), new_x=XPos.LMARGIN, new_y=YPos.NEXT)


_BUILDERS = {
    "classic": _build_classic,
    "modern":  _build_modern,
    "minimal": _build_minimal,
}


def generate_pdf(req: ResumeExportRequest) -> bytes:
    pdf = _ResumePDF()
    pdf.add_page()
    _BUILDERS[req.template](pdf, req)
    return bytes(pdf.output())
