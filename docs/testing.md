# System Testing & Verification Guide

This document describes methods to test and verify the hardware nodes, FastAPI endpoints, React dashboard, and mobile application.

---

## 1. Hardware Unit Testing

### 1.1 Ultrasonic Level & LED Testing
- Open the PlatformIO serial monitor for the main node:
  ```bash
  pio device monitor -b 115200
  ```
- Wave your hand in front of the AJ-SR04M ultrasonic sensor to change the distance and observe:
  - **0 to 15 cm**: Green LED lights up. "SAFE TO PASS" displays on the LCD.
  - **16 to 30 cm**: Yellow LED lights up. "RISKY PASSAGE" displays on the LCD.
  - **Above 30 cm (or hand blocked)**: Red LED lights up. Buzzer starts pulsing. "DANGER! SHUTDOWN" displays on the LCD.

### 1.2 GPS Sync & Watchdog
- Ensure the GPS module has a clear view of the sky (indicated by a blinking red LED on the NEO-6M).
- The Serial logs will display parsed coordinates once a lock is achieved.
- If the firmware locks up or fails to loop in 12 seconds, the Hardware Watchdog (`esp_task_wdt`) will automatically trigger a chip reset to maintain field robustness.

---

## 2. Backend API Verification (Mock cURL commands)

Use these terminal commands to verify backend responses independently of the ESP32 hardware:

### 2.1 Post Telemetry Payload (Safe Status)
```bash
curl -X POST "http://localhost:8000/api/v1/status" \
     -H "x-device-key: esp32-super-secret-api-key-2026" \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "DEV-ESP32-MAIN-001",
       "water_level_cm": 8.5,
       "status": "SAFE",
       "wifi_rssi": -62,
       "gps_speed": 0.0
     }'
```

### 2.2 Post Telemetry Payload (Danger Status)
*Triggers SMS/Push logs and saves a critical alert.*
```bash
curl -X POST "http://localhost:8000/api/v1/status" \
     -H "x-device-key: esp32-super-secret-api-key-2026" \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "DEV-ESP32-MAIN-001",
       "water_level_cm": 35.2,
       "status": "DANGER",
       "wifi_rssi": -69,
       "gps_speed": 2.5
     }'
```

### 2.3 Post GPS Coordinates
```bash
curl -X POST "http://localhost:8000/api/v1/location?device_id=DEV-ESP32-MAIN-001&latitude=37.7749&longitude=-122.4194&speed=0.0" \
     -H "x-device-key: esp32-super-secret-api-key-2026"
```

### 2.4 Post ESP32-CAM AI Detection (Simulated Hazard)
```bash
curl -X POST "http://localhost:8000/api/v1/object" \
     -H "x-device-key: esp32-super-secret-api-key-2026" \
     -F "device_id=DEV-ESP32-CAM-001" \
     -F "object_name=person" \
     -F "confidence=0.92" \
     -F "bounding_box={\"x\": 200, \"y\": 150, \"w\": 120, \"h\": 250}"
```

---

## 3. UI Dashboard Testing

### 3.1 React Dashboard
- Open the React dashboard at `http://localhost:5173`.
- Verify the **Metric Cards** refresh automatically.
- Check the **Geospatial Map** tab: The marker for `DEV-ESP32-MAIN-001` should change colors from green to yellow/red dynamically as you submit different cURL payloads.
- In **AI Camera Feed**, verify the uploaded object is displayed, showing a bounding box drawn over the image coordinates.

### 3.2 Flutter Application
- Run the Flutter app and log in with the simulation credentials:
  - **Email**: `admin@flood.com`
  - **Password**: `admin123`
- Verify the side navigation drawer loads the Emergency Contacts list and System Alerts notifications properly.
- Verify bottom navigation switches tabs correctly between Overview, Map, Camera, and History logs.
