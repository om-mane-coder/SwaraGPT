import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_high_font_presentation(output_path="SwaraGPT_Lab_Assessment_Final.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # White Theme High-Contrast Colors
    COLOR_BG = RGBColor(255, 255, 255)         # Pure White
    COLOR_CARD = RGBColor(248, 250, 252)       # Off-White Card (Slate 50)
    COLOR_BORDER = RGBColor(203, 213, 225)     # Slate 300 Border
    COLOR_TITLE = RGBColor(15, 23, 42)         # Slate 900
    COLOR_BODY = RGBColor(30, 41, 59)          # Slate 800
    COLOR_MUTED = RGBColor(71, 85, 105)        # Slate 600
    COLOR_BLUE = RGBColor(29, 78, 216)         # Darker Blue 700 (High contrast)
    COLOR_SAFFRON = RGBColor(180, 83, 9)       # Amber 700
    COLOR_GREEN = RGBColor(5, 150, 105)        # Emerald 600
    COLOR_TH_BG = RGBColor(241, 245, 249)      # Table Header Fill
    COLOR_TAG_BG = RGBColor(239, 246, 255)     # Blue Tint Fill

    def set_white_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD, border_color=COLOR_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (HIGH FONT)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_white_bg(slide1)

    stripe = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.3), Inches(0.18), Inches(4.8))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = COLOR_BLUE
    stripe.line.fill.background()

    tb1 = slide1.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(11.3), Inches(5.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "LAB ASSESSMENT EVALUATION  •  CO2, CO3, CO4, CO5"
    p0.font.size = Pt(16)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_BLUE

    p1 = tf1.add_paragraph()
    p1.text = "SwaraGPT (स्वरGPT)"
    p1.font.size = Pt(50)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TITLE
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "AI Virtual Guru for Indian Classical Music Riyaz"
    p2.font.size = Pt(26)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_SAFFRON
    p2.space_before = Pt(6)

    p3 = tf1.add_paragraph()
    p3.text = "Dual Engine: MIR Signal Processing (pYIN/22-Shrutis) + Grounded Classical RAG"
    p3.font.size = Pt(18)
    p3.font.color.rgb = COLOR_MUTED
    p3.space_before = Pt(12)

    p4 = tf1.add_paragraph()
    p4.text = "Presenter: Om Mane  |  GitHub: github.com/om-mane-coder/SwaraGPT  |  Status: 100% Completed"
    p4.font.size = Pt(16)
    p4.font.bold = True
    p4.font.color.rgb = COLOR_TITLE
    p4.space_before = Pt(32)

    # =========================================================================
    # SLIDE 2: OBJECTIVES (HIGH FONT, SINGLE-LINE BULLETS)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_white_bg(slide2)

    tb2 = slide2.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    tf2 = tb2.text_frame
    p_h2 = tf2.paragraphs[0]
    p_h2.text = "Project Objectives (CO2)"
    p_h2.font.size = Pt(30)
    p_h2.font.bold = True
    p_h2.font.color.rgb = COLOR_TITLE

    p_s2 = tf2.add_paragraph()
    p_s2.text = "% of Planned Objectives Completed: 100% Fully Implemented"
    p_s2.font.size = Pt(16)
    p_s2.font.bold = True
    p_s2.font.color.rgb = COLOR_GREEN

    # Single-line punchy objectives container
    card_obj = add_card(slide2, Inches(0.8), Inches(1.5), Inches(11.73), Inches(5.4))
    tf_o = card_obj.text_frame
    tf_o.word_wrap = True

    single_line_objectives = [
        ("1. Real-Time Pitch Tracking:", " Extract fundamental frequency (F0) using 80 Hz Butterworth HPF and pYIN algorithm."),
        ("2. 22-Shruti Intonation Analysis:", " Map microtonal cents (C = 1200·log2(f/fSa)) into Sur (<=25c), Mild (<=50c), and Besur (>50c)."),
        ("3. Automated Raga Recognition:", " Evaluate scale adherence, Vadi/Samvadi energy distribution, and Pakad melodic phrases."),
        ("4. Classical Virtual Guru (RAG):", " Provide grounded pedagogical critique citing Natya Shastra, Sangeeta Ratnakara, and Bhatkhande."),
        ("5. Multi-Factor Performance Scoring:", " Calculate transparent score: 35% Pitch + 25% Swara + 15% Shruti + 15% Raga + 10% Tonic."),
        ("6. Full-Stack Web Platform:", " Deliver responsive Next.js 16 frontend + FastAPI backend with synthetic Tanpura drone.")
    ]

    for idx, (head, body) in enumerate(single_line_objectives):
        p = tf_o.paragraphs[0] if idx == 0 else tf_o.add_paragraph()
        p.space_before = Pt(14 if idx > 0 else 4)

        r_icon = p.add_run()
        r_icon.text = "✔  "
        r_icon.font.bold = True
        r_icon.font.size = Pt(17)
        r_icon.font.color.rgb = COLOR_GREEN

        r_head = p.add_run()
        r_head.text = head
        r_head.font.bold = True
        r_head.font.size = Pt(17)
        r_head.font.color.rgb = COLOR_TITLE

        r_body = p.add_run()
        r_body.text = body
        r_body.font.size = Pt(16)
        r_body.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SLIDE 3: MODULAR ARCHITECTURE (HIGH FONT & GITHUB LINKS)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_white_bg(slide3)

    tb3 = slide3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    tf3 = tb3.text_frame
    p_h3 = tf3.paragraphs[0]
    p_h3.text = "System Modules & Verified GitHub Source Links (CO2 & CO3)"
    p_h3.font.size = Pt(30)
    p_h3.font.bold = True
    p_h3.font.color.rgb = COLOR_TITLE

    p_s3 = tf3.add_paragraph()
    p_s3.text = "Repository: https://github.com/om-mane-coder/SwaraGPT  •  Clean Separation of Concerns"
    p_s3.font.size = Pt(15)
    p_s3.font.bold = True
    p_s3.font.color.rgb = COLOR_BLUE

    box_w = Inches(5.7)
    box_h = Inches(5.5)

    # Core Modules Card (Left)
    c_left = add_card(slide3, Inches(0.8), Inches(1.5), box_w, box_h)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True

    p_lt = tf_l.paragraphs[0]
    p_lt.text = "CORE ALGORITHMIC MODULES"
    p_lt.font.bold = True
    p_lt.font.size = Pt(17)
    p_lt.font.color.rgb = COLOR_BLUE

    core_items = [
        ("pYIN Pitch Tracking & DSP Engine", "backend/app/ai/pitch_detector.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/pitch_detector.py"),
        ("22-Shrutis Just Intonation Math", "backend/app/ai/shrutis.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/shrutis.py"),
        ("Automated Raga Recognizer & Pakad", "backend/app/ai/raga_recognizer.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/ai/raga_recognizer.py"),
        ("Conversational Virtual Guru (RAG)", "backend/app/rag/knowledge_base.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/rag/knowledge_base.py")
    ]

    for title, path, url in core_items:
        p1 = tf_l.add_paragraph()
        p1.text = "• " + title
        p1.font.bold = True
        p1.font.size = Pt(15)
        p1.font.color.rgb = COLOR_TITLE
        p1.space_before = Pt(12)

        p2 = tf_l.add_paragraph()
        p2.text = "   🔗 GitHub: " + path
        p2.font.bold = True
        p2.font.size = Pt(13)
        p2.font.color.rgb = COLOR_BLUE
        p2.runs[0].hyperlink.address = url

    # Transaction Modules Card (Right)
    c_right = add_card(slide3, Inches(6.8), Inches(1.5), box_w, box_h)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True

    p_rt = tf_r.paragraphs[0]
    p_rt.text = "TRANSACTION MODULES (User Flow)"
    p_rt.font.bold = True
    p_rt.font.size = Pt(17)
    p_rt.font.color.rgb = COLOR_SAFFRON

    txn_items = [
        ("Auth & Tonic Sa Calibration", "backend/app/routers/auth.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/auth.py"),
        ("Audio Ingestion & Tanpura Drone", "backend/app/routers/audio.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/audio.py"),
        ("Performance Analysis & Scoring", "backend/app/routers/analysis.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/analysis.py"),
        ("Riyaz Drills & Longitudinal Progress", "backend/app/routers/practice.py", "https://github.com/om-mane-coder/SwaraGPT/blob/main/backend/app/routers/practice.py")
    ]

    for title, path, url in txn_items:
        p1 = tf_r.add_paragraph()
        p1.text = "• " + title
        p1.font.bold = True
        p1.font.size = Pt(15)
        p1.font.color.rgb = COLOR_TITLE
        p1.space_before = Pt(12)

        p2 = tf_r.add_paragraph()
        p2.text = "   🔗 GitHub: " + path
        p2.font.bold = True
        p2.font.size = Pt(13)
        p2.font.color.rgb = COLOR_BLUE
        p2.runs[0].hyperlink.address = url

    # =========================================================================
    # SLIDE 4: CO4 - QA ANALYSIS TABULATED FORM (HIGH FONT + LOCAL AUDIO)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_white_bg(slide4)

    tb4 = slide4.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.85))
    tf4 = tb4.text_frame
    p_h4 = tf4.paragraphs[0]
    p_h4.text = "Quality Assurance (QA) Execution Matrix (CO4)"
    p_h4.font.size = Pt(28)
    p_h4.font.bold = True
    p_h4.font.color.rgb = COLOR_TITLE

    p_s4 = tf4.add_paragraph()
    p_s4.text = "Automated Test Suite: 19 / 19 PASSED (100% Pass)  •  Tested on Local Audio Benchmark Clips"
    p_s4.font.size = Pt(15)
    p_s4.font.bold = True
    p_s4.font.color.rgb = COLOR_GREEN

    # Local audio files banner
    banner = add_card(slide4, Inches(0.8), Inches(1.35), Inches(11.73), Inches(0.65), bg_color=COLOR_TAG_BG, border_color=COLOR_BLUE)
    btf = banner.text_frame
    bp = btf.paragraphs[0]
    bp.text = "📁 Local Audio Benchmark Source: C:\\Users\\OM\\Desktop\\SwaraGPT_Demo_Audios (10 Master-Learner Pairs / 20 WAVs)"
    bp.font.size = Pt(13)
    bp.font.bold = True
    bp.font.color.rgb = COLOR_BLUE

    # QA Table
    table_shape = slide4.shapes.add_table(5, 5, Inches(0.8), Inches(2.1), Inches(11.73), Inches(4.3))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(3.0)
    tbl.columns[2].width = Inches(2.3)
    tbl.columns[3].width = Inches(2.1)
    tbl.columns[4].width = Inches(2.13)

    qa_headers = ["Test Type", "Subtest / Scenario", "Module Tested", "Software Used", "Empirical Result"]
    for c_idx, h in enumerate(qa_headers):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_TH_BG
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = COLOR_TITLE

    qa_rows = [
        ("Benchmark Audio QA", "Audio Signal Integrity & Normalization\n(Lata Mangeshkar Lag Ja Gale)", "backend/app/ai/pitch_detector.py", "Pytest 9.1 + SoundFile 0.13", "sr=22050 Hz, 15.00s, peak=-1dBFS\n(PASSED ✔)"),
        ("Benchmark Audio QA", "Master vs. Learner Discrimination\n(Lata Mangeshkar vs Student Singer)", "backend/app/ai/shrutis.py", "Pytest 9.1 + Librosa 0.10", "Master Sur=98.5% (Dev: 3.8c)\nLearner Sur=72.4% (Dev: 14.2c) ✔"),
        ("Unit Testing (7 Tests)", "22-Shrutis ratios, relative cents math,\nand Sa tonic histogram peak detection", "backend/app/ai/shrutis.py &\ntonic_detector.py", "Pytest + NumPy 2.0 +\nSciPy 1.15", "Exact Natya Shastra ratios,\nSa=305.25 Hz (98% conf) ✔"),
        ("Integration Testing", "REST API Endpoints (/health, /shrutis,\n/ragas, /practice, /chat) & E2E Pipeline", "backend/app/routers/* &\nFull DSP Pipeline", "FastAPI TestClient +\nHTTPX", "All 5 APIs return HTTP 200 OK\n19/19 PASSED in 35.45s ✔")
    ]

    for r_idx, (t_type, scenario, mod, soft, res) in enumerate(qa_rows, start=1):
        for c_idx, val in enumerate((t_type, scenario, mod, soft, res)):
            c = tbl.cell(r_idx, c_idx)
            c.fill.solid()
            c.fill.fore_color.rgb = COLOR_CARD if r_idx % 2 == 1 else COLOR_BG
            p = c.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(13)
            p.font.bold = (c_idx == 0 or c_idx == 4)
            if c_idx == 4:
                p.font.color.rgb = COLOR_GREEN
            elif c_idx == 0:
                p.font.color.rgb = COLOR_TITLE
            else:
                p.font.color.rgb = COLOR_BODY

    # Clickable links footer
    tb_foot = slide4.shapes.add_textbox(Inches(0.8), Inches(6.5), Inches(11.73), Inches(0.6))
    tf_f = tb_foot.text_frame
    p_foot = tf_f.paragraphs[0]
    p_foot.text = "🔗 Verified HTML Report: QA_AUTOMATED_REPORT.html   |   GitHub: QA_TEST_REPORT.md   |   Live Pytest Command: python -m pytest app/tests -v"
    p_foot.font.size = Pt(13)
    p_foot.font.bold = True
    p_foot.font.color.rgb = COLOR_BLUE
    p_foot.runs[0].hyperlink.address = "https://github.com/om-mane-coder/SwaraGPT/blob/main/QA_TEST_REPORT.md"

    # =========================================================================
    # SLIDE 5: CO5 - WORKING PROTOTYPE (HIGH FONT)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_white_bg(slide5)

    tb5 = slide5.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9))
    tf5 = tb5.text_frame
    p_h5 = tf5.paragraphs[0]
    p_h5.text = "Working Prototype & End-to-End Workflow (CO5)"
    p_h5.font.size = Pt(30)
    p_h5.font.bold = True
    p_h5.font.color.rgb = COLOR_TITLE

    p_s5 = tf5.add_paragraph()
    p_s5.text = "Active Local Services: Frontend (localhost:3000)  •  FastAPI Backend (localhost:8000)"
    p_s5.font.size = Pt(15)
    p_s5.font.bold = True
    p_s5.font.color.rgb = COLOR_BLUE

    w5 = Inches(2.2)
    h5 = Inches(5.4)
    gap5 = Inches(0.18)
    x5_start = Inches(0.8)

    steps_data = [
        ("STEP 1", "Session Setup & Sa Calibration",
         "• Student login\n• Select preferred Sa tonic (e.g. C# / 138.59 Hz)\n• Choose target Raga (Yaman / Bhairav / Bilawal)",
         COLOR_BLUE),
        ("STEP 2", "Audio Ingestion & Tanpura",
         "• Web Audio API real-time microphone stream\n• Synthetic Tanpura drone oscillator active\n• WAV / WebM ingestion",
         COLOR_SAFFRON),
        ("STEP 3", "DSP & Pitch Extraction",
         "• 80 Hz Butterworth High-Pass Filter\n• Voice Activity Detection (VAD)\n• pYIN pitch (F0) tracking & canvas plot",
         COLOR_BLUE),
        ("STEP 4", "Intonation Scoring Engine",
         "• Formula: 35%P + 25%S + 15%Sh + 15%R + 10%T\n• Sur (<=25c), Mild (<=50c), Besur (>50c) zones\n• Real-time cent deviation",
         COLOR_GREEN),
        ("STEP 5", "Virtual Guru & Riyaz Drills",
         "• Grounded critique citing Natya Shastra\n• Automatic weak swara identification\n• Dynamic personalized Alankar practice regimens",
         COLOR_SAFFRON)
    ]

    for idx, (s_num, s_title, s_bullets, s_color) in enumerate(steps_data):
        sx = x5_start + idx * (w5 + gap5)
        sc = add_card(slide5, sx, Inches(1.5), w5, h5)

        # Top colored accent stripe
        b = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, sx, Inches(1.5), w5, Inches(0.10))
        b.fill.solid()
        b.fill.fore_color.rgb = s_color
        b.line.fill.background()

        stf = sc.text_frame
        stf.word_wrap = True

        p1 = stf.paragraphs[0]
        p1.text = s_num
        p1.font.bold = True
        p1.font.size = Pt(15)
        p1.font.color.rgb = s_color
        p1.space_before = Pt(6)

        p2 = stf.add_paragraph()
        p2.text = s_title
        p2.font.bold = True
        p2.font.size = Pt(14)
        p2.font.color.rgb = COLOR_TITLE
        p2.space_before = Pt(4)

        p3 = stf.add_paragraph()
        p3.text = s_bullets
        p3.font.size = Pt(12)
        p3.font.color.rgb = COLOR_BODY
        p3.space_before = Pt(12)

    prs.save(output_path)
    print(f"High-font white presentation successfully generated at: {output_path}")

if __name__ == "__main__":
    out = "SwaraGPT_Lab_Assessment_Final.pptx"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    build_high_font_presentation(out)
