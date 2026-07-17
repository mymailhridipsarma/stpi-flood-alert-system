#ifndef SENSOR_H
#define SENSOR_H

#include <Arduino.h>

class UltrasonicSensor {
private:
    uint8_t trigPin;
    uint8_t echoPin;
    float maxDistanceCm;

public:
    /**
     * Constructor for the AJ-SR04M sensor.
     * @param trig Pin connected to Trig trigger line.
     * @param echo Pin connected to Echo response line.
     */
    UltrasonicSensor(uint8_t trig, uint8_t echo);

    /**
     * Initializer for sensor pins.
     */
    void begin();

    /**
     * Reads distance from the sensor in centimeters.
     * Returns -1.0 if read times out or is invalid.
     */
    float readDistanceCm();
};

#endif // SENSOR_H
