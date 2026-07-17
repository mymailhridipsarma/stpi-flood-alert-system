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

class ApiClient {
private:
    String baseUrl;
    String apiKey;
    bool spiffsActive;
    const char* cacheFilePath;

public:
    /**
     * Constructor for Web Backend REST API client.
     */
    ApiClient(String url, String key);

    /**
     * Initializes file system storage for offline cache.
     */
    void begin();

    /**
     * Uploads telemetry reading. If connection fails, caches to flash.
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
