from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceCreate(BaseModel):
    device_id: str
    name: str

class DeviceUpdate(BaseModel):
    status: Optional[str] = None
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None

class DeviceResponse(BaseModel):
    device_id: str
    name: str
    status: str
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    last_seen: datetime
    created_at: datetime

    class Config:
        from_attributes = True
