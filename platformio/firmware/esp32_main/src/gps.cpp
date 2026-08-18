#include "gps.h"

GpsController::GpsController(uint8_t rx, uint8_t tx, uint32_t baud) 
    : gpsSerial(2) {  // Hardware Serial 2
    rxPin = rx;
    txPin = tx;
    baudRate = baud;
}

void GpsController::begin() {
    // Initialize serial communication
    gpsSerial.begin(baudRate, SERIAL_8N1, rxPin, txPin);
}

void GpsController::update() {
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }
}

GpsData GpsController::getData() {
    GpsData data;
    data.isValid = gps.location.isValid() && gps.location.age() < 2000; // valid if updated in the last 2 seconds
    
    if (data.isValid) {
        data.latitude = gps.location.lat();
        data.longitude = gps.location.lng();
        data.speedKmph = gps.speed.kmph();
    } else {
        // Fallback default coordinates if no lock
        data.latitude = 0.0;
        data.longitude = 0.0;
        data.speedKmph = 0.0;
    }

    if (gps.date.isValid()) {
        data.year = gps.date.year();
        data.month = gps.date.month();
        data.day = gps.date.day();
    } else {
        data.year = 2026;
        data.month = 1;
        data.day = 1;
    }

    if (gps.time.isValid()) {
        data.hour = gps.time.hour();
        data.minute = gps.time.minute();
        data.second = gps.time.second();
    } else {
        data.hour = 0;
        data.minute = 0;
        data.second = 0;
    }

    return data;
}

bool GpsController::hasLock() {
    return gps.location.isValid() && gps.satellites.value() >= 3;
}
