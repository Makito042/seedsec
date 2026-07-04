# SeedSec Rwanda Mobile App

A premium, high-performance Flutter mobile application for the **SeedSec Rwanda** project — a hybrid online/offline smartphone-based seed quality diagnosis system tailored for smallholder farmers.

---

## 📱 Features & Capabilities

1. **Dual-Deployment Mode (Cloud API & Local Edge)**
   - Automatically detects internet availability.
   - Forwards image files to the FastAPI cloud API for heavy GPU-backed predictions.
   - Automatically falls back to on-device **TensorFlow Lite (TFLite)** models when network coverage is low or offline.
2. **Four Integrated Diagnostic Tools**
   - **Maize Vigor YOLOv8**: Detects root emergence and assesses vigor grades of ibigori seeds.
   - **Tomato Species MobileNet**: Inspects seed lot varietal purity and detects cultivar variety.
   - **Seed Surface ResNet**: Scans for structural splits, cracks, and microbial surface mold.
   - **Soil Bioacoustic Monitor**: Listens to soil micro-fauna frequencies to assess biological soil health.
3. **Agro-Tools Sowing Calculator**
   - Calculates custom sowing rates (kg/Ha) based on desired plot area and diagnostic seed vigor.
   - Adjusts seed volume requirements dynamically depending on viability levels (e.g., adding +15% for Vigor 2 and +35% for Vigor 1, or warning against planting for Vigor 0).
   - Generates recommended spacing rules (e.g. 75x25cm spacing for maize).
4. **Scan History & Audit Registry**
   - Keeps track of all historical scans and recommendations locally.
   - Supports exporting diagnostic logs to a raw CSV format to share with agronomists.
5. **Agricultural Weather Advisories**
   - Connects with the Open-Meteo API to fetch multi-day weather forecasts for 8 key Rwandan cities (Kigali, Musanze, Huye, Kayonza, Rubavu, Nyagatare, Karongi, Bugesera).
   - Provides context-aware farm advisories based on meteorological conditions.

---

## 🎨 Premium Visual Theme

The app follows the premium dark forest green aesthetic of the SeedSec web portal:
- **Background**: `#0B1308` (Dark Charcoal Green)
- **Surfaces**: `#162612` (Translucent forest green cards with Backdrop Blur)
- **Accent Green**: `#67C23A` (Vibrant lime green)
- **Accent Orange**: `#E6A23C` (Warm amber warning indicator)
- **Typography**: **Outfit** (headings, bold letterspacing) and **Plus Jakarta Sans** (body text)

---

## ⚙️ Project Structure

```
seedsec_mobile/
├── assets/
│   └── models/                      # TFLite model files
├── lib/
│   ├── main.dart                    # App entry, theme configuration, navigation
│   ├── config/
│   │   └── theme.dart               # Dark glassmorphism color palette
│   ├── models/
│   │   ├── crop_spec.dart           # Crop configurations (Maize, Tomato, etc.)
│   │   ├── diagnostic_result.dart   # Diagnostic result schema
│   │   └── weather_info.dart        # Weather coordinates & forecast models
│   ├── services/
│   │   ├── api_service.dart         # FastAPI backend connection
│   │   ├── app_state.dart           # SharedPreferences history & weather state manager
│   │   ├── tflite_service.dart      # On-device TFLite inference engine
│   │   └── weather_service.dart     # Open-Meteo API fetcher & fallback generator
│   ├── screens/
│   │   ├── home_screen.dart         # Hero header, weather chips, system metrics
│   │   ├── workspace_screen.dart    # Camera picker, audio simulate, run diagnostic
│   │   ├── agro_tools_screen.dart   # Sowing calculator, vigor toggle, CSV registry
│   │   └── scan_result_screen.dart  # Detailed report with YOLOv8 bounding boxes
│   └── widgets/
│       ├── premium_card.dart        # Glassmorphic card styling
│       ├── scan_history_tile.dart   # Audit log item tiles
│       ├── vigor_selector.dart      # Agro calculation vigor buttons
│       └── weather_widget.dart      # Weather Advisory layout
├── pubspec.yaml                     # Dependencies & assets configurations
└── README.md                        # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Install [Flutter SDK](https://docs.flutter.dev/get-started/install).
- Ensure an Android Emulator, iOS Simulator, or physical device is configured.

### Run Instructions

1. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

2. **Run the FastAPI Backend Server** (Optional, for Online Cloud Mode):
   Navigate to the backend directory and run:
   ```bash
   cd ../seedsec_web/backend
   python server.py
   ```

3. **Launch the Application**:
   ```bash
   flutter run
   ```
