# API Reference & Documentation

The system backend uses **FastAPI** to expose REST APIs for telemetry upload, camera AI sync, web dashboards, and mobile clients.

All API routes are prefixed with `/api/v1`.

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Route**: `POST /auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

### 1.2 User Login
- **Route**: `POST /auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

---

## 2. Device Endpoints

### 2.1 Register/Ping Device
- **Route**: `POST /device/register`
- **Headers**: `x-device-key: esp32-super-secret-api-key-2026`
- **Request Body**:
```json
{
  "device_id": "DEV-ESP32-MAIN-001",
  "name": "Highway 101 Flood Node"
}
```
- **Response (200 OK)**:
```json
{
  "device_id": "DEV-ESP32-MAIN-001",
  "name": "Highway 101 Flood Node",
  "status": "ONLINE",
  "last_latitude": 37.7749,
  "last_longitude": -122.4194,
  "last_seen": "2026-07-15T11:45:00.000Z"
}
```

### 2.2 List Registered Devices
- **Route**: `GET /device/list`
- **Response (200 OK)**:
```json
[
  {
    "device_id": "DEV-ESP32-MAIN-001",
    "name": "Highway 101 Flood Node",
    "status": "ONLINE",
    "last_latitude": 37.7749,
    "last_longitude": -122.4194,
    "last_seen": "2026-07-15T11:45:00.000Z"
  }
]
```

---

## 3. Telemetry & Sensor Endpoints

### 3.1 Upload Telemetry Status
- **Route**: `POST /status`
- **Headers**: `x-device-key: esp32-super-secret-api-key-2026`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "device_id": "DEV-ESP32-MAIN-001",
  "water_level_cm": 22.4,
  "status": "RISKY",
  "wifi_rssi": -68,
  "gps_speed": 12.5
}
```
- **Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "a90b4bc1-2092-4919-9407-3532c5ef2da3",
      "device_id": "DEV-ESP32-MAIN-001",
      "water_level_cm": 22.4,
      "status": "RISKY",
      "wifi_rssi": -68,
      "gps_speed": 12.5,
      "recorded_at": "2026-07-15T11:45:02.000Z"
    }
  ]
}
```

### 3.2 Update Location Coordinates (GPS)
- **Route**: `POST /location`
- **Headers**: `x-device-key: esp32-super-secret-api-key-2026`
- **Query Parameters**:
  - `device_id`: `DEV-ESP32-MAIN-001` (string)
  - `latitude`: `37.7749` (float)
  - `longitude`: `-122.4194` (float)
  - `speed`: `0.0` (float)
- **Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "device_id": "DEV-ESP32-MAIN-001",
      "last_latitude": 37.7749,
      "last_longitude": -122.4194,
      "status": "ONLINE"
    }
  ]
}
```

### 3.3 Get Telemetry History
- **Route**: `GET /history`
- **Query Parameters**:
  - `device_id`: `DEV-ESP32-MAIN-001` (required)
  - `limit`: `50` (optional, default 50)
- **Response (200 OK)**:
```json
[
  {
    "id": "a90b4bc1-2092-4919-9407-3532c5ef2da3",
    "device_id": "DEV-ESP32-MAIN-001",
    "water_level_cm": 22.4,
    "status": "RISKY",
    "wifi_rssi": -68,
    "gps_speed": 12.5,
    "recorded_at": "2026-07-15T11:45:02.000Z"
  }
]
```

---

## 4. ESP32-CAM AI Endpoints

### 4.1 Upload Object Detection Image
- **Route**: `POST /object`
- **Headers**: `x-device-key: esp32-super-secret-api-key-2026`, `Content-Type: multipart/form-data`
- **Form Data Parameters**:
  - `device_id`: `DEV-ESP32-CAM-001` (string)
  - `object_name`: `person` (string)
  - `confidence`: `0.89` (float)
  - `bounding_box`: `{"x": 250, "y": 180, "w": 100, "h": 200}` (JSON string, optional)
  - `image`: `[File Binary Upload]` (optional)
- **Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "e932b-...",
      "device_id": "DEV-ESP32-CAM-001",
      "object_name": "person",
      "confidence": 0.89,
      "image_url": "https://supabase-url.../flood-images/DEV-ESP32-CAM-001_capture.jpg",
      "detected_at": "2026-07-15T11:45:05.000Z"
    }
  ]
}
```

### 4.2 Fetch Recent Object Detections
- **Route**: `GET /object/recent`
- **Query Parameters**:
  - `device_id`: `DEV-ESP32-CAM-001` (optional)
  - `limit`: `20` (optional, default 20)
- **Response (200 OK)**:
```json
[
  {
    "id": "e932b-...",
    "device_id": "DEV-ESP32-CAM-001",
    "object_name": "person",
    "confidence": 0.89,
    "bounding_box": {"x": 250, "y": 180, "w": 100, "h": 200},
    "image_url": "https://supabase-url.../flood-images/DEV-ESP32-CAM-001_capture.jpg",
    "detected_at": "2026-07-15T11:45:05.000Z"
  }
]
```

---

## 5. System Alerts Endpoints

### 5.1 Get Alerts
- **Route**: `GET /alerts`
- **Query Parameters**:
  - `device_id`: `DEV-ESP32-MAIN-001` (optional)
  - `active_only`: `true` (optional, default false)
- **Response (200 OK)**:
```json
[
  {
    "id": "alert-123",
    "device_id": "DEV-ESP32-MAIN-001",
    "alert_type": "DANGER_LEVEL",
    "message": "DANGER: Water level is critical at 34.1 cm!",
    "resolved": false,
    "resolved_at": null,
    "created_at": "2026-07-15T11:45:00.000Z"
  }
]
```

### 5.2 Mark Alert Resolved
- **Route**: `POST /alerts/resolve/{alert_id}`
- **Headers**: `Authorization: Bearer [JWT]`
- **Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "alert-123",
      "resolved": true,
      "resolved_at": "2026-07-15T11:45:10.000Z"
    }
  ]
}
```
