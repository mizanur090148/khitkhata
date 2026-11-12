import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  HomePage,
  AuthPage,
  FactoryPortalPage,
  FactoryLayout,
  FactoryDashboardPage,
  FactoryOrdersPage,
  FactoryOrderDetailPage,
  FactoryNewOrderPage,
  FactoryPartyPage,
  FactoryJobCardPage,
  FactoryProductionEntryPage,
  FactoryQcPage,
  FactoryReadyFabricPage,
  VendorPortalPage,
  SupplierPortalPage,
} from '@/pages';
import { Toast } from '@/components/common/Toast';
import { CallModal } from '@/components/common/CallModal';
import { PrintDialog } from '@/components/common/PrintDialog';
import '@/styles/knitkhata.css';

export const DashboardRoute: React.FC = () => {
  const { role, currentUser } = useApp();
  const activeRole = currentUser?.role || role;

  if (activeRole === 'vendor' || activeRole === 'ven') {
    return <VendorPortalPage />;
  }
  if (activeRole === 'supplier' || activeRole === 'sup') {
    return <SupplierPortalPage />;
  }
  return <FactoryPortalPage />;
};

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
        <Route path="/home" element={<HomePage />} />

        {/* Dedicated Separate Pages for Factory Portal under FactoryLayout */}
        <Route path="/dashboard" element={<FactoryLayout />}>
          <Route index element={<FactoryDashboardPage />} />
          <Route path="dash" element={<FactoryDashboardPage />} />
          <Route path="orders" element={<FactoryOrdersPage />} />
          <Route path="orders/:id" element={<FactoryOrderDetailPage />} />
          <Route path="neworder" element={<FactoryNewOrderPage />} />
          <Route path="party" element={<FactoryPartyPage />} />
          <Route path="jobcard" element={<FactoryJobCardPage />} />
          <Route path="jobcard/:id" element={<FactoryJobCardPage />} />
          <Route path="entry" element={<FactoryProductionEntryPage />} />
          <Route path="qc" element={<FactoryQcPage />} />
          <Route path="fready" element={<FactoryReadyFabricPage />} />
          <Route path="detail" element={<FactoryOrderDetailPage />} />
          <Route path="detail/:id" element={<FactoryOrderDetailPage />} />
        </Route>

        {/* Other dashboard views / roles */}
        <Route path="/dashboard/:view" element={<DashboardRoute />} />
        <Route path="/dashboard/:view/:id" element={<DashboardRoute />} />

        <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/factory" element={<Navigate to="/dashboard" replace />} />
        <Route path="/factory/:view" element={<DashboardRoute />} />
        <Route path="/vendor" element={<Navigate to="/dashboard" replace />} />
        <Route path="/vendor/:view" element={<DashboardRoute />} />
        <Route path="/supplier" element={<Navigate to="/dashboard" replace />} />
        <Route path="/supplier/:view" element={<DashboardRoute />} />
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
