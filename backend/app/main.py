from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse  # 👈 Added RedirectResponse import

from app.config import settings
from app.database import engine, Base
from app.api.v1 import auth, users, medicines, categories, suppliers, customers
from app.api.v1 import sales, prescriptions, notifications
from app.api.v1 import reports, dashboard, settings as settings_router, search

# 🚨 DATABASE TABLES CREATE KARNE KE LIYE YAHAN ADD KIYA GAYA HAI 🚨
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")


@app.get("/")
def root():
    return RedirectResponse(url="https://pharmacy-system-lwr6.vercel.app") 


@app.get("/api")
def api_root():
    return {"status": "success", "message": "Pharmacy Management System API", "version": "1.0.0", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "success", "message": "API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pharmacy-system-lwr6.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Static files for uploads
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(medicines.router, prefix="/api/v1/medicines", tags=["Medicines"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Prescriptions"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])