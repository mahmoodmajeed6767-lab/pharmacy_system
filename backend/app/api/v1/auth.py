from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas.user import LoginRequest, TokenResponse, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, AdminProfileUpdate
from app.api.deps import get_current_user
from datetime import datetime, timezone, timedelta
import secrets

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username, User.is_active == True).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role.name})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(req: AdminProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.current_password and req.new_password:
        if not verify_password(req.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        current_user.password_hash = hash_password(req.new_password)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"status": "success", "message": "If email exists, reset link sent"}
    reset_token = secrets.token_urlsafe(32)
    # In production: send email with reset link
    return {"status": "success", "message": "Reset link sent to email", "reset_token": reset_token}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(req.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"status": "success", "message": "Password reset successfully"}
