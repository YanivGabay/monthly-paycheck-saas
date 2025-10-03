import axios from 'axios';
import {
  CompanyTemplate,
  UploadSampleResponse,
  TestTemplateResponse,
  SaveCropAreaResponse,
  UploadEmployeesResponse,
  CropArea,
  PreviewResult,
  EmailSendResult,
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 (Unauthorized) - token expired or invalid
    if (error.response?.status === 401) {
      console.log('Token expired, clearing auth data');
      localStorage.removeItem('auth_token');
      // Optionally reload the page to trigger re-authentication
      window.location.reload();
    }
    
    throw error;
  }
);

// Company API
export const companyApi = {
  // Get all companies
  async getCompanies(): Promise<CompanyTemplate[]> {
    const response = await api.get('/companies');
    return response.data.companies || [];
  },

  // Get company by ID
  async getCompany(companyId: string): Promise<{ company: CompanyTemplate }> {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },
};

// Setup API
export const setupApi = {
  // Upload sample PDF
  async uploadSample(file: File, companyName: string): Promise<UploadSampleResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_name', companyName);
    
    // Generate company_id from company name (same logic as frontend)
    const companyId = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
    formData.append('company_id', companyId);

    const response = await api.post('/setup/upload-sample', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Save crop area - returns template for localStorage
  async saveCropArea(
    companyId: string,
    companyName: string,
    cropArea: CropArea
  ): Promise<SaveCropAreaResponse> {
    const response = await api.post('/setup/save-crop-area', {
      company_id: companyId,
      company_name: companyName,
      crop_area: cropArea,
    });

    return response.data;
  },

  // Upload employees CSV - requires existing company config
  async uploadEmployees(
    file: File,
    companyConfig: CompanyTemplate
  ): Promise<UploadEmployeesResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_config', JSON.stringify(companyConfig));

    const response = await api.post('/setup/upload-employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Test template - requires file upload and company config
  async testTemplate(
    file: File, 
    companyConfig: CompanyTemplate
  ): Promise<TestTemplateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_config', JSON.stringify(companyConfig));

    const response = await api.post('/setup/test-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Processing API
export const processingApi = {
  // Step 1: Upload and get a preview - requires company config
  async uploadAndPreview(
    file: File,
    companyId: string,
    companyConfig: CompanyTemplate
  ): Promise<{ process_id: string; preview: PreviewResult[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_config', JSON.stringify(companyConfig));

    const response = await api.post(`/process/${companyId}/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Step 2: Send emails based on the preview - requires company config
  async sendEmails(
    processId: string,
    companyId: string,
    companyConfig: CompanyTemplate
  ): Promise<{ email_results: EmailSendResult[] }> {
    const response = await api.post(`/process/${companyId}/send`, {
      process_id: processId,
      company_config: companyConfig,
    });
    return response.data;
  },
};

// Health check
export const healthApi = {
  async check(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 