export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompanyTemplate {
  company_id: string;
  company_name: string;
  name_crop_area: CropArea;
  employee_emails: Record<string, string>;
  ocr_confidence_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingResult {
  page: number;
  extracted_name: string;
  confidence: number;
  matched_employee?: {
    name: string;
    email: string;
  };
  ai_crop_image_path?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadSampleResponse {
  success: boolean;
  message: string;
  preview_url: string;
  company_id: string;
}

export interface TestTemplateResponse {
  success: boolean;
  message: string;
  results: ProcessingResult[];
}

export interface SaveCropAreaResponse {
  success: boolean;
  message: string;
  template: CompanyTemplate;
}

export interface UploadEmployeesResponse {
  success: boolean;
  message: string;
  template: CompanyTemplate;
}

export type SetupStep = 'upload' | 'crop' | 'employees' | 'test' | 'complete';

export interface PreviewResult {
  page: number;
  found_match: boolean;
  extracted_name: string;
  employee_name?: string;
  employee_email?: string;
  error?: string;
  cropped_image_path?: string;
}

export interface EmailSendResult {
  page: number;
  employee_name: string;
  employee_email: string;
  email_sent: boolean;
  email_detail: string;
}

export interface User {
  google_user_id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface UsageStats {
  ai_calls: {
    used: number;
    limit: number;
  };
  email_sends: {
    used: number;
    limit: number;
  };
  pdf_uploads: {
    used: number;
    limit: number;
  };
  last_reset: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  usage: UsageStats | null;
}

export interface AppState {
  // Auth
  auth: AuthState;
  
  // Companies
  companies: CompanyTemplate[];
  currentCompany: CompanyTemplate | null;
  
  // Setup flow
  setupStep: SetupStep;
  previewUrl: string | null;
  uploadedSampleId: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Processing state
  processId: string | null;
  previewResults: PreviewResult[];
  emailSendResults: EmailSendResult[];
  processingResults: ProcessingResult[]; // This might be deprecated
} 