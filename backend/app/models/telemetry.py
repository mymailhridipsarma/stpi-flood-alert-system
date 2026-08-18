from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class StatusLogCreate(BaseModel):
    device_id: str
    water_level_cm: float
    status: str  # SAFE, RISKY, DANGER
    wifi_rssi: Optional[int] = None
    gps_speed: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ObjectDetectionCreate(BaseModel):
    device_id: str
    object_name: str
    confidence: float
    bounding_box: Optional[Dict[str, Any]] = None
    image_base64: Optional[str] = None  # To allow direct base64 image uploads

class AlertCreate(BaseModel):
    device_id: str
    alert_type: str  # DANGER_LEVEL, PERSON_DETECTED, VEHICLE_DETECTED
    message: str

class AlertResponse(BaseModel):
    id: str
    device_id: str
    alert_type: str
    message: str
    resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
