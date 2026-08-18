from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.models.device import DeviceCreate, DeviceUpdate, DeviceResponse
from app.database import supabase_client
from app.config import settings
from typing import List, Optional

router = APIRouter(prefix="/device", tags=["devices"])

def verify_device_key(x_device_key: Optional[str] = Header(None)):
    """
    Dependency to verify device requests using a simple shared secret.
    """
    if not x_device_key or x_device_key != settings.DEVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing device API key."
        )
    return x_device_key

@router.post("/register", response_model=DeviceResponse)
async def register_device(device: DeviceCreate, _=Depends(verify_device_key)):
    """
    Registers a new ESP32 telemetry node device or updates its online state.
    """
    try:
        # Check if device exists
        existing = supabase_client.table("devices").select("*").eq("device_id", device.device_id).execute()
        if existing.data:
            # Update status to ONLINE
            res = supabase_client.table("devices").update({
                "name": device.name,
                "status": "ONLINE",
                "last_seen": "now()"
            }).eq("device_id", device.device_id).execute()
        else:
            # Insert new
            res = supabase_client.table("devices").insert({
                "device_id": device.device_id,
                "name": device.name,
                "status": "ONLINE"
            }).execute()

        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to register device in database.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[DeviceResponse])
async def list_devices():
    """
    Lists all registered devices.
    """
    try:
        res = supabase_client.table("devices").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
