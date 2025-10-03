import os
import base64
import logging
from typing import List, Dict, Optional
from io import BytesIO

import httpx
from PIL import Image
from pdf2image import convert_from_path
from dotenv import load_dotenv
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

import random
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import CompanyTemplate, CropArea

load_dotenv()

logger = logging.getLogger(__name__)

class AIVisionService:
    """AI Vision service using OpenRouter API with Gemini model"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = "google/gemini-2.5-flash-lite-preview-06-17"  # Using the model you specified
        self.base_url = "https://openrouter.ai/api/v1"
        self.is_dev = os.getenv("ENVIRONMENT") == "development"
        
        if not self.api_key:
            logger.warning("⚠️ OPENROUTER_API_KEY not found in environment variables")
    
    async def process_payslip_pdf(self, pdf_path: str, template: CompanyTemplate) -> List[Dict]:
        """Process a payslip PDF and extract Hebrew names using AI vision"""
        results = []
        
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            logger.info(f"🔄 Processing {len(images)} pages from PDF")
            
            # Use a ThreadPoolExecutor for parallel processing
            with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
                future_to_page = {
                    executor.submit(self._process_single_page, image, template.name_crop_area, page_num + 1): page_num
                    for page_num, image in enumerate(images)
                }
                
                for future in as_completed(future_to_page):
                    page_num = future_to_page[future]
                    try:
                        hebrew_name, cropped_image_path = future.result()
                        
                        if hebrew_name:
                            found_match, employee_name, employee_email = self._find_best_match(
                                hebrew_name, template.employee_emails
                            )
                            
                            results.append({
                                "page": page_num + 1,
                                "found_match": found_match,
                                "extracted_name": hebrew_name,
                                "employee_name": employee_name,
                                "employee_email": employee_email,
                                "cropped_image_path": cropped_image_path
                            })
                        else:
                            results.append({
                                "page": page_num + 1,
                                "found_match": False,
                                "extracted_name": "N/A",
                                "error": "Could not extract name from page."
                            })

                    except Exception as e:
                        logger.error(f"Error processing page {page_num + 1}: {e}")
                        results.append({
                            "page": page_num + 1,
                            "found_match": False,
                            "error": str(e)
                        })
            
            # Sort results by page number
            results.sort(key=lambda x: x["page"])
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Error processing PDF: {e}")
            raise
            
    def _process_single_page(self, image: Image.Image, crop_area: CropArea, page_num: int):
        """Process a single page: crop, save debug image, and extract name."""
        
        # Crop to name area
        cropped_image = self._crop_image(image, crop_area)
        
        # Save debug image
        cropped_image_path = self._save_debug_image(cropped_image, "debug", page_num)
        
        # Extract name using AI vision
        hebrew_name = self._extract_name_with_ai(cropped_image) # This is now a sync function
        
        return hebrew_name, cropped_image_path
    
    def _crop_image(self, image: Image.Image, crop_area) -> Image.Image:
        """Crop image to specified area"""
        try:
            logger.info(f"🔍 Original image size: {image.size}")
            logger.info(f"🔍 Crop coordinates: ({crop_area.x}, {crop_area.y}) to ({crop_area.x + crop_area.width}, {crop_area.y + crop_area.height})")
            
            # PIL crop expects (left, top, right, bottom)
            crop_box = (
                crop_area.x,
                crop_area.y,
                crop_area.x + crop_area.width,
                crop_area.y + crop_area.height
            )
            
            cropped = image.crop(crop_box)
            logger.info(f"✂️ Cropped to {crop_area.width}x{crop_area.height}")
            return cropped
            
        except Exception as e:
            logger.error(f"❌ Error cropping image: {e}")
            return image
    
    def _find_best_match(self, text: str, employee_map: Dict[str, str]):
        """Find the best match for the extracted text from the employee list."""
        if not text:
            return False, "No name provided", ""

        # Use process.extractOne which is correct for this library version
        result = process.extractOne(text, employee_map.keys(), scorer=fuzz.token_set_ratio)
        
        # Handle cases where no match is found
        if not result:
            return False, "No match found", ""
        
        best_match, score = result # Unpack the two values

        if score >= 75: # Using a threshold to avoid incorrect matches
            return True, best_match, employee_map[best_match]
        
        return False, "No match found", ""
    
    def _save_debug_image(self, image: Image.Image, company_id: str, page_num: int):
        """Save debug image for inspection (development only)"""
        # Only save debug images in development mode
        if not self.is_dev:
            logger.info(f"🔧 Production mode: Skipping debug image save for page {page_num}")
            return None
            
        try:
            debug_dir = "debug"
            # Ensure the directory exists
            os.makedirs(debug_dir, exist_ok=True)
            
            from datetime import datetime
            # Generate a unique path for the debug image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_path = os.path.join(debug_dir, f"{company_id}_page{page_num}_{timestamp}_ai_crop.png")
            
            # Save the image
            image.save(image_path)
            
            logger.info(f"💾 Saved debug image: {image_path}")
            return image_path
            
        except Exception as e:
            logger.error(f"❌ Error saving debug image: {e}")
            return None
    
    def _extract_name_with_ai(self, image: Image.Image) -> str:
        """Extract Hebrew name from image using AI Vision (sync version)"""
        
        # Convert image to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        prompt_text = "Please extract the full name from this payslip image. The name is in Hebrew. Return only the name, with no extra text or labels."
        
        payload = {
            "model": self.model, # Use the model initialized in the service
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_str}"}}
                    ],
                }
            ],
            "max_tokens": 80,
            "temperature": 0.1,
        }
        
        try:
            # Use httpx.Client for sync request
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions", # Use base_url from the service
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=payload,
                    timeout=30.0,
                )
                response.raise_for_status()
            
            ai_response = response.json()
            extracted_text = ai_response["choices"][0]["message"]["content"].strip()
            
            logger.info(f"🧠 AI Vision extracted: '{extracted_text}'")
            return extracted_text if extracted_text else "לא זוהה"

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error with AI Vision API: {e.response.text}")
            return "שגיאה"
        except Exception as e:
            logger.error(f"Error extracting name with AI: {str(e)}")
            return "שגיאה"
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str 