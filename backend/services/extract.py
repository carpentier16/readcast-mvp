import io, pdfplumber, pytesseract
from PIL import Image
from typing import List

def extract_text_from_pdf(path: str, lang: str = "fra") -> str:
    texts: List[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            txt = page.extract_text() or ""
            if txt.strip():
                texts.append(txt)
            else:
                im = page.to_image(resolution=300).original
                if not isinstance(im, Image.Image):
                    im = Image.open(io.BytesIO(im.tobytes()))
                ocr = pytesseract.image_to_string(im, lang=lang)
                texts.append(ocr)
    return "\n\n".join(texts)
