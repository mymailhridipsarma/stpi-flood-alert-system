#ifndef API_H
#define API_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "SPIFFS.h"

struct TelemetryReport {
    String deviceId;
    float waterLevelCm;
    String status;
    int wifiRssi;
    float gpsSpeed;
    double latitude;
    double longitude;
};

struct TelemetryPayload {
    char deviceId[32];
    float waterLevelCm;
    char status[16];
    int wifiRssi;
    float gpsSpeed;
    double latitude;
    double longitude;
};

class ApiClient {
private:
    String baseUrl;
    String apiKey;
    bool spiffsActive;
    const char* cacheFilePath;
    QueueHandle_t telemetryQueue;
    TaskHandle_t networkTaskHandle;

    static void networkTaskFunc(void* parameter);

public:
    /**
     * Constructor for Web Backend REST API client.
     */
    ApiClient(String url, String key);

    /**
     * Initializes file system storage for offline cache and async FreeRTOS worker.
     */
    void begin();

    /**
     * Pushes telemetry reading to non-blocking queue for async Core 0 processing.
     */
    bool queueTelemetry(TelemetryReport report);

    /**
     * Uploads telemetry reading directly. If connection fails, caches to flash.
     * @param report Telemetry details.
     */
    bool sendTelemetry(TelemetryReport report);

    /**
     * Uploads GPS location logs.
     */
    bool sendLocation(String deviceId, double lat, double lng, float speed);

    /**
     * Uploads any data stored offline during network outages.
     * Call this inside main loop when internet is verified.
     */
    void uploadOfflineCache();

private:
    /**
     * Saves telemetry data locally when offline.
     */
    void cacheOffline(TelemetryReport report);
};

#endif // API_H
