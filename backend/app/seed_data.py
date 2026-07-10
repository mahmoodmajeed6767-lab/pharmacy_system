"""Add sample data for testing - run after app.seed"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.medicine_category import MedicineCategory
from app.models.medicine import Medicine
from app.models.supplier import Supplier
from app.models.customer import Customer
from app.models.sale import Sale, SaleItem
from app.models.notification import Notification
from app.utils.qr import generate_qr_code
from datetime import date, timedelta
from datetime import datetime
import random, string

db = SessionLocal()

def seed_sample_data():
    if db.query(Medicine).first():
        print("Sample data already exists, skipping.")
        return

    # Categories
    categories = [
        MedicineCategory(name="Antibiotics", description="Antibacterial medications"),
        MedicineCategory(name="Pain Relief", description="Analgesics and pain killers"),
        MedicineCategory(name="Cold & Flu", description="Cold, cough, and flu medicines"),
        MedicineCategory(name="Blood Pressure", description="Antihypertensive medications"),
        MedicineCategory(name="Diabetes", description="Diabetes management medications"),
        MedicineCategory(name="Vitamins & Supplements", description="Vitamins, minerals, and health supplements"),
        MedicineCategory(name="Allergy", description="Antihistamines and allergy relief"),
        MedicineCategory(name="Digestive Health", description="Stomach and digestive medications"),
    ]
    db.add_all(categories)
    db.flush()

    # Suppliers
    suppliers = [
        Supplier(company_name="MediSupply Corp", contact_person="John Smith", phone="+1-555-0101", email="john@medisupply.com", address="123 Industry Blvd, New York, NY"),
        Supplier(company_name="PharmaWorld Ltd", contact_person="Sarah Johnson", phone="+1-555-0102", email="sarah@pharmaworld.com", address="456 Health Ave, Los Angeles, CA"),
        Supplier(company_name="HealthPlus Distributors", contact_person="Mike Chen", phone="+1-555-0103", email="mike@healthplus.com", address="789 Medical Dr, Chicago, IL"),
        Supplier(company_name="Global Medics Inc", contact_person="Emily Davis", phone="+1-555-0104", email="emily@globalmedics.com", address="321 Pharma St, Houston, TX"),
        Supplier(company_name="CareFirst Pharmaceuticals", contact_person="David Wilson", phone="+1-555-0105", email="david@carefirst.com", address="654 Wellness Way, Miami, FL"),
    ]
    db.add_all(suppliers)
    db.flush()

    # Customers
    customers_data = [
        ("Alice Johnson", "+1-555-1001", "alice@email.com", "123 Oak St, New York, NY", "1990-05-15"),
        ("Bob Williams", "+1-555-1002", "bob@email.com", "456 Pine Rd, Los Angeles, CA", "1985-11-20"),
        ("Carol Martinez", "+1-555-1003", "carol@email.com", "789 Elm Ave, Chicago, IL", "1992-03-08"),
        ("David Brown", "+1-555-1004", "david.b@email.com", "321 Maple Dr, Houston, TX", "1978-07-22"),
        ("Emma Davis", "+1-555-1005", "emma.d@email.com", "654 Birch Ln, Miami, FL", "2000-01-10"),
        ("Frank Thomas", "+1-555-1006", "frank@email.com", "987 Cedar Ct, Phoenix, AZ", "1982-09-30"),
        ("Grace Lee", "+1-555-1007", "grace@email.com", "147 Walnut St, Denver, CO", "1995-12-05"),
        ("Henry Wilson", "+1-555-1008", "henry@email.com", "258 Spruce Way, Seattle, WA", "1970-04-18"),
        ("Isabella Taylor", "+1-555-1009", "isabella@email.com", "369 Ash Blvd, Boston, MA", "1988-06-25"),
        ("Jack Anderson", "+1-555-1010", "jack@email.com", "159 Poplar Ave, Dallas, TX", "1998-08-14"),
    ]
    customers = []
    for name, phone, email, addr, dob in customers_data:
        c = Customer(name=name, phone=phone, email=email, address=addr, date_of_birth=date.fromisoformat(dob), gender=random.choice(["Male", "Female"]), loyalty_points=0, total_purchases=0)
        db.add(c)
        customers.append(c)
    db.flush()

    # Medicines
    medicines_data = [
        # (name, generic, brand, category_idx, manufacturer, batch, barcode, sku, purchase_price, selling_price, tax, qty, min_stock, max_stock, expiry_offset_days, rack)
        ("Amoxicillin 500mg", "Amoxicillin", "Amoxil", 0, "MediSupply Corp", "BAT-001", "890123456001", "SKU-AMOX-001", 2.50, 8.99, 5, 200, 20, 500, 365, "A-01"),
        ("Azithromycin 250mg", "Azithromycin", "Zithromax", 0, "PharmaWorld Ltd", "BAT-002", "890123456002", "SKU-AZI-002", 3.00, 12.50, 5, 150, 15, 300, 730, "A-02"),
        ("Ciprofloxacin 500mg", "Ciprofloxacin", "Cipro", 0, "Global Medics Inc", "BAT-003", "890123456003", "SKU-CIP-003", 1.80, 6.99, 5, 180, 20, 400, 540, "A-03"),
        ("Paracetamol 500mg", "Acetaminophen", "Tylenol", 1, "HealthPlus Distributors", "BAT-004", "890123456004", "SKU-PARA-004", 0.80, 3.49, 5, 500, 50, 1000, 1095, "B-01"),
        ("Ibuprofen 400mg", "Ibuprofen", "Advil", 1, "CareFirst Pharmaceuticals", "BAT-005", "890123456005", "SKU-IBU-005", 1.20, 5.99, 5, 350, 30, 600, 730, "B-02"),
        ("Diclofenac Gel 30g", "Diclofenac", "Voltaren", 1, "MediSupply Corp", "BAT-006", "890123456006", "SKU-DIC-006", 2.00, 7.50, 10, 100, 10, 200, 545, "B-03"),
        ("Cetirizine 10mg", "Cetirizine", "Zyrtec", 6, "PharmaWorld Ltd", "BAT-007", "890123456007", "SKU-CET-007", 1.50, 5.49, 5, 250, 20, 400, 730, "C-01"),
        ("Loratadine 10mg", "Loratadine", "Claritin", 6, "Global Medics Inc", "BAT-008", "890123456008", "SKU-LOR-008", 1.60, 6.99, 5, 200, 15, 350, 730, "C-02"),
        ("Amoxicillin 250mg Syrup", "Amoxicillin", "Amoxil", 0, "MediSupply Corp", "BAT-009", "890123456009", "SKU-AMOX-009", 2.00, 6.50, 5, 80, 10, 150, 365, "A-04"),
        ("Omeprazole 20mg", "Omeprazole", "Prilosec", 7, "HealthPlus Distributors", "BAT-010", "890123456010", "SKU-OME-010", 2.20, 8.99, 5, 120, 10, 200, 545, "D-01"),
        ("Metformin 500mg", "Metformin", "Glucophage", 4, "CareFirst Pharmaceuticals", "BAT-011", "890123456011", "SKU-MET-011", 1.50, 4.99, 5, 300, 30, 600, 730, "E-01"),
        ("Amlodipine 5mg", "Amlodipine", "Norvasc", 3, "Global Medics Inc", "BAT-012", "890123456012", "SKU-AML-012", 1.80, 6.49, 5, 280, 20, 500, 730, "F-01"),
        ("Lisinopril 10mg", "Lisinopril", "Zestril", 3, "PharmaWorld Ltd", "BAT-013", "890123456013", "SKU-LIS-013", 1.90, 7.49, 5, 260, 20, 450, 730, "F-02"),
        ("Vitamin D3 1000IU", "Cholecalciferol", "Nature's Bounty", 5, "HealthPlus Distributors", "BAT-014", "890123456014", "SKU-VITD-014", 3.00, 9.99, 5, 400, 40, 800, 1095, "G-01"),
        ("Multivitamin Tablets", "Multivitamin", "Centrum", 5, "CareFirst Pharmaceuticals", "BAT-015", "890123456015", "SKU-MV-015", 5.00, 14.99, 5, 350, 30, 500, 730, "G-02"),
        ("Vitamin C 500mg", "Ascorbic Acid", "Ester-C", 5, "MediSupply Corp", "BAT-016", "890123456016", "SKU-VITC-016", 2.50, 7.99, 5, 300, 25, 500, 730, "G-03"),
        ("Losartan 50mg", "Losartan", "Cozaar", 3, "Global Medics Inc", "BAT-017", "890123456017", "SKU-LOS-017", 2.00, 7.99, 5, 220, 15, 400, 730, "F-03"),
        ("Metoprolol 50mg", "Metoprolol", "Lopressor", 3, "PharmaWorld Ltd", "BAT-018", "890123456018", "SKU-MET-018", 1.70, 6.49, 5, 180, 15, 350, 730, "F-04"),
        ("Atorvastatin 20mg", "Atorvastatin", "Lipitor", 3, "CareFirst Pharmaceuticals", "BAT-019", "890123456019", "SKU-ATO-019", 2.50, 9.99, 5, 240, 20, 400, 730, "F-05"),
        ("Salbutamol Inhaler", "Salbutamol", "Ventolin", 2, "HealthPlus Distributors", "BAT-020", "890123456020", "SKU-SALB-020", 5.00, 18.99, 10, 60, 5, 100, 545, "H-01"),
        ("Fluconazole 150mg", "Fluconazole", "Diflucan", 0, "PharmaWorld Ltd", "BAT-021", "890123456021", "SKU-FLU-021", 3.50, 12.99, 5, 90, 10, 200, 730, "A-05"),
        ("Ranitidine 150mg", "Ranitidine", "Zantac", 7, "MediSupply Corp", "BAT-022", "890123456022", "SKU-RAN-022", 1.20, 4.99, 5, 150, 15, 300, 545, "D-02"),
        ("Aspirin 81mg", "Aspirin", "Bayer", 1, "Global Medics Inc", "BAT-023", "890123456023", "SKU-ASP-023", 0.50, 2.99, 5, 600, 50, 1000, 1095, "B-04"),
        ("Insulin Glargine 100U", "Insulin Glargine", "Lantus", 4, "CareFirst Pharmaceuticals", "BAT-024", "890123456024", "SKU-INS-024", 25.00, 85.00, 10, 40, 5, 80, 365, "E-02"),
        ("Furosemide 40mg", "Furosemide", "Lasix", 3, "HealthPlus Distributors", "BAT-025", "890123456025", "SKU-FUR-025", 1.00, 3.99, 5, 200, 20, 400, 730, "F-06"),
    ]

    medicines = []
    for (name, generic, brand, cat_idx, mfr, batch, barcode, sku, pp, sp, tax, qty, min_stk, max_stk, exp_days, rack) in medicines_data:
        exp_date = date.today() + timedelta(days=exp_days)
        # Make some medicines nearly expired for demo
        if random.random() < 0.1:
            exp_date = date.today() + timedelta(days=random.randint(-30, 30))
        # Make some low stock
        if random.random() < 0.15:
            qty = random.randint(1, max(1, int(min_stk) - 1))
        m = Medicine(
            name=name, generic_name=generic, brand=brand, category_id=categories[cat_idx].id,
            manufacturer=mfr, batch_number=batch, barcode=barcode, sku=sku,
            purchase_price=pp, selling_price=sp, tax=tax,
            quantity=qty, min_stock=min_stk, max_stock=max_stk,
            manufacturing_date=date.today() - timedelta(days=exp_days - 60),
            expiry_date=exp_date, rack_number=rack, is_active=1,
        )
        m.qr_code = generate_qr_code(barcode or sku or name)
        db.add(m)
        medicines.append(m)
    db.flush()

    # Create some sales (transactions)
    for _ in range(20):
        customer = random.choice(customers)
        num_items = random.randint(1, 4)
        items = random.sample(medicines, num_items)
        total = 0
        sale_items = []
        for med in items:
            qty = random.randint(1, 3)
            price = med.selling_price
            subtotal = qty * price
            total += subtotal
            sale_items.append((med, qty, price, subtotal))
        invoice = "SAL-" + datetime.now().strftime("%Y%m%d") + "-" + "".join(random.choices(string.digits, k=4))
        payment = random.choice(["cash", "credit_card", "debit_card", "mobile_wallet"])
        sale = Sale(
            invoice_number=invoice, customer_id=customer.id, user_id=1,
            subtotal=total, total=total, paid_amount=total + random.choice([0, 0, 0, 5, 10]),
            change_amount=random.choice([0, 0, 0, 1.50, 5.00]),
            payment_method=payment, payment_status="paid",
            created_at=datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 12)),
        )
        db.add(sale)
        db.flush()
        for med, qty, price, subtotal in sale_items:
            si = SaleItem(sale_id=sale.id, medicine_id=med.id, quantity=qty, unit_price=price, subtotal=subtotal)
            db.add(si)
            med.quantity -= qty
        customer.total_purchases = (customer.total_purchases or 0) + total
        customer.loyalty_points = (customer.loyalty_points or 0) + (total * 0.01)

    # Create some notifications
    low_stock_meds = db.query(Medicine).filter(Medicine.quantity <= Medicine.min_stock).all()
    for med in low_stock_meds[:3]:
        db.add(Notification(title="Low Stock Alert", message=f"{med.name} is low on stock (only {med.quantity:.0f} remaining)", type="low_stock", reference_type="medicine", reference_id=med.id))
    
    expired_meds = [m for m in medicines if m.expiry_date and m.expiry_date < date.today()]
    for med in expired_meds[:2]:
        db.add(Notification(title="Expired Medicine", message=f"{med.name} has expired ({med.expiry_date})", type="expiry", reference_type="medicine", reference_id=med.id))

    db.add(Notification(title="Welcome!", message="Pharmacy Management System is ready. Start by adding inventory and making sales.", type="info"))

    db.commit()
    print(f"Sample data seeded!")
    print(f"  - {len(categories)} categories")
    print(f"  - {len(medicines)} medicines")
    print(f"  - {len(suppliers)} suppliers")
    print(f"  - {len(customers)} customers")
    print(f"  - 20 sales transactions")
    print(f"  - Notifications created")


if __name__ == "__main__":
    try:
        seed_sample_data()
    finally:
        db.close()
