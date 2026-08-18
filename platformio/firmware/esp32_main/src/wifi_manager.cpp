#include "wifi_manager.h"
#include <time.h>

WifiManager::WifiManager(const char* wifiSsid, const char* wifiPwd) {
    ssid = wifiSsid;
    password = wifiPwd;
    lastReconnectAttempt = 0;
    isNtpSynced = false;
}

bool WifiManager::begin(uint32_t timeoutMs) {
    Serial.println("\n[WIFI] Configuring WiFi module...");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    unsigned long startMs = millis();
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        if (millis() - startMs >= timeoutMs) {
            Serial.println("\n[WIFI] Connection Timeout!");
            return false;
        }
    }

    Serial.println("\n[WIFI] Connection Established!");
    Serial.print("[WIFI] IP Address: ");
    Serial.println(WiFi.localIP());

    syncTimeNTP();
    return true;
}

void WifiManager::loop() {
    if (!isConnected()) {
        unsigned long now = millis();
        // Reconnect every 10 seconds asynchronously
        if (now - lastReconnectAttempt >= 10000) {
            lastReconnectAttempt = now;
            Serial.println("[WIFI] Connection lost! Reconnecting...");
            WiFi.disconnect();
            WiFi.begin(ssid, password);
        }
    }
}

bool WifiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

int WifiManager::getRSSI() {
    return WiFi.RSSI();
}

void WifiManager::syncTimeNTP() {
    if (!isConnected()) return;

    Serial.println("[NTP] Synchronizing local clock...");
    // Configure NTP server. UTC + 5:30 (India Standard Time) = 19800 seconds
    configTime(19800, 0, "pool.ntp.org", "time.nist.gov");

    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
        Serial.println("[NTP] Clock Sync Successful!");
        isNtpSynced = true;
    } else {
        Serial.println("[NTP] Clock Sync Failed!");
    }
}
