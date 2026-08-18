#include "lcd.h"

LcdController::LcdController(uint8_t address) 
    : lcd(address, 16, 2) {
    currentPage = PAGE_WATER_STATUS;
    lastRotateTime = 0;
    lastWaterCm = 0.0;
    lastStatus = STATUS_UNKNOWN;
    lastLat = 0.0;
    lastLng = 0.0;
    lastObjectStr = "None";
    lastWifiRssi = -99;
}

void LcdController::begin() {
    lcd.init();
    lcd.backlight();
    showMessage("AquaPulse Node", "Initializing...");
}

void LcdController::updateData(float waterCm, AlertStatus status, double lat, double lng, String object, int rssi) {
    lastWaterCm = waterCm;
    lastStatus = status;
    lastLat = lat;
    lastLng = lng;
    if (object.length() > 0) {
        lastObjectStr = object;
    }
    lastWifiRssi = rssi;
    
    // Immediately render updated water level & status synchronously
    renderCurrentPage();
}

void LcdController::loop() {
    // Continuous loop check - renderCurrentPage uses string comparison to avoid flicker
    renderCurrentPage();
}

void LcdController::showMessage(const char* line1, const char* line2) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
}

void LcdController::renderCurrentPage() {
    char buf1[17];
    char buf2[17];
    static char prevBuf1[17] = "";
    static char prevBuf2[17] = "";

    const char* statusStr = "SAFE  ";
    if (lastStatus == STATUS_RISKY) {
        statusStr = "RISKY ";
    } else if (lastStatus == STATUS_DANGER) {
        statusStr = "DANGER";
    } else if (lastStatus == STATUS_UNKNOWN) {
        statusStr = "WAIT..";
    }

    // Line 1: AquaPulse  <STATUS> (exactly 16 chars)
    snprintf(buf1, sizeof(buf1), "AquaPulse %-6s", statusStr);

    // Line 2: Water: X.X cm (cleanly formatted without spaces inside number)
    if (lastWaterCm < 0) {
        snprintf(buf2, sizeof(buf2), "Water: ERROR   ");
    } else {
        char valStr[8];
        dtostrf(lastWaterCm, 1, 1, valStr); // Format e.g. "0.0" or "12.5"
        snprintf(buf2, sizeof(buf2), "Water: %s cm    ", valStr);
        buf2[16] = '\0'; // Ensure exact 16 char termination
    }

    // Differential hardware update: Only write to I2C LCD lines if text actually changed!
    if (strcmp(prevBuf1, buf1) != 0) {
        strcpy(prevBuf1, buf1);
        lcd.setCursor(0, 0);
        lcd.print(buf1);
    }

    if (strcmp(prevBuf2, buf2) != 0) {
        strcpy(prevBuf2, buf2);
        lcd.setCursor(0, 1);
        lcd.print(buf2);
    }
}
