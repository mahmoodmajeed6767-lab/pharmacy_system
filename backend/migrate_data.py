import sqlite3
import pymysql
from sqlalchemy import create_engine, inspect, text
# Apne models/database setup se Base import karein
from app.database import Base, engine as app_mysql_engine 

# 1. Database Connections Setup
SQLITE_DB_PATH = "pharmacy.db"  # SQLite db file
MYSQL_URI = "mysql+pymysql://root:@127.0.0.1:3306/pharmacy_system"

print("🚀 Starting Data Migration from SQLite to MySQL...")

# Step A: Ensure all MySQL tables are created first using SQLAlchemy Models
print("🛠️ Creating missing tables in MySQL...")
Base.metadata.create_all(bind=app_mysql_engine)
print("✅ All MySQL tables are ready!\n")

# Engines
sqlite_engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}")
mysql_engine = create_engine(MYSQL_URI)

# Inspectors
sqlite_inspector = inspect(sqlite_engine)
mysql_inspector = inspect(mysql_engine)

sqlite_tables = sqlite_inspector.get_table_names()
mysql_tables = set(mysql_inspector.get_table_names())

print(f"📋 Found tables in SQLite: {sqlite_tables}\n")

with mysql_engine.begin() as mysql_conn:
    # Foreign key checks disable kar rahe hain
    mysql_conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    
    for table in sqlite_tables:
        # Check agar MySQL mein table exist karti hai
        if table not in mysql_tables:
            print(f"⚠️ Table '{table}' does not exist in MySQL. Skipping...")
            continue

        # SQLite se data fetch karein
        with sqlite_engine.connect() as sqlite_conn:
            result = sqlite_conn.execute(text(f"SELECT * FROM `{table}`"))
            rows = result.fetchall()
            keys = result.keys()
            
            if not rows:
                print(f"ℹ️ Table '{table}' is empty. Skipping...")
                continue
            
            data = [dict(zip(keys, row)) for row in rows]
            
            print(f"📦 Transferring {len(data)} records for table: '{table}'...")
            
            # Clear existing data in MySQL
            mysql_conn.execute(text(f"TRUNCATE TABLE `{table}`;"))
            
            # Construct dynamic insert
            columns = ", ".join([f"`{k}`" for k in keys])
            placeholders = ", ".join([f":{k}" for k in keys])
            insert_stmt = text(f"INSERT INTO `{table}` ({columns}) VALUES ({placeholders})")
            
            mysql_conn.execute(insert_stmt, data)
            print(f"✅ Successfully transferred '{table}'!")

    # Foreign key checks re-enable
    mysql_conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))

print("\n🎉 Migration Complete! All SQLite data has been copied to MySQL successfully.")