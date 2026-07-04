import os
import math
from PIL import Image, ImageDraw, ImageFont

# Set up paths
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"
OUTPUT_DIR = "/Users/mac/soilsec"

# Colors
COLOR_BG = (255, 255, 255)            # Page background
COLOR_SHADOW = (226, 232, 240)        # Box shadow (slate-200)
COLOR_TEXT_MAIN = (15, 23, 42)        # Main text (slate-900)
COLOR_TEXT_MUTED = (71, 85, 105)      # Muted text (slate-600)
COLOR_BORDER_BLUE = (37, 99, 235)     # Blue border (blue-600)
COLOR_FILL_BLUE = (239, 246, 255)     # Blue fill (blue-50)
COLOR_BORDER_GREEN = (22, 163, 74)    # Green border (green-600)
COLOR_FILL_GREEN = (240, 253, 244)    # Green fill (green-50)
COLOR_BORDER_ORANGE = (234, 88, 12)   # Orange border (orange-600)
COLOR_FILL_ORANGE = (255, 247, 237)   # Orange fill (orange-50)
COLOR_BORDER_PURPLE = (147, 51, 234)  # Purple border (purple-600)
COLOR_FILL_PURPLE = (250, 245, 255)   # Purple fill (purple-50)
COLOR_BORDER_RED = (225, 29, 72)      # Red border (rose-600)
COLOR_FILL_RED = (255, 241, 242)      # Red fill (rose-50)
COLOR_BORDER_TEAL = (15, 118, 110)    # Teal border (teal-700)
COLOR_FILL_TEAL = (240, 253, 250)     # Teal fill (teal-50)
COLOR_BORDER_GRAY = (100, 116, 139)   # Gray border (slate-500)
COLOR_FILL_GRAY = (248, 250, 252)     # Gray fill (slate-50)

# Load fonts
try:
    font_title = ImageFont.truetype(FONT_PATH, 18)
    font_bold = ImageFont.truetype(FONT_PATH, 14)
    font_regular = ImageFont.truetype(FONT_PATH, 12)
    font_small = ImageFont.truetype(FONT_PATH, 10)
except IOError:
    font_title = ImageFont.load_default()
    font_bold = ImageFont.load_default()
    font_regular = ImageFont.load_default()
    font_small = ImageFont.load_default()

def draw_shadowed_rect(draw, x1, y1, x2, y2, radius=8, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE, width=2, shadow_offset=4):
    """Draws a rounded rectangle with a clean flat shadow underneath."""
    draw.rounded_rectangle(
        (x1 + shadow_offset, y1 + shadow_offset, x2 + shadow_offset, y2 + shadow_offset),
        radius=radius,
        fill=COLOR_SHADOW
    )
    draw.rounded_rectangle(
        (x1, y1, x2, y2),
        radius=radius,
        fill=fill,
        outline=outline,
        width=width
    )

def draw_arrow(draw, x1, y1, x2, y2, fill=COLOR_BORDER_GRAY, width=2, head_length=12):
    """Draws a clean directional arrow from (x1,y1) to (x2,y2)."""
    draw.line((x1, y1, x2, y2), fill=fill, width=width)
    angle = math.atan2(y2 - y1, x2 - x1)
    x3 = x2 - head_length * math.cos(angle - 0.4)
    y3 = y2 - head_length * math.sin(angle - 0.4)
    x4 = x2 - head_length * math.cos(angle + 0.4)
    y4 = y2 - head_length * math.sin(angle + 0.4)
    draw.polygon([(x2, y2), (x3, y3), (x4, y4)], fill=fill)

def draw_dashed_arrow(draw, x1, y1, x2, y2, label=None, fill=COLOR_BORDER_GRAY, width=1, head_length=8):
    """Draws a dashed arrow for UML dependencies (include, extend)."""
    dx, dy = x2 - x1, y2 - y1
    dist = math.sqrt(dx*dx + dy*dy)
    if dist == 0:
        return
    ux, uy = dx/dist, dy/dist
    curr_dist = 0
    dash_len = 6
    gap_len = 4
    while curr_dist < dist - head_length:
        next_dist = min(curr_dist + dash_len, dist - head_length)
        draw.line((x1 + ux*curr_dist, y1 + uy*curr_dist, x1 + ux*next_dist, y1 + uy*next_dist), fill=fill, width=width)
        curr_dist += dash_len + gap_len
    draw_arrow(draw, x1 + ux*(dist-head_length), y1 + uy*(dist-head_length), x2, y2, fill=fill, width=width, head_length=head_length)
    if label:
        tx = x1 + ux*(dist*0.5)
        ty = y1 + uy*(dist*0.5) - 8
        draw.text((tx, ty), label, font=font_small, fill=COLOR_TEXT_MUTED, anchor="mm")

def draw_stick_figure(draw, x, y, fill=COLOR_BORDER_BLUE, width=2):
    """Draws a standard UML actor stick figure centered around (x, y)."""
    draw.ellipse((x - 10, y - 35, x + 10, y - 15), outline=fill, width=width, fill=(255, 255, 255))
    draw.line((x, y - 15, x, y + 10), fill=fill, width=width)
    draw.line((x - 20, y - 8, x + 20, y - 8), fill=fill, width=width)
    draw.line((x, y + 10, x - 12, y + 32), fill=fill, width=width)
    draw.line((x, y + 10, x + 12, y + 32), fill=fill, width=width)

def draw_uml_class_box(draw, x1, y1, x2, y2, title, attributes, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE, header_fill=None):
    """Draws a standard UML class box with separated compartments."""
    draw_shadowed_rect(draw, x1, y1, x2, y2, radius=6, fill=fill, outline=outline, width=2)
    header_h = 32
    if header_fill:
        draw.rounded_rectangle((x1 + 1, y1 + 1, x2 - 1, y1 + header_h), radius=6, fill=header_fill)
        draw.rectangle((x1 + 1, y1 + header_h - 6, x2 - 1, y1 + header_h), fill=header_fill)
        text_color = (255, 255, 255)
    else:
        text_color = COLOR_TEXT_MAIN
        
    draw.text(((x1 + x2) // 2, y1 + header_h // 2), title, font=font_bold, fill=text_color, anchor="mm")
    draw.line((x1, y1 + header_h, x2, y1 + header_h), fill=outline, width=2)
    
    curr_y = y1 + header_h + 10
    for attr in attributes:
        draw.text((x1 + 12, curr_y), attr, font=font_regular, fill=COLOR_TEXT_MAIN)
        curr_y += 18

# ==================== DIAGRAM 1: RESEARCH DESIGN ====================
def make_research_design():
    im = Image.new("RGB", (1000, 320), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((500, 25), "SeedSec Rwanda: Research Design & Prototyping Loop", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    nodes = {
        "req": (60, 80, 280, 160),
        "design": (390, 80, 610, 160),
        "dev": (720, 80, 940, 160),
        "eval": (340, 210, 660, 290)
    }
    
    draw_shadowed_rect(draw, *nodes["req"], radius=8, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE)
    draw.text((170, 120), "1. Requirements Analysis", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm")
    
    draw_shadowed_rect(draw, *nodes["design"], radius=8, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE)
    draw.text((500, 120), "2. System Design", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm")
    
    draw_shadowed_rect(draw, *nodes["dev"], radius=8, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE)
    draw.text((830, 120), "3. Prototype Development", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm")
    
    draw_shadowed_rect(draw, *nodes["eval"], radius=8, fill=COLOR_FILL_ORANGE, outline=COLOR_BORDER_ORANGE)
    draw.text((500, 250), "4. Comparative Evaluation\n(Cloud Web-app vs. Offline Mobile Edge-app)", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm", align="center")
    
    draw_arrow(draw, 280, 120, 390, 120)
    draw_arrow(draw, 610, 120, 720, 120)
    draw.line((830, 160, 830, 250), fill=COLOR_BORDER_GRAY, width=2)
    draw_arrow(draw, 830, 250, 660, 250)
    draw.line((340, 250, 170, 250), fill=COLOR_BORDER_GRAY, width=2)
    draw_arrow(draw, 170, 250, 170, 160)
    
    im.save(os.path.join(OUTPUT_DIR, "research_design.png"))
    print("Generated research_design.png")

# ==================== DIAGRAM 2: SYSTEM ARCHITECTURE ====================
def make_system_architecture():
    im = Image.new("RGB", (1000, 750), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((500, 20), "SeedSec Rwanda: Layered System Architecture", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    # 1. Presentation Layer
    draw_shadowed_rect(draw, 50, 70, 950, 210, radius=10, fill=COLOR_FILL_BLUE, outline=COLOR_BORDER_BLUE)
    draw.text((70, 85), "Presentation Layer (Client Interfaces)", font=font_bold, fill=COLOR_TEXT_MAIN)
    
    sub_modules_fe = [
        ("Google Colab / Notebook\n(Model Prototyping)", 100, 120, 330, 190),
        ("Online Web App\n(Next.js Web-UI)", 380, 120, 610, 190),
        ("Offline Mobile App\n(Local TFLite/ONNX Runner)", 660, 120, 890, 190)
    ]
    for title, x1, y1, x2, y2 in sub_modules_fe:
        draw.rectangle((x1, y1, x2, y2), fill=(255, 255, 255), outline=COLOR_BORDER_BLUE, width=1)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, font=font_regular, fill=COLOR_TEXT_MAIN, anchor="mm", align="center")
        
    # 2. Application Layer (Execution pipelines)
    draw_shadowed_rect(draw, 50, 290, 950, 430, radius=10, fill=COLOR_FILL_GREEN, outline=COLOR_BORDER_GREEN)
    draw.text((70, 305), "Application Layer (Execution & Optimization Engines)", font=font_bold, fill=COLOR_TEXT_MAIN)
    
    sub_modules_be = [
        ("Online FastAPI Backend\n(Cloud REST Diagnostics)", 100, 340, 360, 410),
        ("Edge Model Quantizer\n(Quantization & Serialization)", 390, 340, 620, 410),
        ("Offline Edge Runner\n(Local CPU/NPU Acceleration)", 650, 340, 900, 410)
    ]
    for title, x1, y1, x2, y2 in sub_modules_be:
        draw.rectangle((x1, y1, x2, y2), fill=(255, 255, 255), outline=COLOR_BORDER_GREEN, width=1)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, font=font_regular, fill=COLOR_TEXT_MAIN, anchor="mm", align="center")
        
    draw_arrow(draw, 500, 210, 500, 290, fill=COLOR_BORDER_GRAY, width=3)
    draw.text((515, 250), "JSON / local execution calls", font=font_bold, fill=COLOR_TEXT_MUTED, anchor="lm")
    
    # 3. Lower Layers
    # Storage Layer
    draw_shadowed_rect(draw, 50, 510, 320, 690, radius=10, fill=COLOR_FILL_ORANGE, outline=COLOR_BORDER_ORANGE)
    draw.text((185, 530), "Storage Layer", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma")
    db_text = "SQLite / Drive Storage\n\n- DATASETS Table\n- TRAINING_RUNS Table\n- EVALUATION_METRICS Table"
    draw.text((70, 560), db_text, font=font_regular, fill=COLOR_TEXT_MAIN)
    
    # ML Pipeline Layer
    draw_shadowed_rect(draw, 360, 510, 640, 690, radius=10, fill=COLOR_FILL_PURPLE, outline=COLOR_BORDER_PURPLE)
    draw.text((500, 530), "ML Pipeline & Edge Assets", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma")
    ml_text = "PyTorch Models -> Quantized\n\n- PyTorch Weights (Cloud)\n- YOLOv8 (Maize Vigor)\n- ResNet/MobileNet (Classifiers)\n- Compiled TFLite/ONNX (Local)"
    draw.text((380, 560), ml_text, font=font_regular, fill=COLOR_TEXT_MAIN)
    
    # External Resources
    draw_shadowed_rect(draw, 680, 510, 950, 690, radius=10, fill=COLOR_FILL_RED, outline=COLOR_BORDER_RED)
    draw.text((815, 530), "External Data Sources", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma")
    ext_text = "Kaggle Datasets\n\n- Seed Vigor Detection (Maize)\n- Corn Seed Classification\n- Vegetable Seed Dataset (14)"
    draw.text((700, 560), ext_text, font=font_regular, fill=COLOR_TEXT_MAIN)
    
    draw_arrow(draw, 220, 430, 220, 510, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((230, 470), "Save Runs / SQL", font=font_small, fill=COLOR_TEXT_MUTED)
    
    draw_arrow(draw, 500, 430, 500, 510, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((510, 470), "Export TFLite", font=font_small, fill=COLOR_TEXT_MUTED)
    
    draw_arrow(draw, 780, 430, 780, 510, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((790, 470), "Kaggle API Pull", font=font_small, fill=COLOR_TEXT_MUTED)
    
    im.save(os.path.join(OUTPUT_DIR, "system_architecture.png"))
    print("Generated system_architecture.png")

# ==================== DIAGRAM 3: USE CASE DIAGRAM ====================
def make_use_case():
    im = Image.new("RGB", (1000, 650), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((500, 20), "SeedSec Rwanda: Use Case Diagram", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    # Boundary box
    draw.rectangle((220, 70, 780, 610), outline=COLOR_BORDER_GRAY, width=2, fill=COLOR_FILL_GRAY)
    draw.text((500, 85), "SeedSec Rwanda Platform", font=font_bold, fill=COLOR_TEXT_MUTED, anchor="ma")
    
    # Draw Actors
    draw_stick_figure(draw, 110, 320, fill=COLOR_BORDER_BLUE, width=2)
    draw.text((110, 370), "Farmer", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    draw_stick_figure(draw, 890, 320, fill=COLOR_BORDER_GREEN, width=2)
    draw.text((890, 370), "Agro-dealer", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma", align="center")
    
    # Define Use Cases with detailed coordinates
    # Format: (text, cx, cy, width, height)
    use_cases = {
        "capture": ("Capture Seed Image", 500, 120, 180, 55),
        "offline": ("Run Offline Edge\nDiagnostics", 380, 240, 190, 55),
        "online": ("Run Online Cloud\nDiagnostics", 620, 240, 190, 55),
        "view_status": ("View Seed Vigor &\nHealth Status", 380, 360, 190, 55),
        "view_history": ("View Batch\nDiagnostic History", 620, 360, 190, 55),
        "sync": ("Sync Local Scan Logs", 500, 470, 180, 55),
        "verify": ("Verify Seed Variety\n& Quality", 500, 560, 200, 55)
    }
    
    # Draw Use Case boxes
    for name, (text, cx, cy, w, h) in use_cases.items():
        x1, y1 = cx - w//2, cy - h//2
        x2, y2 = cx + w//2, cy + h//2
        draw.rounded_rectangle((x1, y1, x2, y2), radius=16, fill=(255, 255, 255), outline=COLOR_BORDER_TEAL, width=2)
        draw.text((cx, cy), text, font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm", align="center")
        
    # Draw Actor Connections (solid lines)
    # Farmer connections
    draw.line((130, 320, 380 - 95, 240), fill=COLOR_BORDER_BLUE, width=1) # Offline
    draw.line((130, 320, 380 - 95, 360), fill=COLOR_BORDER_BLUE, width=1) # View status
    draw.line((130, 320, 500 - 90, 470), fill=COLOR_BORDER_BLUE, width=1) # Sync logs
    
    # Agro-dealer connections
    draw.line((870, 320, 620 + 95, 240), fill=COLOR_BORDER_GREEN, width=1) # Online
    draw.line((870, 320, 620 + 95, 360), fill=COLOR_BORDER_GREEN, width=1) # View history
    draw.line((870, 320, 500 + 90, 470), fill=COLOR_BORDER_GREEN, width=1) # Sync logs
    draw.line((870, 320, 500 + 100, 560), fill=COLOR_BORDER_GREEN, width=1) # Verify seed quality
    
    # Draw UML Dependencies (dashed arrows with <<include>> / <<extend>>)
    # 1. Offline & Online include Capture
    draw_dashed_arrow(draw, 380, 240 - 27, 500 - 20, 120 + 27, label="<<include>>")
    draw_dashed_arrow(draw, 620, 240 - 27, 500 + 20, 120 + 27, label="<<include>>")
    
    # 2. Offline & Online include View Vigor & Health Status
    draw_dashed_arrow(draw, 380, 240 + 27, 380, 360 - 27, label="<<include>>")
    draw_dashed_arrow(draw, 620 - 40, 240 + 27, 380 + 60, 360 - 27, label="<<include>>")
    
    # 3. Sync Local Model extends Edge Diagnostics
    draw_dashed_arrow(draw, 500 - 30, 470 - 27, 380 + 30, 240 + 27, label="<<extend>>")
    
    # 4. Verify includes View History
    draw_dashed_arrow(draw, 500 + 40, 560 - 27, 620 - 40, 360 + 27, label="<<include>>")
    
    im.save(os.path.join(OUTPUT_DIR, "use_case.png"))
    print("Generated use_case.png")

# ==================== DIAGRAM 4: CLASS DIAGRAM ====================
def make_class_diagram():
    im = Image.new("RGB", (1000, 600), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((500, 20), "SeedSec Rwanda: UML Class Diagram", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    dataset_attrs = [
        "+ datasetId: Integer",
        "+ name: String",
        "+ sourceUrl: String",
        "+ totalImages: Integer",
        "+ numClasses: Integer"
    ]
    draw_uml_class_box(draw, 60, 180, 310, 340, "Dataset", dataset_attrs, header_fill=COLOR_BORDER_BLUE, outline=COLOR_BORDER_BLUE)
    
    run_attrs = [
        "+ runId: Integer",
        "+ datasetId: Integer",
        "+ modelArchitecture: String",
        "+ hyperparameters: String",
        "+ executionTime: Float",
        "+ epochsTrained: Integer"
    ]
    draw_uml_class_box(draw, 390, 180, 640, 375, "TrainingRun", run_attrs, header_fill=COLOR_BORDER_BLUE, outline=COLOR_BORDER_BLUE)
    
    quant_attrs = [
        "+ quantizerId: Integer",
        "+ targetFormat: String",
        "+ optimizationType: String",
        "+ sizeReductionPct: Float",
        "+ validationLossChange: Float"
    ]
    draw_uml_class_box(draw, 720, 180, 970, 375, "ModelQuantizer", quant_attrs, header_fill=COLOR_BORDER_BLUE, outline=COLOR_BORDER_BLUE)
    
    draw_arrow(draw, 310, 260, 390, 260, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((320, 240), "1", font=font_regular, fill=COLOR_TEXT_MUTED)
    draw.text((370, 240), "1..*", font=font_regular, fill=COLOR_TEXT_MUTED)
    draw.text((350, 270), "runs", font=font_bold, fill=COLOR_TEXT_MUTED, anchor="ma")
    
    draw_arrow(draw, 640, 260, 720, 260, fill=COLOR_BORDER_GRAY, width=2)
    draw.polygon([(640, 260), (634, 268), (640, 276), (646, 268)], fill=(255, 255, 255), outline=COLOR_BORDER_GRAY)
    draw.text((650, 240), "1", font=font_regular, fill=COLOR_TEXT_MUTED)
    draw.text((700, 240), "1", font=font_regular, fill=COLOR_TEXT_MUTED)
    draw.text((680, 270), "quantizes", font=font_bold, fill=COLOR_TEXT_MUTED, anchor="ma")
    
    im.save(os.path.join(OUTPUT_DIR, "class_diagram.png"))
    print("Generated class_diagram.png")

# ==================== DIAGRAM 5: ENTITY RELATIONSHIP DIAGRAM ====================
def make_erd():
    im = Image.new("RGB", (1000, 600), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((500, 20), "SeedSec Rwanda: Entity Relationship Diagram (ERD)", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    datasets_fields = [
        "PK | dataset_id : INTEGER",
        "     name : VARCHAR(100)",
        "     source_url : VARCHAR(255)",
        "     total_images : INTEGER",
        "     num_classes : INTEGER"
    ]
    draw_uml_class_box(draw, 60, 180, 340, 345, "DATASETS", datasets_fields, fill=COLOR_FILL_TEAL, outline=COLOR_BORDER_TEAL, header_fill=COLOR_BORDER_TEAL)
    
    runs_fields = [
        "PK | run_id : INTEGER",
        "FK | dataset_id : INTEGER",
        "     model_architecture : VARCHAR(50)",
        "     hyperparameters : TEXT",
        "     execution_time : REAL",
        "     epochs_trained : INTEGER"
    ]
    draw_uml_class_box(draw, 380, 180, 660, 365, "TRAINING_RUNS", runs_fields, fill=COLOR_FILL_TEAL, outline=COLOR_BORDER_TEAL, header_fill=COLOR_BORDER_TEAL)
    
    metrics_fields = [
        "PK | metric_id : INTEGER",
        "FK | run_id : INTEGER",
        "     accuracy : REAL",
        "     f1_score : REAL",
        "     precision_val : REAL",
        "     recall_val : REAL",
        "     map_score : REAL"
    ]
    draw_uml_class_box(draw, 690, 180, 970, 380, "EVALUATION_METRICS", metrics_fields, fill=COLOR_FILL_TEAL, outline=COLOR_BORDER_TEAL, header_fill=COLOR_BORDER_TEAL)
    
    draw.line((340, 260, 380, 260), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((348, 252, 348, 268), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((352, 252, 352, 268), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((380, 260, 368, 250), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((380, 260, 368, 270), fill=COLOR_BORDER_TEAL, width=2)
    draw.ellipse((358, 256, 366, 264), outline=COLOR_BORDER_TEAL, fill=(255, 255, 255), width=2)
    
    draw.line((660, 260, 690, 260), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((668, 252, 668, 268), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((672, 252, 672, 268), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((680, 252, 680, 268), fill=COLOR_BORDER_TEAL, width=2)
    draw.line((684, 252, 684, 268), fill=COLOR_BORDER_TEAL, width=2)
    
    im.save(os.path.join(OUTPUT_DIR, "erd.png"))
    print("Generated erd.png")

# ==================== DIAGRAM 6: SEQUENCE DIAGRAM ====================
def make_sequence_diagram():
    im = Image.new("RGB", (1100, 760), COLOR_BG)
    draw = ImageDraw.Draw(im)
    draw.text((550, 20), "SeedSec Rwanda: Hybrid Diagnostic Sequence Flow", font=font_title, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    lifelines = {
        "user": 120,
        "fe": 320,
        "be": 540,
        "ml": 760,
        "db": 980
    }
    
    draw_stick_figure(draw, 120, 80, fill=COLOR_BORDER_BLUE, width=2)
    draw.text((120, 115), "Farmer / Agro-dealer", font=font_bold, fill=COLOR_TEXT_MAIN, anchor="ma")
    
    headers = [
        ("fe", "Mobile/Web Client\n(App Interface)", COLOR_FILL_BLUE, COLOR_BORDER_BLUE),
        ("be", "FastAPI Cloud API\n(Online Engine)", COLOR_FILL_GREEN, COLOR_BORDER_GREEN),
        ("ml", "TFLite / ONNX\n(Offline Local ML)", COLOR_FILL_PURPLE, COLOR_BORDER_PURPLE),
        ("db", "Google Drive / SQLite\n(Storage & Metrics)", COLOR_FILL_ORANGE, COLOR_BORDER_ORANGE)
    ]
    for key, label, fill, border in headers:
        x = lifelines[key]
        draw_shadowed_rect(draw, x - 70, 60, x + 70, 110, radius=4, fill=fill, outline=border, shadow_offset=2)
        draw.text((x, 85), label, font=font_bold, fill=COLOR_TEXT_MAIN, anchor="mm", align="center")
        
    for key, x in lifelines.items():
        curr_y = 130
        while curr_y < 720:
            draw.line((x, curr_y, x, curr_y + 10), fill=COLOR_BORDER_GRAY, width=1)
            curr_y += 20
            
    activations = [
        ("fe", 145, 700),
        ("be", 175, 400),
        ("ml", 445, 660),
        ("db", 335, 395)
    ]
    for key, y1, y2 in activations:
        x = lifelines[key]
        draw.rectangle((x - 6, y1, x + 6, y2), fill=(255, 255, 255), outline=COLOR_TEXT_MUTED, width=1)
        
    messages = [
        (150, "user", "fe", "1. Capture seed photo (Select Online)", False, True),
        (180, "fe", "be", "2. POST /diagnose (Upload Image)", False, True),
        (220, "be", "be", "3. Run High-Performance Cloud PyTorch", False, True),
        (340, "be", "db", "4. Save cloud diagnosis run logs", False, True),
        (390, "be", "fe", "5. Return detailed metrics & advice JSON", True, False),
        
        (450, "user", "fe", "6. Capture seed photo (Select Offline)", False, True),
        (480, "fe", "ml", "7. Run local TFLite Edge Inference", False, True),
        (540, "ml", "ml", "8. Compute locally on Mobile CPU/NPU", False, True),
        (650, "ml", "fe", "9. Return instant bounding boxes & classes", True, False),
        (690, "fe", "user", "10. Display offline diagnostics & advice", True, False)
    ]
    
    for y, from_k, to_k, text, is_dashed, is_call in messages:
        if from_k == to_k:
            continue
            
        x1 = lifelines[from_k]
        x2 = lifelines[to_k]
        
        if x1 < x2:
            start_x = x1 + (6 if from_k != "user" else 0)
            end_x = x2 - 6
        else:
            start_x = x1 - (6 if from_k != "user" else 0)
            end_x = x2 + 6
            
        if is_dashed:
            curr_x = start_x
            step = 10 if x1 < x2 else -10
            while abs(curr_x - end_x) > 10:
                draw.line((curr_x, y, curr_x + step//2, y), fill=COLOR_TEXT_MUTED, width=1)
                curr_x += step
            draw_arrow(draw, curr_x, y, end_x, y, fill=COLOR_TEXT_MUTED, width=1, head_length=8)
        else:
            draw_arrow(draw, start_x, y, end_x, y, fill=COLOR_TEXT_MAIN, width=2, head_length=10)
            
        text_x = (start_x + end_x) // 2
        draw.text((text_x, y - 10), text, font=font_regular, fill=COLOR_TEXT_MAIN, anchor="mb")
        
    be_x = lifelines["be"]
    draw.line((be_x + 6, 220, be_x + 40, 220), fill=COLOR_BORDER_GRAY, width=2)
    draw.line((be_x + 40, 220, be_x + 40, 260), fill=COLOR_BORDER_GRAY, width=2)
    draw_arrow(draw, be_x + 40, 260, be_x + 6, 260, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((be_x + 45, 240), "3. Execute cloud inference", font=font_small, fill=COLOR_TEXT_MUTED, anchor="lm")
    
    ml_x = lifelines["ml"]
    draw.line((ml_x + 6, 540, ml_x + 40, 540), fill=COLOR_BORDER_GRAY, width=2)
    draw.line((ml_x + 40, 540, ml_x + 40, 580), fill=COLOR_BORDER_GRAY, width=2)
    draw_arrow(draw, ml_x + 40, 580, ml_x + 6, 580, fill=COLOR_BORDER_GRAY, width=2)
    draw.text((ml_x + 45, 560), "8. Compute local edge-run", font=font_small, fill=COLOR_TEXT_MUTED, anchor="lm")
    
    im.save(os.path.join(OUTPUT_DIR, "sequence_diagram.png"))
    print("Generated sequence_diagram.png")

if __name__ == "__main__":
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    make_research_design()
    make_system_architecture()
    make_use_case()
    make_class_diagram()
    make_erd()
    make_sequence_diagram()
    print("All diagrams generated successfully.")
