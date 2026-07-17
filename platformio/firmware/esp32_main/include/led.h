#ifndef LED_H
#define LED_H

#include <Arduino.h>

enum AlertStatus {
    STATUS_SAFE,
    STATUS_RISKY,
    STATUS_DANGER,
    STATUS_UNKNOWN
};

class LedController {
private:
    uint8_t greenPin;
    uint8_t yellowPin;
    uint8_t redPin;

public:
    /**
     * Constructor for status LED indicators.
     */
    LedController(uint8_t green, uint8_t yellow, uint8_t red);

    /**
     * Initializes hardware pins.
     */
    void begin();

    /**
     * Set active LED based on current status.
     * @param status Current evaluated level status.
     */
    void setStatus(AlertStatus status);

    /**
     * Turn all indicator LEDs off.
     */
    void turnOffAll();

    /**
     * Run a self-test blink sequence.
     */
    void selfTest();
};

#endif // LED_H
