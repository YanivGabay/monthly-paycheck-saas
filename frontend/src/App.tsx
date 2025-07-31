import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { StatusMessage } from '@/components/common/StatusMessage';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CompanyList } from '@/components/CompanyList';
import { SetupWizard } from '@/components/CompanySetup/SetupWizard';
import { PayslipUpload } from '@/components/ProcessPayslip/PayslipUpload';
import { useAppStore } from '@/store';

function App() {
  const { error, successMessage, clearMessages, initializeAuth } = useAppStore();

  // Initialize authentication on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <Router>
        <AuthGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<CompanyList />} />
              <Route path="/setup" element={<SetupWizard />} />
              <Route path="/process/:companyId" element={<PayslipUpload />} />
            </Routes>
            
            {/* Status Messages */}
            {error && (
              <StatusMessage
                type="error"
                message={error}
                onClose={clearMessages}
              />
            )}
            
            {successMessage && (
              <StatusMessage
                type="success"
                message={successMessage}
                onClose={clearMessages}
              />
            )}
          </Layout>
        </AuthGuard>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 