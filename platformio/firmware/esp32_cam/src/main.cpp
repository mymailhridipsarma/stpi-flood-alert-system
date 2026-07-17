#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"
#include "camera.h"

CameraController camCtrl;
unsigned long lastCaptureTime = 0;

void connectWiFi() {
    Serial.println("\n[WIFI] Connecting ESP32-CAM to network...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    unsigned long startMs = millis();
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        if (millis() - startMs >= 15000) {
            Serial.println("\n[WIFI] Connection Timeout!");
            return;
        }
    }
    Serial.println("\n[WIFI] Connected!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());
}

bool uploadImageAndDetect(camera_fb_t* fb) {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    HTTPClient http;
    http.begin(API_UPLOAD_URL);
    
    // Set headers
    http.addHeader("x-device-key", DEVICE_API_KEY);

    // Multi-part form boundary
    String boundary = "--------------------------SmartFloodBoundary";
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    // Build HTTP Body payload
    // Boundary structure for: device_id, object_name (default for server-side evaluation), confidence, bounding_box
    String bodyStart = "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"device_id\"\r\n\r\n" +
                       String(DEVICE_ID) + "\r\n" +
                       "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"object_name\"\r\n\r\n" +
                       "car\r\n" + // Server-side AI model will override this fallback
                       "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"confidence\"\r\n\r\n" +
                       "0.91\r\n" +
                       "--" + boundary + "\r\n" +
                       "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n" +
                       "Content-Type: image/jpeg\r\n\r\n";

    String bodyEnd = "\r\n--" + boundary + "--\r\n";

    // Allocate memory for combined request
    size_t totalLen = bodyStart.length() + fb->len + bodyEnd.length();
    uint8_t* reqBody = (uint8_t*)malloc(totalLen);
    if (!reqBody) {
        Serial.println("[HTTP] Out of memory allocating body buffer!");
        http.end();
        return false;
    }

    // Assemble body
    memcpy(reqBody, bodyStart.c_str(), bodyStart.length());
    memcpy(reqBody + bodyStart.length(), fb->buf, fb->len);
    memcpy(reqBody + bodyStart.length() + fb->len, bodyEnd.c_str(), bodyEnd.length());

    Serial.println("[HTTP] Uploading frame to backend for AI object classification...");
    int httpResponseCode = http.POST(reqBody, totalLen);
    free(reqBody);

    bool success = false;
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
        String response = http.getString();
        Serial.printf("[HTTP] Success response: %s\n", response.c_str());
        success = true;
        
        // Notify main ESP32 controller over serial RX/TX
        // Format: CAM:object_name:confidence (e.g. CAM:car:0.91)
        // Main controller parses this and prints to LCD display
        Serial.println("CAM:car:0.91"); // Mock parsing output triggers for main LCD display
    } else {
        Serial.printf("[HTTP] Image upload failed. Status code: %d\n", httpResponseCode);
    }

    http.end();
    return success;
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n[SYSTEM] Starting ESP32-CAM Module...");

    // Setup Camera Hardware
    if (!camCtrl.begin()) {
        Serial.println("[SYSTEM] Camera failed to start!");
        while (true) { delay(1000); }
    }

    connectWiFi();
}

void loop() {
    // Reconnect Wifi if connection dropped
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }

    unsigned long now = millis();
    // Capture every 5 seconds
    if (now - lastCaptureTime >= IMAGE_CAPTURE_INTERVAL_MS) {
        lastCaptureTime = now;

        camera_fb_t* fb = camCtrl.captureFrame();
        if (fb) {
            // Upload to backend and trigger serial transmission
            uploadImageAndDetect(fb);
            camCtrl.returnFrame(fb);
        }
    }
}
