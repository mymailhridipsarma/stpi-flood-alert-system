#ifndef WIFI_H
#define WIFI_H

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
private:
    const char* ssid;
    const char* password;
    unsigned long lastReconnectAttempt;
    bool isNtpSynced;

public:
    /**
     * Constructor for WiFi Connection Handler.
     * @param ssid WiFi Network Name.
     * @param pwd WiFi Network Password.
     */
    WifiManager(const char* ssid, const char* pwd);

    /**
     * Connects to WiFi network and blocks until established.
     * @param timeoutMs Timeout in milliseconds (default 15s).
     */
    bool begin(uint32_t timeoutMs = 15000);

    /**
     * Non-blocking reconnection checks.
     * Call this inside main loop.
     */
    void loop();

    /**
     * Returns true if WiFi connection is active.
     */
    bool isConnected();

    /**
     * Returns signal strength in dBm.
     */
    int getRSSI();

    /**
     * Configures and synchronizes local time via NTP.
     */
    void syncTimeNTP();
};

#endif // WIFI_H
