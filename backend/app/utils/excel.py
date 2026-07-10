import io
from openpyxl import Workbook


def export_to_excel(headers: list, rows: list, sheet_name: str = "Sheet1") -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_name
    ws.append(headers)
    for row in rows:
        ws.append(row)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
