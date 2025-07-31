import json
import os
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class CropArea:
    """Defines a rectangular area for cropping"""
    x: int  # Top-left x coordinate
    y: int  # Top-left y coordinate  
    width: int  # Width of the crop area
    height: int  # Height of the crop area

@dataclass
class CompanyTemplate:
    """Company-specific payslip processing template"""
    company_id: str
    company_name: str
    name_crop_area: CropArea
    employee_emails: Dict[str, str]  # name -> email mapping
    ocr_confidence_threshold: float = 80.0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ConfigManager:
    """Manages the single company configuration"""
    
    def __init__(self, config_dir: str = "company_configs"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(exist_ok=True)
        self.config_file = self.config_dir / "config.json"

    def save_template(self, template: CompanyTemplate) -> bool:
        """Save company template to the single JSON file"""
        try:
            template_dict = asdict(template)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(template_dict, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Saved template for {template.company_name}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to save template: {e}")
            return False
    
    def load_template(self) -> Optional[CompanyTemplate]:
        """Load company template from the single JSON file"""
        try:
            if not self.config_file.exists():
                return None
                
            with open(self.config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            crop_area = CropArea(**data['name_crop_area'])
            template = CompanyTemplate(
                company_id=data.get('company_id', 'main'),  # Keep for backward compatibility
                company_name=data['company_name'],
                name_crop_area=crop_area,
                employee_emails=data['employee_emails'],
                ocr_confidence_threshold=data.get('ocr_confidence_threshold', 80.0),
                created_at=data.get('created_at'),
                updated_at=data.get('updated_at')
            )
            
            return template
            
        except Exception as e:
            print(f"❌ Failed to load template: {e}")
            return None
    
    def delete_template(self) -> bool:
        """Delete the single company template"""
        try:
            if self.config_file.exists():
                self.config_file.unlink()
                return True
            return False
        except Exception as e:
            print(f"❌ Failed to delete template: {e}")
            return False

    # Keep these methods for backward compatibility with existing frontend
    def list_companies(self) -> List[str]:
        """List companies - returns single company or empty list"""
        template = self.load_template()
        return [template.company_id] if template else []
    
    def list_company_templates(self) -> List[CompanyTemplate]:
        """List company templates - returns single template or empty list"""
        template = self.load_template()
        return [template] if template else []
    
    def load_template_by_id(self, company_id: str) -> Optional[CompanyTemplate]:
        """Load template by ID - for backward compatibility"""
        return self.load_template()

# Global config manager instance
config_manager = ConfigManager() 