#ifndef CONFIG_H
#define CONFIG_H

// Device Configuration
#define DEVICE_ID "DEV-ESP32-CAM-001"

// WiFi Credentials
#define WIFI_SSID "Your_WiFi_SSID"
#define WIFI_PASSWORD "Your_WiFi_Password"

// API configuration
#define API_UPLOAD_URL "http://YOUR_BACKEND_IP:8000/api/v1/object"
#define DEVICE_API_KEY "esp32-super-secret-api-key-2026"

// Camera Capture Intervals
#define IMAGE_CAPTURE_INTERVAL_MS 5000

// ESP32-CAM AI Thinker Pin Definitions
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#endif // CONFIG_H
