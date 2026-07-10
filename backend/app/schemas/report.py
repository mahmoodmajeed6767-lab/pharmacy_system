from pydantic import BaseModel
from typing import Optional
from datetime import date


class ReportRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    report_type: str = "sales"  # sales, purchase, profit, inventory, expired, best_selling
