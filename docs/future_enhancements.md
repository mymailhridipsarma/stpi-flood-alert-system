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

## 2. Real-world Alerts Integration

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
