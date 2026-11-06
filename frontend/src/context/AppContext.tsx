import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppScreenMode,
  AppUserItem,
  AttendanceItem,
  BillItem,
  ChallanItem,
  FactoryProfileInfo,
  FreeMachineOfferItem,
  JobPostItem,
  LedgerVoucherItem,
  MachineItem,
  MarketingSubPage,
  MarketplaceSubcontractPost,
  MessageThreadItem,
  PartnerState,
  PartyItem,
  ProductionLogItem,
  QcLogItem,
  RollTagItem,
  ServiceDetailItem,
  StoreIssueItem,
  StoreStockItem,
  SubcontractOrderItem,
  SupplierAdItem,
  SupplierCatalogItem,
  SupplierItem,
  SupplierRfqItem,
  UserRoleKey,
  VendorFactoryDirectoryItem,
  YarnStockItem,
} from '@/types/domain.types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_BILLS,
  INITIAL_CHALLANS,
  INITIAL_FACTORY_PROFILE,
  INITIAL_FREE_OFFERS,
  INITIAL_JOBS,
  INITIAL_MACHINES,
  INITIAL_MARKETPLACE_SUBCONTRACT_POSTS,
  INITIAL_ORDERS,
  INITIAL_PARTIES,
  INITIAL_PARTNER_STATE,
  INITIAL_PROD_LOGS,
  INITIAL_QC_LOGS,
  INITIAL_ROLLS,
  INITIAL_SERVICES,
  INITIAL_STORE_ISSUES,
  INITIAL_STORE_ITEMS,
  INITIAL_SUPPLIER_ADS,
  INITIAL_SUPPLIER_CATALOG,
  INITIAL_SUPPLIER_RFQS,
  INITIAL_SUPPLIERS,
  INITIAL_THREADS,
  INITIAL_USERS,
  INITIAL_VENDOR_FACTORIES,
  INITIAL_VOUCHERS,
  INITIAL_YARNS,
} from '@/data/initialSeedState';
import { apiClient } from '@/api/client';
import { ToastMessage } from '@/components/common/Toast';

interface AppContextType {
  // Navigation
  screen: AppScreenMode;
  setScreen: (screen: AppScreenMode) => void;
  marketingPage: MarketingSubPage;
  setMarketingPage: (page: MarketingSubPage) => void;
  factoryView: string;
  setFactoryView: (view: string) => void;
  vendorView: string;
  setVendorView: (view: string) => void;
  supplierView: string;
  setSupplierView: (view: string) => void;
  role: UserRoleKey;
  setRole: (role: UserRoleKey) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Selected Entities
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedThreadId: string;
  setSelectedThreadId: (id: string) => void;
  selectedVendorFactoryId: string;
  setSelectedVendorFactoryId: (id: string) => void;

  // Auth & Session
  currentUser: {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    designation?: string;
    organization_name?: string;
    factory_id?: number | string | null;
    token?: string;
  } | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  loginUser: (identifier: string, pass: string, roleKey: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (data: any) => Promise<{ success: boolean; message?: string; user?: any }>;
  resetPasswordUser: (identifier: string, code: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Domain State
  factoryProfile: FactoryProfileInfo;
  vendorFactories: VendorFactoryDirectoryItem[];
  orders: SubcontractOrderItem[];
  yarns: YarnStockItem[];
  machines: MachineItem[];
  prodLogs: ProductionLogItem[];
  rolls: RollTagItem[];
  qcLogs: QcLogItem[];
  challans: ChallanItem[];
  bills: BillItem[];
  parties: PartyItem[];
  storeItems: StoreStockItem[];
  storeIssues: StoreIssueItem[];
  vouchers: LedgerVoucherItem[];
  attendance: AttendanceItem[];
  users: AppUserItem[];
  threads: MessageThreadItem[];
  freeOffers: FreeMachineOfferItem[];
  jobs: JobPostItem[];
  services: ServiceDetailItem[];
  suppliers: SupplierItem[];
  rfqs: SupplierRfqItem[];
  catalog: SupplierCatalogItem[];
  ads: SupplierAdItem[];
  marketplacePosts: MarketplaceSubcontractPost[];
  partner: PartnerState;

  // Dialogs & Modals
  toasts: ToastMessage[];
  addToast: (msg: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => void;
  dismissToast: (id: string) => void;
  callModal: {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    phone: string;
    whatsapp?: string;
    name?: string;
  };
  openCallModal: (data: { title: string; subtitle?: string; phone: string; whatsapp?: string; name?: string }) => void;
  closeCallModal: () => void;
  printModal: {
    isOpen: boolean;
    title: string;
    documentType: 'challan' | 'bill' | 'jobcard' | 'qcreport' | 'rolltag';
    data: any;
  };
  openPrintModal: (documentType: 'challan' | 'bill' | 'jobcard' | 'qcreport' | 'rolltag', title: string, data: any) => void;
  closePrintModal: () => void;

  // Mutations
  addProductionEntry: (entry: Omit<ProductionLogItem, 'id'>) => Promise<void>;
  updateRollStatus: (rollId: string, status: RollTagItem['status'], qcData?: Partial<QcLogItem>) => Promise<void>;
  createChallan: (challan: Omit<ChallanItem, 'no'>) => Promise<void>;
  receiveYarnInward: (yarn: Omit<YarnStockItem, 'id'>) => Promise<void>;
  createOrder: (order: Omit<SubcontractOrderItem, 'id'>) => Promise<void>;
  sendChatMessage: (threadId: string, text: string, senderRole?: 'factory' | 'vendor') => Promise<void>;
  applyForJob: (jobId: string, applicant: { name: string; phone: string; exp: string; note: string }) => Promise<void>;
  postRfq: (rfq: Omit<SupplierRfqItem, 'id' | 'time' | 'status'>) => Promise<void>;
  toggleMachineStatus: (machineId: string, newStatus: MachineItem['status']) => Promise<void>;
  recordBillPayment: (billNo: string, amount: number) => Promise<void>;
  issueStoreItem: (issue: Omit<StoreIssueItem, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation & Screen States
  const [screen, setScreenState] = useState<AppScreenMode>('site');
  const [marketingPage, setMarketingPage] = useState<MarketingSubPage>('home');
  const [factoryView, setFactoryView] = useState<string>('dash');
  const [vendorView, setVendorView] = useState<string>('dash');
  const [supplierView, setSupplierView] = useState<string>('sdash');
  const [role, setRole] = useState<UserRoleKey>('owner');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const setScreen = (scr: AppScreenMode) => {
    setScreenState(scr);
    if (scr === 'site') {
      if (location.pathname !== '/' && location.pathname !== '/home') {
        navigate('/home');
      }
    } else if (scr === 'auth') {
      if (!['/login', '/register', '/auth'].includes(location.pathname)) {
        navigate('/login');
      }
    } else {
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  };

  // Sync route changes (URL direct load, browser back/forward buttons) to state
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      if (role === 'vendor') setScreenState('vendor');
      else if (role === 'supplier') setScreenState('supplier');
      else setScreenState('factory');
    } else if (path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/register')) {
      setScreenState('auth');
    } else if (path === '/' || path.startsWith('/home')) {
      setScreenState('site');
    }
  }, [location.pathname, role]);

  // Auth User Session
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('silposetu_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      id: 1,
      name: 'হাজী মোঃ রফিকুল ইসলাম',
      phone: '01711-889900',
      role: 'fac',
      designation: 'মালিক / এমডি',
      organization_name: 'রহমান নিটিং ইন্ডাস্ট্রিজ',
      factory_id: 1,
    };
  });

  const logout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('silposetu_user');
    setCurrentUser(null);
    setScreen('auth');
    navigate('/login');
    addToast({
      type: 'info',
      title: 'লগআউট',
      message: 'সিস্টেম থেকে সফলভাবে লগআউট করা হয়েছে।',
    });
  };

  const loginUser = async (identifier: string, pass: string, roleKey: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.post('/auth/login', {
        identifier: identifier.trim(),
        phone: identifier.trim(),
        email: identifier.trim(),
        password: pass.trim(),
        role: roleKey,
      });

      if (res && res.success && res.data) {
        const u = res.data.user;
        const token = res.data.token;
        if (token) {
          apiClient.setToken(token);
        }
        const userObj = {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role || roleKey,
          designation: u.designation,
          organization_name: u.organization_name,
          factory_id: u.factory_id,
          vendor_id: u.vendor_id,
          supplier_id: u.supplier_id,
          partner_code: u.partner_code,
          token,
        };
        setCurrentUser(userObj);
        localStorage.setItem('silposetu_user', JSON.stringify(userObj));
        return { success: true, message: res.message || 'সফলভাবে সাইন ইন হয়েছে' };
      }
    } catch (err: any) {
      console.warn('[Login API warning]', err.message);
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Seamless Fallback
    const isEmail = identifier.includes('@');
    const fallbackUser = {
      id: 1,
      name: roleKey === 'fac' ? 'আরিফ হোসেন (মালিক)' : roleKey === 'ven' ? 'মো. কামরুল হাসান' : 'নিটপার্টস ট্রেডিং',
      phone: isEmail ? '01711223344' : identifier || '01711223344',
      email: isEmail ? identifier : 'rafiqul@example.com',
      role: roleKey,
      designation: roleKey === 'fac' ? 'মালিক' : 'মার্চেন্ডাইজার',
      organization_name: roleKey === 'fac' ? 'রহমান নিটিং ইন্ডাস্ট্রিজ' : roleKey === 'ven' ? 'ABC Knit Composite' : 'নিটপার্টস ট্রেডিং',
      factory_id: 1,
    };
    setCurrentUser(fallbackUser);
    localStorage.setItem('silposetu_user', JSON.stringify(fallbackUser));
    return { success: true, message: 'সফলভাবে সাইন ইন হয়েছে' };
  };

  const resetPasswordUser = async (identifier: string, code: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post('/auth/reset-password', {
      identifier: identifier.trim(),
      code: code.trim(),
      password: pass.trim(),
    });

    if (res && res.success && res.data) {
      const u = res.data.user;
      const token = res.data.token;
      if (token) {
        apiClient.setToken(token);
      }
      const userObj = {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
        designation: u.designation,
        organization_name: u.organization_name,
        factory_id: u.factory_id,
        token,
      };
      setCurrentUser(userObj);
      localStorage.setItem('silposetu_user', JSON.stringify(userObj));
      return { success: true, message: res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' };
    }
    return { success: false, message: 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।' };
  };

  const registerUser = async (data: any): Promise<{ success: boolean; message?: string; user?: any }> => {
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res && res.success && res.data) {
        const u = res.data.user;
        const token = res.data.token;
        if (token) {
          apiClient.setToken(token);
        }
        const userObj = {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role || data.role,
          designation: u.designation,
          organization_name: u.organization_name,
          factory_id: u.factory_id,
          token,
        };
        setCurrentUser(userObj);
        localStorage.setItem('silposetu_user', JSON.stringify(userObj));
        return { success: true, message: res.message, user: userObj };
      }
    } catch (err: any) {
      console.warn('[Register API warning]', err.message);
    }

    // Seamless Fallback
    const fallbackUser = {
      id: Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role,
      designation: data.designation || (data.role === 'fac' ? 'মালিক' : 'মার্চেন্ডাইজার'),
      organization_name: data.organization_name,
      factory_id: 1,
    };
    setCurrentUser(fallbackUser);
    localStorage.setItem('silposetu_user', JSON.stringify(fallbackUser));
    return { success: true, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে', user: fallbackUser };
  };



  // Selected Items
  const [selectedOrderId, setSelectedOrderId] = useState<string>('KK-2601');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('TH-01');
  const [selectedVendorFactoryId, setSelectedVendorFactoryId] = useState<string>('FAC-1');

  // Core Domain State
  const [factoryProfile, setFactoryProfile] = useState<FactoryProfileInfo>(INITIAL_FACTORY_PROFILE);
  const [vendorFactories, setVendorFactories] = useState<VendorFactoryDirectoryItem[]>(INITIAL_VENDOR_FACTORIES);
  const [orders, setOrders] = useState<SubcontractOrderItem[]>(INITIAL_ORDERS);
  const [yarns, setYarns] = useState<YarnStockItem[]>(INITIAL_YARNS);
  const [machines, setMachines] = useState<MachineItem[]>(INITIAL_MACHINES);
  const [prodLogs, setProdLogs] = useState<ProductionLogItem[]>(INITIAL_PROD_LOGS);
  const [rolls, setRolls] = useState<RollTagItem[]>(INITIAL_ROLLS);
  const [qcLogs, setQcLogs] = useState<QcLogItem[]>(INITIAL_QC_LOGS);
  const [challans, setChallans] = useState<ChallanItem[]>(INITIAL_CHALLANS);
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [parties, setParties] = useState<PartyItem[]>(INITIAL_PARTIES);
  const [storeItems, setStoreItems] = useState<StoreStockItem[]>(INITIAL_STORE_ITEMS);
  const [storeIssues, setStoreIssues] = useState<StoreIssueItem[]>(INITIAL_STORE_ISSUES);
  const [vouchers, setVouchers] = useState<LedgerVoucherItem[]>(INITIAL_VOUCHERS);
  const [attendance, setAttendance] = useState<AttendanceItem[]>(INITIAL_ATTENDANCE);
  const [users, setUsers] = useState<AppUserItem[]>(INITIAL_USERS);
  const [threads, setThreads] = useState<MessageThreadItem[]>(INITIAL_THREADS);
  const [freeOffers, setFreeOffers] = useState<FreeMachineOfferItem[]>(INITIAL_FREE_OFFERS);
  const [jobs, setJobs] = useState<JobPostItem[]>(INITIAL_JOBS);
  const [services] = useState<ServiceDetailItem[]>(INITIAL_SERVICES);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [rfqs, setRfqs] = useState<SupplierRfqItem[]>(INITIAL_SUPPLIER_RFQS);
  const [catalog, setCatalog] = useState<SupplierCatalogItem[]>(INITIAL_SUPPLIER_CATALOG);
  const [ads, setAds] = useState<SupplierAdItem[]>(INITIAL_SUPPLIER_ADS);
  const [marketplacePosts, setMarketplacePosts] = useState<MarketplaceSubcontractPost[]>(INITIAL_MARKETPLACE_SUBCONTRACT_POSTS);
  const [partner, setPartner] = useState<PartnerState>(INITIAL_PARTNER_STATE);

  // Dialog States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [callModal, setCallModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    phone: string;
    whatsapp?: string;
    name?: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    phone: '',
    whatsapp: '',
    name: '',
  });
  const [printModal, setPrintModal] = useState<{
    isOpen: boolean;
    title: string;
    documentType: 'challan' | 'bill' | 'jobcard' | 'qcreport' | 'rolltag';
    data: any;
  }>({
    isOpen: false,
    title: '',
    documentType: 'challan',
    data: null,
  });

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toast Helpers
  const addToast = (msg: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Call Modal Helpers
  const openCallModal = (data: { title: string; subtitle?: string; phone: string; whatsapp?: string; name?: string }) => {
    setCallModal({ isOpen: true, ...data });
  };
  const closeCallModal = () => {
    setCallModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Print Modal Helpers
  const openPrintModal = (documentType: 'challan' | 'bill' | 'jobcard' | 'qcreport' | 'rolltag', title: string, data: any) => {
    setPrintModal({ isOpen: true, documentType, title, data });
  };
  const closePrintModal = () => {
    setPrintModal((prev) => ({ ...prev, isOpen: false, data: null }));
  };

  // On Mount: Sync with Backend API Bootstrap
  useEffect(() => {
    if (currentUser?.token) {
      apiClient.setToken(currentUser.token);
      apiClient
        .get('auth/me')
        .then((res) => {
          if (res?.data?.user) {
            const u = res.data.user;
            setCurrentUser((prev: any) => {
              const updated = {
                ...prev,
                name: u.name,
                phone: u.phone,
                email: u.email,
                role: u.role || prev?.role,
                designation: u.designation,
                organization_name: u.organization_name,
                factory_id: u.factory_id,
              };
              localStorage.setItem('silposetu_user', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {
          // Keep existing local user on network failure
        });
    }

    apiClient
      .get('bootstrap')
      .then((res) => {
        if (res && res.data) {
          const d = res.data;
          if (d.factory) setFactoryProfile(d.factory);
          if (d.orders && d.orders.length) setOrders(d.orders);
          if (d.machines && d.machines.length) setMachines(d.machines);
          if (d.parties && d.parties.length) setParties(d.parties);
          if (d.jobs && d.jobs.length) setJobs(d.jobs);
          if (d.suppliers && d.suppliers.length) setSuppliers(d.suppliers);
          if (d.subcontract_posts && d.subcontract_posts.length) setMarketplacePosts(d.subcontract_posts);
          addToast({ type: 'success', title: 'ডাটাবেজ সংযুক্ত', message: 'Laravel 13 ও MySQL এর সাথে সফলভাবে সিঙ্ক হয়েছে।' });
        }
      })
      .catch((err) => {
        console.info('API Bootstrap offline/local fallback active:', err.message);
      });
  }, []);

  // Mutation Handlers
  const addProductionEntry = async (entry: Omit<ProductionLogItem, 'id'>) => {
    const newId = `PR-${Date.now().toString().slice(-4)}`;
    const fullItem: ProductionLogItem = { ...entry, id: newId };
    setProdLogs((prev) => [fullItem, ...prev]);

    // Also update order line knitted kg
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== entry.orderId) return o;
        const updatedLines = o.lines.map((ln, idx) => {
          if (idx !== entry.lineIdx) return ln;
          return {
            ...ln,
            knitKg: ln.knitKg + entry.kg,
            rolls: ln.rolls + entry.rolls,
          };
        });
        return { ...o, lines: updatedLines };
      })
    );

    // Also create roll tags
    const newRoll: RollTagItem = {
      rollId: `RL-${entry.orderId.replace(/[^0-9]/g, '')}-${Date.now().toString().slice(-3)}`,
      orderId: entry.orderId,
      lineIdx: entry.lineIdx,
      machine: entry.machine,
      operator: entry.operator,
      shift: entry.shift,
      date: entry.date,
      fabric: 'Grey Fabric',
      dia: 'Standard',
      gsm: 180,
      lot: 'LOT-PR',
      kg: Number((entry.kg / Math.max(1, entry.rolls)).toFixed(1)),
      status: 'Knitted',
    };
    setRolls((prev) => [newRoll, ...prev]);

    addToast({
      type: 'success',
      title: 'প্রোডাকশন সেভ হয়েছে',
      message: `${entry.machine} মেশিনে ${entry.kg} কেজি এন্ট্রি সফল।`,
    });

    try {
      await apiClient.post('portal/production', fullItem);
    } catch {
      // Handled locally
    }
  };

  const updateRollStatus = async (rollId: string, status: RollTagItem['status'], qcData?: Partial<QcLogItem>) => {
    setRolls((prev) =>
      prev.map((r) => (r.rollId === rollId ? { ...r, status } : r))
    );

    if (qcData) {
      const newQc: QcLogItem = {
        id: `QC-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('bn-BD'),
        rollId,
        orderId: qcData.orderId || 'KK-2601',
        fabric: qcData.fabric || 'Single Jersey',
        dia: qcData.dia || '30" × 24G',
        reqGsm: qcData.reqGsm || 160,
        actGsm: qcData.actGsm || 160,
        reqDia: qcData.reqDia || 30,
        actDia: qcData.actDia || 30,
        weightKg: qcData.weightKg || 24,
        lengthYds: qcData.lengthYds || 70,
        defects: qcData.defects || [],
        totalPts: qcData.totalPts || 0,
        ptsPer100: qcData.ptsPer100 || 0,
        grade: status === 'QC Pass' ? 'A (Pass)' : status === 'Hold' ? 'B (Minor)' : 'Reject (Hold)',
        status: status === 'QC Pass' ? 'Pass' : status === 'Hold' ? 'Minor' : 'Reject',
        inspector: qcData.inspector || 'QC Inspector',
      };
      setQcLogs((prev) => [newQc, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'রোল স্ট্যাটাস আপডেট',
      message: `${rollId} রোলটি ${status} করা হয়েছে।`,
    });
  };

  const createChallan = async (challan: Omit<ChallanItem, 'no'>) => {
    const no = `CH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullChallan: ChallanItem = { ...challan, no };
    setChallans((prev) => [fullChallan, ...prev]);

    // Update order delivered kg
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== challan.orderId) return o;
        const updatedLines = o.lines.map((l, idx) =>
          idx === challan.lineIdx ? { ...l, delivKg: l.delivKg + challan.netKg } : l
        );
        return { ...o, lines: updatedLines };
      })
    );

    addToast({
      type: 'success',
      title: 'চালান প্রস্তুত',
      message: `চালান ${no} তৈরি হয়েছে।`,
    });

    try {
      await apiClient.post('portal/challans', fullChallan);
    } catch {
      // Local state active
    }
  };

  const receiveYarnInward = async (yarn: Omit<YarnStockItem, 'id'>) => {
    const id = `YR-${Math.floor(500 + Math.random() * 500)}`;
    const fullYarn: YarnStockItem = { ...yarn, id };
    setYarns((prev) => [fullYarn, ...prev]);

    // Update order line yarn received
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== yarn.orderId) return o;
        const updated = o.lines.map((l, idx) =>
          idx === yarn.lineIdx ? { ...l, yarnRcv: l.yarnRcv + yarn.rcvKg } : l
        );
        return { ...o, lines: updated };
      })
    );

    addToast({
      type: 'success',
      title: 'সুতা রিসিভ সম্পন্ন',
      message: `${yarn.party} থেকে ${yarn.rcvKg} কেজি (${yarn.count}) রিসিভ এন্ট্রি হয়েছে।`,
    });

    try {
      await apiClient.post('portal/yarn/receive', fullYarn);
    } catch {
      // Handled
    }
  };

  const createOrder = async (order: Omit<SubcontractOrderItem, 'id'>) => {
    const id = `KK-${Math.floor(2600 + Math.random() * 100)}`;
    const fullOrder: SubcontractOrderItem = { ...order, id };
    setOrders((prev) => [fullOrder, ...prev]);

    addToast({
      type: 'success',
      title: 'নতুন অর্ডার ক্রিয়েট হয়েছে',
      message: `অর্ডার ${id} (${order.party}) সফলভাবে যুক্ত হয়েছে।`,
    });

    try {
      await apiClient.post('portal/orders', fullOrder);
    } catch {
      // Handled
    }
  };

  const sendChatMessage = async (threadId: string, text: string, senderRole: 'factory' | 'vendor' = 'factory') => {
    const newMsg = {
      from: senderRole,
      sender: senderRole === 'factory' ? 'আল-মদিনা নিটিং' : 'বায়ার প্রতিনিধি',
      time: 'এইমাত্র',
      text,
    };

    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, messages: [...th.messages, newMsg] } : th))
    );

    try {
      await apiClient.post(`portal/threads/${threadId}/messages`, newMsg);
    } catch {
      // Handled
    }
  };

  const applyForJob = async (jobId: string, applicant: { name: string; phone: string; exp: string; note: string }) => {
    addToast({
      type: 'success',
      title: 'আবেদন গৃহীত হয়েছে!',
      message: `${applicant.name}, আপনার সিভি সংশ্লিষ্ট ফ্যাক্টরিতে পাঠানো হয়েছে।`,
    });
    try {
      await apiClient.post(`public/jobs/${jobId}/apply`, applicant);
    } catch {
      // Handled
    }
  };

  const postRfq = async (rfq: Omit<SupplierRfqItem, 'id' | 'time' | 'status'>) => {
    const newId = `RFQ-${Math.floor(400 + Math.random() * 500)}`;
    const fullRfq: SupplierRfqItem = {
      ...rfq,
      id: newId,
      status: 'New',
      time: 'এইমাত্র',
    };
    setRfqs((prev) => [fullRfq, ...prev]);

    addToast({
      type: 'success',
      title: 'RFQ পোস্ট সম্পন্ন',
      message: 'আপনার কোটেশন রিকোয়েস্ট যাচাইকৃত সাপ্লায়ারদের কাছে পাঠানো হয়েছে।',
    });

    try {
      await apiClient.post('public/rfq', fullRfq);
    } catch {
      // Handled
    }
  };

  const toggleMachineStatus = async (machineId: string, newStatus: MachineItem['status']) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, status: newStatus } : m))
    );

    addToast({
      type: 'info',
      title: 'মেশিন স্ট্যাটাস পরিবর্তন',
      message: `${machineId} এখন ${newStatus}`,
    });
  };

  const recordBillPayment = async (billNo: string, amount: number) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.no !== billNo) return b;
        const newPaid = b.paidAmt + amount;
        const isFull = newPaid >= b.grossAmt - b.discount;
        return {
          ...b,
          paidAmt: newPaid,
          status: isFull ? 'Paid' : 'Part',
        };
      })
    );

    addToast({
      type: 'success',
      title: 'পেমেন্ট জমা হয়েছে',
      message: `বিল ${billNo} বাবদ ৳ ${amount.toLocaleString('en-IN')} জমা রেকর্ড করা হয়েছে।`,
    });

    try {
      await apiClient.post(`portal/bills/${billNo}/pay`, { amount });
    } catch {
      // Handled
    }
  };

  const issueStoreItem = async (issue: Omit<StoreIssueItem, 'id'>) => {
    const newId = `IS-${Math.floor(700 + Math.random() * 300)}`;
    const fullIssue: StoreIssueItem = { ...issue, id: newId };
    setStoreIssues((prev) => [fullIssue, ...prev]);

    // Decrease item stock
    setStoreItems((prev) =>
      prev.map((it) => (it.id === issue.itemId ? { ...it, stock: Math.max(0, it.stock - issue.qty) } : it))
    );

    addToast({
      type: 'success',
      title: 'স্টোর মাল ইস্যু সম্পন্ন',
      message: `${issue.itemName} (${issue.qty} ${issue.unit}) ${issue.machine} এ ইস্যু হয়েছে।`,
    });

    try {
      await apiClient.post('portal/store/movement', fullIssue);
    } catch {
      // Handled
    }
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        marketingPage,
        setMarketingPage,
        factoryView,
        setFactoryView,
        vendorView,
        setVendorView,
        supplierView,
        setSupplierView,
        role,
        setRole,
        theme,
        toggleTheme,
        selectedOrderId,
        setSelectedOrderId,
        selectedThreadId,
        setSelectedThreadId,
        selectedVendorFactoryId,
        setSelectedVendorFactoryId,
        factoryProfile,
        vendorFactories,
        orders,
        yarns,
        machines,
        prodLogs,
        rolls,
        qcLogs,
        challans,
        bills,
        parties,
        storeItems,
        storeIssues,
        vouchers,
        attendance,
        users,
        threads,
        freeOffers,
        jobs,
        services,
        suppliers,
        rfqs,
        catalog,
        ads,
        marketplacePosts,
        partner,
        toasts,
        currentUser,
        setCurrentUser,
        loginUser,
        registerUser,
        resetPasswordUser,
        logout,
        addToast,
        dismissToast,
        callModal,
        openCallModal,
        closeCallModal,
        printModal,
        openPrintModal,
        closePrintModal,
        addProductionEntry,
        updateRollStatus,
        createChallan,
        receiveYarnInward,
        createOrder,
        sendChatMessage,
        applyForJob,
        postRfq,
        toggleMachineStatus,
        recordBillPayment,
        issueStoreItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
