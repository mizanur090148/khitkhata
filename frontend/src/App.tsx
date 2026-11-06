import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  HomePage,
  AuthPage,
  FactoryPortalPage,
  VendorPortalPage,
  SupplierPortalPage,
} from '@/pages';
import { Toast } from '@/components/common/Toast';
import { CallModal } from '@/components/common/CallModal';
import { PrintDialog } from '@/components/common/PrintDialog';
import '@/styles/knitkhata.css';

export const AppContent: React.FC = () => {
  const {
    toasts,
    dismissToast,
    callModal,
    closeCallModal,
    printModal,
    closePrintModal,
  } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/factory" element={<FactoryPortalPage />} />
        <Route path="/vendor" element={<VendorPortalPage />} />
        <Route path="/supplier" element={<SupplierPortalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Dialogs & Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <CallModal
        isOpen={callModal.isOpen}
        onClose={closeCallModal}
        title={callModal.title}
        subtitle={callModal.subtitle}
        phone={callModal.phone}
        whatsapp={callModal.whatsapp}
        name={callModal.name}
      />

      <PrintDialog
        isOpen={printModal.isOpen}
        onClose={closePrintModal}
        title={printModal.title}
        documentType={printModal.documentType}
        data={printModal.data}
      />
    </>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
