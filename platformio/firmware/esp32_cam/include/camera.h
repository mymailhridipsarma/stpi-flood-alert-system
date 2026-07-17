#ifndef CAMERA_H
#define CAMERA_H

#include "esp_camera.h"

class CameraController {
public:
    /**
     * Initializes the OV2640 camera using the pins specified in config.h.
     */
    bool begin();

    /**
     * Captures a single frame from the camera buffer.
     * Caller is responsible for returning the frame buffer using returnFrame().
     */
    camera_fb_t* captureFrame();

    /**
     * Releases memory associated with the captured frame.
     */
    void returnFrame(camera_fb_t* fb);
};

#endif // CAMERA_H
