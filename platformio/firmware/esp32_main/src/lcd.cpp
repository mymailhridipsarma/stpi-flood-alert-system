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
    showMessage("Smart Flood Sys", "Initializing...");
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
}

void LcdController::loop() {
    unsigned long now = millis();
    if (now - lastRotateTime >= 5000) {
        lastRotateTime = now;
        // Cycle page
        currentPage = static_cast<LcdPage>((static_cast<int>(currentPage) + 1) % PAGE_MAX_COUNT);
        lcd.clear();
        renderCurrentPage();
    }
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

    switch (currentPage) {
        case PAGE_WATER_STATUS:
            // Line 1: Water: XX.Xcm
            if (lastWaterCm < 0) {
                snprintf(buf1, sizeof(buf1), "Water: ERROR   ");
            } else {
                snprintf(buf1, sizeof(buf1), "Water: %.1fcm", lastWaterCm);
            }
            // Line 2: Status
            if (lastStatus == STATUS_SAFE) {
                snprintf(buf2, sizeof(buf2), "SAFE TO PASS    ");
            } else if (lastStatus == STATUS_RISKY) {
                snprintf(buf2, sizeof(buf2), "RISKY PASSAGE   ");
            } else if (lastStatus == STATUS_DANGER) {
                snprintf(buf2, sizeof(buf2), "DANGER! SHUTDOWN");
            } else {
                snprintf(buf2, sizeof(buf2), "CALIBRATING...  ");
            }
            break;

        case PAGE_GPS:
            // Line 1: Lat: XX.XXXX
            snprintf(buf1, sizeof(buf1), "Lat: %.5f", lastLat);
            // Line 2: Lng: XX.XXXX
            snprintf(buf2, sizeof(buf2), "Lng: %.5f", lastLng);
            break;

        case PAGE_OBJECTS:
            // Line 1: Object detected
            snprintf(buf1, sizeof(buf1), "Objects Alert:  ");
            // Line 2: Object Details
            snprintf(buf2, sizeof(buf2), "%s", lastObjectStr.substring(0, 16).c_str());
            break;



        default:
            return;
    }

    lcd.setCursor(0, 0);
    lcd.print(buf1);
    lcd.setCursor(0, 1);
    lcd.print(buf2);
}
