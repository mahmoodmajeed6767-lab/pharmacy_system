from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.models.medicine import Medicine
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_user
from datetime import date

router = APIRouter()


def create_notification_if_needed(db: Session, type: str, title: str, message: str, reference_type: str, reference_id: int):
    existing = db.query(Notification).filter(
        Notification.type == type,
        Notification.reference_type == reference_type,
        Notification.reference_id == reference_id,
    ).first()
    if not existing:
        db.add(Notification(
            type=type, title=title, message=message,
            reference_type=reference_type, reference_id=reference_id,
        ))


def resolve_notifications(db: Session, type: str, reference_type: str, reference_id: int):
    """Delete notifications that are no longer relevant (read or unread)."""
    db.query(Notification).filter(
        Notification.type == type,
        Notification.reference_type == reference_type,
        Notification.reference_id == reference_id,
    ).delete()


def sync_medicine_notifications(db: Session, medicine):
    """Create or resolve stock notifications for a single medicine based on current quantity."""
    if medicine.quantity <= 0:
        create_notification_if_needed(
            db, "out_of_stock", "Out of Stock",
            f"{medicine.name} is out of stock.",
            "medicine", medicine.id,
        )
        resolve_notifications(db, "low_stock", "medicine", medicine.id)
    elif medicine.quantity <= medicine.min_stock:
        create_notification_if_needed(
            db, "low_stock", "Low Stock Alert",
            f"{medicine.name} is low on stock ({medicine.quantity:.0f} remaining, min: {medicine.min_stock:.0f}).",
            "medicine", medicine.id,
        )
        resolve_notifications(db, "out_of_stock", "medicine", medicine.id)
    else:
        resolve_notifications(db, "low_stock", "medicine", medicine.id)
        resolve_notifications(db, "out_of_stock", "medicine", medicine.id)
    # Expiry check
    today = date.today()
    if medicine.expiry_date and medicine.expiry_date < today:
        create_notification_if_needed(
            db, "expiry", "Expired Medicine",
            f"{medicine.name} expired on {medicine.expiry_date}.",
            "medicine", medicine.id,
        )
    else:
        resolve_notifications(db, "expiry", "medicine", medicine.id)


def check_and_create_alerts(db: Session):
    """Auto-create/resolve notifications for all medicines."""
    medicines = db.query(Medicine).filter(Medicine.is_active == 1).all()
    for med in medicines:
        sync_medicine_notifications(db, med)
    db.commit()


@router.get("/")
def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_and_create_alerts(db)
    query = db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id.is_(None))
    ).order_by(Notification.created_at.desc())
    total = query.count()
    notifications = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [NotificationResponse.model_validate(n).model_dump() for n in notifications],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success", "message": "Marked as read"}


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_and_create_alerts(db)
    count = db.query(Notification).filter(
        (Notification.user_id == current_user.id) | (Notification.user_id.is_(None)),
        Notification.is_read == False,
    ).count()
    return {"status": "success", "data": {"count": count}}
