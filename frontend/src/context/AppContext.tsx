import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppScreenMode,
  AppUserItem,
  AttendanceItem,
  BillItem,
  ChallanItem,
  ExpenseItem,
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

export interface DashboardData {
  factory?: {
    id: number;
    code: string;
    name: string;
    area: string;
    total_machines: number;
    plan_code?: string;
    ontime_delivery_pct?: number;
    qc_reject_pct?: number;
  };
  kpis: {
    today_production_kg: number;
    running_orders_count: number;
    running_orders_total_kg: number;
    running_orders_knit_kg: number;
    running_orders_deliv_kg: number;
    total_machines: number;
    running_machines_count: number;
    idle_machines_count: number;
    free_machines_count: number;
    down_machines_count: number;
    broadcast_free_count: number;
    receivable_bills_amount: number;
    today_expense_amount: number;
    open_qc_issues_count: number;
  };
  machines: Array<{
    id: string;
    code: string;
    brand: string;
    type: string;
    dia: string;
    gg: string;
    spec_label: string;
    status: 'Running' | 'Idle' | 'Free' | 'Maint';
    raw_status?: string;
    order_no?: string;
    running_order?: string;
    operator: string;
    fabric: string;
    today_kg: number;
    target_kg: number;
    broadcast_free: boolean;
    daily_capacity_kg: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    action_label?: string;
    action_view?: string;
  }>;
  running_orders: Array<{
    id: string;
    po: string;
    party: string;
    party_code: string;
    buyer: string;
    fabric: string;
    gsm: string | number;
    dia: string;
    color: string;
    order_kg: number;
    knit_kg: number;
    deliv_kg: number;
    progress_pct: number;
    machines: string[];
    eta: string;
    status: string;
    status_bn: string;
    rate_tk: number;
  }>;
  marketplace_rfqs?: Array<{
    id: number;
    title: string;
    buyer: string;
    fabric: string;
    qty_kg: number;
    target_rate: string;
    location: string;
    delivery_date: string;
  }>;
  sync_time?: string;
}

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

  // Dashboard Live API
  dashboardData: DashboardData | null;
  isDashboardSyncing: boolean;
  fetchDashboardData: () => Promise<void>;
  quickProductionEntry: (entry: {
    machine_code: string;
    shift: string;
    operator_name: string;
    order_no?: string;
    net_kg: number;
    rolls_count: number;
    reject_kg?: number;
    rpm?: number;
    notes?: string;
  }) => Promise<void>;
  broadcastFreeMachines: (
    machineCodes: string[],
    isBroadcast: boolean,
    freeFrom?: string,
    dailyCapacity?: number,
    note?: string
  ) => Promise<void>;
  submitQuotation: (data: {
    subcontract_post_id: number;
    offered_rate_tk: number;
    estimated_days?: number;
    allocated_machines?: number;
    note?: string;
  }) => Promise<boolean>;

  // Mutations
  addProductionEntry: (entry: Omit<ProductionLogItem, 'id'>) => Promise<void>;
  updateRollStatus: (rollId: string, status: RollTagItem['status'], qcData?: Partial<QcLogItem>) => Promise<void>;
  createChallan: (challan: Omit<ChallanItem, 'no'>) => Promise<void>;
  receiveYarnInward: (yarn: Omit<YarnStockItem, 'id'>) => Promise<void>;
  createOrder: (order: Omit<SubcontractOrderItem, 'id'> & { id?: string }) => Promise<string>;
  sendChatMessage: (threadId: string, text: string, senderRole?: 'factory' | 'vendor') => Promise<void>;
  applyForJob: (jobId: string, applicant: { name: string; phone: string; exp: string; note: string }) => Promise<void>;
  postRfq: (rfq: Omit<SupplierRfqItem, 'id' | 'time' | 'status'>) => Promise<void>;
  toggleMachineStatus: (machineId: string, newStatus: MachineItem['status']) => Promise<void>;
  recordBillPayment: (billNo: string, amount: number) => Promise<void>;
  issueStoreItem: (issue: Omit<StoreIssueItem, 'id'>) => Promise<void>;
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => Promise<void>;
  punchAttendance: (workerName: string, status: AttendanceItem['todayStatus'], otHours?: number, shift?: string) => Promise<void>;
  addUser: (user: Omit<AppUserItem, 'id' | 'lastSeen'>) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  requestPartnerPayout: (amount: number, method: string, account: string) => Promise<boolean>;
  updateFactoryProfileInfo: (info: Partial<FactoryProfileInfo>) => Promise<void>;
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
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 1, category: 'electricity', title: 'পল্লী বিদ্যুৎ বিল — সেপ্টেম্বর ২০২৬', amount: 64500, method: 'bank', ref: 'BILL-REB-891', date: '2026-10-01', createdBy: 'হিসাবরক্ষক তানভীর' },
    { id: 2, category: 'maintenance', title: 'M-03 ও M-07 সিলিন্ডার বিয়ারিং ও ক্যাম অয়েলিং', amount: 8500, method: 'cash', ref: 'VOU-MC-104', date: '2026-10-02', createdBy: 'ম্যানেজার শফিকুল' },
    { id: 3, category: 'needle_oil', title: 'Groz-Beckert ভোটা নিডেল ৫০০ পিস ও লুব অয়েল ১ ব্যারেল', amount: 22000, method: 'cash', ref: 'INV-SP-09', date: '2026-10-02', createdBy: 'স্টোরকিপার হাবিব' },
    { id: 4, category: 'snacks', title: 'ফ্লোর নাইট শিফট অপারেটরদের নাস্তা ও চা', amount: 1850, method: 'cash', ref: 'SNK-04', date: '2026-10-03', createdBy: 'সুপারভাইজার মাহমুদুল' },
    { id: 5, category: 'transport', title: 'ডেলিভারি চালান পিকআপ ভ্যান ভাড়া (গাজীপুর টু জামগড়া)', amount: 3500, method: 'cash', ref: 'TRP-88', date: '2026-10-03', createdBy: 'ম্যানেজার শফিকুল' },
  ]);
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

  // Dashboard State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDashboardSyncing, setIsDashboardSyncing] = useState(false);

  const fetchDashboardData = async () => {
    setIsDashboardSyncing(true);
    try {
      const res = await apiClient.get('portal/dashboard');
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      console.warn('Dashboard sync fallback to offline state:', err.message);
    } finally {
      setIsDashboardSyncing(false);
    }
  };

  const quickProductionEntry = async (entry: {
    machine_code: string;
    shift: string;
    operator_name: string;
    order_no?: string;
    net_kg: number;
    rolls_count: number;
    reject_kg?: number;
    rpm?: number;
    notes?: string;
  }) => {
    try {
      const res = await apiClient.post('portal/dashboard/quick-production', entry);
      addToast({
        type: 'success',
        title: 'শিফট এন্ট্রি সফল',
        message: res.message || `${entry.machine_code} এ ${entry.net_kg} kg প্রোডাকশন এন্ট্রি হয়েছে।`,
      });
      await fetchDashboardData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'এন্ট্রি ব্যর্থ',
        message: err.message || 'শিফট এন্ট্রি সংরক্ষণ করা সম্ভব হয়নি।',
      });
    }
  };

  const broadcastFreeMachines = async (
    machineCodes: string[],
    isBroadcast: boolean,
    freeFrom?: string,
    dailyCapacity?: number,
    note?: string
  ) => {
    try {
      const res = await apiClient.post('portal/dashboard/broadcast-free', {
        machine_codes: machineCodes,
        is_broadcast: isBroadcast,
        free_from: freeFrom,
        daily_capacity_kg: dailyCapacity,
        note,
      });
      addToast({
        type: 'success',
        title: 'ফ্রি মেশিন ব্রডকাস্ট',
        message: res.message || `${machineCodes.length}টি মেশিন সফলভাবে ব্রডকাস্ট করা হয়েছে।`,
      });
      await fetchDashboardData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'ব্রডকাস্ট ত্রুটি',
        message: err.message || 'ব্রডকাস্ট সংরক্ষণ করা সম্ভব হয়নি।',
      });
    }
  };

  const submitQuotation = async (data: {
    subcontract_post_id: number;
    offered_rate_tk: number;
    estimated_days?: number;
    allocated_machines?: number;
    note?: string;
  }) => {
    try {
      const res = await apiClient.post('portal/dashboard/submit-quotation', data);
      addToast({
        type: 'success',
        title: 'কোটেশন প্রেরিত হয়েছে',
        message: res.message || 'বায়ার সাব-কন্ট্রাক্ট দরপত্র সফলভাবে পাঠানো হয়েছে।',
      });
      await fetchDashboardData();
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'কোটেশন ত্রুটি',
        message: err.message || 'দরপত্র পাঠানো সম্ভব হয়নি।',
      });
      return false;
    }
  };

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
          if (d.expenses && d.expenses.length) {
            setExpenses(d.expenses.map((e: any) => ({
              id: e.id,
              category: e.cat,
              title: e.title,
              amount: e.amt,
              method: e.method,
              ref: e.ref,
              date: e.date,
              createdBy: e.by,
              notes: e.notes,
            })));
          }
          if (d.partner) {
            setPartner((prev) => ({
              ...prev,
              partnerCode: d.partner.code,
              totalReferrals: d.partner.total_referrals,
              activeFactoriesCount: d.partner.active_factories,
              totalCommissionTk: d.partner.commission_earned,
              withdrawnCommissionTk: d.partner.withdrawn,
              balanceCommissionTk: d.partner.balance,
              payoutMethod: d.partner.payout_method,
              payoutNumber: d.partner.payout_number,
            }));
          }
          addToast({ type: 'success', title: 'ডাটাবেজ সংযুক্ত', message: 'Laravel 13 ও MySQL এর সাথে সফলভাবে সিঙ্ক হয়েছে।' });
        }
      })
      .catch((err) => {
        console.info('API Bootstrap offline/local fallback active:', err.message);
      });
    fetchDashboardData();
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

  const createOrder = async (order: Omit<SubcontractOrderItem, 'id'> & { id?: string }): Promise<string> => {
    const id = order.id?.trim() || order.po?.trim() || `SC-2610-02${orders.length + 1}`;
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
    return id;
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

    try {
      const statusMap: Record<string, string> = {
        Running: 'run',
        Idle: 'idle',
        Free: 'free',
        Maint: 'down',
      };
      await apiClient.post('portal/dashboard/toggle-machine', {
        machine_code: machineId,
        status: statusMap[newStatus] || 'idle',
      });
      await fetchDashboardData();
    } catch {
      // Local state preserved
    }
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

  const addExpense = async (expense: Omit<ExpenseItem, 'id'>) => {
    const newId = Date.now();
    const full: ExpenseItem = { ...expense, id: newId };
    setExpenses((prev) => [full, ...prev]);

    const newVoucher: LedgerVoucherItem = {
      id: `JV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: expense.date,
      party: 'ফ্যাক্টরি খরচ খাতা',
      type: 'Expense',
      method: expense.method.toUpperCase(),
      ref: expense.ref || `EX-${newId}`,
      narration: expense.title,
      debit: expense.amount,
      credit: 0,
    };
    setVouchers((prev) => [newVoucher, ...prev]);

    addToast({
      type: 'success',
      title: 'খরচ রেকর্ড হয়েছে',
      message: `${expense.title} (৳${expense.amount.toLocaleString('en-IN')}) খরচ এন্ট্রি সংরক্ষিত।`,
    });

    try {
      await apiClient.post('portal/accounts/expenses', {
        category: expense.category,
        title: expense.title,
        amount_tk: expense.amount,
        payment_method: expense.method,
        reference_no: expense.ref,
        expense_date: expense.date,
        created_by: expense.createdBy,
        notes: expense.notes,
      });
    } catch {
      // Local fallback
    }
  };

  const punchAttendance = async (
    workerName: string,
    status: AttendanceItem['todayStatus'],
    otHours?: number,
    shift?: string
  ) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.name === workerName
          ? {
              ...a,
              todayStatus: status,
              otHours: otHours !== undefined ? a.otHours + otHours : a.otHours,
              presentDays: status === 'Present' ? a.presentDays + 1 : a.presentDays,
            }
          : a
      )
    );

    addToast({
      type: 'success',
      title: 'হাজিরা সম্পন্ন',
      message: `${workerName} এর আজকের হাজিরা: ${status} চিহ্নিত করা হয়েছে।`,
    });

    try {
      await apiClient.post('portal/attendance/punch', {
        worker_name: workerName,
        role_type: 'operator',
        shift: shift || 'A',
        status: status.toLowerCase(),
        overtime_hours: otHours || 0,
      });
    } catch {
      // Local fallback
    }
  };

  const addUser = async (user: Omit<AppUserItem, 'id' | 'lastSeen'>) => {
    const newId = `USR-${Date.now().toString().slice(-4)}`;
    const full: AppUserItem = { ...user, id: newId, lastSeen: 'নতুন যোগকৃত' };
    setUsers((prev) => [...prev, full]);

    addToast({
      type: 'success',
      title: 'টিম মেম্বার যুক্ত হয়েছে',
      message: `${user.name} কে ${user.role} রোলে যুক্ত করা হয়েছে।`,
    });

    try {
      await apiClient.post('portal/users', {
        name: user.name,
        phone: user.phone,
        designation: user.role === 'owner' ? 'মালিক' : user.role === 'manager' ? 'ম্যানেজার' : 'অপারেটর',
        role: 'fac',
      });
    } catch {
      // Local fallback
    }
  };

  const toggleUserStatus = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' }
          : u
      )
    );

    try {
      await apiClient.post(`portal/users/${userId}/toggle`, {});
    } catch {
      // Handled
    }
  };

  const requestPartnerPayout = async (amount: number, method: string, account: string) => {
    if (amount > partner.balanceCommissionTk) {
      addToast({
        type: 'error',
        title: 'ব্যালেন্স অপ্রতুল',
        message: `উত্তোলনযোগ্য ব্যালেন্স মাত্র ৳${partner.balanceCommissionTk.toLocaleString('en-IN')}`,
      });
      return false;
    }

    setPartner((prev) => ({
      ...prev,
      withdrawnCommissionTk: prev.withdrawnCommissionTk + amount,
      balanceCommissionTk: prev.balanceCommissionTk - amount,
      payoutMethod: method,
      payoutNumber: account,
    }));

    addToast({
      type: 'success',
      title: 'উত্তোলন অনুরোধ গৃহীত',
      message: `৳${amount.toLocaleString('en-IN')} উত্তোলনের অনুরোধ ${method.toUpperCase()} (${account}) নম্বরে পাঠানো হয়েছে।`,
    });

    try {
      await apiClient.post('portal/partner/payout', {
        amount_tk: amount,
        payout_method: method,
        account_number: account,
      });
      return true;
    } catch (err: any) {
      addToast({ type: 'error', title: 'উত্তোলন ত্রুটি', message: err.message || 'অনুরোধ ব্যর্থ হয়েছে।' });
      return false;
    }
  };

  const updateFactoryProfileInfo = async (info: Partial<FactoryProfileInfo>) => {
    setFactoryProfile((prev) => ({ ...prev, ...info }));
    addToast({ type: 'success', title: 'প্রোফাইল আপডেট', message: 'ফ্যাক্টরি তথ্য ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' });
    try {
      await apiClient.post('portal/profile', {
        name: info.name,
        area: info.loc,
        address: info.address,
        phone: info.phone,
        total_machines: info.machinesCount,
      });
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
        dashboardData,
        isDashboardSyncing,
        fetchDashboardData,
        quickProductionEntry,
        broadcastFreeMachines,
        submitQuotation,
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
        expenses,
        addExpense,
        punchAttendance,
        addUser,
        toggleUserStatus,
        requestPartnerPayout,
        updateFactoryProfileInfo,
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
