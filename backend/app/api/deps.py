from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import decode_access_token
from app.models.user import User
from app.models.role import Role

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.name != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def get_pharmacist_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.name not in ["Admin", "Pharmacist"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pharmacist or Admin access required")
    return current_user


def get_cashier_or_above(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.name not in ["Admin", "Pharmacist", "Cashier"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return current_user
