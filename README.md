# SeedSec Rwanda: Hybrid Online/Offline Seed Quality Diagnosis and Advisory System
ALU BSc in Software Engineering Capstone Project submission workspace.

## Demo Video
🎥 Watch the SeedSec demonstration video showing both the Web App and Mobile App:

[![SeedSec Project Demo Video](https://img.youtube.com/vi/AvhVfsejh8U/maxresdefault.jpg)](https://youtu.be/AvhVfsejh8U)

## Repository Information
- **GitHub Repository URL**: [https://github.com/Makito042/seedsec](https://github.com/Makito042/seedsec)
- **Submission Track**: Machine Learning (ML) Track
- **Project Scope**: A hybrid deep learning diagnostic system combining:
  1. A cloud-hosted **FastAPI** backend executing **PyTorch** models for complex diagnostics (YOLOv8 object detection for maize vigor, MobileNetV2 classification for vegetable species, ResNet50 for seed defects).
  2. A local on-device **TensorFlow Lite (TFLite)** engine embedded in a mobile web client for field operations in rural areas with poor connectivity.

---

## Workspace Setup

### Prerequisites
- Python 3.10+
- Virtual environment tool (`venv`)
- Kaggle account API token (`kaggle.json` credentials)

### Local Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Makito042/seedsec.git
   cd seedsec
   ```
2. Initialize virtual environment and install requirements:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Export diagrams and documents:
   - Run `/Users/mac/soilsec/.venv/bin/python generate_diagrams.py` to draw the project architecture, ERD, and sequence flow images.
   - Run `/Users/mac/soilsec/.venv/bin/python generate_docx.py` to parse and build the formatting-compliant Word Document proposal (`SeedSec_Rwanda_Proposal_Clean_Final.docx`).

---

## Machine Learning Track Notebooks

We provide two pre-configured, Colab-ready Jupyter notebooks in the repository root directory:
1. **[Maize Seed Vigor Object Detection Notebook (YOLOv8)](file:///Users/mac/soilsec/seed_vigor_training_yolov8_final.ipynb)**:
   - Sets up dataset ingestion and mounts Google Drive.
   - Recursively parses, structures, and converts annotations from standard PASCAL VOC XML into normalized YOLO `.txt` coordinates relative to image sizes.
   - Handles dynamic class mapping for categories (0: ungerminated, 1: germinated, etc.).
   - Launches training using transfer learning on the lightweight `yolov8n` backbone.
   - Generates Precision-Recall logs, harmonic mean F1-Score calculations, confusion matrices, and loss curve plots.
   - Exports the best PyTorch checkpoint to a quantized **FP16 TensorFlow Lite (`.tflite`)** model.
2. **[Vegetable Species Classification Notebook (MobileNetV2)](file:///Users/mac/soilsec/vegetable_seed_training_mobilenetv2.ipynb)**:
   - Programmatically downloads the 14-class Vegetable Seed Dataset from Kaggle.
   - Splits images into stratified subsets (70% train, 15% validation, 15% test).
   - Configures PyTorch `ImageFolder` loaders and applies augmentation transforms.
   - Initiates pre-trained **MobileNetV2** for transfer learning classification across 14 species classes.
   - Plots training loss/accuracy curves and prints classification F1/precision tables.
   - Exports the model to `.onnx` and compiles it into a half-precision mobile-ready `.tflite` model.

---

## Interface Mockups & Designs
All UML files and wireframe assets are included in the repository root directory:
* **Research Design & Data Pipeline**: [research_design.png](file:///Users/mac/soilsec/research_design.png)
* **System Architecture**: [system_architecture.png](file:///Users/mac/soilsec/system_architecture.png)
* **UML Use Case Diagram**: [use_case.png](file:///Users/mac/soilsec/use_case.png)
* **UML Class Diagram**: [class_diagram.png](file:///Users/mac/soilsec/class_diagram.png)
* **Entity-Relationship Diagram (ERD)**: [erd.png](file:///Users/mac/soilsec/erd.png)
* **Operational Flow Sequence Diagram**: [sequence_diagram.png](file:///Users/mac/soilsec/sequence_diagram.png)

### MVP Solution Demonstration
Open the local dashboard [index.html](file:///Users/mac/soilsec/index.html) in your browser. This application showcases:
- **Interactive Wireframe UI**: Responsive layout featuring image dropzones, mock camera snaps, and dynamic parameter tables.
- **Engine Switching**: Toggle between *Online Cloud mode* (simulated cloud latency, PyTorch sizes, comprehensive advisories) and *Offline local mode* (quantized TFLite sizes, CPU latency, cached advisories).
- **Interactive Inference**: Simulates execution latency, maps predicted bounding boxes, displays classification confidences, and returns agricultural advisory actions.

---

## Deployment Plan

1. **Cloud API Services**:
   - **Infrastructure**: AWS EC2 instance (g4dn.xlarge with T4 GPU) or GCP VM.
   - **Backend Engine**: FastAPI ASGI server running inside a Docker container.
   - **Inference Engine**: PyTorch framework loading standard floating-point models (`.pt`).
   - **Database**: SQLite instance tracking diagnostic transaction logs, class predictions, and accuracy stats.
2. **Mobile Client Application**:
   - **Infrastructure**: Progressive Web Application (PWA) container.
   - **Inference Engine**: TensorFlow Lite Android NPU/CPU runtime using JavaScript and TFLite web assembly bindings.
   - **Storage**: Offline storage of local scan logs using SQLite / indexedDB, syncing metadata back to cloud storage when internet connection is restored.
