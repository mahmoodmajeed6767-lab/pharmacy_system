import io
import barcode
from barcode.writer import ImageWriter


def generate_barcode(code: str) -> str:
    try:
        barcode_class = barcode.get_barcode_class("code128")
        barcode_obj = barcode_class(code, writer=ImageWriter())
        buffer = io.BytesIO()
        barcode_obj.write(buffer)
        buffer.seek(0)
        import base64
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception:
        return ""
