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

    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.2), Inches(0.15), Inches(5.0))
    bar.fill.solid()
    bar.fill.fore_color.rgb = GOLD
    bar.line.fill.background()

    tbox = slide1.shapes.add_textbox(Inches(1.4), Inches(1.2), Inches(11.0), Inches(5.0))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "LAB ASSESSMENT EVALUATION (CO2, CO3, CO4, CO5)"
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
    p3.text = "Dual Engine: MIR Signal Processing (pYIN/22-Shrutis) + Grounded Classical RAG"
    p3.font.size = Pt(14)
    p3.font.color.rgb = MUTED
    p3.space_before = Pt(8)

    p4 = tf1.add_paragraph()
    p4.text = "\nPresenter: Om Mane  |  Repository: github.com/om-mane-coder/SwaraGPT  |  Status: 100% Completed"
    p4.font.size = Pt(13)
    p4.font.color.rgb = WHITE
    p4.space_before = Pt(24)

    # =========================================================================
    # SLIDE 2: CO2 - OBJECTIVES & PROGRESS
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)

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

    rows = 7
    cols = 4
    table_shape = slide2.shapes.add_table(rows, cols, Inches(0.8), Inches(1.6), Inches(11.73), Inches(5.2))
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

    obj_data = [
        ("OBJ-1", "Acoustic MIR Signal Processing", "80 Hz Butterworth HPF, -1dBFS Normalization, VAD, continuous pYIN fundamental pitch (F0) tracking", "100% DONE"),
        ("OBJ-2", "Microtonal 22-Shruti Math", "Just Intonation relative cent formula C = 1200·log2(f/fSa); Intonation zones: Sur (<=25c), Mild (<=50c), Besur (>50c)", "100% DONE"),
        ("OBJ-3", "Automated Raga Recognition", "Automated Raga Index (ARI), Vadi/Samvadi energy distribution, Pakad n-gram matching, Gamak/Meend derivatives", "100% DONE"),
        ("OBJ-4", "Conversational Virtual Guru (RAG)", "Semantic RAG grounded in primary Sanskrit/Hindi treatises (Natya Shastra, Sangeeta Ratnakara, Bhatkhande)", "100% DONE"),
        ("OBJ-5", "Multi-Factor Weighted Scoring", "Formula: Score = 35%(P) + 25%(S) + 15%(Sh) + 15%(R) + 10%(T) with dynamic pedagogical Riyaz drills", "100% DONE"),
        ("OBJ-6", "Full-Stack System Integration", "Next.js 16 (App Router, Turbopack) + FastAPI backend + SQLite/PostgreSQL persistence + WebSocket streaming", "100% DONE")
    ]

    for r_idx, (oid, title, desc, prog) in enumerate(obj_data, start=1):
        bg_col = CARD_BG if r_idx % 2 == 1 else LIGHT_BG
        for c_idx, val in enumerate((oid, title, desc, prog)):
            c = tbl.cell(r_idx, c_idx)
            c.fill.solid()
            c.fill.fore_color.rgb = bg_col
            p = c.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(10 if c_idx == 2 else 11)
            p.font.bold = (c_idx != 2)
            if c_idx == 0: p.font.color.rgb = CYAN
            elif c_idx == 1: p.font.color.rgb = WHITE
            elif c_idx == 2: p.font.color.rgb = MUTED
            elif c_idx == 3: p.font.color.rgb = GREEN

    # =========================================================================
    # SLIDE 3: CO2 & CO3 - MODULES & GITHUB LINKS
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)

    hdr3 = slide3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    htf3 = hdr3.text_frame
    p_hdr3 = htf3.paragraphs[0]
    p_hdr3.text = "System Modules & Verified GitHub Source Links (CO2 & CO3)"
    p_hdr3.font.size = Pt(24)
    p_hdr3.font.bold = True
    p_hdr3.font.color.rgb = WHITE

    p_sub3 = htf3.add_paragraph()
    p_sub3.text = "Repository: https://github.com/om-mane-coder/SwaraGPT  |  Clean separation of Core & Transaction modules"
    p_sub3.font.size = Pt(13)
    p_sub3.font.color.rgb = CYAN

    box_w = Inches(5.65)
    box_h = Inches(5.5)

    # Core Modules
    c_left = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), box_w, box_h)
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = BORDER_COLOR

    tf_left = c_left.text_frame
    tf_left.word_wrap = True
    p_c_title = tf_left.paragraphs[0]
    p_c_title.text = "🧠 CORE MODULES (Algorithms & MIR)"
    p_c_title.font.size = Pt(15)
    p_c_title.font.bold = True
    p_c_title.font.color.rgb = GOLD

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
        pl.runs[0].hyperlink.address = url

    # Transaction Modules
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
        pl.runs[0].hyperlink.address = url

    # =========================================================================
    # SLIDE 4: CO4 - QUALITY ASSURANCE (QA) & DEFECT TRACKING
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)

    hdr4 = slide4.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    htf4 = hdr4.text_frame
    p_hdr4 = htf4.paragraphs[0]
    p_hdr4.text = "Quality Assurance (QA) & Defect Tracking Log (CO4)"
    p_hdr4.font.size = Pt(24)
    p_hdr4.font.bold = True
    p_hdr4.font.color.rgb = WHITE

    p_sub4 = htf4.add_paragraph()
    p_sub4.text = "Pytest Suite: 13/13 PASSED (100% Success)  |  Full Report: QA_TEST_REPORT.md on GitHub"
    p_sub4.font.size = Pt(13)
    p_sub4.font.color.rgb = GREEN

    # Left: Test Matrix Summary Card
    card_test = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.65), Inches(5.5))
    card_test.fill.solid()
    card_test.fill.fore_color.rgb = CARD_BG
    card_test.line.color.rgb = BORDER_COLOR
    tf_test = card_test.text_frame
    tf_test.word_wrap = True

    p_tt = tf_test.paragraphs[0]
    p_tt.text = "🧪 TEST EXECUTION BREAKDOWN (13/13)"
    p_tt.font.size = Pt(15)
    p_tt.font.bold = True
    p_tt.font.color.rgb = GOLD

    test_bullets = [
        ("Unit Testing (7 Tests — 100% Pass)",
         "• test_22_shrutis_catalog: Exact 22 Natya Shastra ratios\n"
         "• test_cent_calculation: Relative cents & Sur/Besur zones\n"
         "• test_synthetic_sine_audio: 22.05 kHz acoustic tone synthesis\n"
         "• test_tonic_estimation: Peak histogram Sa detection\n"
         "• test_raga_recognition_pakad: Yaman ARI classification\n"
         "• test_feedback_weighted_scoring: 5-factor formula check\n"
         "• test_rag_musicology_retriever: Canonical text citation"),
        ("Integration Testing (5 Tests — 100% Pass)",
         "• /api/health: Service observability check\n"
         "• /api/audio/shrutis: 22-shruti JSON dictionary\n"
         "• /api/ragas: Master Raga knowledge catalog\n"
         "• /api/practice/drills: Dynamic Alankar regimens\n"
         "• /api/chat: Grounded Virtual Guru conversation"),
        ("System End-to-End Testing (1 Test — 100% Pass)",
         "• Full Pipeline: Mic Audio ➔ 80Hz HPF ➔ pYIN ➔ Swara & 22-Shruti Mapping ➔ Score ➔ Guru Feedback")
    ]

    for cat_title, bullets in test_bullets:
        pt = tf_test.add_paragraph()
        pt.text = cat_title
        pt.font.bold = True
        pt.font.size = Pt(11)
        pt.font.color.rgb = CYAN
        pt.space_before = Pt(6)

        pb = tf_test.add_paragraph()
        pb.text = bullets
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = MUTED

    # Right: Defect Tracking Card
    card_def = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), Inches(5.65), Inches(5.5))
    card_def.fill.solid()
    card_def.fill.fore_color.rgb = CARD_BG
    card_def.line.color.rgb = BORDER_COLOR
    tf_def = card_def.text_frame
    tf_def.word_wrap = True

    p_dt = tf_def.paragraphs[0]
    p_dt.text = "🐞 DEFECT TRACKING & RESOLUTION LOG"
    p_dt.font.size = Pt(15)
    p_dt.font.bold = True
    p_dt.font.color.rgb = GOLD

    defects = [
        ("DEF-01: Browser WebM Audio Decoding", "High", "MediaRecorder WebM blobs caused format decode errors.", "Integrated Web Audio API decodeAudioData with PCM float conversion."),
        ("DEF-02: Low-Frequency Microphone Rumble", "Medium", "Sub-80Hz ambient room noise degraded pitch tracking.", "Applied 2nd-order Butterworth 80 Hz HPF in scipy before pYIN."),
        ("DEF-03: LLM Rate-Limit & Latency", "Medium", "External LLM latency caused chat endpoint timeouts.", "Built resilient Offline Classical Pedagogical Guru fallback."),
        ("DEF-04: Cross-Origin Resource Sharing", "Low", "CORS policy blocked local frontend port 3000 calls.", "Configured regex origin allowlist for localhost/127.0.0.1.")
    ]

    for did, sev, desc, fix in defects:
        pt = tf_def.add_paragraph()
        pt.text = f"{did} [{sev} Severity]"
        pt.font.bold = True
        pt.font.size = Pt(11)
        pt.font.color.rgb = WHITE
        pt.space_before = Pt(8)

        pd = tf_def.add_paragraph()
        pd.text = f"• Defect: {desc}\n• Resolution: {fix}"
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = MUTED

    plink = tf_def.add_paragraph()
    plink.text = "\n🔗 View Full Report on GitHub: QA_TEST_REPORT.md"
    plink.font.bold = True
    plink.font.size = Pt(10)
    plink.font.color.rgb = CYAN
    plink.runs[0].hyperlink.address = "https://github.com/om-mane-coder/SwaraGPT/blob/main/QA_TEST_REPORT.md"

    slide4.notes_slide.notes_text_frame.text = (
        "Speaker Note: Quality Assurance was executed using Pytest with 100% test pass rate across 13 test cases. "
        "We also systematically tracked defects from audio container transcoding to room noise filtering."
    )

    # =========================================================================
    # SLIDE 5: CO5 - WORKING PROTOTYPE & LIVE DEMO WORKFLOW
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)

    hdr5 = slide5.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    htf5 = hdr5.text_frame
    p_hdr5 = htf5.paragraphs[0]
    p_hdr5.text = "Working Prototype & End-to-End Workflow (CO5)"
    p_hdr5.font.size = Pt(24)
    p_hdr5.font.bold = True
    p_hdr5.font.color.rgb = WHITE

    p_sub5 = htf5.add_paragraph()
    p_sub5.text = "Live Services Active: Frontend (localhost:3000)  |  FastAPI Backend (localhost:8000)"
    p_sub5.font.size = Pt(13)
    p_sub5.font.color.rgb = CYAN

    # 5 Step Workflow Cards across the screen
    step_w = Inches(2.18)
    step_h = Inches(5.4)
    step_gap = Inches(0.2)
    start_left = Inches(0.8)

    workflow_steps = [
        ("STEP 1", "Session Setup & Sa Calibration",
         "• Student Login (student@swaragpt.ai)\n"
         "• Select fundamental tonic Sa (e.g. C# / 138.59 Hz)\n"
         "• Choose target Raga (Yaman / Bhairav / Bilawal)",
         CYAN),
        ("STEP 2", "Audio Capture & Ingestion",
         "• Web Audio API real-time microphone stream\n"
         "• Synthetic Tanpura Drone Oscillator for acoustic reference\n"
         "• WebM / WAV audio transcoding",
         GOLD),
        ("STEP 3", "DSP & Pitch Extraction",
         "• 80 Hz Butterworth High-Pass Filtering\n"
         "• Voice Activity Detection (VAD)\n"
         "• pYIN fundamental pitch (F0) tracking & Swara grid plot",
         CYAN),
        ("STEP 4", "Intonation Scoring Engine",
         "• Transparent formula: 35%P + 25%S + 15%Sh + 15%R + 10%T\n"
         "• Sur (<=25c), Mild (<=50c), Besur (>50c) zones\n"
         "• Stability & Vadi emphasis",
         GREEN),
        ("STEP 5", "Virtual Guru & Riyaz Drills",
         "• Grounded pedagogical critique citing Natya Shastra\n"
         "• Automated detection of weak swaras\n"
         "• Dynamic tailored alankar practice regimens",
         GOLD)
    ]

    for idx, (step_num, title, bullets, accent_col) in enumerate(workflow_steps):
        s_left = start_left + idx * (step_w + step_gap)
        scard = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, s_left, Inches(1.5), step_w, step_h)
        scard.fill.solid()
        scard.fill.fore_color.rgb = CARD_BG
        scard.line.color.rgb = BORDER_COLOR

        stf = scard.text_frame
        stf.word_wrap = True

        p_snum = stf.paragraphs[0]
        p_snum.text = step_num
        p_snum.font.bold = True
        p_snum.font.size = Pt(12)
        p_snum.font.color.rgb = accent_col

        p_stitle = stf.add_paragraph()
        p_stitle.text = title
        p_stitle.font.bold = True
        p_stitle.font.size = Pt(12)
        p_stitle.font.color.rgb = WHITE
        p_stitle.space_before = Pt(4)

        p_sbullets = stf.add_paragraph()
        p_sbullets.text = bullets
        p_sbullets.font.size = Pt(9.5)
        p_sbullets.font.color.rgb = MUTED
        p_sbullets.space_before = Pt(10)

    slide5.notes_slide.notes_text_frame.text = (
        "Speaker Note: Our working prototype is live on localhost. The end-to-end workflow transitions seamlessly "
        "from student login and tonic calibration to real-time pYIN pitch curve visualization and Virtual Guru feedback."
    )

    prs.save(output_path)
    print(f"Enhanced 5-slide presentation saved to: {output_path}")

if __name__ == "__main__":
    out = "SwaraGPT_Lab_Assessment_CO2.pptx"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    build_presentation(out)
