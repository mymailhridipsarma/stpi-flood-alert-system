#include "buzzer.h"

BuzzerController::BuzzerController(uint8_t buzzerPin) {
    pin = buzzerPin;
    isActive = false;
    lastToggleTime = 0;
    toggleState = false;
}

void BuzzerController::begin() {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
}

void BuzzerController::turnOn() {
    digitalWrite(pin, HIGH);
    isActive = true;
}

void BuzzerController::turnOff() {
    digitalWrite(pin, LOW);
    isActive = false;
    toggleState = false;
}

void BuzzerController::update(bool isDanger) {
    if (!isDanger) {
        if (isActive) {
            turnOff();
        }
        return;
    }

    // Danger mode: Pulse buzzer every 3 seconds for attention
    unsigned long now = millis();
    // Force immediate buzz when first entering danger mode
    if (!isActive) {
        lastToggleTime = now;
        toggleState = true;
        digitalWrite(pin, HIGH);
        isActive = true;
    } else if (now - lastToggleTime >= 3000) {
        lastToggleTime = now;
        toggleState = !toggleState;
        digitalWrite(pin, toggleState ? HIGH : LOW);
    }
}
