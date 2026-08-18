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
    float samples[3];
    int validCount = 0;

    for (int i = 0; i < 3; i++) {
        // Clear trigger pin
        digitalWrite(trigPin, LOW);
        delayMicroseconds(2);

        // Set trigger pin HIGH for 10 microseconds
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);

        // Read echo pin travel duration in microseconds (timeout at ~25ms)
        long duration = pulseIn(echoPin, HIGH, 25000);

        if (duration > 0) {
            float dist = (duration * 0.0343) / 2.0;
            if (dist < 2.0) {
                samples[validCount++] = 0.0;
            } else if (dist <= maxDistanceCm) {
                samples[validCount++] = dist;
            }
        }
        delay(4); // Short acoustic decay pause between burst samples
    }

    if (validCount == 0) {
        return maxDistanceCm; // Safe default max height if out of range or timeout
    }

    // Sort valid samples to obtain median value (filters noise spikes)
    for (int i = 0; i < validCount - 1; i++) {
        for (int j = i + 1; j < validCount; j++) {
            if (samples[i] > samples[j]) {
                float tmp = samples[i];
                samples[i] = samples[j];
                samples[j] = tmp;
            }
        }
    }

    return samples[validCount / 2];
}
