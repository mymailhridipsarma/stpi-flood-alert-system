#include "api.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_task_wdt.h>

ApiClient::ApiClient(String url, String key) {
    baseUrl = url;
    apiKey = key;
    spiffsActive = false;
    cacheFilePath = "/offline_cache.jsonl";
    telemetryQueue = NULL;
    networkTaskHandle = NULL;
}

void ApiClient::begin() {
    // Mount SPIFFS with auto-format if corrupted
    if (SPIFFS.begin(true)) {
        spiffsActive = true;
        Serial.println("[SPIFFS] Storage Mounted successfully.");
    } else {
        Serial.println("[SPIFFS] Mount failed! Offline cache disabled.");
    }

    // Create FreeRTOS queue & async upload worker pinned to Core 0
    telemetryQueue = xQueueCreate(5, sizeof(TelemetryPayload));
    if (telemetryQueue != NULL) {
        xTaskCreatePinnedToCore(
            networkTaskFunc,
            "AsyncNetworkTask",
            8192,
            this,
            1,
            &networkTaskHandle,
            0 // Pin to Core 0 so Core 1 is dedicated to real-time sensors
        );
        Serial.println("[API] Non-blocking FreeRTOS async upload task started on Core 0.");
    }
}

bool ApiClient::queueTelemetry(TelemetryReport report) {
    if (telemetryQueue == NULL) {
        return sendTelemetry(report); // Fallback to sync if queue creation failed
    }

    TelemetryPayload payload;
    memset(&payload, 0, sizeof(TelemetryPayload));
    strncpy(payload.deviceId, report.deviceId.c_str(), sizeof(payload.deviceId) - 1);
    payload.waterLevelCm = report.waterLevelCm;
    strncpy(payload.status, report.status.c_str(), sizeof(payload.status) - 1);
    payload.wifiRssi = report.wifiRssi;
    payload.gpsSpeed = report.gpsSpeed;
    payload.latitude = report.latitude;
    payload.longitude = report.longitude;

    // Push to queue non-blocking (0 timeout)
    BaseType_t res = xQueueSend(telemetryQueue, &payload, 0);
    if (res == pdTRUE) {
        Serial.println("[API] Telemetry queued asynchronously (0ms blocking).");
        return true;
    } else {
        Serial.println("[API] Telemetry queue full! Dropping old payload to prevent latency.");
        return false;
    }
}

void ApiClient::networkTaskFunc(void* parameter) {
    ApiClient* client = (ApiClient*)parameter;
    TelemetryPayload payload;

    for (;;) {
        if (xQueueReceive(client->telemetryQueue, &payload, portMAX_DELAY) == pdTRUE) {
            esp_task_wdt_reset();

            TelemetryReport report;
            report.deviceId = String(payload.deviceId);
            report.waterLevelCm = payload.waterLevelCm;
            report.status = String(payload.status);
            report.wifiRssi = payload.wifiRssi;
            report.gpsSpeed = payload.gpsSpeed;
            report.latitude = payload.latitude;
            report.longitude = payload.longitude;

            // Execute network calls asynchronously on Core 0
            client->sendTelemetry(report);

            if (payload.latitude != 0.0 && payload.longitude != 0.0) {
                client->sendLocation(report.deviceId, payload.latitude, payload.longitude, payload.gpsSpeed);
            }
        }
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

bool ApiClient::sendTelemetry(TelemetryReport report) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[API] No WiFi connection. Caching telemetry locally.");
        cacheOffline(report);
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure(); // Skip SSL certificate check for HTTPS Supabase endpoint

    HTTPClient http;
    String url = String(SUPABASE_REST_URL) + "/status_logs";
    http.begin(client, url);
    http.setTimeout(1500); // 1.5s timeout prevents MCU lockup
    
    // Set headers for Supabase REST API
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + String(SUPABASE_ANON_KEY));
    http.addHeader("Prefer", "return=minimal");

    // Create JSON Payload
    JsonDocument doc;
    doc["device_id"] = report.deviceId;
    doc["water_level_cm"] = report.waterLevelCm;
    doc["status"] = report.status;
    doc["wifi_rssi"] = report.wifiRssi;
    doc["gps_speed"] = report.gpsSpeed;

    String jsonString;
    serializeJson(doc, jsonString);

    Serial.print("[API] Pushing telemetry directly to Supabase Cloud: ");
    Serial.println(url);

    int httpResponseCode = http.POST(jsonString);
    bool success = false;

    if (httpResponseCode > 0) {
        Serial.print("[API] Supabase Response Code: ");
        Serial.println(httpResponseCode);
        if (httpResponseCode >= 200 && httpResponseCode < 300) {
            success = true;
        }
    } else {
        Serial.print("[API] Error Code: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();

    // Also update devices table status in Supabase
    if (success) {
        HTTPClient httpDev;
        String devUrl = String(SUPABASE_REST_URL) + "/devices?device_id=eq." + report.deviceId;
        httpDev.begin(client, devUrl);
        httpDev.setTimeout(1500);
        httpDev.addHeader("Content-Type", "application/json");
        httpDev.addHeader("apikey", SUPABASE_ANON_KEY);
        httpDev.addHeader("Authorization", String("Bearer ") + String(SUPABASE_ANON_KEY));
        
        JsonDocument devDoc;
        devDoc["status"] = report.status;
        String devJson;
        serializeJson(devDoc, devJson);
        httpDev.sendRequest("PATCH", (uint8_t*)devJson.c_str(), devJson.length());
        httpDev.end();

        // If status returns to SAFE, instantly resolve active emergency alerts in Supabase
        if (report.status == "SAFE") {
            HTTPClient httpAlert;
            String alertUrl = String(SUPABASE_REST_URL) + "/alerts?device_id=eq." + report.deviceId + "&resolved=eq.false";
            httpAlert.begin(client, alertUrl);
            httpAlert.setTimeout(1500);
            httpAlert.addHeader("Content-Type", "application/json");
            httpAlert.addHeader("apikey", SUPABASE_ANON_KEY);
            httpAlert.addHeader("Authorization", String("Bearer ") + String(SUPABASE_ANON_KEY));

            JsonDocument alertDoc;
            alertDoc["resolved"] = true;
            String alertJson;
            serializeJson(alertDoc, alertJson);
            httpAlert.sendRequest("PATCH", (uint8_t*)alertJson.c_str(), alertJson.length());
            httpAlert.end();
        }
    }

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
    http.setTimeout(1500);
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
