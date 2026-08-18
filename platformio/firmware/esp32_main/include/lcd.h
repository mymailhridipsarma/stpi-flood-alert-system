#ifndef LCD_H
#define LCD_H

#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include "led.h"

enum LcdPage {
    PAGE_WATER_STATUS,
    PAGE_GPS,
    PAGE_OBJECTS,
    PAGE_MAX_COUNT
};

class LcdController {
private:
    LiquidCrystal_I2C lcd;
    LcdPage currentPage;
    unsigned long lastRotateTime;
    
    // Telemetry values for screen updates
    float lastWaterCm;
    AlertStatus lastStatus;
    double lastLat;
    double lastLng;
    String lastObjectStr;
    int lastWifiRssi;

public:
    /**
     * Constructor for 16x2 I2C LCD.
     * @param address I2C Address (default 0x27 or 0x3F).
     */
    LcdController(uint8_t address = 0x27);

    /**
     * Initializes LCD display.
     */
    void begin();

    /**
     * Sets telemetry values. Call this to update cache.
     */
    void updateData(float waterCm, AlertStatus status, double lat, double lng, String object, int rssi);

    /**
     * Non-blocking update method. Rotates pages every 5 seconds.
     * Call this inside main loop.
     */
    void loop();

    /**
     * Displays a static notification screen (e.g. WiFi connecting).
     */
    void showMessage(const char* line1, const char* line2);

private:
    /**
     * Draws the active page layout on screen.
     */
    void renderCurrentPage();
};

#endif // LCD_H
