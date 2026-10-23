import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_path="SwaraGPT_Lab_Assessment_CO2.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    BG_COLOR = RGBColor(11, 15, 25)       # Deep Obsidian
    CARD_BG = RGBColor(19, 25, 41)        # Slate Card
    BORDER_COLOR = RGBColor(38, 48, 77)   # Subtle Border
    GOLD = RGBColor(245, 158, 11)         # Saffron / Gold
    CYAN = RGBColor(56, 189, 248)         # Cyan / Accent
    GREEN = RGBColor(34, 197, 94)         # Success Green
    WHITE = RGBColor(255, 255, 255)
    MUTED = RGBColor(156, 163, 175)
    LIGHT_BG = RGBColor(28, 36, 56)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # Accent decorative bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.2), Inches(0.15), Inches(5.0))
    bar.fill.solid()
    bar.fill.fore_color.rgb = GOLD
    bar.line.fill.background()

    # Title box
    tbox = slide1.shapes.add_textbox(Inches(1.4), Inches(1.2), Inches(11.0), Inches(5.0))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "LAB ASSESSMENT EVALUATION (CO2)"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = CYAN

    p1 = tf1.add_paragraph()
    p1.text = "SwaraGPT (स्वरGPT)"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "AI-Powered Virtual Guru for Indian Classical Music Education"
    p2.font.size = Pt(22)
    p2.font.color.rgb = GOLD
    p2.space_before = Pt(4)

    p3 = tf1.add_paragraph()
    p3.text = "Real-Time MIR Pitch Estimation (pYIN), 22-Shrutis, Raga Recognition & Classical RAG"
    p3.font.size = Pt(14)
    p3.font.color.rgb = MUTED
    p3.space_before = Pt(8)

    p4 = tf1.add_paragraph()
    p4.text = "\nPresenter: Om Mane  |  Repository: github.com/om-mane-coder/SwaraGPT  |  Status: 100% Completed"
    p4.font.size = Pt(13)
    p4.font.color.rgb = WHITE
    p4.space_before = Pt(24)

    # =========================================================================
    # SLIDE 2: PROJECT OBJECTIVES & IMPLEMENTATION DASHBOARD
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)

    # Header
    hdr = slide2.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    htf = hdr.text_frame
    p_hdr = htf.paragraphs[0]
    p_hdr.text = "Project Objectives & Implementation Dashboard (CO2)"
    p_hdr.font.size = Pt(24)
    p_hdr.font.bold = True
    p_hdr.font.color.rgb = WHITE

    p_sub = htf.add_paragraph()
    p_sub.text = "% of Planned Objectives Completed: 100% [Fully Functional Across Core & Transaction Modules]"
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = GREEN

    # Objectives Table
    rows = 7
    cols = 4
    left = Inches(0.8)
    top = Inches(1.6)
    width = Inches(11.73)
    height = Inches(5.2)

    table_shape = slide2.shapes.add_table(rows, cols, left, top, width, height)
    tbl = table_shape.table
    tbl.columns[0].width = Inches(0.9)
    tbl.columns[1].width = Inches(3.4)
    tbl.columns[2].width = Inches(5.8)
    tbl.columns[3].width = Inches(1.63)

    headers = ["ID", "Project Objective", "Engineering Specification & Implementation", "Progress"]
    for c_idx, h in enumerate(headers):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = LIGHT_BG
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = GOLD
        p.alignment = PP_ALIGN.LEFT

    obj_data = [
        ("OBJ-1", "Acoustic MIR Signal Processing", "80 Hz Butterworth HPF, -1dBFS Normalization, VAD, continuous pYIN fundamental pitch (F0) tracking", "100% DONE"),
        ("OBJ-2", "Microtonal 22-Shruti Math", "Just Intonation relative cent formula C = 1200·log2(f/fSa); Intonation zones: Sur (<=25c), Mild (<=50c), Besur (>50c)", "100% DONE"),
        ("OBJ-3", "Automated Raga Recognition", "Automated Raga Index (ARI), Vadi/Samvadi energy distribution, Pakad n-gram matching, Gamak/Meend derivatives", "100% DONE"),
        ("OBJ-4", "Conversational Virtual Guru (RAG)", "Semantic RAG grounded in primary Sanskrit/Hindi treatises (Natya Shastra, Sangeeta Ratnakara, Bhatkhande)", "100% DONE"),
        ("OBJ-5", "Multi-Factor Weighted Scoring", "Formula: Score = 35%(P) + 25%(S) + 15%(Sh) + 15%(R) + 10%(T) with dynamic pedagogical Riyaz drills", "100% DONE"),
        ("OBJ-6", "Full-Stack System Integration", "Next.js 16 (App Router, Turbopack) + FastAPI backend + SQLite/PostgreSQL persistence + WebSocket streaming", "100% DONE")
    ]

    for r_idx, (oid, title, desc, prog) in enumerate(obj_data, start=1):
        c0 = tbl.cell(r_idx, 0)
        c1 = tbl.cell(r_idx, 1)
        c2 = tbl.cell(r_idx, 2)
        c3 = tbl.cell(r_idx, 3)

        bg_col = CARD_BG if r_idx % 2 == 1 else LIGHT_BG
        for c in (c0, c1, c2, c3):
            c.fill.solid()
            c.fill.fore_color.rgb = bg_col

        p0 = c0.text_frame.paragraphs[0]
        p0.text = oid
        p0.font.bold = True
        p0.font.size = Pt(11)
        p0.font.color.rgb = CYAN

        p1 = c1.text_frame.paragraphs[0]
        p1.text = title
        p1.font.bold = True
        p1.font.size = Pt(11)
        p1.font.color.rgb = WHITE

        p2 = c2.text_frame.paragraphs[0]
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = MUTED

        p3 = c3.text_frame.paragraphs[0]
        p3.text = prog
        p3.font.bold = True
        p3.font.size = Pt(11)
        p3.font.color.rgb = GREEN

    # Speaker notes for slide 2
    slide2.notes_slide.notes_text_frame.text = (
        "Speaker Note: As shown in this objective matrix, SwaraGPT has achieved 100% completion across all "
        "six planned engineering and musicological milestones—ranging from low-level DSP signal processing "
        "up to conversational AI grounded in canonical treatises."
    )

    # =========================================================================
    # SLIDE 3: CORE & TRANSACTION MODULES WITH GITHUB LINKS
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)

    # Header
    hdr3 = slide3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    htf3 = hdr3.text_frame
    p_hdr3 = htf3.paragraphs[0]
    p_hdr3.text = "System Modules & Verified GitHub Source Links (CO2)"
    p_hdr3.font.size = Pt(24)
    p_hdr3.font.bold = True
    p_hdr3.font.color.rgb = WHITE

    p_sub3 = htf3.add_paragraph()
    p_sub3.text = "Repository: https://github.com/om-mane-coder/SwaraGPT  |  Clean separation of Core & Transaction modules"
    p_sub3.font.size = Pt(13)
    p_sub3.font.color.rgb = CYAN

    # Column 1: Core Modules Box
    box_w = Inches(5.65)
    box_h = Inches(5.5)
    
    # Left Card Shape
    c_left = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), box_w, box_h)
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = BORDER_COLOR

    # Left Text Frame
    tf_left = c_left.text_frame
    tf_left.word_wrap = True
    
    p_c_title = tf_left.paragraphs[0]
    p_c_title.text = "🧠 CORE MODULES (Algorithms & MIR)"
    p_c_title.font.size = Pt(15)
    p_c_title.font.bold = True
    p_c_title.font.color.rgb = GOLD
    p_c_title.alignment = PP_ALIGN.LEFT

    core_items = [
        ("1. pYIN Pitch Tracking & DSP Engine",
         "F0 extraction, harmonic peak picking, Butterworth HPF",
         "backend/app/ai/pitch_detector.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/pitch_detector.py"),
        ("2. 22-Shrutis Just Intonation Calculator",
         "Natya Shastra ratios, relative cent calculation",
         "backend/app/ai/shrutis.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/shrutis.py"),
        ("3. Automated Raga Recognizer & Pakad",
         "Automated Raga Index, vadi/samvadi energy contour",
         "backend/app/ai/raga_recognizer.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/raga_recognizer.py"),
        ("4. Conversational Virtual Guru (RAG)",
         "Citations: Natya Shastra, Sangeeta Ratnakara, Bhatkhande",
         "backend/app/rag/knowledge_base.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/rag/knowledge_base.py")
    ]

    for title, desc, rel_path, url in core_items:
        pt = tf_left.add_paragraph()
        pt.text = "• " + title
        pt.font.bold = True
        pt.font.size = Pt(11)
        pt.font.color.rgb = WHITE
        pt.space_before = Pt(8)

        pd = tf_left.add_paragraph()
        pd.text = "   " + desc
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = MUTED

        pl = tf_left.add_paragraph()
        pl.text = "   🔗 GitHub: " + rel_path
        pl.font.size = Pt(9.5)
        pl.font.bold = True
        pl.font.color.rgb = CYAN
        run = pl.runs[0]
        run.hyperlink.address = url

    # Column 2: Transaction Modules Box
    c_right = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), box_w, box_h)
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = CARD_BG
    c_right.line.color.rgb = BORDER_COLOR

    tf_right = c_right.text_frame
    tf_right.word_wrap = True

    p_t_title = tf_right.paragraphs[0]
    p_t_title.text = "🔄 TRANSACTION MODULES (User Flow)"
    p_t_title.font.size = Pt(15)
    p_t_title.font.bold = True
    p_t_title.font.color.rgb = GOLD
    p_t_title.alignment = PP_ALIGN.LEFT

    txn_items = [
        ("Transaction 1: Auth & User Profile",
         "Student/Guru roles, JWT bearer auth, user Sa preference",
         "backend/app/routers/auth.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/auth.py"),
        ("Transaction 2: Audio Ingestion & Capture",
         "Web Audio API mic recording, WebM/WAV transcoding",
         "backend/app/routers/audio.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/audio.py"),
        ("Transaction 3: Performance Analysis & Scoring",
         "Weighted formula calculation, visual pitch graphing",
         "backend/app/routers/analysis.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/analysis.py"),
        ("Transaction 4: Riyaz Regimen & Progress",
         "Dynamic drill generation, longitudinal session analytics",
         "backend/app/routers/practice.py",
         "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/practice.py")
    ]

    for title, desc, rel_path, url in txn_items:
        pt = tf_right.add_paragraph()
        pt.text = "• " + title
        pt.font.bold = True
        pt.font.size = Pt(11)
        pt.font.color.rgb = WHITE
        pt.space_before = Pt(8)

        pd = tf_right.add_paragraph()
        pd.text = "   " + desc
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = MUTED

        pl = tf_right.add_paragraph()
        pl.text = "   🔗 GitHub: " + rel_path
        pl.font.size = Pt(9.5)
        pl.font.bold = True
        pl.font.color.rgb = CYAN
        run = pl.runs[0]
        run.hyperlink.address = url

    slide3.notes_slide.notes_text_frame.text = (
        "Speaker Note: Our codebase cleanly separates algorithmic Core Modules (MIR, 22-Shrutis, and RAG) "
        "from Transaction Modules (Auth, Audio Ingestion, Scoring, and Progress Tracking). All modules are "
        "hosted and tracked in our GitHub repository with verified modular contracts."
    )

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    out = "SwaraGPT_Lab_Assessment_CO2.pptx"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    build_presentation(out)
