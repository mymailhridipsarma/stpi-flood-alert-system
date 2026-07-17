#ifndef GPS_H
#define GPS_H

#include <Arduino.h>
#include <TinyGPS++.h>

struct GpsData {
    bool isValid;
    double latitude;
    double longitude;
    float speedKmph;
    uint8_t hour;
    uint8_t minute;
    uint8_t second;
    uint16_t year;
    uint8_t month;
    uint8_t day;
};

class GpsController {
private:
    uint8_t rxPin;
    uint8_t txPin;
    uint32_t baudRate;
    TinyGPSPlus gps;
    HardwareSerial gpsSerial;

public:
    /**
     * Constructor for NEO-6M GPS Module.
     * @param rx Pin connected to GPS TX.
     * @param tx Pin connected to GPS RX.
     * @param baud UART Baudrate (default 9600).
     */
    GpsController(uint8_t rx, uint8_t tx, uint32_t baud = 9600);

    /**
     * Starts the hardware serial connection to GPS.
     */
    void begin();

    /**
     * Feeds incoming characters from serial into parser.
     * Must be called constantly in loop.
     */
    void update();

    /**
     * Returns parsed GPS telemetry data.
     */
    GpsData getData();

    /**
     * Returns true if GPS has a 3D lock.
     */
    bool hasLock();
};

#endif // GPS_H
