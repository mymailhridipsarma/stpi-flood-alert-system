# Future Enhancements & System Upgrades

This document outlines features and architectural improvements planned for future system iterations.

---

## 1. Solar & Battery Telemetry Integration

For standalone roadside deployments, the node should be powered by solar energy:

- **Hardware Additions**: 
  - 10W Solar Panel + TP4056 charging module.
  - 18650 Li-ion battery pack (3.7V, 3400mAh).
  - Voltage divider circuit hooked to an ESP32 ADC pin (e.g. GPIO 34) to monitor battery voltage.
- **Firmware Integration**:
  - Read battery voltage and calculate State of Charge (SoC).
  - Add battery percentage to the telemetry upload payload.
- **Dashboard Support**:
  - Display battery health, voltage, and charging state on dashboard cards.

---

## 2. On-Device Edge Impulse Model Deployment

Instead of sending camera frames to the backend for cloud inference, execution can happen locally on the ESP32-CAM to save bandwidth:

1. **Dataset Acquisition**: Collect road water logging images containing cars, people, bikes, and debris.
2. **Model Training**: Upload images to [Edge Impulse Studio](https://edgeimpulse.com), set up an object detection impulse (FOMO - Faster Objects, More Objects) which runs extremely fast on microcontroller architectures.
3. **Firmware Integration**:
   - Download the trained C++ library package from Edge Impulse.
   - Place it inside the `esp32_cam` PlatformIO project's `lib` directory.
   - Modify `camera.cpp` to run local classification on captured frame buffers and print detected obstacles directly onto the Serial TX channel.

---

## 3. Real-world Alerts Integration

Replace SMS and push notification placeholders with operational gateways:

### 3.1 Twilio SMS Broadcast
- In `backend/app/routers/telemetry.py`, initialize the Twilio client using environment credentials:
  ```python
  from twilio.rest import Client
  
  def send_sms_notification(device_id: str, message: str):
      client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
      client.messages.create(
          body=message,
          from_="+15017122661",
          to="+15558675310"
      )
  ```

### 3.2 Firebase Cloud Messaging (FCM)
- Integrate the Firebase Admin SDK inside the FastAPI backend.
- Push warnings using the `/topics/flood_alerts` channel so that all rescue mobile app clients receive push alerts within 1.5 seconds of a DANGER status update.
