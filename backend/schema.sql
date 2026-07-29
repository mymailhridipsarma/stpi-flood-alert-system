-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for registered devices
CREATE TABLE devices (
    device_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'OFFLINE',
    last_latitude DOUBLE PRECISION,
    last_longitude DOUBLE PRECISION,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for water level telemetry status logs
CREATE TABLE status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE CASCADE,
    water_level_cm REAL NOT NULL,
    status VARCHAR(20) NOT NULL, -- SAFE, RISKY, DANGER
    wifi_rssi INTEGER,
    gps_speed REAL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for ESP32-CAM object detection events
CREATE TABLE object_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE CASCADE,
    object_name VARCHAR(50) NOT NULL, -- Person, Car, Bike, etc.
    confidence REAL NOT NULL, -- 0.0 to 1.0
    bounding_box JSONB, -- Coordinates {"x": 10, "y": 20, "w": 50, "h": 50}
    image_url TEXT, -- Uploaded image URL in Supabase Storage
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for system alerts and notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- DANGER_LEVEL, PERSON_DETECTED, VEHICLE_DETECTED
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for speed
CREATE INDEX idx_status_logs_device_recorded ON status_logs(device_id, recorded_at DESC);
CREATE INDEX idx_object_detections_device_detected ON object_detections(device_id, detected_at DESC);
CREATE INDEX idx_alerts_device_created ON alerts(device_id, created_at DESC);

-- Initial Mock Device Insert for testing
INSERT INTO devices (device_id, name, status, last_latitude, last_longitude)
VALUES ('DEV-ESP32-MAIN-001', 'Highway 101 Flood Node', 'ONLINE', 37.7749, -122.4194)
ON CONFLICT (device_id) DO NOTHING;
