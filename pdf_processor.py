import os
import re
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple
import pypdf
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from rapidfuzz import fuzz
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HebrewNameExtractor:
    def __init__(self):
        # Common Hebrew names (first and last names) - you can expand this list
        self.hebrew_names = [
            # First names
            "יוסף", "משה", "אברהם", "יצחק", "יעקב", "דוד", "שלמה", "אהרן",
            "מרים", "שרה", "רבקה", "רחל", "לאה", "דינה", "תמר", "חנה",
            "אבינועם", "אביגיל", "איתן", "אליהו", "אמיר", "ארי", "בן",
            "גל", "דן", "זהר", "חיים", "טל", "יונתן", "כפיר", "לוי",
            "מאיר", "נתן", "סתיו", "עמוס", "פנינה", "צבי", "קרן", "רן",
            "שי", "תום", "עדי", "נועה", "מיכל", "הדר", "רות", "עינת",
            
            # Common last names 
            "כהן", "לוי", "מיכאל", "דוד", "אברהם", "יוסף", "חיים", "משה",
            "שלמה", "אליהו", "בן", "בר", "גרוס", "קלין", "רוזן", "גולד",
            "שוורץ", "פרידמן", "ברק", "שמיר", "פרץ", "אהרן", "יצחק", "עמוס",
            "נתן", "שמואל", "רפאל", "גבריאל", "דניאל", "עמנואל", "יהודה",
            "בנימין", "אפרים", "מנשה", "נפתלי", "אשר", "זבולון", "גד", "ראובן"
        ]
        
    def extract_hebrew_text_from_pdf(self, pdf_path: str) -> List[str]:
        """Extract Hebrew text from PDF pages"""
        hebrew_texts = []
        
        try:
            # First try to extract text directly from PDF
            with open(pdf_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if self._contains_hebrew(text):
                        hebrew_texts.append(text)
                        logger.info(f"Extracted text from page {page_num + 1}")
                        
            # If no Hebrew text found, use OCR
            if not hebrew_texts:
                logger.info("No Hebrew text found in PDF, trying OCR...")
                hebrew_texts = self._ocr_pdf_pages(pdf_path)
                
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            
        return hebrew_texts
    
    def _contains_hebrew(self, text: str) -> bool:
        """Check if text contains Hebrew characters"""
        hebrew_pattern = re.compile(r'[\u0590-\u05FF]')
        return bool(hebrew_pattern.search(text))
    
    def _ocr_pdf_pages(self, pdf_path: str) -> List[str]:
        """Use OCR to extract Hebrew text from PDF pages"""
        hebrew_texts = []
        
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            for i, image in enumerate(images):
                # Use Tesseract with Hebrew language
                text = pytesseract.image_to_string(image, lang='heb')
                if self._contains_hebrew(text):
                    hebrew_texts.append(text)
                    logger.info(f"OCR extracted Hebrew text from page {i + 1}")
                    
        except Exception as e:
            logger.error(f"Error during OCR: {e}")
            
        return hebrew_texts
    
    def extract_names_from_text(self, text: str) -> List[Tuple[str, float]]:
        """Extract potential Hebrew names from text with confidence scores"""
        found_names = []
        
        # Debug: Log the original text
        logger.info(f"Processing text: {text[:100]}..." if len(text) > 100 else f"Processing text: {text}")
        
        # Split text into words and clean them
        words = re.findall(r'[\u0590-\u05FF]+', text)
        logger.info(f"Found {len(words)} Hebrew words: {words}")
        
        for word in words:
            # Remove common prefixes/suffixes and niqqud
            clean_word = self._clean_hebrew_word(word)
            
            # Skip very short words
            if len(clean_word) < 2:
                continue
            
            # Check against known names with fuzzy matching
            best_match = None
            best_similarity = 0
            
            for name in self.hebrew_names:
                similarity = fuzz.ratio(clean_word, name)
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = name
                
                # Lower threshold for debugging
                if similarity >= 70:  # Lowered from 90% to 70% for testing
                    logger.info(f"Potential match: '{clean_word}' -> '{name}' (similarity: {similarity}%)")
                    
                if similarity >= 70:  # Temporarily lowered from 90% to catch OCR issues
                    found_names.append((name, similarity))
                    logger.info(f"Found name: {name} (similarity: {similarity}%)")
            
            # Debug: Show best match even if below threshold
            if best_match and best_similarity > 0:
                logger.debug(f"Best match for '{clean_word}': '{best_match}' ({best_similarity}%)")
        
        # Remove duplicates and sort by confidence
        unique_names = list(set(found_names))
        unique_names.sort(key=lambda x: x[1], reverse=True)
        
        return unique_names
    
    def _clean_hebrew_word(self, word: str) -> str:
        """Clean Hebrew word by removing niqqud and common prefixes/suffixes"""
        original_word = word
        
        # Remove niqqud (Hebrew diacritics)
        word = re.sub(r'[\u0591-\u05C7]', '', word)
        
        # Remove common punctuation and symbols that OCR might introduce
        word = re.sub(r'[.,;:״"\'`\-_\s]', '', word)
        
        # Remove numbers and currency symbols that OCR often mixes in
        word = re.sub(r'[0-9₪$€£¥]', '', word)
        
        # Remove common OCR artifacts (dots, slashes, etc.)
        word = re.sub(r'[./\\|]', '', word)
        
        # Fix common Hebrew OCR character confusions
        # These are common misreads that Tesseract makes with Hebrew
        word = word.replace('שמ', 'מש')  # ש and מ often get swapped
        word = word.replace('הו', 'ו')   # ה often gets added before ו
        word = word.replace('וו', 'ו')   # Double ו often becomes single
        word = word.replace('חח', 'ח')   # Double ח often becomes single
        
        # Remove common prefixes (ה, ו, ב, כ, ל, מ)
        word = re.sub(r'^[הוובכלמ]', '', word)
        
        # Remove common suffixes
        word = re.sub(r'[ים]$', '', word)
        
        # Debug logging
        if original_word != word:
            logger.info(f"Cleaned '{original_word}' -> '{word}'")
        
        return word
    
    def split_pdf_by_pages(self, pdf_path: str, output_dir: str) -> List[str]:
        """Split PDF into individual pages"""
        page_files = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    # Create a new PDF for each page
                    pdf_writer = pypdf.PdfWriter()
                    pdf_writer.add_page(page)
                    
                    # Save the page
                    page_filename = f"page_{page_num + 1}.pdf"
                    page_path = os.path.join(output_dir, page_filename)
                    
                    with open(page_path, 'wb') as output_file:
                        pdf_writer.write(output_file)
                    
                    page_files.append(page_path)
                    logger.info(f"Created page file: {page_filename}")
                    
        except Exception as e:
            logger.error(f"Error splitting PDF: {e}")
            
        return page_files
    
    def process_payslip_pdf(self, pdf_path: str) -> List[dict]:
        """Main function to process a payslip PDF and extract names"""
        results = []
        
        # Create temporary directory for split pages
        with tempfile.TemporaryDirectory() as temp_dir:
            # Split PDF into pages
            page_files = self.split_pdf_by_pages(pdf_path, temp_dir)
            
            for page_file in page_files:
                # Extract Hebrew text from each page
                hebrew_texts = self.extract_hebrew_text_from_pdf(page_file)
                
                page_result = {
                    'page_file': os.path.basename(page_file),
                    'hebrew_text': hebrew_texts,
                    'extracted_names': [],
                    'best_name': None,
                    'confidence': 0
                }
                
                # Extract names from each text block
                all_names = []
                for text in hebrew_texts:
                    names = self.extract_names_from_text(text)
                    all_names.extend(names)
                    page_result['extracted_names'].extend(names)
                
                # Find the best name match
                if all_names:
                    best_match = max(all_names, key=lambda x: x[1])
                    page_result['best_name'] = best_match[0]
                    page_result['confidence'] = best_match[1]
                
                results.append(page_result)
        
        return results

# Example usage and testing function
def test_with_example():
    """Test function you can run with your PDF"""
    extractor = HebrewNameExtractor()
    
    # Replace with your PDF path
    pdf_path = "example_payslip.pdf"
    
    if os.path.exists(pdf_path):
        print(f"Processing {pdf_path}...")
        results = extractor.process_payslip_pdf(pdf_path)
        
        print("\n=== EXTRACTION RESULTS ===")
        for i, result in enumerate(results, 1):
            print(f"\nPage {i}:")
            print(f"  Best name: {result['best_name']}")
            print(f"  Confidence: {result['confidence']}%")
            print(f"  All extracted names: {result['extracted_names']}")
            if result['hebrew_text']:
                print(f"  Hebrew text preview: {result['hebrew_text'][0][:100]}...")
    else:
        print(f"PDF file not found: {pdf_path}")
        print("Please place your example PDF in the same directory and rename it to 'example_payslip.pdf'")

if __name__ == "__main__":
    test_with_example() 