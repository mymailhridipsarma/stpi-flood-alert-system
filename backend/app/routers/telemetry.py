from fastapi import APIRouter, HTTPException, Depends, Header, status, UploadFile, File, Form
from app.models.telemetry import StatusLogCreate, ObjectDetectionCreate, AlertCreate, AlertResponse
from app.database import supabase_client
from app.routers.device import verify_device_key
from app.services.telegram import send_telegram_notification
from app.config import settings
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import base64
import json
from datetime import datetime

router = APIRouter(tags=["telemetry"])

# Pydantic models for Telegram config/test
class TelegramTestRequest(BaseModel):
    bot_token: Optional[str] = None
    chat_id: Optional[str] = None

class TelegramConfigRequest(BaseModel):
    bot_token: str
    chat_id: str

# Helpers to trigger alerts
def send_push_notification(device_id: str, title: str, body: str):
    """
    Placeholder/Hook for Firebase Cloud Messaging (FCM) or OneSignal.
    """
    print(f"[PUSH ALERT] Device: {device_id} | Title: {title} | Body: {body}")

def send_sms_notification(device_id: str, message: str):
    """
    Placeholder/Hook for Twilio SMS integration.
    """
    print(f"[SMS ALERT] Device: {device_id} | Message: {message}")

async def evaluate_emergency_rules(device_id: str, current_water_level: float, current_status: str):
    """
    Runs emergency rules logic. If water is in DANGER status, check recent object detections.
    If a Person or Vehicle was recently detected (within the last 30 seconds), trigger an immediate Emergency Alert.
    """
    if current_status.upper() != "DANGER":
        return

    try:
        # Check database for objects detected within the last 30 seconds
        time_limit = datetime.utcnow()
        # Query object_detections for this device
        detections_res = supabase_client.table("object_detections") \
            .select("*") \
            .eq("device_id", device_id) \
            .order("detected_at", desc=True) \
            .limit(5) \
            .execute()
        
        objects = detections_res.data
        if not objects:
            return

        emergency_objects = ["person", "car", "bike", "bus", "truck", "motorcycle", "bicycle"]
        
        for obj in objects:
            # Parse detected_at timestamp and check if within 30 seconds
            detected_time = datetime.fromisoformat(obj["detected_at"].replace("Z", "+00:00"))
            time_diff = (datetime.now(detected_time.tzinfo) - detected_time).total_seconds()
            
            if time_diff <= 30.0 and obj["object_name"].lower() in emergency_objects:
                alert_msg = f"EMERGENCY: {obj['object_name'].upper()} detected in DANGER zone (Water Level: {current_water_level}cm)!"
                
                # Insert Alert into database
                supabase_client.table("alerts").insert({
                    "device_id": device_id,
                    "alert_type": "EMERGENCY_OBSTACLE",
                    "message": alert_msg
                }).execute()
                
                # Trigger Push, SMS, and Telegram
                send_push_notification(device_id, "EMERGENCY FLOOD OBSTACLE", alert_msg)
                send_sms_notification(device_id, alert_msg)
                send_telegram_notification(f"<b>⚠️ EMERGENCY FLOOD OBSTACLE</b>\n\n{alert_msg}")
                break
    except Exception as e:
        print(f"Error evaluating emergency rules: {str(e)}")


# ---------------------------------------------------------
# Telemetry Endpoints
# ---------------------------------------------------------

@router.post("/status")
async def post_status(log: StatusLogCreate, _=Depends(verify_device_key)):
    """
    Upload status from ESP32. Updates status logs.
    """
    try:
        # Insert log
        res = supabase_client.table("status_logs").insert({
            "device_id": log.device_id,
            "water_level_cm": log.water_level_cm,
            "status": log.status,
            "wifi_rssi": log.wifi_rssi,
            "gps_speed": log.gps_speed
        }).execute()

        # Update last seen and device status
        supabase_client.table("devices").update({
            "status": log.status.upper(),
            "last_seen": "now()"
        }).eq("device_id", log.device_id).execute()

        # Evaluate rules for warning/danger
        if log.status.upper() == "DANGER":
            alert_msg = f"DANGER: Water level is critical at {log.water_level_cm} cm!"
            # Avoid duplicate active alerts: check if alert is already active
            active = supabase_client.table("alerts") \
                .select("*") \
                .eq("device_id", log.device_id) \
                .eq("alert_type", "DANGER_LEVEL") \
                .eq("resolved", False) \
                .execute()
            
            if not active.data:
                supabase_client.table("alerts").insert({
                    "device_id": log.device_id,
                    "alert_type": "DANGER_LEVEL",
                    "message": alert_msg
                }).execute()
                send_push_notification(log.device_id, "CRITICAL WATER LEVEL", alert_msg)
                send_sms_notification(log.device_id, alert_msg)
                send_telegram_notification(
                    f"<b>🚨 CRITICAL WATER LEVEL ALERT</b>\n\n"
                    f"<b>Device:</b> {log.device_id}\n"
                    f"<b>Water Level:</b> {log.water_level_cm} cm\n"
                    f"<b>Status:</b> CRITICAL DANGER\n"
                    f"<b>Timestamp:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                )

        elif log.status.upper() == "SAFE" or log.status.upper() == "RISKY":
            # Resolve existing danger alerts automatically
            supabase_client.table("alerts") \
                .update({"resolved": True, "resolved_at": "now()"}) \
                .eq("device_id", log.device_id) \
                .eq("alert_type", "DANGER_LEVEL") \
                .eq("resolved", False) \
                .execute()

        # Check emergency rules for vehicles/persons
        await evaluate_emergency_rules(log.device_id, log.water_level_cm, log.status)

        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/location")
async def post_location(
    device_id: str, 
    latitude: float, 
    longitude: float, 
    speed: Optional[float] = 0.0,
    _=Depends(verify_device_key)
):
    """
    Update ESP32 GPS location coordinates.
    """
    try:
        res = supabase_client.table("devices").update({
            "last_latitude": latitude,
            "last_longitude": longitude,
            "last_seen": "now()"
        }).eq("device_id", device_id).execute()

        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/object")
async def post_object_detection(
    device_id: str = Form(...),
    object_name: str = Form(...),
    confidence: float = Form(...),
    bounding_box: Optional[str] = Form(None),  # JSON string e.g. '{"x": 10, "y": 20}'
    image: Optional[UploadFile] = File(None),
    _=Depends(verify_device_key)
):
    """
    ESP32-CAM upload endpoint for object detection events, with optional file attachment.
    """
    try:
        image_url = None
        
        # If an image file is uploaded, store it in Supabase Storage bucket 'flood-images'
        if image:
            filename = f"{device_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{image.filename}"
            file_data = await image.read()
            
            # Upload to bucket
            # Note: Bucket 'flood-images' should be configured in Supabase Storage with public access
            storage_res = supabase_client.storage.from_("flood-images").upload(
                path=filename,
                file=file_data,
                file_options={"content-type": image.content_type}
            )
            # Retrieve public URL
            image_url = supabase_client.storage.from_("flood-images").get_public_url(filename)

        bbox_json = None
        if bounding_box:
            try:
                bbox_json = json.loads(bounding_box)
            except Exception:
                pass

        # Insert detection event
        res = supabase_client.table("object_detections").insert({
            "device_id": device_id,
            "object_name": object_name,
            "confidence": confidence,
            "bounding_box": bbox_json,
            "image_url": image_url
        }).execute()

        # If object is a person or vehicle, check if current water status is DANGER to trigger instant alert
        device_status_res = supabase_client.table("status_logs") \
            .select("status, water_level_cm") \
            .eq("device_id", device_id) \
            .order("recorded_at", desc=True) \
            .limit(1) \
            .execute()
        
        if device_status_res.data:
            current_status = device_status_res.data[0]["status"]
            current_water = device_status_res.data[0]["water_level_cm"]
            if current_status.upper() == "DANGER":
                emergency_objects = ["person", "car", "bike", "bus", "truck", "motorcycle", "bicycle"]
                if object_name.lower() in emergency_objects:
                    alert_msg = f"EMERGENCY ALERT: {object_name.upper()} detected in DANGER flood waters!"
                    supabase_client.table("alerts").insert({
                        "device_id": device_id,
                        "alert_type": "EMERGENCY_OBSTACLE",
                        "message": alert_msg
                    }).execute()
                    send_push_notification(device_id, "EMERGENCY OBSTACLE", alert_msg)
                    send_sms_notification(device_id, alert_msg)

        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=List[Dict[str, Any]])
async def get_history(device_id: str, limit: Optional[int] = 50):
    """
    Get historical telemetry data for a device.
    """
    try:
        res = supabase_client.table("status_logs") \
            .select("*") \
            .eq("device_id", device_id) \
            .order("recorded_at", desc=True) \
            .limit(limit) \
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(device_id: Optional[str] = None, active_only: Optional[bool] = False):
    """
    Get all alerts. Can be filtered by device and resolution status.
    """
    try:
        query = supabase_client.table("alerts").select("*")
        if device_id:
            query = query.eq("device_id", device_id)
        if active_only:
            query = query.eq("resolved", False)
        
        res = query.order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/resolve/{alert_id}")
async def resolve_alert(alert_id: str):
    """
    Manually mark an alert as resolved.
    """
    try:
        res = supabase_client.table("alerts") \
            .update({"resolved": True, "resolved_at": "now()"}) \
            .eq("id", alert_id) \
            .execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/object/recent", response_model=List[Dict[str, Any]])
async def get_recent_objects(device_id: Optional[str] = None, limit: Optional[int] = 20):
    """
    Get recent object detections.
    """
    try:
        query = supabase_client.table("object_detections").select("*")
        if device_id:
            query = query.eq("device_id", device_id)
        res = query.order("detected_at", desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/telegram/test")
async def test_telegram_alert(req: TelegramTestRequest):
    """
    Send a test Telegram message using configured or provided Bot credentials.
    """
    msg = (
        "<b>🤖 Smart Flood System - Telegram Bot Test</b>\n\n"
        "If you are reading this message, your Telegram Bot integration is <b>SUCCESSFULLY CONNECTED!</b> 🎉\n\n"
        "You will receive automatic alerts here when critical flood levels or obstacles are detected."
    )
    success = send_telegram_notification(msg, bot_token=req.bot_token, chat_id=req.chat_id)
    if success:
        return {"status": "success", "message": "Test notification sent successfully to Telegram!"}
    else:
        raise HTTPException(
            status_code=400, 
            detail="Failed to send Telegram message. Please verify your Bot Token and Chat ID."
        )


@router.post("/telegram/config")
async def save_telegram_config(req: TelegramConfigRequest):
    """
    Update runtime Telegram Bot Token and Chat ID settings.
    """
    settings.TELEGRAM_BOT_TOKEN = req.bot_token.strip()
    settings.TELEGRAM_CHAT_ID = req.chat_id.strip()
    return {
        "status": "success", 
        "message": "Telegram Bot settings updated successfully!",
        "bot_token_set": bool(settings.TELEGRAM_BOT_TOKEN),
        "chat_id_set": bool(settings.TELEGRAM_CHAT_ID)
    }


@router.get("/telegram/config")
async def get_telegram_config():
    """
    Retrieve current Telegram Bot configuration status.
    """
    return {
        "bot_token": settings.TELEGRAM_BOT_TOKEN,
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "configured": bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID)
    }

