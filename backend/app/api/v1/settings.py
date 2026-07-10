from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setting import Setting
from app.models.user import User
from app.schemas.setting import SettingResponse, SettingUpdate
from app.api.deps import get_current_user, get_admin_user

router = APIRouter()


@router.get("/")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(Setting).all()
    return {
        "status": "success",
        "data": {s.key: s.value for s in settings},
    }


@router.put("/{key}")
def update_setting(key: str, req: SettingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        setting = Setting(key=key, value=req.value)
        db.add(setting)
    else:
        setting.value = req.value
    db.commit()
    return {"status": "success", "message": "Setting updated"}
