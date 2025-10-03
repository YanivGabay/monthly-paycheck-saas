import logging
from typing import List
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pdf2image import convert_from_path

logger = logging.getLogger(__name__)

class PDFService:
    """Service for PDF manipulation"""
    
    def __init__(self):
        self.default_dpi = 300
    
    def get_total_pages(self, pdf_path: str) -> int:
        """Get total number of pages in a PDF"""
        with open(pdf_path, 'rb') as f:
            reader = PdfReader(f)
            return len(reader.pages)

    def extract_page(self, pdf_path: str, page_number: int, output_path: str):
        """Extract a single page from a PDF and save it"""
        with open(pdf_path, 'rb') as infile:
            reader = PdfReader(infile)
            writer = PdfWriter()
            
            # Page numbers are 0-indexed in pypdf
            writer.add_page(reader.pages[page_number - 1])
            
            with open(output_path, 'wb') as outfile:
                writer.write(outfile)
                
    def convert_to_image(self, pdf_path: str, page_number: int, dpi: int = 300):
        """Convert PDF to list of PIL Images"""
        try:
            dpi = dpi or self.default_dpi
            images = convert_from_path(pdf_path, dpi=dpi)
            logger.info(f"✅ Converted PDF to {len(images)} images at {dpi} DPI")
            return images
        except Exception as e:
            logger.error(f"❌ Error converting PDF: {e}")
            raise
    
    def get_page_count(self, pdf_path: str) -> int:
        """Get number of pages in PDF"""
        try:
            images = self.convert_to_images(pdf_path)
            return len(images)
        except Exception as e:
            logger.error(f"❌ Error getting page count: {e}")
            return 0 