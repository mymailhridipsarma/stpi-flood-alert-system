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
    
    // Immediately render updated water level & status
    renderCurrentPage();
}

void LcdController::loop() {
    // Keep LCD fixed to AquaPulse water level and status screen only (no rotation)
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

    const char* statusStr = "SAFE  ";
    if (lastStatus == STATUS_RISKY) {
        statusStr = "RISKY ";
    } else if (lastStatus == STATUS_DANGER) {
        statusStr = "DANGER";
    } else if (lastStatus == STATUS_UNKNOWN) {
        statusStr = "WAIT..";
    }

    // Line 1: AquaPulse  <STATUS>
    snprintf(buf1, sizeof(buf1), "AquaPulse %-6s", statusStr);

    // Line 2: Water: XX.X cm
    if (lastWaterCm < 0) {
        snprintf(buf2, sizeof(buf2), "Water: ERROR   ");
    } else {
        snprintf(buf2, sizeof(buf2), "Water: %-5.1f cm", lastWaterCm);
    }

    lcd.setCursor(0, 0);
    lcd.print(buf1);
    lcd.setCursor(0, 1);
    lcd.print(buf2);
}
