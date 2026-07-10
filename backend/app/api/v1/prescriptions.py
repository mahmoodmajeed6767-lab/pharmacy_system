from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse
from app.api.deps import get_current_user, get_pharmacist_or_admin, get_admin_user
from typing import Optional
from datetime import datetime
import os, shutil

router = APIRouter()
UPLOAD_DIR = "static/prescriptions"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=dict)
def list_prescriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prescription).order_by(Prescription.created_at.desc())
    if status:
        query = query.filter(Prescription.status == status)
    total = query.count()
    prescriptions = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [PrescriptionResponse.model_validate(p).model_dump() for p in prescriptions],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.post("/", response_model=PrescriptionResponse)
def create_prescription(
    customer_id: int = Form(...),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_pharmacist_or_admin),
):
    image_path = None
    if file:
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        filename = f"pres_{customer_id}_{int(datetime.now().timestamp())}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        image_path = f"/static/prescriptions/{filename}"

    prescription = Prescription(
        customer_id=customer_id,
        uploaded_by=current_user.id,
        image_path=image_path,
        notes=notes,
        status="pending",
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return PrescriptionResponse.model_validate(prescription)


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int,
    req: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_pharmacist_or_admin),
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if req.status in ["approved", "rejected"]:
        prescription.approved_by = current_user.id
    prescription.status = req.status or prescription.status
    prescription.rejection_reason = req.rejection_reason
    db.commit()
    db.refresh(prescription)
    return PrescriptionResponse.model_validate(prescription)
