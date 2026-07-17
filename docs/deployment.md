# System Deployment & Installation Guide

This guide outlines step-by-step instructions to compile and deploy the **Smart Water Logging & Flood Alert System**.

---

## 1. Database Setup (Supabase)

1. **Create Project**: Log in to [Supabase Console](https://supabase.com) and create a new project.
2. **Execute SQL Schema**:
   - Go to the **SQL Editor** in the Supabase Sidebar.
   - Click "New Query".
   - Copy the contents of the database schema file [schema.sql](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/backend/schema.sql) and paste it into the editor.
   - Click **Run** to execute and initialize tables, indexes, and initial mock data.
3. **Configure Storage Bucket**:
   - Go to the **Storage** section in the Supabase Sidebar.
   - Click **New Bucket**.
   - Name the bucket `flood-images`.
   - Set the bucket access toggle to **Public** (allowing dashboards to view image links).
   - Click **Save**.

---

## 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd SmartFloodSystem/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Create a `.env` file or export variables:
   ```bash
   SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
   SUPABASE_KEY="YOUR_SUPABASE_SERVICE_ROLE_OR_ANON_KEY"
   JWT_SECRET_KEY="YOUR_SUPER_SECRET_JWT_SIGNING_KEY"
   DEVICE_API_KEY="esp32-super-secret-api-key-2026"
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## 3. Web Dashboard Setup (React + Vite)

1. Navigate to the dashboard directory:
   ```bash
   cd SmartFloodSystem/web_dashboard
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Update API Endpoint Configuration:
   - Edit the base URL in [App.jsx](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/web_dashboard/src/App.jsx) (Line 10) to point to your local machine IP or cloud instance domain.
4. Launch the local dev server:
   ```bash
   npm run dev
   ```

---

## 4. Mobile App Setup (Flutter)

1. Navigate to the mobile app directory:
   ```bash
   cd SmartFloodSystem/mobile_app
   ```
2. Fetch flutter packages:
   ```bash
   flutter pub get
   ```
3. Run the application on a connected device/simulator:
   ```bash
   flutter run
   ```

---

## 5. Firmware Flashing (PlatformIO)

### 5.1 Main ESP32 Node
1. Navigate to `SmartFloodSystem/platformio/firmware/esp32_main`.
2. Edit [config.h](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/platformio/firmware/esp32_main/include/config.h):
   - Replace `WIFI_SSID` and `WIFI_PASSWORD` with your local router credentials.
   - Replace `API_BASE_URL` with the IP address of your FastAPI backend (e.g., `http://192.168.1.50:8000/api/v1`).
3. Connect your **ESP32 DevKit V1** to the USB port.
4. Compile and upload:
   ```bash
   pio run --target upload
   ```

### 5.2 ESP32-CAM Node
1. Navigate to `SmartFloodSystem/platformio/firmware/esp32_cam`.
2. Edit [config.h](file:///Users/hridipsarma/Documents/PlatformIO/Projects/STPI/SmartFloodSystem/platformio/firmware/esp32_cam/include/config.h):
   - Configure local `WIFI_SSID` and `WIFI_PASSWORD`.
   - Configure `API_UPLOAD_URL` pointing to your backend IP (e.g., `http://192.168.1.50:8000/api/v1/object`).
3. Connect your **ESP32-CAM AI Thinker** module (using a FTDI Serial Adapter, bridge GPIO 0 to GND to enter download mode).
4. Compile and upload:
   ```bash
   pio run --target upload
   ```
5. Remove the GPIO 0 to GND bridge and press RESET to boot the camera firmware.
