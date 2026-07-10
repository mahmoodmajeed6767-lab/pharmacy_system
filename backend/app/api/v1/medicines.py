from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.medicine import Medicine
from app.models.medicine_category import MedicineCategory
from app.models.user import User
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.api.deps import get_current_user, get_admin_user, get_pharmacist_or_admin
from app.api.v1.notifications import sync_medicine_notifications
from app.utils.qr import generate_qr_code
from app.utils.excel import export_to_excel
from app.utils.barcode import generate_barcode
from fastapi.responses import StreamingResponse
from typing import List, Optional
import csv, io

router = APIRouter()


@router.get("/", response_model=dict)
def list_medicines(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    expired: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Medicine).filter(Medicine.is_active == 1)
    if search:
        query = query.filter(
            or_(
                Medicine.name.ilike(f"%{search}%"),
                Medicine.barcode.ilike(f"%{search}%"),
                Medicine.sku.ilike(f"%{search}%"),
                Medicine.batch_number.ilike(f"%{search}%"),
            )
        )
    if category_id:
        query = query.filter(Medicine.category_id == category_id)
    if category:
        if category.lower() == "others":
            query = query.filter(Medicine.category_id == None)
        else:
            cat = db.query(MedicineCategory).filter(MedicineCategory.name.ilike(category)).first()
            if not cat:
                query = query.filter(False)
            else:
                query = query.filter(Medicine.category_id == cat.id)
    if low_stock:
        query = query.filter(Medicine.quantity <= Medicine.min_stock)
    if expired:
        from sqlalchemy import func
        query = query.filter(Medicine.expiry_date < func.date('now'))

    total = query.count()
    medicines = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "status": "success",
        "data": [MedicineResponse.model_validate(m).model_dump() for m in medicines],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{medicine_id}", response_model=MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return MedicineResponse.model_validate(medicine)


@router.post("/", response_model=MedicineResponse)
def create_medicine(req: MedicineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_pharmacist_or_admin)):
    if req.barcode and db.query(Medicine).filter(Medicine.barcode == req.barcode).first():
        raise HTTPException(status_code=400, detail="Barcode already exists")
    if req.sku and db.query(Medicine).filter(Medicine.sku == req.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    medicine_data = req.model_dump()
    # Ensure empty strings are converted to None for nullable fields
    for key in ('category_id',):
        if key in medicine_data and medicine_data[key] == '':
            medicine_data[key] = None
    medicine = Medicine(**medicine_data)
    # Generate QR code from barcode or SKU
    qr_data = req.barcode or req.sku or req.name
    medicine.qr_code = generate_qr_code(qr_data)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return MedicineResponse.model_validate(medicine)


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(medicine_id: int, req: MedicineUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_pharmacist_or_admin)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(medicine, field, value)
    db.commit()
    db.refresh(medicine)
    sync_medicine_notifications(db, medicine)
    db.commit()
    return MedicineResponse.model_validate(medicine)


@router.delete("/{medicine_id}")
def delete_medicine(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicine.is_active = 0
    db.commit()
    return {"status": "success", "message": "Medicine deactivated"}


@router.get("/barcode/{barcode}", response_model=MedicineResponse)
def get_by_barcode(barcode: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicine = db.query(Medicine).filter(Medicine.barcode == barcode, Medicine.is_active == 1).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return MedicineResponse.model_validate(medicine)


@router.post("/import-csv")
def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    count = 0
    for row in reader:
        medicine = Medicine(
            name=row.get("name", ""),
            generic_name=row.get("generic_name", ""),
            brand=row.get("brand", ""),
            manufacturer=row.get("manufacturer", ""),
            batch_number=row.get("batch_number", ""),
            barcode=row.get("barcode", ""),
            sku=row.get("sku", ""),
            purchase_price=float(row.get("purchase_price", 0)),
            selling_price=float(row.get("selling_price", 0)),
            quantity=float(row.get("quantity", 0)),
            min_stock=float(row.get("min_stock", 10)),
            expiry_date=row.get("expiry_date", None),
        )
        medicine.qr_code = generate_qr_code(medicine.barcode or medicine.sku or medicine.name)
        db.add(medicine)
        count += 1
    db.commit()
    return {"status": "success", "message": f"Imported {count} medicines"}


@router.get("/export/excel")
def export_excel_medicines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicines = db.query(Medicine).filter(Medicine.is_active == 1).all()
    headers = ["Name", "Generic Name", "Brand", "SKU", "Barcode", "Quantity", "Purchase Price", "Selling Price", "Expiry Date"]
    rows = [[m.name, m.generic_name, m.brand, m.sku, m.barcode, m.quantity, m.purchase_price, m.selling_price, str(m.expiry_date or "")] for m in medicines]
    buffer = export_to_excel(headers, rows, "Medicines")
    return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=medicines.xlsx"})
