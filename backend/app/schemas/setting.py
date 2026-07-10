from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str] = None
    group: str = "general"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SettingUpdate(BaseModel):
    value: str
