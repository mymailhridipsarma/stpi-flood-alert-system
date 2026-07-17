#include "api.h"
#include <WiFi.h>
#include <esp_task_wdt.h>

ApiClient::ApiClient(String url, String key) {
    baseUrl = url;
    apiKey = key;
    spiffsActive = false;
    cacheFilePath = "/offline_cache.jsonl";
}

void ApiClient::begin() {
    // Mount SPIFFS with auto-format if corrupted
    if (SPIFFS.begin(true)) {
        spiffsActive = true;
        Serial.println("[SPIFFS] Storage Mounted successfully.");
    } else {
        Serial.println("[SPIFFS] Mount failed! Offline cache disabled.");
    }
}

bool ApiClient::sendTelemetry(TelemetryReport report) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[API] No WiFi connection. Caching telemetry locally.");
        cacheOffline(report);
        return false;
    }

    HTTPClient http;
    String url = baseUrl + "/status";
    http.begin(url);
    
    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", apiKey);

    // Create JSON Payload
    JsonDocument doc;
    doc["device_id"] = report.deviceId;
    doc["water_level_cm"] = report.waterLevelCm;
    doc["status"] = report.status;
    doc["wifi_rssi"] = report.wifiRssi;
    doc["gps_speed"] = report.gpsSpeed;

    String jsonString;
    serializeJson(doc, jsonString);

    Serial.print("[API] Pushing telemetry to: ");
    Serial.println(url);

    int httpResponseCode = http.POST(jsonString);
    bool success = false;

    if (httpResponseCode > 0) {
        Serial.print("[API] Response Code: ");
        Serial.println(httpResponseCode);
        if (httpResponseCode >= 200 && httpResponseCode < 300) {
            success = true;
        }
    } else {
        Serial.print("[API] Error Code: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();

    if (!success) {
        // Cache if server was unreachable or error occurred
        cacheOffline(report);
    }
    return success;
}

bool ApiClient::sendLocation(String deviceId, double lat, double lng, float speed) {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    HTTPClient http;
    // Format parameters query string
    String url = baseUrl + "/location?device_id=" + deviceId + 
                 "&latitude=" + String(lat, 6) + 
                 "&longitude=" + String(lng, 6) + 
                 "&speed=" + String(speed, 2);
                 
    http.begin(url);
    http.addHeader("x-device-key", apiKey);

    Serial.print("[API] Syncing coordinates: ");
    Serial.println(url);

    int httpResponseCode = http.POST("");
    http.end();

    return (httpResponseCode >= 200 && httpResponseCode < 300);
}

void ApiClient::cacheOffline(TelemetryReport report) {
    if (!spiffsActive) return;

    File file = SPIFFS.open(cacheFilePath, FILE_APPEND);
    if (!file) {
        Serial.println("[SPIFFS] Failed to open cache file for appending!");
        return;
    }

    JsonDocument doc;
    doc["device_id"] = report.deviceId;
    doc["water_level_cm"] = report.waterLevelCm;
    doc["status"] = report.status;
    doc["wifi_rssi"] = report.wifiRssi;
    doc["gps_speed"] = report.gpsSpeed;
    doc["latitude"] = report.latitude;
    doc["longitude"] = report.longitude;

    serializeJson(doc, file);
    file.print("\n"); // JSON Lines separation
    file.close();
    Serial.println("[SPIFFS] Telemetry cached successfully.");
}

void ApiClient::uploadOfflineCache() {
    if (!spiffsActive || WiFi.status() != WL_CONNECTED) return;

    if (!SPIFFS.exists(cacheFilePath)) return;

    File file = SPIFFS.open(cacheFilePath, FILE_READ);
    if (!file) return;

    Serial.println("[SPIFFS] Found offline telemetry. Attempting sync...");

    // Create a temporary list of reports to send
    // Since reading and writing to the same file might cause issues, we read all line-by-line first.
    String line;
    int successCount = 0;
    int failCount = 0;
    int maxUploadsPerLoop = 5; // Prevent WDT resets by limiting batch size

    while (file.available() && successCount + failCount < maxUploadsPerLoop) {
        esp_task_wdt_reset(); // Feed the watchdog during long uploads

        line = file.readStringUntil('\n');
        line.trim();
        if (line.length() == 0) continue;

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, line);
        if (!error) {
            TelemetryReport report;
            report.deviceId = doc["device_id"].as<String>();
            report.waterLevelCm = doc["water_level_cm"].as<float>();
            report.status = doc["status"].as<String>();
            report.wifiRssi = doc["wifi_rssi"].as<int>();
            report.gpsSpeed = doc["gps_speed"].as<float>();
            report.latitude = doc["latitude"].as<double>();
            report.longitude = doc["longitude"].as<double>();

            // Try sending log status
            HTTPClient http;
            String url = baseUrl + "/status";
            http.begin(url);
            http.addHeader("Content-Type", "application/json");
            http.addHeader("x-device-key", apiKey);

            String jsonString;
            serializeJson(doc, jsonString);

            int resCode = http.POST(jsonString);
            http.end();

            if (resCode >= 200 && resCode < 300) {
                successCount++;
                // Sync location associated with it if present
                if (report.latitude != 0.0 && report.longitude != 0.0) {
                    sendLocation(report.deviceId, report.latitude, report.longitude, report.gpsSpeed);
                }
            } else {
                failCount++;
            }
        }
    }
    file.close();

    // Clear the cache file
    if (failCount == 0) {
        SPIFFS.remove(cacheFilePath);
        Serial.printf("[SPIFFS] Cache cleared. Successfully synced %d records.\n", successCount);
    } else {
        Serial.printf("[SPIFFS] Cache synced partial. Succeeded: %d, Failed: %d.\n", successCount, failCount);
    }
}
