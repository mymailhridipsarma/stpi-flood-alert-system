#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class BuzzerController {
private:
    uint8_t pin;
    bool isActive;
    unsigned long lastToggleTime;
    bool toggleState;

public:
    /**
     * Constructor for active alarm buzzer.
     * @param buzzerPin HW pin connection.
     */
    BuzzerController(uint8_t buzzerPin);

    /**
     * Initializes buzzer hardware pin.
     */
    void begin();

    /**
     * Enables continuous alarm sound.
     */
    void turnOn();

    /**
     * Disables alarm.
     */
    void turnOff();

    /**
     * Non-blocking update method. Creates a pulsing warning siren.
     * Call this inside the main loop for non-blocking execution.
     * @param status Current evaluated alert status.
     */
    void update(bool isDanger);
};

#endif // BUZZER_H
