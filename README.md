# Smart Water Logging & Flood Alert System

A production-grade, end-to-end IoT system designed to detect road water levels, evaluate vehicle passage safety, recognize obstacles using camera AI, and broadcast emergency alerts to web dashboards and mobile devices in real time.

---

## 🚀 Key Features

- **ESP32 Main Firmware**: 
  - Measures water levels using a waterproof **AJ-SR04M** sensor.
  - Captures coordinates, speed, and synchronizes system time using a **NEO-6M GPS**.
  - Rotates diagnostic metrics on a local **16x2 I2C LCD Display**.
  - Drives safety LEDs (Green/Yellow/Red) and triggers an active buzzer during critical status.
  - Implements a hardware watchdog, WiFi auto-recovery, and **SPIFFS offline caching** to log data when connection drops.
- **ESP32-CAM Firmware**:
  - Captures road images every 5 seconds.
  - Transmits JPEG binary payloads to the cloud backend for AI object classification.
  - Relays classifications directly to the main controller's LCD display via serial TX.
- **FastAPI Cloud Backend**:
  - Exposes secure REST endpoints.
  - Interfaces with a **Supabase PostgreSQL** database.
  - Secures operations using JWT-based Email logins.
  - Evaluates emergency rules (e.g., if a Person or Vehicle is detected while the water logging level is high, it triggers an instant alert).
- **Vite React Web Dashboard**:
  - Dark mode design system.
  - Displays water logging depth history on charts and maps device locations using **Leaflet Maps**.
  - Includes diagnostic specs, camera feed panels, and threshold control centers.
- **Flutter Mobile Application**:
  - Cross-platform Android/iOS client.
  - Features real-time map views, threat notification centers, and distress contacts directories.

---

## 📂 Directory Structure

```text
SmartFloodSystem/
├── platformio/
│   └── firmware/
│       ├── esp32_main/       # ESP32 main sensor node firmware
│       └── esp32_cam/        # ESP32-CAM capture and upload firmware
├── backend/                  # FastAPI + Supabase backend API
├── web_dashboard/            # React + Vite web application
├── mobile_app/               # Flutter mobile application
├── docs/                     # Comprehensive documentation
│   ├── hardware.md           # Wiring table, component details & circuit schematic
│   ├── api.md                # FastAPI REST API references
│   ├── deployment.md         # Step-by-step compilation & installation guide
│   ├── testing.md            # Hardware verification & simulated cURL testing
│   └── future_enhancements.md# Roadmaps for solar telemetry & Edge Impulse models
└── README.md                 # Project landing page (this file)
```

---

## 📖 Setup & Documentation Index

To configure, compile, and run each component of the system, review the documentation files:

1. 🔌 **Hardware Wiring & Schematics**: See [hardware.md](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/docs/hardware.md)
2. 🚀 **Installation & Deployment Guide**: See [deployment.md](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/docs/deployment.md)
3. 🧪 **Testing & API Verification Guide**: See [testing.md](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/docs/testing.md)
4. 📡 **API Reference Reference**: See [api.md](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/docs/api.md)
5. 🗺️ **Roadmap & Future Improvements**: See [future_enhancements.md](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/docs/future_enhancements.md)
