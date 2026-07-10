"""Add pharmacist and cashier users"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.utils.security import hash_password

db = SessionLocal()
users_created = []

role = db.query(Role).filter(Role.name == "Pharmacist").first()
if role:
    if not db.query(User).filter(User.username == "pharmacist").first():
        db.add(User(
            username="pharmacist", email="pharmacist@pharmacy.com",
            password_hash=hash_password("pharmacist123"),
            full_name="Pharmacist User", phone="+1234567891",
            is_active=True, role_id=role.id,
        ))
        users_created.append("pharmacist / pharmacist123")

role = db.query(Role).filter(Role.name == "Cashier").first()
if role:
    if not db.query(User).filter(User.username == "cashier").first():
        db.add(User(
            username="cashier", email="cashier@pharmacy.com",
            password_hash=hash_password("cashier123"),
            full_name="Cashier User", phone="+1234567892",
            is_active=True, role_id=role.id,
        ))
        users_created.append("cashier / cashier123")

db.commit()

for u in db.query(User).all():
    print(f"  {u.username:15s} / {u.role.name if u.role else '?'}")

db.close()

if users_created:
    print(f"\nCreated: {', '.join(users_created)}")
else:
    print("\nUsers already exist.")
