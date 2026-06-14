"""
pdf_generator.py — Builds ATS-friendly resume PDFs using fpdf2.

WHY fpdf2 INSTEAD OF WEASYPRINT:
  WeasyPrint produces beautiful PDFs by rendering HTML+CSS, but it requires
  libgobject/libpango (GTK) as system libraries — not available on Windows
  without a separate GTK runtime installer, and unreliable on free-tier
  Linux hosts. fpdf2 is pure Python: no system libraries, no DLL pain,
  works identically everywhere.

HOW fpdf2 WORKS:
  fpdf2 builds PDFs by drawing primitives in a coordinate system:
    - set_font() chooses typeface, style, size
    - cell(w, h, text) prints one line of fixed-width text
    - multi_cell(w, h, text) prints wrapped text (like a paragraph)
    - line(x1, y1, x2, y2) draws a horizontal rule
    - ln(h) moves the cursor down by h mm

  Origin (0,0) is top-left of the printable area. The effective_width()
  helper gives us the usable width after subtracting margins.

FONT CHOICES:
  We use Helvetica (a built-in PDF core font). Built-in fonts are embedded
  in every PDF viewer without external font files — no missing-font issues.
  Helvetica maps to Arial in Windows and San Francisco on macOS.

ATS LAYOUT PRINCIPLES:
  - Linear, single-column — no tables, no text boxes, no floats
  - Heading hierarchy: Name (18pt bold) → Section (10pt bold+rule) → body (10pt)
  - Bullets as "• " prefix on multi_cell lines (not PDF list objects, which
    some ATS parsers skip)
  - No images, no headers/footers beyond page margins
"""

from fpdf import FPDF
from app.schemas.export import ResumeExportRequest

# Built-in PDF fonts (Helvetica) only cover Latin-1 (cp1252).
# Sanitise common Unicode characters before handing text to fpdf2.
_UNICODE_MAP = str.maketrans({
    "–": "-",   # en dash
    "—": "-",   # em dash
    "‘": "'",   # left single quote
    "’": "'",   # right single quote
    "“": '"',   # left double quote
    "”": '"',   # right double quote
    "•": "-",   # bullet
    "·": "-",   # middle dot
    "…": "...", # ellipsis
    " ": " ",   # non-breaking space
})


def _s(text: str) -> str:
    """Sanitise text to Latin-1 so Helvetica can encode it."""
    return text.translate(_UNICODE_MAP).encode("latin-1", errors="replace").decode("latin-1")

# Page dimensions & margins
_PAGE_W    = 210   # A4 mm
_MARGIN    = 18    # left/right margin mm
_TOP       = 15    # top margin mm
_LINE_H    = 5.5   # standard line height mm
_SECT_GAP  = 4     # gap before each new section mm


class _ResumePDF(FPDF):
    def __init__(self):
        super().__init__(unit="mm", format="A4")
        self.set_margins(_MARGIN, _TOP, _MARGIN)
        self.set_auto_page_break(auto=True, margin=15)

    @property
    def w_eff(self) -> float:
        return _PAGE_W - 2 * _MARGIN

    # ── typographic helpers ───────────────────────────────────────────────

    def _h1(self, text: str) -> None:
        self.set_font("Helvetica", "B", 18)
        self.cell(self.w_eff, 9, _s(text), ln=True)

    def _section_rule(self, title: str) -> None:
        self.ln(_SECT_GAP)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(67, 56, 202)
        self.cell(self.w_eff, 5, _s(title.upper()), ln=True)
        y = self.get_y()
        self.set_draw_color(199, 210, 254)
        self.set_line_width(0.4)
        self.line(_MARGIN, y, _PAGE_W - _MARGIN, y)
        self.ln(2)
        self.set_text_color(26, 26, 26)

    def _body(self, text: str, bold: bool = False, size: float = 10) -> None:
        style = "B" if bold else ""
        self.set_font("Helvetica", style, size)
        self.multi_cell(self.w_eff, _LINE_H, _s(text), ln=True)

    def _small(self, text: str, color: tuple = (80, 80, 80)) -> None:
        self.set_text_color(*color)
        self.set_font("Helvetica", "", 9)
        self.multi_cell(self.w_eff, 4.5, _s(text), ln=True)
        self.set_text_color(26, 26, 26)

    def _two_col(self, left: str, right: str, left_bold: bool = False) -> None:
        """Print left text and right-aligned text on the same line."""
        right_w = 38
        left_w = self.w_eff - right_w
        style = "B" if left_bold else ""
        self.set_font("Helvetica", style, 10)
        self.cell(left_w, _LINE_H, _s(left))
        self.set_font("Helvetica", "", 9)
        self.set_text_color(100, 100, 100)
        self.cell(right_w, _LINE_H, _s(right), align="R", ln=True)
        self.set_text_color(26, 26, 26)


def generate_pdf(req: ResumeExportRequest) -> bytes:
    """
    Build a PDF from a ResumeExportRequest and return the raw bytes.

    Raises:
        Any fpdf2 exception propagates up — the route maps it to HTTP 500.
    """
    pdf = _ResumePDF()
    pdf.add_page()

    # ── Header ─────────────────────────────────────────────────────────
    pdf._h1(req.personal.full_name.strip())

    parts = []
    if req.personal.email:    parts.append(req.personal.email)
    if req.personal.phone:    parts.append(req.personal.phone)
    if req.personal.location: parts.append(req.personal.location)
    if req.personal.linkedin: parts.append(req.personal.linkedin)
    if req.personal.website:  parts.append(req.personal.website)

    if parts:
        pdf._small("  |  ".join(parts), color=(80, 80, 80))

    # Rule beneath header
    pdf.ln(1)
    y = pdf.get_y()
    pdf.set_draw_color(67, 56, 202)
    pdf.set_line_width(0.8)
    pdf.line(_MARGIN, y, _PAGE_W - _MARGIN, y)
    pdf.ln(3)

    # ── Professional Summary ────────────────────────────────────────────
    if req.summary.strip():
        pdf._section_rule("Professional Summary")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, req.summary.strip(), ln=True)

    # ── Work Experience ─────────────────────────────────────────────────
    if req.experience:
        pdf._section_rule("Work Experience")
        for job in req.experience:
            pdf.ln(1)
            date_str = f"{job.start_date} - {job.end_date}"
            pdf._two_col(job.title, date_str, left_bold=True)
            pdf._small(job.company)
            for bullet in job.bullets:
                b = bullet.strip().lstrip("-• ")
                if b:
                    pdf.set_font("Helvetica", "", 10)
                    pdf.multi_cell(pdf.w_eff, _LINE_H, _s(f"-  {b}"), ln=True)
            pdf.ln(1)

    # ── Education ───────────────────────────────────────────────────────
    if req.education:
        pdf._section_rule("Education")
        for edu in req.education:
            pdf.ln(1)
            degree = edu.degree
            if edu.field:
                degree += f" — {edu.field}"
            pdf._two_col(degree, edu.year, left_bold=True)
            pdf._small(edu.institution)

    # ── Skills ─────────────────────────────────────────────────────────
    if req.skills.strip():
        pdf._section_rule("Skills")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(pdf.w_eff, _LINE_H, req.skills.strip(), ln=True)

    return bytes(pdf.output())
