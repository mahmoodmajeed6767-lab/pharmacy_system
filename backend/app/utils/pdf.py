import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer


CURRENCY_SYMBOLS = {
    "PKR": "Rs.",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "INR": "₹",
    "BDT": "৳",
    "AED": "د.إ",
    "SAR": "﷼",
}


def generate_invoice_pdf(sale, pharmacy_name="Pharmacy", currency="PKR"):
    sym = CURRENCY_SYMBOLS.get(currency.upper(), currency + " ")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"<b>{pharmacy_name}</b>", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Invoice: {sale.invoice_number}", styles["Heading2"]))
    elements.append(Paragraph(f"Date: {sale.created_at.strftime('%Y-%m-%d %H:%M') if hasattr(sale.created_at, 'strftime') else sale.created_at}", styles["Normal"]))
    if sale.customer:
        elements.append(Paragraph(f"Customer: {sale.customer.name}", styles["Normal"]))
    if sale.payment_method:
        elements.append(Paragraph(f"Payment: {sale.payment_method.replace('_', ' ').title()}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    data = [["Item", "Qty", "Price", "Disc", "Total"]]
    for item in sale.items:
        name = item.medicine.name if item.medicine else f"Item #{item.medicine_id}"
        data.append([name, str(int(item.quantity)), f"{sym} {item.unit_price:.2f}", f"{sym} {item.discount:.2f}", f"{sym} {item.subtotal:.2f}"])

    t = Table(data, colWidths=[220, 50, 80, 80, 80])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Subtotal: {sym} {sale.subtotal:.2f}", styles["Normal"]))
    elements.append(Paragraph(f"Discount: {sym} {sale.discount:.2f}", styles["Normal"]))
    elements.append(Paragraph(f"Tax: {sym} {sale.tax:.2f}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Total: {sym} {sale.total:.2f}</b>", styles["Heading3"]))
    elements.append(Paragraph(f"Paid: {sym} {sale.paid_amount:.2f}", styles["Normal"]))
    elements.append(Paragraph(f"Change: {sym} {sale.change_amount:.2f}", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer
