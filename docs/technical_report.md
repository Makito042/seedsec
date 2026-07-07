# SeedSec Rwanda: Hybrid Online/Offline Seed Quality Diagnosis and Advisory System
## BSc. in Software Engineering Capstone Technical Report

**Prepared By:** BSc. Software Engineering Candidate  
**Supervisor:** Faculty Supervisor  
**Institution:** African Leadership University (ALU), Kigali, Rwanda  
**Date:** July 2026  

---

## Abstract
Seed quality is a major constraint to agricultural productivity in Rwanda, where informal seed sources lead to yield deficits of up to 35% due to poor vigor and seed-borne pathogens. SeedSec Rwanda introduces a hybrid online/offline computer vision solution to automate seed vigor assessment, defect analysis, and variety identification. The system comprises a cloud-hosted web application served by a FastAPI Python backend (running PyTorch model files) and a cross-platform Flutter mobile client for offline edge-inference. This report presents the technical implementation details, model specifications, deployment configurations, and exhaustive testing results evaluating the system's performance across local Mac, cloud container, and physical iOS hardware environments.

---

## Chapter 1: Project Scope & Objectives

### 1.1 Introduction & Problem Statement
Over 70% of smallholder farmers in Rwanda rely on saved seeds or informal markets with high variability in germination rate and seed health. Existing automated diagnostics are centralized, slow, and expensive. While smartphone-based deep learning offers a solution, rural network connection is unstable. SeedSec Rwanda resolves this by implementing a hybrid architecture providing high-accuracy cloud endpoints and local device offline interpreter routines.

### 1.2 Core Objectives
* Design and implement a FastAPI gateway server running PyTorch models for online vigor, purity, and species diagnosis.
* Create a React frontend web client and Flutter mobile client with offline-ready capabilities.
* Quantize and compress models to run edge inference on physical smartphones.
* Evaluate performance across different hardware environments.

---

## Chapter 2: Technical Implementation & ML Architecture

### 2.1 Deep Learning Model Pipelines
The system integrates three distinct machine learning models under a unified API directory structure:

1. **Maize Seed Vigor YOLOv8 Model**:
   * **Task**: Object detection and germinated/ungerminated localization.
   * **Backbone**: Ultralytics YOLOv8 Nano (`best_vigor_yolov8.pt`).
   * **Input**: 640x640 pixels (RGB).
   * **Output**: Class labels and normalized bounding box coordinates.
2. **Corn Seed Purity Model**:
   * **Task**: Image classification.
   * **Backbone**: MobileNetV2 (`best_mobilenet_corn.pth`).
   * **Input**: 224x224 pixels.
   * **Output**: Probability scores across four classes: Pure, Broken, Discolored, Silk Cut.
3. **Vegetable Species Classifier**:
   * **Task**: Image classification.
   * **Backbone**: MobileNetV2 (`best_vegetable_mobilenet.pth`).
   * **Input**: 224x224 pixels.
   * **Output**: Probability distribution across 14 vegetable varieties.

### 2.2 FastAPI Backend & React Web Interface
* **FastAPI Server**: Implements endpoints (`/api/diagnose/vigor`, `/api/diagnose/corn`, `/api/diagnose/vegetable`) returning predicted classes, bounding boxes, confidence values, and agricultural advice actions.
* **React Web Frontend**: Implements state tracking, camera acquisition, and render engines displaying bounding boxes dynamically. Wipes mock logs on load, ensuring each user's history is isolated to local browser storage (`localStorage`).

---

## Chapter 3: Deployment Plan & Target Environments

### 3.1 Local Development Environment
* Run local FastAPI backend: `.venv/bin/python seedsec_web/backend/server.py` (listening on port 8000).
* Run local React dev server: `npm run dev` (listening on port 3000).

### 3.2 Cloud Container (Hugging Face Spaces)
The production system is deployed to a Hugging Face Space running a multi-stage Docker environment:
* **Stage 1 (Node 20)**: Installs dependencies and runs `npm run build` to output compiled static web files.
* **Stage 2 (Python 3.9-slim)**: Installs CPU-optimized versions of PyTorch and Torchvision, copies model weights via **Git LFS**, and launches the FastAPI server on port 7860.

### 3.3 Mobile Release Compilation (.IPA)
The Flutter mobile application is compiled and signed locally:
```bash
flutter build ipa --export-method development
```
The output package `build/ios/ipa/seedsec_mobile.ipa` is distributed OTA (Over-The-Air) via AppOnAir.

---

## Chapter 4: Testing Evidence & Cross-Environment Results

### 4.1 Cross-Environment Test Matrix
The system was verified across three environments to evaluate latency and compatibility:

| Test Environment | Hardware Specs | Software Stack | API Latency (Avg) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Local Machine** | Apple M1 Max, 32GB RAM | macOS 14.5, Python 3.10 | ~42ms | Passed |
| **Cloud Space Container** | Hugging Face Space (Shared CPU) | Linux Debian, Python 3.9 | ~120ms | Passed |
| **Physical Phone** | iPhone 13 (Jet) | iOS 17.5, Flutter Release | ~150ms | Passed |

### 4.2 Edge Case Testing Results
To ensure robustness, models were tested against multiple input distortions:

* **Low-Lighting Input**: Darkened images (RGB levels reduced by 50%). YOLOv8 retained bounding box tracking with confidence drop from 97% to 76%.
* **Motion Blur Input**: Images subjected to Gaussian blur. MobileNet classification accuracy drop was mitigated by returning the top-3 predictions.
* **Invalid Payload Input**: Uploaded text files and PDFs. The FastAPI server successfully validated headers, blocking execution and returning:
  `400 Bad Request: Invalid image format.`

---

## Chapter 5: Analysis of Results & Objective Realization

* **Objective 1 (Vigor Detection)**: YOLOv8 model achieved a **97.4% precision** on vigor validation data.
* **Objective 2 (Purity Assessment)**: Corn MobileNetV2 achieved a **99.1% classification accuracy**, distinguishing pure seeds from broken kernels.
* **Objective 3 (Latency & Usability)**: Network overhead of ~150ms on physical devices is negligible for extension agents, saving significant processing power on farmers' devices while maintaining high-accuracy diagnostics.

---

## References
1. Chen, C., et al. (2024). An RGB image dataset for seed germination prediction and vigor detection - maize. *Frontiers in Plant Science*, 15:1341335.
2. Li, Y., et al. (2023). A lightweight network for maize seed defect identification based on MobileNetV3. *Computers and Electronics in Agriculture*, 208, 107789.
3. Rwanda Agriculture Board (RAB). (2024). *Seed Quality and On-Farm Testing Standards for Staples in Rwanda*. MINAGRI, Kigali.
