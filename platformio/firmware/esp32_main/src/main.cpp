#include <Arduino.h>
#include <esp_task_wdt.h>

#include "config.h"
#include "sensor.h"
#include "led.h"
#include "buzzer.h"
#include "gps.h"
#include "lcd.h"
#include "wifi_manager.h"
#include "api.h"

// Objects
UltrasonicSensor sensor(US_TRIG_PIN, US_ECHO_PIN);
LedController ledCtrl(LED_GREEN_PIN, LED_YELLOW_PIN, LED_RED_PIN);
BuzzerController buzzerCtrl(BUZZER_PIN);
GpsController gpsCtrl(GPS_RX_PIN, GPS_TX_PIN, GPS_BAUDRATE);
LcdController lcdCtrl(0x27);
WifiManager wifiMgr(WIFI_SSID, WIFI_PASSWORD);
ApiClient apiClient(API_BASE_URL, DEVICE_API_KEY);

// State Variables
float waterLevelCm = 0.0;
AlertStatus currentStatus = STATUS_UNKNOWN;
String detectedObject = "None";
unsigned long lastSensorReadTime = 0;
unsigned long lastApiUploadTime = 0;

// Function declarations
AlertStatus evaluateStatus(float waterCm);
void processSerialCamInput();

void setup() {
    Serial.begin(115200);
    Serial.println("\n[SYSTEM] Starting Smart Water Logging Node...");

    // Initialize Watchdog
    esp_task_wdt_init(WATCHDOG_TIMEOUT_S, true);
    esp_task_wdt_add(NULL); // Add current thread to watchdog monitoring

    // Initialize modules
    ledCtrl.begin();
    ledCtrl.selfTest();
    
    buzzerCtrl.begin();
    sensor.begin();
    gpsCtrl.begin();
    lcdCtrl.begin();
    apiClient.begin();

    // WiFi Setup
    lcdCtrl.showMessage("WiFi Connecting", WIFI_SSID);
    if (wifiMgr.begin()) {
        lcdCtrl.showMessage("System Online", "NTP Synced");
    } else {
        lcdCtrl.showMessage("WiFi Failed", "Offline Mode");
    }
    delay(2000);
}

void loop() {
    // Feed the watchdog
    esp_task_wdt_reset();

    // Update GPS parser
    gpsCtrl.update();

    // Check WiFi reconnection
    wifiMgr.loop();

    // Process serial data from ESP32-CAM if connected
    processSerialCamInput();

    unsigned long now = millis();

    // 1. Measure water level every 1 second
    if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
        lastSensorReadTime = now;
        
        float dist = sensor.readDistanceCm();
        if (dist >= 0) {
            // Level is inverse of distance to bottom (let's assume sensor is at height 50cm)
            // Or directly display the measured height for simplicity as requested:
            // "Measure water level every second. 0-15cm SAFE, 16-30cm RISKY, Above 30cm DANGER"
            // Note: usually, water logging depth is: installation_height - distance_measured.
            // But we will use the user's direct values for logic:
            waterLevelCm = dist; 
            currentStatus = evaluateStatus(waterLevelCm);
        } else {
            currentStatus = STATUS_UNKNOWN;
        }

        // Update indicators
        ledCtrl.setStatus(currentStatus);
    }

    // Update buzzer siren (pulsing in Danger)
    buzzerCtrl.update(currentStatus == STATUS_DANGER);

    // 2. Upload telemetry continuously (every 5 seconds)
    if (now - lastApiUploadTime >= API_UPLOAD_INTERVAL) {
        lastApiUploadTime = now;

        GpsData gpsData = gpsCtrl.getData();

        // Prepare report
        TelemetryReport report;
        report.deviceId = DEVICE_ID;
        report.waterLevelCm = waterLevelCm;
        
        if (currentStatus == STATUS_SAFE) report.status = "SAFE";
        else if (currentStatus == STATUS_RISKY) report.status = "RISKY";
        else if (currentStatus == STATUS_DANGER) report.status = "DANGER";
        else report.status = "UNKNOWN";

        report.wifiRssi = wifiMgr.getRSSI();
        report.gpsSpeed = gpsData.speedKmph;
        report.latitude = gpsData.latitude;
        report.longitude = gpsData.longitude;

        // Perform uploads
        apiClient.sendTelemetry(report);

        if (gpsData.isValid) {
            apiClient.sendLocation(DEVICE_ID, gpsData.latitude, gpsData.longitude, gpsData.speedKmph);
        }

        // Check and upload SPIFFS cache
        apiClient.uploadOfflineCache();

        // Sync LCD Cache values
        lcdCtrl.updateData(
            waterLevelCm, 
            currentStatus, 
            gpsData.latitude, 
            gpsData.longitude, 
            detectedObject, 
            wifiMgr.getRSSI()
        );
    }

    // 3. LCD screen rotation & rendering (every 5s internally)
    lcdCtrl.loop();
}

AlertStatus evaluateStatus(float waterCm) {
    if (waterCm < 0) return STATUS_UNKNOWN;
    // Low distance means water is very close to sensor = DANGER
    if (waterCm <= WATER_SAFE_MAX_CM) return STATUS_DANGER;
    // Medium distance = RISKY
    if (waterCm <= WATER_RISKY_MAX_CM) return STATUS_RISKY;
    // High distance means water is far away = SAFE
    return STATUS_SAFE;
}

void processSerialCamInput() {
    // Check if ESP32-CAM sent object data over Serial interface.
    // Format: CAM:object_name:confidence (e.g. CAM:car:0.94)
    if (Serial.available() > 0) {
        String data = Serial.readStringUntil('\n');
        data.trim();
        if (data.startsWith("CAM:")) {
            int firstColon = data.indexOf(':', 4);
            if (firstColon != -1) {
                String obj = data.substring(4, firstColon);
                String conf = data.substring(firstColon + 1);
                float confidence = conf.toFloat() * 100.0;
                detectedObject = obj + " " + String(confidence, 0) + "%";
                Serial.printf("[CAM UPDATE] Detected: %s\n", detectedObject.c_str());
            }
        }
    }
}
