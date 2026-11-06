import React from 'react';
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
    screen,
    toasts,
    dismissToast,
    callModal,
    closeCallModal,
    printModal,
    closePrintModal,
  } = useApp();

  return (
    <>
      {screen === 'site' && <HomePage />}
      {screen === 'auth' && <AuthPage />}
      {screen === 'factory' && <FactoryPortalPage />}
      {screen === 'vendor' && <VendorPortalPage />}
      {screen === 'supplier' && <SupplierPortalPage />}

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
