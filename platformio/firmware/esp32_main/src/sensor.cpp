#include "sensor.h"

UltrasonicSensor::UltrasonicSensor(uint8_t trig, uint8_t echo) {
    trigPin = trig;
    echoPin = echo;
    maxDistanceCm = 400.0; // AJ-SR04M standard max range is 4.5m
}

void UltrasonicSensor::begin() {
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
    digitalWrite(trigPin, LOW);
}

float UltrasonicSensor::readDistanceCm() {
    // Clear trigger pin
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);

    // Set trigger pin HIGH for 10 microseconds
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // Read the echo pin travel duration in microseconds (timeout at ~30ms)
    long duration = pulseIn(echoPin, HIGH, 30000);

    if (duration == 0) {
        return -1.0; // Timeout or sensor disconnected
    }

    // Sound speed = 340 m/s = 0.034 cm/microsecond
    float distance = (duration * 0.0343) / 2.0;

    // Check bounds
    if (distance > maxDistanceCm) {
        return -1.0; // Reading outside valid operating range
    }
    
    // If distance is extremely low (under 2cm), the object/water is practically touching the sensor.
    // Return 0.0 rather than an error so the system registers it as maximum DANGER instead of UNKNOWN.
    if (distance < 2.0) {
        return 0.0;
    }

    return distance;
}
