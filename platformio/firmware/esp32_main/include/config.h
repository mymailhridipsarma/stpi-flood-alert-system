#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// Device ID
#define DEVICE_ID "DEV-ESP32-MAIN-001"
#define DEVICE_NAME "Highway 101 Flood Node"

// WiFi Credentials
#define WIFI_SSID "STPI"
#define WIFI_PASSWORD "Admin@123"

// API Endpoints
#define API_BASE_URL "http://172.20.10.2:8000/api/v1"
#define DEVICE_API_KEY "esp32-super-secret-api-key-2026"

// Water Level Thresholds (in cm)
#define WATER_SAFE_MAX_CM 15.0
#define WATER_RISKY_MAX_CM 30.0

// Sensor Pins
#define US_TRIG_PIN 5
#define US_ECHO_PIN 18

// GPS Module Pins (Using Hardware Serial 2)
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GPS_BAUDRATE 9600

// LED Indicator Pins
#define LED_GREEN_PIN 12
#define LED_YELLOW_PIN 14
#define LED_RED_PIN 27

// Alarm Indicator Pins
#define BUZZER_PIN 26

// Task Intervals (in milliseconds)
#define SENSOR_READ_INTERVAL 1000
#define API_UPLOAD_INTERVAL 1000
#define LCD_ROTATE_INTERVAL 5000
#define WATCHDOG_TIMEOUT_S 12

#endif // CONFIG_H
