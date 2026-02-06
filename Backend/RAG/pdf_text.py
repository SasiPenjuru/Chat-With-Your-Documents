from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Extract and clean text from a PDF file."""
    reader = PdfReader(file_path)
    text = " ".join(page.extract_text() or "" for page in reader.pages)
    return " ".join(text.split())  # Normalize whitespace