#include "led.h"

LedController::LedController(uint8_t green, uint8_t yellow, uint8_t red) {
    greenPin = green;
    yellowPin = yellow;
    redPin = red;
}

void LedController::begin() {
    pinMode(greenPin, OUTPUT);
    pinMode(yellowPin, OUTPUT);
    pinMode(redPin, OUTPUT);
    turnOffAll();
}

void LedController::turnOffAll() {
    digitalWrite(greenPin, LOW);
    digitalWrite(yellowPin, LOW);
    digitalWrite(redPin, LOW);
}

void LedController::setStatus(AlertStatus status) {
    turnOffAll();
    switch (status) {
        case STATUS_SAFE:
            digitalWrite(greenPin, HIGH);
            break;
        case STATUS_RISKY:
            digitalWrite(yellowPin, HIGH);
            break;
        case STATUS_DANGER:
            digitalWrite(redPin, HIGH);
            break;
        default:
            // Blink all as an error code
            for (int i = 0; i < 3; i++) {
                digitalWrite(greenPin, HIGH);
                digitalWrite(yellowPin, HIGH);
                digitalWrite(redPin, HIGH);
                delay(200);
                turnOffAll();
                delay(200);
            }
            break;
    }
}

void LedController::selfTest() {
    digitalWrite(greenPin, HIGH);
    delay(300);
    digitalWrite(greenPin, LOW);
    
    digitalWrite(yellowPin, HIGH);
    delay(300);
    digitalWrite(yellowPin, LOW);
    
    digitalWrite(redPin, HIGH);
    delay(300);
    digitalWrite(redPin, LOW);
}
