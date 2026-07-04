# SeedSec Rwanda - Web Portal

This repository contains the web application code for the **SeedSec Rwanda** project, a hybrid smartphone-based seed quality diagnostic tool. 

The web portal provides both **Online** (cloud-based high-performance FastAPI/PyTorch inference) and **Offline** (local browser-side WebAssembly TFLite model execution) capability.

---

## Directory Structure

*   `frontend/`: The frontend application built with **React**, **Vite**, **TypeScript**, and **Vanilla CSS**.
    *   **Features**:
        *   **Rwanda Agro-Meteorological Weather Widget**: Real-time weather reporting and agricultural advisories for 8 key farming districts (Kigali, Musanze, Huye, Kayonza, Rubavu, Nyagatare, Karongi, Bugesera) covering a 4-day timeline (Yesterday, Today, Tomorrow, Next Day) powered by the Open-Meteo API.
        *   **Diagnostic Workspace Catalog**: Access point for 4 interactive agricultural tools:
            1.  *Maize Vigor YOLOv8*: Object-detection tool to evaluate germination and count emerging roots.
            2.  *Tomato Species MobileNet*: Variety classifier to ensure seed purity.
            3.  *Seed Surface ResNet*: Inspection tool for structural fractures and surface mold.
            4.  *Soil Bioacoustic Monitor*: Non-invasive soil fauna density and biotic index evaluator featuring interactive sound waveforms.
*   `backend/`: A **FastAPI** Python application serving as the high-performance cloud model pipeline hosting PyTorch/YOLO/MobileNet configurations.

---

## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.10+)

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the FastAPI development server:
   ```bash
   python server.py
   ```
