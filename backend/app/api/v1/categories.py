from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medicine_category import MedicineCategory
from app.models.user import User
from app.schemas.medicine import MedicineCategoryCreate, MedicineCategoryResponse
from app.api.deps import get_current_user, get_admin_user
from typing import List

router = APIRouter()


@router.get("/", response_model=List[MedicineCategoryResponse])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(MedicineCategory).all()
    return [MedicineCategoryResponse.model_validate(c) for c in categories]


@router.post("/", response_model=MedicineCategoryResponse)
def create_category(req: MedicineCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    if db.query(MedicineCategory).filter(MedicineCategory.name == req.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = MedicineCategory(name=req.name, description=req.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return MedicineCategoryResponse.model_validate(cat)


@router.put("/{category_id}", response_model=MedicineCategoryResponse)
def update_category(category_id: int, req: MedicineCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    cat = db.query(MedicineCategory).filter(MedicineCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.name = req.name
    cat.description = req.description
    db.commit()
    db.refresh(cat)
    return MedicineCategoryResponse.model_validate(cat)


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    cat = db.query(MedicineCategory).filter(MedicineCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"status": "success", "message": "Category deleted"}
