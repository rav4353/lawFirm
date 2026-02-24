"""
PDF Text Extraction Service
Extracts text from PDF files using pdfplumber.
"""

import logging
from pathlib import Path

import pdfplumber

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    Args:
        file_path: Absolute path to the PDF file on disk.

    Returns:
        Combined text from all pages, separated by newlines.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file is not a PDF or extraction yields no text.
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a PDF file, got: {path.suffix}")

    logger.info("Extracting text from PDF: %s", path.name)

    extracted_text = ""
    page_count = 0

    try:
        with pdfplumber.open(path) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
    except Exception as exc:
        logger.error("Failed to extract text from %s: %s", path.name, exc)
        raise ValueError(f"PDF text extraction failed: {exc}") from exc

    extracted_text = extracted_text.strip()

    if not extracted_text:
        logger.warning("No text extracted from %s (%d pages)", path.name, page_count)
        raise ValueError("No text could be extracted from the PDF.")

    logger.info(
        "Extracted %d characters from %d pages of %s",
        len(extracted_text),
        page_count,
        path.name,
    )

    return extracted_text
