import { create } from 'zustand';
import { AppState, CompanyTemplate, SetupStep, PreviewResult, EmailSendResult, User, UsageStats } from '@/types';
import { authService } from '@/services/authService';

interface AppActions {
  // Auth
  signIn: () => Promise<void>;
  signOut: () => void;
  initializeAuth: () => Promise<void>;
  setAuthUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setUsageStats: (usage: UsageStats | null) => void;
  
  // Companies
  setCompanies: (companies: CompanyTemplate[]) => void;
  setCurrentCompany: (company: CompanyTemplate | null) => void;
  addCompany: (company: CompanyTemplate) => void;
  updateCompany: (companyId: string, updates: Partial<CompanyTemplate>) => void;
  
  // Setup flow
  setSetupStep: (step: SetupStep) => void;
  setPreviewUrl: (url: string | null) => void;
  setUploadedSampleId: (id: string | null) => void;
  resetSetup: () => void;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;
  
  // Processing
  setProcessId: (processId: string | null) => void;
  setPreviewResults: (results: PreviewResult[]) => void;
  setEmailSendResults: (results: EmailSendResult[]) => void;
  clearProcessing: () => void;
}

export const useAppStore = create<AppState & AppActions>((set, _get) => ({
  // Auth state
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    usage: null,
  },
  
  // Initial state
  companies: [],
  currentCompany: null,
  setupStep: 'upload',
  previewUrl: null,
  uploadedSampleId: null,
  isLoading: false,
  error: null,
  successMessage: null,
  
  // New processing state
  processId: null,
  previewResults: [],
  emailSendResults: [],
  processingResults: [], // This might be deprecated

  // Company actions
  setCompanies: (companies) => set({ companies }),
  
  setCurrentCompany: (company) => set({ currentCompany: company }),
  
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company]
  })),
  
  updateCompany: (companyId, updates) => set((state) => ({
    companies: state.companies.map(company =>
      company.company_id === companyId
        ? { ...company, ...updates }
        : company
    ),
    currentCompany: state.currentCompany?.company_id === companyId
      ? { ...state.currentCompany, ...updates }
      : state.currentCompany
  })),

  // Setup flow actions
  setSetupStep: (step) => set({ setupStep: step }),
  
  setPreviewUrl: (url) => set({ previewUrl: url }),
  
  setUploadedSampleId: (id) => set({ uploadedSampleId: id }),
  
  resetSetup: () => set({
    setupStep: 'upload',
    previewUrl: null,
    uploadedSampleId: null,
    currentCompany: null,
    processingResults: [],
    error: null,
    successMessage: null
  }),

  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, successMessage: null }),
  
  setSuccessMessage: (message) => set({ successMessage: message, error: null }),
  
  clearMessages: () => set({ error: null, successMessage: null }),

  // Processing actions
  setProcessId: (processId) => set({ processId }),
  setPreviewResults: (results) => set({ previewResults: results }),
  setEmailSendResults: (results) => set({ emailSendResults: results }),
  clearProcessing: () => set({
    processId: null,
    previewResults: [],
    emailSendResults: [],
    processingResults: []
  }),

  // Auth actions
  signIn: async () => {
    set((state) => ({ 
      auth: { ...state.auth, isLoading: true },
      error: null 
    }));
    
    try {
      const authResponse = await authService.signInWithGoogle();
      set((_state) => ({
        auth: {
          user: authResponse.user,
          token: authResponse.token,
          isAuthenticated: true,
          isLoading: false,
          usage: authResponse.usage,
        },
        successMessage: `Welcome, ${authResponse.user.name}!`
      }));
    } catch (error: any) {
      set((_state) => ({
        auth: { ..._state.auth, isLoading: false },
        error: `Authentication failed: ${error.message}`
      }));
    }
  },

  signOut: () => {
    authService.logout();
    set((_state) => ({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        usage: null,
      },
      successMessage: 'Signed out successfully'
    }));
  },

  initializeAuth: async () => {
    const token = authService.getStoredToken();
    if (!token) return;

    if (authService.isTokenExpired(token)) {
      authService.logout();
      return;
    }

    set((state) => ({ 
      auth: { ...state.auth, isLoading: true }
    }));

    try {
      authService.initializeTokenFromStorage();
      const userData = await authService.getCurrentUser();
      
      if (userData) {
        set((_state) => ({
          auth: {
            user: userData.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            usage: userData.usage,
          }
        }));
      } else {
        set((_state) => ({ 
          auth: { ..._state.auth, isLoading: false }
        }));
      }
    } catch (error) {
      authService.logout();
      set((_state) => ({ 
        auth: { ..._state.auth, isLoading: false }
      }));
    }
  },

  setAuthUser: (user) => set((state) => ({
    auth: { ...state.auth, user, isAuthenticated: !!user }
  })),

  setAuthToken: (token) => set((state) => ({
    auth: { ...state.auth, token }
  })),

  setAuthLoading: (loading) => set((state) => ({
    auth: { ...state.auth, isLoading: loading }
  })),

  setUsageStats: (usage) => set((state) => ({
    auth: { ...state.auth, usage }
  })),
})); 