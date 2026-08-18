from fastapi import APIRouter, HTTPException, Depends, Header, status, UploadFile, File, Form
from app.models.telemetry import StatusLogCreate, AlertCreate, AlertResponse
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
    Runs emergency rules logic. If water is in DANGER status, trigger emergency alert notifications.
    """
    if current_status.upper() != "DANGER":
        return

    try:
        alert_msg = f"EMERGENCY: Water level is in DANGER zone (Water Level: {current_water_level}cm)!"
        send_push_notification(device_id, "EMERGENCY FLOOD ALERT", alert_msg)
        send_sms_notification(device_id, alert_msg)
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
                telegram_msg = (
                    "<b>🚨 AquaPulse Emergency Flood Alert 🚨</b>\n\n"
                    f"<b>System Node:</b> AquaPulse Flood Node ({log.device_id})\n"
                    f"<b>Alert Level:</b> DANGER 🔴\n"
                    f"<b>Water Level:</b> {log.water_level_cm:.1f} cm\n"
                    f"<b>Timestamp:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}\n\n"
                    "⚠️ <i>IMMEDIATE ACTION REQUIRED! Water level has reached critical flood depth. Avoid hazardous road segments!</i>"
                )
                send_telegram_notification(telegram_msg)

        elif log.status.upper() == "SAFE" or log.status.upper() == "RISKY":
            # Resolve existing danger alerts automatically
            supabase_client.table("alerts") \
                .update({"resolved": True, "resolved_at": "now()"}) \
                .eq("device_id", log.device_id) \
                .eq("alert_type", "DANGER_LEVEL") \
                .eq("resolved", False) \
                .execute()

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

