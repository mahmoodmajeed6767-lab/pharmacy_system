import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models.role import Role
from app.models.user import User
from app.models.setting import Setting
from app.utils.security import hash_password


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Role).first():
            print("Database already seeded.")
            return

        roles = [
            Role(name="Admin", description="Full system access", permissions={
                "users": ["create", "read", "update", "delete"],
                "medicines": ["create", "read", "update", "delete"],
                "suppliers": ["create", "read", "update", "delete"],
                "customers": ["create", "read", "update", "delete"],
                "sales": ["create", "read", "update", "delete"],
                "prescriptions": ["create", "read", "update", "delete"],
                "reports": ["read"],
                "settings": ["create", "read", "update", "delete"],
                "dashboard": ["read"],
            }),
            Role(name="Pharmacist", description="Can sell, manage inventory, view prescriptions", permissions={
                "medicines": ["read", "update"],
                "suppliers": ["read"],
                "customers": ["create", "read", "update"],
                "sales": ["create", "read"],
                "prescriptions": ["create", "read", "update"],
                "reports": ["read"],
                "dashboard": ["read"],
            }),
            Role(name="Cashier", description="Can create bills and accept payments", permissions={
                "medicines": ["read"],
                "customers": ["read"],
                "sales": ["create", "read"],
                "dashboard": ["read"],
            }),
        ]
        db.add_all(roles)
        db.flush()

        admin = User(
            username="admin",
            email="admin@pharmacy.com",
            password_hash=hash_password("admin123"),
            full_name="System Administrator",
            phone="+1234567890",
            is_active=True,
            role_id=roles[0].id,
        )
        db.add(admin)
        db.flush()

        settings = [
            Setting(key="pharmacy_name", value="City Pharmacy", group="general"),
            Setting(key="pharmacy_logo", value="", group="general"),
            Setting(key="pharmacy_address", value="123 Main Street", group="general"),
            Setting(key="pharmacy_phone", value="+1234567890", group="general"),
            Setting(key="pharmacy_email", value="info@citypharmacy.com", group="general"),
            Setting(key="currency", value="USD", group="general"),
            Setting(key="tax_percentage", value="10", group="invoice"),
            Setting(key="invoice_prefix", value="INV-", group="invoice"),
        ]
        db.add_all(settings)
        db.commit()
        print("Database seeded successfully!")
        print(f"Admin user: admin / admin123")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
