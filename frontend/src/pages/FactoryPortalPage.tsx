import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KnittedKCanvas } from '@/components/common/KnittedKCanvas';
import { QrCodeSvg } from '@/components/common/QrCodeSvg';
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  FileSpreadsheet,
  Activity,
  MessageSquare,
  Radio,
  CheckSquare,
  PackageCheck,
  Truck,
  Layers,
  Archive,
  Users,
  Receipt,
  BookOpen,
  DollarSign,
  UserCheck,
  Building,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
  Sparkles,
  LogOut,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Printer,
  ChevronRight,
  Phone,
  Send,
  AlertTriangle,
  RotateCcw,
  X,
  Check,
} from 'lucide-react';
import { bnNum, fmtKg, fmtTk, pct } from '@/utils/formatters';
import { ROLES_MAP } from '@/config/appConfig';

export const FactoryPortal: React.FC = () => {
  const {
    factoryView,
    setFactoryView,
    setScreen,
    role,
    setRole,
    currentUser,
    logout,
    orders,
    machines,
    yarns,
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
    marketplacePosts,
    partner,
    selectedOrderId,
    setSelectedOrderId,
    selectedThreadId,
    setSelectedThreadId,
    openCallModal,
    openPrintModal,
    addProductionEntry,
    updateRollStatus,
    createChallan,
    receiveYarnInward,
    createOrder,
    sendChatMessage,
    toggleMachineStatus,
    recordBillPayment,
    issueStoreItem,
    addToast,
    dashboardData,
    factoryProfile,
    expenses,
    addExpense,
    punchAttendance,
    updateFactoryProfileInfo,
    addUser,
    toggleUserStatus,
    requestPartnerPayout,
    isDashboardSyncing,
    fetchDashboardData,
    quickProductionEntry,
    broadcastFreeMachines,
    submitQuotation,
  } = useApp();

  // Active Order Detail Lookup
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Forms Local State
  // 1. Shift Entry
  const [entryShift, setEntryShift] = useState('A (সকাল)');
  const [entryMachine, setEntryMachine] = useState(machines[0]?.id || 'M-01');
  const [entryOperator, setEntryOperator] = useState('মোঃ সোহেল রানা');
  const [entryKg, setEntryKg] = useState('160');
  const [entryRolls, setEntryRolls] = useState('7');
  const [entryRejectKg, setEntryRejectKg] = useState('2.5');
  const [entryRpm, setEntryRpm] = useState('28');
  const [entryNote, setEntryNote] = useState('');

  // 2. Chat Input
  const [chatText, setChatText] = useState('');
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  // 3. New Challan
  const [chParty, setChParty] = useState(activeOrder.party);
  const [chRolls, setChRolls] = useState('40');
  const [chGrossKg, setChGrossKg] = useState('1010');
  const [chNetKg, setChNetKg] = useState('1000');
  const [chVehicle, setChVehicle] = useState('ঢাকা মেট্রো-ট ১৪-৮৮২১');
  const [chDriver, setChDriver] = useState('মোঃ বাবুল মিয়া');
  const [chDriverPhone, setChDriverPhone] = useState('01722-665544');

  // 4. Yarn Inward
  const [yarnParty, setYarnParty] = useState(parties[0]?.name || '');
  const [yarnCount, setYarnCount] = useState('30/1 Combed');
  const [yarnBrand, setYarnBrand] = useState('Square');
  const [yarnLot, setYarnLot] = useState('LOT-SQ-99');
  const [yarnBags, setYarnBags] = useState('20');
  const [yarnKg, setYarnKg] = useState('1000');

  // 5. Bill Payment
  const [selectedBillForPay, setSelectedBillForPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');

  // 6. Dashboard Interactive Tasks & Modals
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [qeMachine, setQeMachine] = useState('M-01');
  const [qeShift, setQeShift] = useState('A');
  const [qeOperator, setQeOperator] = useState('মোঃ সোহেল রানা');
  const [qeOrderNo, setQeOrderNo] = useState('SC-2610-014');
  const [qeKg, setQeKg] = useState('180');
  const [qeRolls, setQeRolls] = useState('7');
  const [qeRejectKg, setQeRejectKg] = useState('1.5');
  const [qeRpm, setQeRpm] = useState('28');
  const [qeNotes, setQeNotes] = useState('');

  const [selectedMachineForAction, setSelectedMachineForAction] = useState<any>(null);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedBroadcastMachines, setSelectedBroadcastMachines] = useState<string[]>(['M-01', 'M-02', 'M-05', 'M-06']);
  const [broadcastCapacity, setBroadcastCapacity] = useState('190');
  const [broadcastDate, setBroadcastDate] = useState('2026-10-05');
  const [broadcastNote, setBroadcastNote] = useState('সিঙ্গেল জার্সি ও রিব মেশিনের দ্রুত বুকিং স্লট ওপেন।');

  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [rfqProposedRate, setRfqProposedRate] = useState('15.5');
  const [rfqCommitment, setRfqCommitment] = useState('২টি মেশিন বরাদ্দ');
  const [rfqNote, setRfqNote] = useState('আমাদের মায়ার অ্যান্ড সি সিঙ্গেল জার্সি মেশিনে সর্বোচ্চ কোয়ালিটি গ্যারান্টি।');

  // --- NEW ORDER FORM STATE ---
  const [noParty, setNoParty] = useState(parties[0]?.id || 'abc');
  const [noBuyer, setNoBuyer] = useState('H&M / C&A');
  const [noId, setNoId] = useState('SC-2610-021');
  const [noDueDate, setNoDueDate] = useState('2026-10-28');
  const [noRate, setNoRate] = useState('14.5');
  const [noLines, setNoLines] = useState<any[]>([
    { place: 'Body', kt: 'c', fab: 'Single Jersey', ggsm: '160', fgsm: '160', dia: '30" × 24G', sl: '2.65', color: 'Navy Blue', qty: 5000, machines: ['M-01', 'M-02'], count: '30/1 Combed', brand: 'Square', lot: 'SQ-884' }
  ]);

  // --- LEDGER STATE ---
  const [ledgerParty, setLedgerParty] = useState(parties[0]?.id || 'abc');

  // --- EXPENSE FORM STATE ---
  const [expCategory, setExpCategory] = useState('maintenance');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expMethod, setExpMethod] = useState('cash');
  const [expRef, setExpRef] = useState('');

  // --- ATTENDANCE STATE ---
  const [attShift, setAttShift] = useState('All');

  // --- WHATSAPP BUILDER STATE ---
  const [waType, setWaType] = useState<'daily' | 'order' | 'challan' | 'qc'>('daily');
  const [waTargetPhone, setWaTargetPhone] = useState('01711000111');

  // --- USER FORM STATE ---
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserDesig, setNewUserDesig] = useState('অপারেটর');
  const [newUserRole, setNewUserRole] = useState<any>('operator');

  // --- PARTNER PAYOUT STATE ---
  const [payoutAmt, setPayoutAmt] = useState('5000');
  const [payoutMethod, setPayoutMethod] = useState('bkash');
  const [payoutNumber, setPayoutNumber] = useState('01819000000');

  // --- READY ROLLS SELECTION ---
  const [selectedReadyRolls, setSelectedReadyRolls] = useState<string[]>([]);
  const [freadyFilter, setFreadyFilter] = useState('all');

  // --- PROFILE EDIT STATE ---
  const [profName, setProfName] = useState(factoryProfile?.name || 'আল-মদিনা নিটওয়্যার লিঃ');
  const [profOwner, setProfOwner] = useState(factoryProfile?.owner || 'হাজী মোঃ রফিকুল ইসলাম');
  const [profPhone, setProfPhone] = useState(factoryProfile?.phone || '01711-889900');
  const [profAddress, setProfAddress] = useState(factoryProfile?.address || 'বিসিক শিল্পনগরী, ফতুল্লা, নারায়ণগঞ্জ');
  const [profLoc, setProfLoc] = useState(factoryProfile?.loc || 'নারায়ণগঞ্জ');
  const [profMachines, setProfMachines] = useState(String(factoryProfile?.machinesCount || 24));

  // Sidebar Menu Config
  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badge?: string | number;
  }
  interface MenuGroup {
    group: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      group: 'কোর অপারেশন',
      items: [
        { id: 'dash', label: 'ফ্যাক্টরি ড্যাশবোর্ড', icon: LayoutDashboard },
        { id: 'orders', label: 'অর্ডার তালিকা', icon: ClipboardList, badge: orders.length },
        { id: 'detail', label: 'অর্ডার বিস্তারিত', icon: FileSpreadsheet },
        { id: 'neworder', label: '+ নতুন সাব-কন্ট্রাক্ট অর্ডার', icon: FilePlus },
        { id: 'jobcard', label: 'প্রোডাকশন জব কার্ড', icon: BookOpen },
        { id: 'entry', label: 'শিফট এন্ট্রি ও রোল ট্যাগ', icon: Activity },
      ],
    },
    {
      group: 'বায়ার সংযোগ ও ফ্লোর',
      items: [
        { id: 'fmsg', label: 'বায়ার চ্যাট ও বার্তা', icon: MessageSquare, badge: '২' },
        { id: 'freem', label: 'ফ্রি মেশিন ব্রডকাস্ট', icon: Radio, badge: 'লাইভ' },
        { id: 'qc', label: '৪-পয়েন্ট ফ্যাব্রিক QC', icon: CheckSquare },
        { id: 'fready', label: 'রেডি রোল স্টক', icon: PackageCheck },
        { id: 'challan', label: 'ডেলিভারি চালান ও গেট পাস', icon: Truck },
        { id: 'subcontract', label: 'সাব-কন্ট্রাক্ট মার্কেটপ্লেস', icon: Sparkles, badge: 'নতুন' },
      ],
    },
    {
      group: 'ইনভেন্টরি ও স্টোর',
      items: [
        { id: 'yarn', label: 'সুতা রিসিভ ও লেজার', icon: Layers },
        { id: 'store', label: 'নিডেল, সিংকার ও অয়েল স্টোর', icon: Archive },
        { id: 'party', label: 'পার্টি ও বায়ার তালিকা', icon: Users },
      ],
    },
    {
      group: 'হিসাব ও অ্যাডমিন',
      items: [
        { id: 'bill', label: 'নিটিং বিল ও ইনভয়েস', icon: Receipt },
        { id: 'ledger', label: 'জমা-খরচ ও ক্যাশ লেজার', icon: DollarSign },
        { id: 'acc', label: 'লাভ-ক্ষতি ও মেশিন কস্টিং', icon: TrendingUp },
        { id: 'att', label: 'অপারেটর হাজিরা ও বেতন', icon: UserCheck },
        { id: 'wa', label: 'হোয়াটসঅ্যাপ নোটিফিকেশন', icon: MessageCircle },
        { id: 'profile', label: 'ফ্যাক্টরি প্রোফাইল ও মেশিন', icon: Building },
        { id: 'users', label: 'স্টাফ ও পারমিশন কন্ট্রোল', icon: ShieldCheck },
        { id: 'pdash', label: 'KnitKhata পার্টনার আর্নিং', icon: DollarSign },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top Header exact from KnitKhata.html */}
      <header className="top">
        <div className="brand">
          <div className="logo">
            <KnittedKCanvas size={20} fgColor="#FFFFFF" />
          </div>
          <div>
            <b>নিটখাতা</b>
            <small>{currentUser?.organization_name || 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা ফ্যাক্টরি)'}</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="proto">লাইভ সিঙ্ক: MySQL</span>
          <button
            type="button"
            className="btn sm"
            onClick={fetchDashboardData}
            disabled={isDashboardSyncing}
            title="ডাটাবেজ রিফ্রেশ করুন"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: 11 }}
          >
            <RotateCcw size={12} style={{ animation: isDashboardSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isDashboardSyncing ? 'সিঙ্ক...' : 'রিফ্রেশ'}</span>
          </button>
        </div>

        <div className="roleswitch" role="group" aria-label="কার চোখে দেখবেন">
          <button
            className={role === 'owner' || (role as string) === 'factory' || (role as string) === 'fac' ? 'on' : ''}
            onClick={() => setRole('owner')}
          >
            ফ্যাক্টরি ভিউ
          </button>
          <button
            className={role === 'vendor' ? 'on' : ''}
            onClick={() => {
              setRole('vendor');
              setScreen('vendor');
            }}
          >
            ভেন্ডর ভিউ (ABC)
          </button>
          <button
            className={role === 'supplier' ? 'on' : ''}
            onClick={() => {
              setRole('supplier');
              setScreen('supplier');
            }}
          >
            সাপ্লায়ার ভিউ
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
          <span>রোল:</span>
          <select
            className="select"
            style={{ width: 125, padding: '3px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="owner">মালিক (Owner)</option>
            <option value="manager">ম্যানেজার</option>
            <option value="prod">প্রোডাকশন</option>
            <option value="qc">QC ইন্সপেক্টর</option>
            <option value="store">স্টোর কিপার</option>
            <option value="acc">হিসাবরক্ষক</option>
          </select>
        </div>

        <button
          type="button"
          className="top-user"
          onClick={() => setFactoryView('profile')}
          aria-label="প্রোফাইল ও সেটিংস"
        >
          <span className="av">আ</span>
          <span>
            <b>{users[0]?.name || 'আরিফ হোসেন'}</b>
            <small>{currentUser?.designation || ROLES_MAP[role]?.bn || 'মালিক'}</small>
          </span>
        </button>

        <button
          type="button"
          className="btn sm"
          onClick={logout}
          style={{ color: 'var(--bad)', borderColor: 'var(--line)' }}
        >
          লগআউট
        </button>
      </header>

      {/* App Shell with Left Rail & Working Canvas */}
      <div className="shell">
        <nav className="rail" id="rail">
          {menuGroups.map((grp, gIdx) => (
            <React.Fragment key={gIdx}>
              <div className="grp">{grp.group}</div>
              {grp.items.map((it) => {
                const Icon = it.icon;
                const active = factoryView === it.id;
                return (
                  <button
                    key={it.id}
                    className={active ? 'on' : ''}
                    onClick={() => setFactoryView(it.id)}
                  >
                    <Icon size={17} />
                    <span>{it.label}</span>
                    {it.badge && (
                      <span
                        className="ch-un"
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: active ? '#ffffff' : 'var(--surface2)',
                          color: active ? 'var(--accent)' : 'var(--ink)',
                          fontWeight: 600,
                        }}
                      >
                        {it.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}

          <div className="grp" style={{ marginTop: 'auto', paddingTop: 16 }}>অ্যাকশন</div>
          <button onClick={logout} style={{ color: 'var(--bad)' }}>
            <LogOut size={17} />
            <span>লগআউট করুন</span>
          </button>
          <button onClick={() => setScreen('site')} style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={17} />
            <span>ওয়েবসাইটে ফিরুন</span>
          </button>
        </nav>

        {/* Working Canvas matching KnitKhata.html */}
        <main id="main">
          {/* ================= 1. DASHBOARD VIEW ================= */}
          {factoryView === 'dash' && (
            <>
              {/* Header section matching KnitKhata.html */}
              <div className="head">
                <div>
                  <h2>আজকের অবস্থা</h2>
                  <p>শনিবার, ৩ অক্টোবর ২০২৬ · শিফট A চলছে · লাইভ সিঙ্ক: MySQL ({dashboardData?.sync_time ? new Date(dashboardData.sync_time).toLocaleTimeString('bn-BD') : 'সক্রিয়'})</p>
                </div>
                <div className="row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn" onClick={() => setIsQuickEntryOpen(true)}>+ প্রোডাকশন এন্ট্রি</button>
                  <button className="btn pri" onClick={() => setFactoryView('orders')}>অর্ডার দেখুন</button>
                </div>
              </div>

              {/* Exact KPI cards connected to live database */}
              <div className="kpis">
                <div className="kpi" style={{ borderLeft: '4px solid var(--ok)', cursor: 'pointer' }} onClick={() => setIsQuickEntryOpen(true)}>
                  <span>আজকের মোট উৎপাদন</span>
                  <b>
                    {dashboardData?.kpis ? bnNum(Math.round(dashboardData.kpis.today_production_kg)) : '১,৪২৫'} <span style={{ fontSize: '0.85rem' }}>kg</span>
                  </b>
                  <i>৮টি মেশিনের শিফট এন্ট্রি</i>
                </div>

                <div className="kpi" style={{ borderLeft: '4px solid var(--accent)', cursor: 'pointer' }} onClick={() => setFactoryView('orders')}>
                  <span>সক্রিয় রানিং অর্ডার</span>
                  <b>
                    {dashboardData?.kpis ? bnNum(dashboardData.kpis.running_orders_count) : orders.filter((o) => o.status === 'Running').length} <span style={{ fontSize: '0.85rem' }}>টি PO</span>
                  </b>
                  <i>মোট অর্ডার: {dashboardData?.kpis ? bnNum(dashboardData.kpis.running_orders_total_kg) : '২৪,৪০০'} kg</i>
                </div>

                <div className="kpi" style={{ borderLeft: '4px solid var(--yarn)', cursor: 'pointer' }} onClick={() => setIsBroadcastModalOpen(true)}>
                  <span>ফ্রি মেশিন (বুকিং ওপেন)</span>
                  <b>
                    {dashboardData?.kpis ? bnNum(dashboardData.kpis.free_machines_count) : '৪'} <span style={{ fontSize: '0.85rem' }}>টি</span>
                  </b>
                  <i style={{ color: 'var(--accent)', fontWeight: 600 }}>📡 ব্রডকাস্ট করুন</i>
                </div>

                <div className="kpi" style={{ borderLeft: '4px solid var(--warn)', cursor: 'pointer' }} onClick={() => setFactoryView('bill')}>
                  <span>বকেয়া বিল আদায়যোগ্য</span>
                  <b>৳ {dashboardData?.kpis ? (Math.round(dashboardData.kpis.receivable_bills_amount)).toLocaleString('en-IN') : '২,০৩,৪০০'}</b>
                  <i>৩টি পার্টির চালান বিল বাকি</i>
                </div>

                <div className="kpi" style={{ borderLeft: '4px solid var(--l4)', cursor: 'pointer' }} onClick={() => setFactoryView('ledger')}>
                  <span>আজকের খরচ</span>
                  <b>৳ {dashboardData?.kpis ? (Math.round(dashboardData.kpis.today_expense_amount)).toLocaleString('en-IN') : '১৮,৪৫০'}</b>
                  <i>৬টি ভাউচার এন্ট্রি</i>
                </div>
              </div>

              {/* 2-Column Grid for Machine Board & Alerts */}
              <div className="grid g2">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>মেশিন বোর্ড (২৪টি মেশিন)</h3>
                    <button className="btn sm" onClick={() => setIsBroadcastModalOpen(true)}>ফ্রি মেশিন ব্রডকাস্ট</button>
                  </div>
                  <div className="machines">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const id = `M-${String(i + 1).padStart(2, '0')}`;
                      const liveMc = dashboardData?.machines?.find((m) => m.code === id || m.id === id);
                      const mc = liveMc || machines.find((m) => m.id === id);
                      
                      const st = mc ? (mc.status === 'Running' ? 'run' : mc.status === 'Free' ? 'wait' : mc.status === 'Maint' ? 'down' : 'idle') : (i < 16 ? 'run' : i < 18 ? 'wait' : i === 18 ? 'down' : 'idle');
                      const orderRef = (mc as any)?.running_order || (mc as any)?.orderId || (mc as any)?.runningOrder;
                      const label = st === 'run' ? (orderRef ? String(orderRef).slice(-3) : '014') : st === 'wait' ? 'রিজার্ভ' : st === 'down' ? 'ব্রেকডাউন' : 'খালি';
                      
                      return (
                        <div
                          key={id}
                          className={`mc ${st}`}
                          title={`${id}: ${label} (ক্লিক করে স্ট্যাটাস পরিবর্তন করুন)`}
                          style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                          onClick={() => setSelectedMachineForAction(mc || { id, code: id, brand: 'Pailung', type: 'Single Jersey', status: st === 'run' ? 'Running' : st === 'wait' ? 'Free' : st === 'down' ? 'Maint' : 'Idle', operator: 'মোঃ সোহেল রানা', fabric: 'Single Jersey 160 GSM', today_kg: 180, target_kg: 240, running_order: 'SC-2610-014' })}
                        >
                          <b>{id}</b>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                  <div className="legend">
                    <span style={{ '--c': 'var(--accent)' } as any}>অর্ডারে চলছে</span>
                    <span style={{ '--c': 'var(--yarn)' } as any}>পরের অর্ডারের জন্য রিজার্ভ</span>
                    <span style={{ '--c': 'var(--bad)' } as any}>ব্রেকডাউন</span>
                    <span style={{ '--c': 'var(--idle)' } as any}>খালি / প্রস্তুত</span>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ margin: 0, marginBottom: 12 }}>নজর দেওয়া দরকার</h3>
                  {(dashboardData?.alerts || [
                    { id: 'alt-1', type: 'bad', title: 'SC-2610-014', message: 'M-07 এ needle mark, ১টি রোল (২২ kg) বাতিল। ABC কে জানানো হয়েছে।', action_label: 'QC সমাধান', action_view: 'qc' },
                    { id: 'alt-2', type: 'yarn', title: 'SC-2610-018', message: 'নবোদয় টেক্সটাইলের সুতা এখনো আসেনি। ৩টি মেশিন রিজার্ভ করে রাখা।', action_label: 'সুতা ট্র্যাকার', action_view: 'yarn' },
                    { id: 'alt-3', type: 'warn', title: 'SC-2609-011', message: 'মাত্র ১৯০ kg বাকি, কাল দুপুরে শেষ হবে। ডেলিভারি চালান রেডি করুন।', action_label: 'চালান কাটুন', action_view: 'challan' },
                    { id: 'alt-4', type: 'accent', title: 'বিল অনুমোদন', message: 'ABC Knit Composite এর সেপ্টেম্বর মাসের বিল রেডি হয়েছে।', action_label: 'লেজার দেখুন', action_view: 'bill' },
                  ]).map((alt: any) => (
                    <div key={alt.id} className="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <i className="dot" style={{ background: alt.type === 'bad' ? 'var(--bad)' : alt.type === 'yarn' ? 'var(--yarn)' : alt.type === 'warn' ? 'var(--warn)' : 'var(--accent)' }}></i>
                        <div>
                          <b>{alt.title}</b> — {alt.message}
                        </div>
                      </div>
                      {alt.action_view && (
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => setFactoryView(alt.action_view)}
                          style={{ whiteSpace: 'nowrap', marginLeft: 12, fontSize: '0.78rem' }}
                        >
                          {alt.action_label || 'দেখুন'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subcontract Opportunities from Buyers (Best of shilposetu-old) */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>বায়ার সাব-কন্ট্রাক্ট কাজের সুযোগ (মার্কেটপ্লেস RFQ)</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      সরাসরি বায়ার ও গার্মেন্টস থেকে আসা নিটিং অর্ডার — ফ্যাক্টরি রেটে কোটেশন দিন
                    </p>
                  </div>
                  <button className="btn sm" onClick={() => setFactoryView('subcontract')}>
                    সব মার্কেটপ্লেস পোস্ট দেখুন
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {(dashboardData?.marketplace_rfqs && dashboardData.marketplace_rfqs.length > 0 ? dashboardData.marketplace_rfqs : [
                    { id: 1, title: 'Single Jersey 160 GSM 5,000 kg জরুরি নিটিং সাবকন্ট্রাক্ট', buyer: 'ABC Fashion Ltd', fabric: 'Single Jersey', qty_kg: 5000, target_rate: '৳১৪–১৬/kg', location: 'গাজীপুর', delivery_date: '২০ অক্টোবর ২০২৬' },
                    { id: 2, title: '1x1 Lycra Rib 220 GSM 3,500 kg সাবকন্ট্রাক্ট', buyer: 'Next Sourcing', fabric: '1x1 Rib Lycra', qty_kg: 3500, target_rate: '৳১৮–২০/kg', location: 'আশুলিয়া', delivery_date: '২৫ অক্টোবর ২০২৬' },
                  ]).map((rfq: any) => (
                    <div
                      key={rfq.id}
                      style={{
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        padding: 14,
                        background: 'var(--surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className="pill p-acc">{rfq.buyer}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{rfq.location}</span>
                        </div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 600 }}>{rfq.title}</h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div><strong>ফেব্রিক:</strong> {rfq.fabric}</div>
                          <div><strong>পরিমাণ:</strong> <span className="mono">{rfq.qty_kg > 0 ? bnNum(rfq.qty_kg) : '৫,০০০'} kg</span></div>
                          <div><strong>টার্গেট রেট:</strong> {rfq.target_rate}</div>
                          <div><strong>ডেলিভারি:</strong> {rfq.delivery_date}</div>
                        </div>
                      </div>
                      <button
                        className="btn pri sm"
                        onClick={() => {
                          setSelectedRfq(rfq);
                          setIsRfqModalOpen(true);
                        }}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        দরপত্র / কোটেশন জমা দিন
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floor Machine Live Monitor Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>ফ্লোর মেশিন লাইভ মনিটর (৮টি মেশিন)</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>প্রতি মেশিনের আরপিএম, বর্তমান অর্ডার ও অপারেটর</p>
                  </div>
                  <button onClick={() => setIsBroadcastModalOpen(true)} className="btn sm">
                    ফ্রি মেশিন ব্রডকাস্ট দেখুন
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                  {(dashboardData?.machines?.slice(0, 8) || machines.slice(0, 8)).map((m: any) => {
                    const isRun = m.status === 'Running';
                    const isFree = m.status === 'Free';
                    const isIdle = m.status === 'Idle';
                    const isMaint = m.status === 'Maint';

                    return (
                      <div
                        key={m.id}
                        style={{
                          border: '1px solid var(--line)',
                          borderRadius: 10,
                          padding: 12,
                          background: isRun ? 'var(--surface)' : isFree ? 'var(--yarn-soft)' : 'var(--surface2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedMachineForAction(m)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', fontFamily: 'var(--f-mono)' }}>{m.id}</span>
                          <span className={`pill ${isRun ? 'p-ok' : isFree ? 'p-warn' : isMaint ? 'p-bad' : 'p-acc'}`}>
                            {m.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                          {m.type} ({m.dia} × {m.gg})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.brand}</div>

                        <div style={{ padding: '6px 8px', background: 'var(--surface2)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div><strong>ফ্যাব্রিক:</strong> {m.fabric}</div>
                          <div><strong>অপারেটর:</strong> {m.operator}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 'auto', paddingTop: 4 }}>
                          <span>আজকের: <strong className="mono" style={{ color: 'var(--ink)' }}>{m.today_kg ?? m.todayKg} kg</strong></span>
                          <span>টার্গেট: <span className="mono">{m.target_kg ?? m.targetKg} kg</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Running Subcontract Orders Table */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>চলমান সাব-কন্ট্রাক্ট অর্ডারসমূহ</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>উৎপাদন ও ডেলিভারি অগ্রগতি</p>
                  </div>
                  <button onClick={() => setFactoryView('neworder')} className="btn pri sm">
                    <Plus size={14} style={{ marginRight: 4 }} /> নতুন অর্ডার যোগ করুন
                  </button>
                </div>

                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>অর্ডার নং</th>
                        <th>পার্টি / বায়ার</th>
                        <th>ফেব্রিক ও কালার</th>
                        <th className="n">অর্ডার (kg)</th>
                        <th className="n">বোনা (kg)</th>
                        <th className="n">ডেলিভারি</th>
                        <th>অগ্রগতি</th>
                        <th>অবস্থা</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData?.running_orders || orders).map((o: any) => {
                        const totalKg = o.order_kg ?? o.lines?.reduce((a: any, b: any) => a + b.orderKg, 0) ?? 10000;
                        const knitKg = o.knit_kg ?? o.lines?.reduce((a: any, b: any) => a + b.knitKg, 0) ?? 6000;
                        const delivKg = o.deliv_kg ?? o.lines?.reduce((a: any, b: any) => a + b.delivKg, 0) ?? 4000;
                        const prog = o.progress_pct ?? pct(knitKg, totalKg);

                        return (
                          <tr key={o.id}>
                            <td className="mono"><b>{o.id}</b><small style={{ display: 'block', color: 'var(--muted)' }}>{o.po}</small></td>
                            <td><b>{o.party}</b><small style={{ display: 'block', color: 'var(--muted)' }}>{o.buyer}</small></td>
                            <td>{o.fabric || o.style}<small style={{ display: 'block', color: 'var(--muted)' }}>{o.color}</small></td>
                            <td className="n mono">{fmtKg(totalKg)}</td>
                            <td className="n mono" style={{ color: 'var(--ok)', fontWeight: 600 }}>{fmtKg(knitKg)}</td>
                            <td className="n mono">{fmtKg(delivKg)}</td>
                            <td>
                              <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'center', gap: 6 }}>
                                <div className="bar" style={{ width: 80 }}><i style={{ width: `${prog}%` }}></i></div>
                                <span className="mono small" style={{ fontSize: '0.78rem' }}>{prog}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`pill ${o.status === 'Running' || o.status === 'run' ? 'p-acc' : o.status === 'Completed' || o.status === 'done' ? 'p-ok' : 'p-warn'}`}>
                                {o.status === 'Running' || o.status === 'run' ? 'চলছে' : o.status === 'Completed' || o.status === 'done' ? 'সম্পন্ন' : 'অপেক্ষায়'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedOrderId(o.id);
                                  setFactoryView('detail');
                                }}
                                className="btn sm"
                              >
                                বিস্তারিত <ChevronRight size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {factoryView === 'orders' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>সকল সাব-কন্ট্রাক্ট ওয়ার্ক অর্ডার ({bnNum(orders.length)})</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>বায়ার ও পার্টি অনুযায়ী কাপড়ের চাহিদা</p>
                </div>
                <button onClick={() => setFactoryView('neworder')} className="btn btn-primary btn-sm">
                  + নতুন অর্ডার তৈরি করুন
                </button>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>অর্ডার নং</th>
                      <th>পার্টি নাম</th>
                      <th>বায়ার ও স্টাইল</th>
                      <th>অর্ডার তারিখ</th>
                      <th>ডেলিভারি তারিখ</th>
                      <th>মোট কেজি</th>
                      <th>স্ট্যাটাস</th>
                      <th>পেমেন্ট</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const totalKg = o.lines.reduce((a, b) => a + b.orderKg, 0);
                      return (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td><strong>{o.party}</strong></td>
                          <td>{o.buyer} - {o.style}</td>
                          <td>{o.orderDate}</td>
                          <td>{o.delivDate}</td>
                          <td>{fmtKg(totalKg)}</td>
                          <td><span className="badge badge-green">{o.status}</span></td>
                          <td><span className={`badge ${o.payStatus === 'Paid' ? 'badge-green' : 'badge-amber'}`}>{o.payStatus}</span></td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedOrderId(o.id);
                                setFactoryView('detail');
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              ভিউ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. ORDER DETAIL VIEW ================= */}
          {factoryView === 'detail' && activeOrder && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <button onClick={() => setFactoryView('orders')} className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }}>
                    ← অর্ডারের তালিকায় ফিরুন
                  </button>
                  <h2 style={{ fontSize: 22, fontWeight: 800 }}>অর্ডার {activeOrder.id} — {activeOrder.party}</h2>
                  <div style={{ fontSize: 13, color: '#64748b' }}>বায়ার: {activeOrder.buyer} · স্টাইল: {activeOrder.style}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => openPrintModal('jobcard', `জব কার্ড - ${activeOrder.id}`, activeOrder)}
                    className="btn btn-secondary"
                  >
                    <Printer size={16} /> জব কার্ড প্রিন্ট
                  </button>
                  <button onClick={() => setFactoryView('entry')} className="btn btn-primary">
                    <Plus size={16} /> প্রোডাকশন এন্ট্রি দিন
                  </button>
                </div>
              </div>

              {/* Order Lines */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>অর্ডারের ফ্যাব্রিক আইটেমসমূহ</h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ফ্যাব্রিক ধরন</th>
                        <th>ডায়া ও গেজ</th>
                        <th>GSM</th>
                        <th>ইয়ার্ন কাউন্ট ও লট</th>
                        <th>অর্ডার (kg)</th>
                        <th>রেট (৳)</th>
                        <th>সুতা রিসিভ</th>
                        <th>বোনা হয়েছে</th>
                        <th>ডেলিভারি</th>
                        <th>অ্যাসাইন মেশিন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrder.lines.map((ln) => (
                        <tr key={ln.id}>
                          <td><strong>{ln.fabric}</strong></td>
                          <td>{ln.dia}</td>
                          <td>{ln.gsm}</td>
                          <td>{ln.yarn} ({ln.lot})</td>
                          <td><strong>{fmtKg(ln.orderKg)}</strong></td>
                          <td>৳ {ln.rate}</td>
                          <td>{fmtKg(ln.yarnRcv)}</td>
                          <td style={{ color: '#0d6e4f', fontWeight: 700 }}>{fmtKg(ln.knitKg)}</td>
                          <td>{fmtKg(ln.delivKg)}</td>
                          <td><span className="badge badge-blue">{ln.machine}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. SHIFT ENTRY & ROLL TAGGING ================= */}
          {factoryView === 'entry' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>দৈনিক শিফট প্রোডাকশন এন্ট্রি</h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>অপারেটর অনুযায়ী মেশিনের উৎপাদন রেকর্ড</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addProductionEntry({
                      date: new Date().toLocaleDateString('bn-BD'),
                      shift: entryShift,
                      machine: entryMachine,
                      operator: entryOperator,
                      orderId: selectedOrderId,
                      lineIdx: 0,
                      rolls: Number(entryRolls),
                      kg: Number(entryKg),
                      rejectKg: Number(entryRejectKg),
                      rpm: Number(entryRpm),
                      eff: 90,
                      note: entryNote,
                    });
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label">ওয়ার্ক অর্ডার বাছাই করুন</label>
                      <select
                        className="select"
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                      >
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.id} ({o.party})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">মেশিন নম্বর</label>
                      <select
                        className="select"
                        value={entryMachine}
                        onChange={(e) => setEntryMachine(e.target.value)}
                      >
                        {machines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id} - {m.type} ({m.dia})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label">শিফট</label>
                      <select
                        className="select"
                        value={entryShift}
                        onChange={(e) => setEntryShift(e.target.value)}
                      >
                        <option value="A (সকাল)">A (সকাল ৬টা – দুপুর ২টা)</option>
                        <option value="B (বিকাল)">B (দুপুর ২টা – রাত ১০টা)</option>
                        <option value="C (রাত)">C (রাত ১০টা – সকাল ৬টা)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">অপারেটরের নাম</label>
                      <input
                        type="text"
                        className="input"
                        value={entryOperator}
                        onChange={(e) => setEntryOperator(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <label className="form-label">বোনা কাপড় (কেজি)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        className="input"
                        value={entryKg}
                        onChange={(e) => setEntryKg(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">রোল সংখ্যা</label>
                      <input
                        type="number"
                        required
                        className="input"
                        value={entryRolls}
                        onChange={(e) => setEntryRolls(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">ওয়েস্টেজ / রিজেক্ট (কেজি)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={entryRejectKg}
                        onChange={(e) => setEntryRejectKg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">মন্তব্য / স্টিচ লেন্থ</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="যেমন: স্টিচ ২.৬৫ মিমি, কোনো নিডেল লাইন নেই"
                      value={entryNote}
                      onChange={(e) => setEntryNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
                    প্রোডাকশন সেভ ও রোল ট্যাগ তৈরি করুন
                  </button>
                </form>
              </div>

              {/* Live Roll Tag Preview Card */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>QR কোড রোল ট্যাগ প্রিভিউ</h3>
                <div
                  style={{
                    border: '2px solid #0f172a',
                    borderRadius: 12,
                    padding: 20,
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0d6e4f' }}>আল-মদিনা নিটওয়্যার লিঃ</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>বিসিক শিল্পনগরী, ফতুল্লা, নারায়ণগঞ্জ</div>

                  <div style={{ margin: '14px 0' }}>
                    <QrCodeSvg value={`ROLL-KK2601-${Date.now().toString().slice(-4)}`} size={120} />
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    রোল আইডি: RL-2601-{(rolls.length + 1).toString().padStart(3, '0')}
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>
                    অর্ডার: <strong>{selectedOrderId}</strong> · মেশিন: <strong>{entryMachine}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginTop: 14, paddingTop: 12, borderTop: '1px dashed #cbd5e1', fontSize: 12, textAlign: 'left' }}>
                    <div><strong>ওজন:</strong> {(Number(entryKg) / Math.max(1, Number(entryRolls))).toFixed(1)} kg</div>
                    <div><strong>শিফট:</strong> {entryShift}</div>
                    <div><strong>অপারেটর:</strong> {entryOperator}</div>
                    <div><strong>তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}</div>
                  </div>

                  <button
                    onClick={() => openPrintModal('rolltag', 'রোল ট্যাগ লেবেল প্রিন্ট', { rollId: 'RL-2601-086', orderId: selectedOrderId })}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 16, width: '100%' }}
                  >
                    <Printer size={14} /> ৪"×৬" থার্মাল লেবেল প্রিন্ট করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. QC 4-POINT INSPECTION ================= */}
          {factoryView === 'qc' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>৪-পয়েন্ট ফ্যাব্রিক QC লগ ও গ্রেডিং</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>প্রতি রোলের GSM, ডায়া ও ডিফেক্ট পয়েন্ট ইন্সপেকশন</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>QC আইডি</th>
                      <th>রোল নম্বর</th>
                      <th>অর্ডার</th>
                      <th>ফ্যাব্রিক ও ডায়া</th>
                      <th>কাঙ্ক্ষিত GSM</th>
                      <th>প্রকৃত GSM</th>
                      <th>ডিফেক্ট পয়েন্ট</th>
                      <th>পয়েন্ট / ১০০ গজ</th>
                      <th>QC গ্রেড</th>
                      <th>ইন্সপেক্টর</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qcLogs.map((qc) => (
                      <tr key={qc.id}>
                        <td><strong>{qc.id}</strong></td>
                        <td><strong>{qc.rollId}</strong></td>
                        <td>{qc.orderId}</td>
                        <td>{qc.fabric} ({qc.dia})</td>
                        <td>{qc.reqGsm}</td>
                        <td style={{ fontWeight: 700, color: Math.abs(qc.reqGsm - qc.actGsm) > 5 ? '#c0392b' : '#0d6e4f' }}>
                          {qc.actGsm}
                        </td>
                        <td>{qc.totalPts} pts</td>
                        <td>{qc.ptsPer100}</td>
                        <td>
                          <span className={`badge ${qc.grade.includes('Pass') ? 'badge-green' : 'badge-red'}`}>
                            {qc.grade}
                          </span>
                        </td>
                        <td>{qc.inspector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. DELIVERY CHALLAN ================= */}
          {factoryView === 'challan' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>ডেলিভারি চালান ও ডিজিটাল গেট পাস</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>বায়ার ও ডাইং ফ্যাক্টরির জন্য কাপড়ের চালান</p>
                </div>
                <button
                  onClick={() => {
                    createChallan({
                      date: new Date().toLocaleDateString('bn-BD'),
                      orderId: selectedOrderId,
                      party: chParty,
                      lineIdx: 0,
                      fabric: 'Single Jersey',
                      dia: '30" × 24G',
                      rolls: Number(chRolls),
                      grossKg: Number(chGrossKg),
                      netKg: Number(chNetKg),
                      vehicle: chVehicle,
                      driver: chDriver,
                      driverPhone: chDriverPhone,
                      gatePass: `GP-${Math.floor(800 + Math.random() * 200)}`,
                      status: 'Delivered',
                      factoryId: 'FAC-1',
                    });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  + নতুন চালান তৈরি করুন
                </button>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>চালান নং</th>
                      <th>তারিখ</th>
                      <th>বায়ার / পার্টি</th>
                      <th>অর্ডার</th>
                      <th>কাপড় ও ডায়া</th>
                      <th>রোল সংখ্যা</th>
                      <th>নেট ওজন (kg)</th>
                      <th>গাড়ি নম্বর ও ড্রাইভার</th>
                      <th>গেট পাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challans.map((ch) => (
                      <tr key={ch.no}>
                        <td><strong>{ch.no}</strong></td>
                        <td>{ch.date}</td>
                        <td><strong>{ch.party}</strong></td>
                        <td>{ch.orderId}</td>
                        <td>{ch.fabric}</td>
                        <td>{ch.rolls} টি</td>
                        <td style={{ color: '#0d6e4f', fontWeight: 800 }}>{fmtKg(ch.netKg)}</td>
                        <td>{ch.vehicle} ({ch.driver})</td>
                        <td><span className="badge badge-blue">{ch.gatePass}</span></td>
                        <td>
                          <button
                            onClick={() => openPrintModal('challan', `ডেলিভারি চালান - ${ch.no}`, ch)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Printer size={14} /> প্রিন্ট
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. YARN STOCK & INWARD ================= */}
          {factoryView === 'yarn' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>সুতা রিসিভ ও পার্টি স্টক ব্যালেন্স</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>বস্তা রিসিভ, নিটিং ব্যবহার ও বর্তমান অবশিষ্ট</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>আইডি</th>
                      <th>অর্ডার</th>
                      <th>পার্টি নাম</th>
                      <th>সুতার কাউন্ট ও ব্র্যান্ড</th>
                      <th>লট নম্বর</th>
                      <th>রিসিভ (কেজি)</th>
                      <th>বোনায় ব্যবহার</th>
                      <th>অবশিষ্ট সুতা</th>
                      <th>ওয়েস্টেজ %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yarns.map((y) => {
                      const balance = y.rcvKg - y.usedKg - y.retKg;
                      const wastePct = y.usedKg ? ((y.wastageKg / y.usedKg) * 100).toFixed(1) : '0';

                      return (
                        <tr key={y.id}>
                          <td><strong>{y.id}</strong></td>
                          <td>{y.orderId}</td>
                          <td><strong>{y.party}</strong></td>
                          <td>{y.count} ({y.brand})</td>
                          <td><span className="badge badge-purple">{y.lot}</span></td>
                          <td><strong>{fmtKg(y.rcvKg)}</strong> ({y.bags} বস্তা)</td>
                          <td>{fmtKg(y.usedKg)}</td>
                          <td style={{ fontWeight: 800, color: balance > 0 ? '#0d6e4f' : '#c0392b' }}>
                            {fmtKg(balance)}
                          </td>
                          <td>{wastePct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 8. BILLING & INVOICE ================= */}
          {factoryView === 'bill' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>সাব-কন্ট্রাক্ট নিটিং বিল ও পেমেন্ট খতিয়ান</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>ইনভয়েস, অগ্রিম সমন্বয় ও বকেয়া আদায়</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>বিল নম্বর</th>
                      <th>তারিখ</th>
                      <th>পার্টি নাম</th>
                      <th>অর্ডার</th>
                      <th>মোট বিল</th>
                      <th>ছাড়</th>
                      <th>অগ্রিম</th>
                      <th>পরিশোধিত</th>
                      <th>অবশিষ্ট বকেয়া</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => {
                      const due = b.grossAmt - b.discount - b.paidAmt;
                      return (
                        <tr key={b.no}>
                          <td><strong>{b.no}</strong></td>
                          <td>{b.date}</td>
                          <td><strong>{b.party}</strong></td>
                          <td>{b.orderId}</td>
                          <td><strong>{fmtTk(b.grossAmt)}</strong></td>
                          <td>{fmtTk(b.discount)}</td>
                          <td>{fmtTk(b.advance)}</td>
                          <td style={{ color: '#0d6e4f', fontWeight: 700 }}>{fmtTk(b.paidAmt)}</td>
                          <td style={{ color: due > 0 ? '#c0392b' : '#0d6e4f', fontWeight: 800 }}>
                            {fmtTk(due)}
                          </td>
                          <td>
                            <span className={`badge ${b.status === 'Paid' ? 'badge-green' : 'badge-amber'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => openPrintModal('bill', `বিল ইনভয়েস - ${b.no}`, b)}
                                className="btn btn-secondary btn-sm"
                              >
                                <Printer size={12} />
                              </button>
                              {due > 0 && (
                                <button
                                  onClick={() => {
                                    const amt = prompt(`বকেয়া ${due} টাকার মধ্যে কত টাকা জমা করবেন?`, String(due));
                                    if (amt && Number(amt) > 0) {
                                      recordBillPayment(b.no, Number(amt));
                                    }
                                  }}
                                  className="btn btn-primary btn-sm"
                                >
                                  পেমেন্ট নিন
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 9. BUYER CHAT ================= */}
          {factoryView === 'fmsg' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, height: 'calc(100vh - 140px)' }}>
              {/* Thread List */}
              <div className="card" style={{ padding: 14, overflowY: 'auto' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>বায়ার চ্যাট থ্রেডসমূহ</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {threads.map((th) => {
                    const active = th.id === selectedThreadId;
                    return (
                      <div
                        key={th.id}
                        onClick={() => setSelectedThreadId(th.id)}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          border: active ? '2px solid #0d6e4f' : '1px solid #e2e8f0',
                          background: active ? '#e6f4ea' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>{th.party}</strong>
                          {th.unread > 0 && <span className="badge badge-red">{th.unread}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{th.orderId} · {th.contact}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat Window */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 800 }}>{activeThread.party}</h4>
                    <p style={{ fontSize: 12, color: '#64748b' }}>অর্ডার: {activeThread.orderId} · {activeThread.contact}</p>
                  </div>
                  <button
                    onClick={() => openCallModal({ title: activeThread.party, subtitle: activeThread.contact, phone: activeThread.phone })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Phone size={14} /> কল করুন
                  </button>
                </div>

                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeThread.messages.map((m, idx) => {
                    const isMe = m.from === 'factory';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          background: isMe ? '#0d6e4f' : '#f1f5f9',
                          color: isMe ? '#ffffff' : '#0f172a',
                          padding: '10px 14px',
                          borderRadius: 12,
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>
                          {m.sender} · {m.time}
                        </div>
                        <div>{m.text}</div>
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatText.trim()) return;
                    sendChatMessage(selectedThreadId, chatText, 'factory');
                    setChatText('');
                  }}
                  style={{ padding: 14, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}
                >
                  <input
                    type="text"
                    placeholder="বায়ারকে বার্তা লিখুন (রোল আপডেট, সুতা তথ্য)..."
                    className="input"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} /> পাঠান
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================= 10. SUBCONTRACT MARKETPLACE ================= */}
          {factoryView === 'subcontract' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>সাব-কন্ট্রাক্ট নিটিং মার্কেটপ্লেস (Silposetu Matchmaker)</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>খালি মেশিনের জন্য বায়িং হাউস ও কম্পোজিটের অর্ডার</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {marketplacePosts.map((post) => (
                  <div key={post.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, background: '#fcfdfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge badge-green">ম্যাচ স্কোর: {post.matchScore}%</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>পোস্ট কোড: {post.postCode}</span>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, marginTop: 6, color: '#0f172a' }}>{post.title}</h4>
                        <div style={{ fontSize: 13, color: '#0d6e4f', fontWeight: 600, marginTop: 4 }}>
                          {post.partyName} · লোকেশন: {post.location}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0d6e4f' }}>
                          ৳ {post.targetRate} / কেজি
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>টার্গেট: {fmtKg(post.targetKg)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, margin: '14px 0', background: '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 12 }}>
                      <div><strong>কাপড়:</strong> {post.fabricType}</div>
                      <div><strong>গেজ ও ডায়া:</strong> {post.dia} × {post.gg}</div>
                      <div><strong>GSM:</strong> {post.gsm}</div>
                      <div><strong>ডেলিভারি ডেডলাইন:</strong> {post.deliveryDeadline}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>ইতোমধ্যে {post.quotationsCount}টি ফ্যাক্টরি কোটেশন দিয়েছে</span>
                      <button
                        onClick={() => {
                          const rate = prompt(`টার্গেট রেট ৳${post.targetRate}/কেজি। আপনার অফার রেট কত?`, String(post.targetRate));
                          if (rate) {
                            addToast({
                              type: 'success',
                              title: 'কোটেশন জমা সম্পন্ন!',
                              message: `${post.postCode} অর্ডারে ৳${rate}/কেজি কোট পাঠানো হয়েছে।`,
                            });
                          }
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        কোটেশন জমা দিন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 11. PARTIES / BUYERS ================= */}
          {factoryView === 'party' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>পার্টি ও বায়িং হাউস তালিকা ({parties.length})</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>কন্ট্রাক্ট রেট ও ক্রেডিট লিমিট</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>আইডি</th>
                      <th>পার্টির নাম</th>
                      <th>টাইপ</th>
                      <th>যোগাযোগ</th>
                      <th>ফোন</th>
                      <th>S/J রেট</th>
                      <th>রিব রেট</th>
                      <th>ফ্লিস রেট</th>
                      <th>ক্রেডিট লিমিট</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="badge badge-blue">{p.type}</span></td>
                        <td>{p.contact}</td>
                        <td>{p.phone}</td>
                        <td>৳ {p.rate1J}</td>
                        <td>৳ {p.rateRib}</td>
                        <td>৳ {p.rateFleece}</td>
                        <td>{fmtTk(p.creditLimit)}</td>
                        <td>
                          <button
                            onClick={() => openCallModal({ title: p.name, subtitle: p.contact, phone: p.phone })}
                            className="btn btn-secondary btn-sm"
                          >
                            <Phone size={12} /> কল
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 12. STORE & INVENTORY ================= */}
          {factoryView === 'store' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>নিডেল, সিংকার ও নিটিং অয়েল স্টোর</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>স্পেয়ার পার্টস স্টক ও ইস্যু রেজিস্টার</p>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>আইটেম কোড</th>
                      <th>ক্যাটাগরি</th>
                      <th>পার্টসের নাম ও স্পেক</th>
                      <th>বর্তমান স্টক</th>
                      <th>ন্যূনতম স্টক অ্যালার্ট</th>
                      <th>একক মূল্য</th>
                      <th>ব্যবহারযোগ্য মেশিন</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeItems.map((st) => {
                      const isLow = st.stock <= st.minStock;
                      return (
                        <tr key={st.id}>
                          <td><strong>{st.id}</strong></td>
                          <td><span className="badge badge-purple">{st.cat}</span></td>
                          <td><strong>{st.name}</strong><div style={{ fontSize: 11, color: '#64748b' }}>{st.spec}</div></td>
                          <td>
                            <strong style={{ color: isLow ? '#c0392b' : '#0d6e4f' }}>
                              {st.stock} {st.unit}
                            </strong>
                          </td>
                          <td>{st.minStock} {st.unit}</td>
                          <td>৳ {st.unitPrice}</td>
                          <td>{st.machine}</td>
                          <td>
                            <button
                              onClick={() => {
                                const q = prompt(`${st.name} কত ${st.unit} ইস্যু করবেন?`, '10');
                                if (q && Number(q) > 0) {
                                  issueStoreItem({
                                    date: new Date().toLocaleDateString('bn-BD'),
                                    itemId: st.id,
                                    itemName: st.name,
                                    qty: Number(q),
                                    unit: st.unit,
                                    machine: 'M-01',
                                    operator: 'মোঃ সোহেল রানা',
                                    reason: 'নিয়মিত পরিবর্তন',
                                    cost: Number(q) * st.unitPrice,
                                  });
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              ইস্যু করুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fallback for other view tabs */}
                    {/* ================= 1. NEW SUBCONTRACT ORDER VIEW (neworder) ================= */}
          {factoryView === 'neworder' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>+ নতুন সাব-কন্ট্রাক্ট নিটিং অর্ডার এন্ট্রি</h3>
                  <small style={{ color: 'var(--muted)' }}>পার্টি ও বায়ারের ওয়ার্ক অর্ডার, ফেব্রিক স্পেসিফিকেশন ও মেশিন বরাদ্দ খাতা</small>
                </div>
                <button type="button" className="btn sm" onClick={() => setFactoryView('orders')}>অর্ডার তালিকায় ফিরুন</button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const totalKg = noLines.reduce((acc, l) => acc + (parseFloat(l.qty) || 0), 0);
                  const selectedPartyObj = parties.find((p) => p.id === noParty) || parties[0];
                  
                  await createOrder({
                    po: noId,
                    party: selectedPartyObj?.name || 'ABC Knit Composite',
                    partyPhone: selectedPartyObj?.phone || '01711-000111',
                    buyer: noBuyer,
                    style: 'Export Jersey Tee',
                    season: 'Autumn 2026',
                    color: noLines[0]?.color || 'Navy Blue',
                    orderDate: new Date().toISOString().split('T')[0],
                    delivDate: noDueDate,
                    status: 'Running',
                    payStatus: 'Due',
                    paidAmt: 0,
                    advanceAmt: 0,
                    discountAmt: 0,
                    deductAmt: 0,
                    notes: 'নিয়মিত সাব-কন্ট্রাক্ট অর্ডার',
                    lines: noLines.map((l, idx) => ({
                      id: idx + 1,
                      lineIdx: idx,
                      fabric: l.fab || 'Single Jersey',
                      dia: l.dia || '30" × 24G',
                      gsm: parseInt(l.ggsm) || 160,
                      color: l.color || 'Navy Blue',
                      yarn: l.count || '30/1 Combed',
                      brand: l.brand || 'Square',
                      lot: l.lot || 'SQ-884',
                      stitch: l.sl || '2.65 mm',
                      orderKg: parseFloat(l.qty) || 5000,
                      rate: parseFloat(noRate) || 14.5,
                      processLoss: 2.0,
                      yarnRcv: parseFloat(l.qty) || 5000,
                      knitKg: 0,
                      qcPass: 0,
                      rejectKg: 0,
                      delivKg: 0,
                      machine: (l.machines || ['M-01']).join(', '),
                      rolls: 0,
                    })),
                  });

                  addToast({
                    type: 'success',
                    title: 'অর্ডার সংরক্ষিত হয়েছে',
                    message: `ওয়ার্ক অর্ডার ${noId} (${totalKg.toLocaleString('en-IN')} kg) সফলভাবে চালু হয়েছে।`,
                  });
                  setSelectedOrderId(noId);
                  setFactoryView('detail');
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>পার্টি / ভেন্ডর নির্বাচন</label>
                    <select
                      className="select"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={noParty}
                      onChange={(e) => setNoParty(e.target.value)}
                    >
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.contact || 'ভেন্ডর'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>বায়ার নাম / ব্র্যান্ড</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={noBuyer}
                      onChange={(e) => setNoBuyer(e.target.value)}
                      placeholder="যেমন: H&M / C&A / Zara"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ওয়ার্ক অর্ডার নম্বর (PO)</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={noId}
                      onChange={(e) => setNoId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ডেলিভারির শেষ তারিখ (Deadline)</label>
                    <input
                      type="date"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={noDueDate}
                      onChange={(e) => setNoDueDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>নিটিং রেট (৳/কেজি)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={noRate}
                      onChange={(e) => setNoRate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>ফেব্রিক স্পেসিফিকেশন ও লাইন ব্রেকডাউন</h4>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => {
                        setNoLines([
                          ...noLines,
                          { place: 'Collar/Cuff', kt: 'f', fab: '1x1 Lycra Rib', ggsm: '220', fgsm: '220', dia: '32" × 18G', sl: '2.80', color: 'Navy Blue', qty: 1500, machines: ['M-03'], count: '30/1 Combed', brand: 'Square', lot: 'SQ-884' }
                        ]);
                      }}
                    >
                      + লাইন যোগ করুন
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {noLines.map((ln, idx) => (
                      <div key={idx} style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>প্লেসমেন্ট</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.place}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].place = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>ফেব্রিক বিবরণ</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.fab}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].fab = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>জিএসএম (GSM)</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.ggsm}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].ggsm = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>ডায়া × গেজ</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.dia}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].dia = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>স্টিচ লেন্থ (SL)</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.sl}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].sl = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>রং (Color)</label>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.color}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].color = e.target.value;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>পরিমাণ (কেজি)</label>
                          <input
                            type="number"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                            value={ln.qty}
                            onChange={(e) => {
                              const updated = [...noLines];
                              updated[idx].qty = parseFloat(e.target.value) || 0;
                              setNoLines(updated);
                            }}
                          />
                        </div>

                        {noLines.length > 1 && (
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn sm"
                              style={{ color: 'var(--bad)', borderColor: 'var(--bad)', padding: '6px 10px', height: 33 }}
                              onClick={() => setNoLines(noLines.filter((_, i) => i !== idx))}
                            >
                              মুছুন
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <button type="button" className="btn" onClick={() => setFactoryView('orders')}>বাতিল</button>
                  <button type="submit" className="btn pri">💾 নতুন সাব-কন্ট্রাক্ট অর্ডার সেভ করুন</button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 2. KNITTING JOB CARD VIEW (jobcard) ================= */}
          {factoryView === 'jobcard' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>নিটিং প্রোডাকশন জব কার্ড (Job Card / Program)</h3>
                  <small style={{ color: 'var(--muted)' }}>অর্ডার: {activeOrder?.id} · বায়ার: {activeOrder?.buyer} · পার্টি: {parties.find((p) => p.id === activeOrder?.party)?.name || 'ABC Knit'}</small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => openPrintModal('jobcard', `জব কার্ড - ${activeOrder?.id}`, activeOrder)}
                  >
                    🖨️ জব কার্ড প্রিন্ট
                  </button>
                  <button
                    type="button"
                    className="btn pri sm"
                    onClick={() => openPrintModal('rolltag', `রোল ট্যাগ বারকোড - ${activeOrder?.id}`, activeOrder)}
                  >
                    🏷️ রোল ট্যাগ স্টিকার
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, background: 'var(--surface2)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>📋 টেকনিক্যাল নিটিং স্পেসিফিকেশন</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>ফেব্রিক টাইপ:</span>
                      <b>{activeOrder?.lines[0]?.fabric}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>গ্রে জিএসএম / ফিনিশ জিএসএম:</span>
                      <b>{activeOrder?.lines[0]?.gsm} / {activeOrder?.lines[0]?.gsm + ' GSM' || '160 GSM'}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>ডায়া ও গেজ:</span>
                      <b>{activeOrder?.lines[0]?.dia}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>স্টিচ লেন্থ (SL):</span>
                      <b>{activeOrder?.lines[0]?.stitch || '2.65 mm'}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>সুতার কাউন্ট ও লট:</span>
                      <b>{activeOrder?.lines[0]?.yarn} (Lot: SQ-88410)</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>বরাদ্দকৃত ফ্লোর মেশিন:</span>
                      <b>{activeOrder?.lines[0]?.machine || 'M-03, M-04, M-07, M-08'}</b>
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, background: 'var(--surface2)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>📊 উৎপাদন অগ্রগতি ও ডেলিভারি কমিটমেন্ট</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>মোট বরাদ্দ পরিমাণ:</span>
                      <b>{bnNum(activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0) || 0)} kg</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>বোনা সম্পন্ন (Knitted):</span>
                      <b style={{ color: 'var(--ok)' }}>{bnNum(activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0) || 0)} kg ({pct(activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0) || 0, activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0) || 1)}%)</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>ডেলিভারি হয়েছে:</span>
                      <b>{bnNum(activeOrder?.lines.reduce((a, b) => a + b.delivKg, 0) || 0)} kg</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>অবশিষ্ট নিটিং বাকি:</span>
                      <b style={{ color: 'var(--warn)' }}>{bnNum(Math.max(0, (activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0) || 0) - (activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0) || 0)))} kg</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>ডেলিভারির শেষ তারিখ:</span>
                      <b>{activeOrder?.delivDate || '28 Oct 2026'}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>🏷️ প্রোডাকশন রোল ট্যাগ ও কিউআর প্রিভিউ</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {rolls.filter((r) => r.orderId === activeOrder?.id).slice(0, 4).map((rl) => (
                    <div key={rl.rollId} style={{ border: '1px dashed var(--line)', borderRadius: 8, padding: 10, background: 'var(--surface)', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <QrCodeSvg value={`RL:${rl.rollId}|MC:${rl.machine}|KG:${rl.kg}`} size={56} />
                      <div style={{ fontSize: '0.78rem' }}>
                        <div><b>{rl.rollId}</b></div>
                        <div>মেশিন: {rl.machine} · শিফট: {rl.shift}</div>
                        <div>ওজন: <b>{rl.kg} kg</b></div>
                        <span className="pill p-ok" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{rl.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. FREE MACHINE MANAGER (freem) ================= */}
          {factoryView === 'freem' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📡 ফ্রি মেশিন বুকিং ও মার্কেটপ্লেস ব্রডকাস্ট</h3>
                  <small style={{ color: 'var(--muted)' }}>খালি মেশিনের শিডিউল ওপেন করুন এবং বায়ারদের কাছ থেকে সরাসরি সাব-কন্ট্রাক্ট কাজ পান</small>
                </div>
                <button type="button" className="btn pri sm" onClick={() => setIsBroadcastModalOpen(true)}>
                  + নতুন ব্রডকাস্ট তৈরি করুন
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="kpi">
                  <div className="t">মোট ফ্রি মেশিন</div>
                  <div className="v">{machines.filter((m) => m.status === 'Free' || m.status === 'Idle').length} টি</div>
                  <div className="s">অর্ডারের জন্য প্রস্তুত</div>
                </div>
                <div className="kpi">
                  <div className="t">দৈনিক উন্মুক্ত ক্ষমতা</div>
                  <div className="v">{bnNum(machines.filter((m) => m.status === 'Free' || m.status === 'Idle').length * 190)} kg</div>
                  <div className="s">প্রতিদিন ডেলিভারি সক্ষমতা</div>
                </div>
                <div className="kpi">
                  <div className="t">বায়ারদের ইনকোয়ারি</div>
                  <div className="v">{freeOffers.length} টি</div>
                  <div className="s">পেন্ডিং সাব-কন্ট্রাক্ট অফার</div>
                </div>
              </div>

              <h4 style={{ margin: '14px 0 10px', fontSize: '0.95rem' }}>সব মেশিনের লাইভ ব্রডকাস্ট স্ট্যাটাস</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {machines.map((mc) => (
                  <div key={mc.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, background: mc.status === 'Free' ? 'var(--yarn-soft)' : 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <b>{mc.id}</b>
                        <span className="pill" style={{ background: mc.status === 'Running' ? 'var(--accent-soft)' : mc.status === 'Free' ? 'var(--ok-soft)' : 'var(--surface2)', color: mc.status === 'Running' ? 'var(--accent)' : mc.status === 'Free' ? 'var(--ok)' : 'var(--muted)', fontSize: '0.72rem' }}>
                          {mc.status}
                        </span>
                      </div>
                      <small style={{ color: 'var(--muted)' }}>{mc.brand} · {mc.dia} × {mc.gg}</small>
                      <div style={{ fontSize: '0.78rem', marginTop: 4 }}>দৈনিক: {mc.todayKg || 180} kg / {mc.targetKg || 240} kg</div>
                    </div>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => toggleMachineStatus(mc.id, mc.status === 'Free' ? 'Running' : 'Free')}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      {mc.status === 'Free' ? 'বুকিং বন্ধ' : 'ফ্রি ব্রডকাস্ট'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. READY FABRIC ROLLS INVENTORY (fready) ================= */}
          {factoryView === 'fready' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📦 ওয়্যারহাউজে প্রস্তুত রোল ও রেডি স্টক</h3>
                  <small style={{ color: 'var(--muted)' }}>নিটিং ও QC সম্পন্ন প্রস্তুত রোল — এখান থেকে সরাসরি চালান কাটা যাবে</small>
                </div>
                {selectedReadyRolls.length > 0 && (
                  <button
                    type="button"
                    className="btn pri sm"
                    onClick={() => {
                      setChRolls(String(selectedReadyRolls.length));
                      const totalWeight = rolls.filter((r) => selectedReadyRolls.includes(r.rollId)).reduce((a, r) => a + r.kg, 0);
                      setChGrossKg(String(Math.round(totalWeight + 8)));
                      setChNetKg(String(Math.round(totalWeight)));
                      setFactoryView('challan');
                    }}
                  >
                    🚚 নির্বাচিত {selectedReadyRolls.length}টি রোলের চালান তৈরি করুন
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button
                  type="button"
                  className={`btn sm ${freadyFilter === 'all' ? 'pri' : ''}`}
                  onClick={() => setFreadyFilter('all')}
                >
                  সব রোল ({rolls.length})
                </button>
                <button
                  type="button"
                  className={`btn sm ${freadyFilter === 'qcpass' ? 'pri' : ''}`}
                  onClick={() => setFreadyFilter('qcpass')}
                >
                  QC পাস রোল
                </button>
                <button
                  type="button"
                  className={`btn sm ${freadyFilter === 'pending' ? 'pri' : ''}`}
                  onClick={() => setFreadyFilter('pending')}
                >
                  চালান বাকি
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px' }}>নির্বাচন</th>
                      <th style={{ padding: '8px 10px' }}>রোল আইডি</th>
                      <th style={{ padding: '8px 10px' }}>অর্ডার নং</th>
                      <th style={{ padding: '8px 10px' }}>মেশিন ও শিফট</th>
                      <th style={{ padding: '8px 10px' }}>ফেব্রিক বিবরণ</th>
                      <th style={{ padding: '8px 10px' }}>ওজন (কেজি)</th>
                      <th style={{ padding: '8px 10px' }}>QC স্ট্যাটাস</th>
                      <th style={{ padding: '8px 10px' }}>তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolls.map((r) => {
                      const isSel = selectedReadyRolls.includes(r.rollId);
                      return (
                        <tr key={r.rollId} style={{ borderBottom: '1px solid var(--line)', background: isSel ? 'var(--accent-soft)' : 'transparent' }}>
                          <td style={{ padding: '8px 10px' }}>
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedReadyRolls([...selectedReadyRolls, r.rollId]);
                                else setSelectedReadyRolls(selectedReadyRolls.filter((id) => id !== r.rollId));
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px' }}><b>{r.rollId}</b></td>
                          <td style={{ padding: '8px 10px' }}>{r.orderId}</td>
                          <td style={{ padding: '8px 10px' }}>{r.machine} ({r.shift})</td>
                          <td style={{ padding: '8px 10px' }}>{r.fabric}</td>
                          <td style={{ padding: '8px 10px' }}><b>{r.kg} kg</b></td>
                          <td style={{ padding: '8px 10px' }}>
                            <span className="pill p-ok" style={{ fontSize: '0.72rem' }}>{r.status}</span>
                          </td>
                          <td style={{ padding: '8px 10px' }}>{r.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. PARTY LEDGER & KHATA (ledger) ================= */}
          {factoryView === 'ledger' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📖 পার্টি খাতা ও লেনদেন বিবরণী (Ledger)</h3>
                  <small style={{ color: 'var(--muted)' }}>চালান অনুযায়ী ডেবিট (পাওনা), পেমেন্ট ক্রেডিট (জমা) ও রানিং ব্যালেন্স</small>
                </div>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => openPrintModal('bill', `পার্টি লেজার - ${parties.find((p) => p.id === ledgerParty)?.name || 'ABC Knit'}`, vouchers)}
                >
                  🖨️ খাতা স্টেটমেন্ট প্রিন্ট
                </button>
              </div>

              {/* Party Selector Pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                {parties.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`btn sm ${ledgerParty === p.id ? 'pri' : ''}`}
                    onClick={() => setLedgerParty(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Party Financial Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="kpi">
                  <div className="t">মোট নিটিং বিল</div>
                  <div className="v">{fmtTk(vouchers.reduce((acc, v) => acc + v.debit, 240000))}</div>
                  <div className="s">ডেলিভারিকৃত চালানের মোট পাওনা</div>
                </div>
                <div className="kpi">
                  <div className="t">মোট আদায় / জমা</div>
                  <div className="v">{fmtTk(vouchers.reduce((acc, v) => acc + v.credit, 180000))}</div>
                  <div className="s">নগদ / ব্যাংক মাধ্যমে প্রাপ্ত</div>
                </div>
                <div className="kpi">
                  <div className="t">চলতি বকেয়া পাওনা</div>
                  <div className="v" style={{ color: 'var(--warn)' }}>{fmtTk(60000)}</div>
                  <div className="s">বিলের ৩০ দিনের মধ্যে পরিশোধযোগ্য</div>
                </div>
              </div>

              {/* Ledger Statement Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px' }}>তারিখ</th>
                      <th style={{ padding: '8px 10px' }}>ভাউচার / রেফারেন্স</th>
                      <th style={{ padding: '8px 10px' }}>বিবরণ</th>
                      <th style={{ padding: '8px 10px' }}>মাধ্যম</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>ডেবিট (পাওনা)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>ক্রেডিট (জমা)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px' }}>{v.date}</td>
                        <td style={{ padding: '8px 10px' }}><b>{v.id}</b></td>
                        <td style={{ padding: '8px 10px' }}>{v.narration}</td>
                        <td style={{ padding: '8px 10px' }}><span className="pill p-acc" style={{ fontSize: '0.72rem' }}>{v.method}</span></td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: v.debit > 0 ? 'var(--ink)' : 'var(--muted)' }}>
                          {v.debit > 0 ? fmtTk(v.debit) : '—'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: v.credit > 0 ? 'var(--ok)' : 'var(--muted)' }}>
                          {v.credit > 0 ? fmtTk(v.credit) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. FACTORY EXPENSES & COSTING (acc) ================= */}
          {factoryView === 'acc' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>💰 ফ্যাক্টরি দৈনিক খরচ, ব্যাংক ও কস্টিং</h3>
                  <small style={{ color: 'var(--muted)' }}>বিদ্যুৎ, স্পেয়ার পার্টস, নিডেল, লুব অয়েল ও ফ্লোর কর্মচারীদের দৈনন্দিন হিসাব</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="kpi">
                  <div className="t">চলতি মাসের খরচ</div>
                  <div className="v">{fmtTk(expenses.reduce((acc, e) => acc + e.amount, 0))}</div>
                  <div className="s">বিদ্যুৎ, নিডেল ও ফ্লোর মেইনটেন্যান্স</div>
                </div>
                <div className="kpi">
                  <div className="t">প্রতি কেজি নিটিং খরচ</div>
                  <div className="v">৳৪.৫০ / kg</div>
                  <div className="s">বিদ্যুৎ + অপারেটর + মেইনটেন্যান্স</div>
                </div>
                <div className="kpi">
                  <div className="t">গড় নিটিং বিলিং রেট</div>
                  <div className="v">৳১৪.০০ / kg</div>
                  <div className="s">নেট মার্জিন: ৳৯.৫০/কেজি</div>
                </div>
              </div>

              {/* Add Expense Form */}
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--line)', marginBottom: 18 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>+ নতুন ফ্যাক্টরি খরচ লিখুন</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!expTitle || !expAmount) return;
                    await addExpense({
                      category: expCategory,
                      title: expTitle,
                      amount: parseFloat(expAmount) || 0,
                      method: expMethod,
                      ref: expRef || ('EX-' + Date.now().toString().slice(-4)),
                      date: new Date().toISOString().split('T')[0],
                      createdBy: users[0]?.name || 'ম্যানেজার',
                    });
                    setExpTitle('');
                    setExpAmount('');
                    setExpRef('');
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'flex-end' }}
                >
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>ক্যাটাগরি</label>
                    <select
                      className="select"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                    >
                      <option value="electricity">পল্লী বিদ্যুৎ বিল</option>
                      <option value="maintenance">মেশিন মেরামত ও বিয়ারিং</option>
                      <option value="needle_oil">নিডেল ও লুব অয়েল</option>
                      <option value="snacks">স্টাফ নাস্তা ও চা</option>
                      <option value="transport">পরিবহন ও ডেলিভারি</option>
                      <option value="other">অন্যান্য অফিস খরচ</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>খরচের বিবরণ</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: M-03 ক্যাম সার্ভিসিং"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>টাকার পরিমাণ (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমন: 2500"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>পরিশোধ মাধ্যম</label>
                    <select
                      className="select"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={expMethod}
                      onChange={(e) => setExpMethod(e.target.value)}
                    >
                      <option value="cash">নগদ ক্যাশ</option>
                      <option value="bank">ব্যাংক একাউন্ট</option>
                      <option value="bkash">বিকাশ / নগদ</option>
                    </select>
                  </div>

                  <button type="submit" className="btn pri sm" style={{ height: 35 }}>
                    + খরচ যোগ করুন
                  </button>
                </form>
              </div>

              {/* Expense Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px' }}>তারিখ</th>
                      <th style={{ padding: '8px 10px' }}>ক্যাটাগরি</th>
                      <th style={{ padding: '8px 10px' }}>বিবরণ</th>
                      <th style={{ padding: '8px 10px' }}>ভাউচার / রেফারেন্স</th>
                      <th style={{ padding: '8px 10px' }}>মাধ্যম</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>পরিমাণ (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((ex) => (
                      <tr key={ex.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px' }}>{ex.date}</td>
                        <td style={{ padding: '8px 10px' }}><span className="pill p-acc" style={{ fontSize: '0.72rem' }}>{ex.category}</span></td>
                        <td style={{ padding: '8px 10px' }}><b>{ex.title}</b></td>
                        <td style={{ padding: '8px 10px' }}>{ex.ref || '—'}</td>
                        <td style={{ padding: '8px 10px' }}>{ex.method}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtTk(ex.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. WORKER ATTENDANCE & PAYROLL (att) ================= */}
          {factoryView === 'att' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>👥 ফ্লোর অপারেটর ও টেকনিশিয়ান হাজিরা</h3>
                  <small style={{ color: 'var(--muted)' }}>দৈনিক শিফট হাজিরা পাঞ্চ, ওভারটাইম ঘণ্টা ও বেতন হিসাব</small>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['All', 'A', 'B', 'C'].map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      className={`btn sm ${attShift === sh ? 'pri' : ''}`}
                      onClick={() => setAttShift(sh)}
                    >
                      {sh === 'All' ? 'সব শিফট' : `শিফট ${sh}`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px' }}>কর্মচারীর নাম</th>
                      <th style={{ padding: '8px 10px' }}>পদবি</th>
                      <th style={{ padding: '8px 10px' }}>শিফট</th>
                      <th style={{ padding: '8px 10px' }}>আজকের স্ট্যাটাস</th>
                      <th style={{ padding: '8px 10px' }}>হাজিরা পাঞ্চ বাটন</th>
                      <th style={{ padding: '8px 10px' }}>ওভারটাইম</th>
                      <th style={{ padding: '8px 10px' }}>দৈনিক হাজিরা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance
                      .filter((a) => attShift === 'All' || a.shift === attShift)
                      .map((worker) => (
                        <tr key={worker.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '8px 10px' }}><b>{worker.name}</b></td>
                          <td style={{ padding: '8px 10px' }}>{worker.role}</td>
                          <td style={{ padding: '8px 10px' }}><span className="pill p-acc" style={{ fontSize: '0.72rem' }}>{worker.shift}</span></td>
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              className="pill"
                              style={{
                                background: worker.todayStatus === 'Present' ? 'var(--ok-soft)' : worker.todayStatus === 'Late' ? 'var(--yarn-soft)' : 'var(--bad-soft)',
                                color: worker.todayStatus === 'Present' ? 'var(--ok)' : worker.todayStatus === 'Late' ? 'var(--yarn)' : 'var(--bad)',
                                fontSize: '0.75rem',
                              }}
                            >
                              {worker.todayStatus}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--ok-soft)', color: 'var(--ok)', borderColor: 'var(--ok)' }}
                                onClick={() => punchAttendance(worker.name, 'Present', 0, worker.shift)}
                              >
                                ✓ উপস্থিত
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--yarn-soft)', color: 'var(--yarn)', borderColor: 'var(--yarn)' }}
                                onClick={() => punchAttendance(worker.name, 'Late', 2, worker.shift)}
                              >
                                + OT (২ ঘণ্টা)
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bad-soft)', color: 'var(--bad)', borderColor: 'var(--bad)' }}
                                onClick={() => punchAttendance(worker.name, 'Absent', 0, worker.shift)}
                              >
                                ✗ অনুপস্থিত
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>{worker.otHours} ঘণ্টা</td>
                          <td style={{ padding: '8px 10px' }}><b>৳{worker.dailyWage}</b></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 8. WHATSAPP NOTIFICATION BUILDER (wa) ================= */}
          {factoryView === 'wa' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📲 স্বয়ংক্রিয় WhatsApp আপডেট ও শিট শেয়ার</h3>
                  <small style={{ color: 'var(--muted)' }}>বায়ার ও মার্চেন্ডাইজারকে ১-ক্লিকে রিয়েলটাইম নিটিং প্রগ্রেস ও ডেলিভারি মেসেজ পাঠান</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>রিপোর্টের ধরন নির্বাচন করুন</label>
                      <select
                        className="select"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={waType}
                        onChange={(e) => setWaType(e.target.value as any)}
                      >
                        <option value="daily">📊 দৈনিক শিফট নিটিং ক্লোজিং রিপোর্ট</option>
                        <option value="order">📦 বায়ার অর্ডার ডেলিভারি অগ্রগতি</option>
                        <option value="challan">🚚 ডেলিভারি চালান ও গেট পাস নোটিস</option>
                        <option value="qc">⚠️ QC ইন্সপেকশন ও ফল্ট অ্যালার্ট</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>বায়ার / প্রাপকের WhatsApp নম্বর</label>
                      <input
                        type="text"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={waTargetPhone}
                        onChange={(e) => setWaTargetPhone(e.target.value)}
                        placeholder="88017XXXXXXXX"
                      />
                    </div>

                    {/* WhatsApp Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => {
                          const text = waType === 'daily'
                            ? `*আল-মদিনা নিটওয়্যার লিঃ — দৈনিক নিটিং রিপোর্ট*\nতারিখ: ${new Date().toLocaleDateString('bn-BD')}\n\n• আজকের মোট উৎপাদন: ১,৪২৫ kg\n• রানিং অর্ডার: ৩টি\n• ফ্রি মেশিন: ২টি (বুকিং ওপেন)\n\nধন্যবাদ, রহমান নিটিং ফ্লোর ইনচার্জ`
                            : `*অর্ডার প্রগ্রেস আপডেট — ${activeOrder?.id}*\nবায়ার: ${activeOrder?.buyer}\nফেব্রিক: ${activeOrder?.lines[0]?.fabric}\nমোট পরিমাণ: ${activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0)} kg\nবোনা সম্পন্ন: ${activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0)} kg (${pct(activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0) || 0, activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0) || 1)}%)\nঅবশিষ্ট: ${Math.max(0, (activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0) || 0) - (activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0) || 0))} kg`;
                          navigator.clipboard.writeText(text);
                          addToast({ type: 'success', title: 'কপি হয়েছে', message: 'WhatsApp মেসেজ ক্লিপবোর্ডে কপি করা হয়েছে।' });
                        }}
                      >
                        📋 মেসেজ কপি করুন
                      </button>

                      <button
                        type="button"
                        className="btn pri sm"
                        style={{ background: '#25D366', borderColor: '#25D366', color: '#FFFFFF' }}
                        onClick={() => {
                          const text = waType === 'daily'
                            ? `*আল-মদিনা নিটওয়্যার লিঃ — দৈনিক নিটিং রিপোর্ট*\nতারিখ: ${new Date().toLocaleDateString('bn-BD')}\n\n• আজকের মোট উৎপাদন: ১,৪২৫ kg\n• রানিং অর্ডার: ৩টি\n• ফ্রি মেশিন: ২টি (বুকিং ওপেন)\n\nধন্যবাদ, রহমান নিটিং ফ্লোর ইনচার্জ`
                            : `*অর্ডার প্রগ্রেস আপডেট — ${activeOrder?.id}*\nবায়ার: ${activeOrder?.buyer}\nফেব্রিক: ${activeOrder?.lines[0]?.fabric}\nমোট পরিমাণ: ${activeOrder?.lines.reduce((a, b) => a + b.orderKg, 0)} kg\nবোনা সম্পন্ন: ${activeOrder?.lines.reduce((a, b) => a + b.knitKg, 0)} kg\n\nধন্যবাদ!`;
                          const cleanPh = waTargetPhone.replace(/[^0-9]/g, '');
                          window.open(`https://api.whatsapp.com/send?phone=${cleanPh}&text=${encodeURIComponent(text)}`, '_blank');
                        }}
                      >
                        📲 সরাসরি WhatsApp-এ পাঠান
                      </button>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Preview Bubble */}
                <div style={{ background: '#E5DDD5', borderRadius: 12, padding: 16, border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#667781', textAlign: 'center', marginBottom: 10 }}>আজকের বার্তা প্রিভিউ</div>
                  <div style={{ background: '#DCF8C6', borderRadius: 10, padding: 12, maxWidth: 320, marginLeft: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.85rem', color: '#111b21', lineHeight: 1.5 }}>
                    <div><b>আল-মদিনা নিটওয়্যার লিঃ — দৈনিক নিটিং রিপোর্ট</b></div>
                    <div style={{ fontSize: '0.78rem', color: '#667781', margin: '4px 0' }}>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
                    <div style={{ marginTop: 6 }}>
                      <div>• আজকের মোট উৎপাদন: <b>১,৪২৫ kg</b></div>
                      <div>• রানিং অর্ডার: <b>৩টি PO</b></div>
                      <div>• ফ্রি মেশিন: <b>২টি (M-06, M-08)</b></div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#667781', textAlign: 'right' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. FACTORY PROFILE & SETTINGS (profile) ================= */}
          {factoryView === 'profile' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🏭 ফ্যাক্টরি প্রোফাইল ও মেশিন সেটিংস</h3>
                  <small style={{ color: 'var(--muted)' }}>নিটখাতা ভেরিফায়েড মিল প্রোফাইল, ট্রেড লাইসেন্স ও মেশিন স্পেসিফিকেশন</small>
                </div>
                <span className="pill p-ok">✓ ভেরিফায়েড নিটিং ফ্যাক্টরি</span>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateFactoryProfileInfo({
                    name: profName,
                    owner: profOwner,
                    phone: profPhone,
                    address: profAddress,
                    loc: profLoc,
                    machinesCount: parseInt(profMachines) || 24,
                  });
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ফ্যাক্টরির নাম</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>মালিক / এমডির নাম</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={profOwner}
                      onChange={(e) => setProfOwner(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>অফিস মোবাইল নম্বর</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>এলাকা / শিল্পাঞ্চল</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={profLoc}
                      onChange={(e) => setProfLoc(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>মোট সার্কুলার মেশিন সংখ্যা</label>
                    <input
                      type="number"
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={profMachines}
                      onChange={(e) => setProfMachines(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ফ্যাক্টরির পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                    value={profAddress}
                    onChange={(e) => setProfAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <button type="submit" className="btn pri">💾 প্রোফাইল তথ্য সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 10. TEAM & USERS PERMISSION (users) ================= */}
          {factoryView === 'users' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>👥 ফ্যাক্টরি টিম ও পারমিশন কন্ট্রোল</h3>
                  <small style={{ color: 'var(--muted)' }}>মালিক, প্রোডাকশন ম্যানেজার, QC ইনচার্জ ও ফ্লোর অপারেটরদের রোলভিত্তিক অনুমতি</small>
                </div>
              </div>

              {/* Add User Form */}
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--line)', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>+ নতুন টিম মেম্বার যুক্ত করুন</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newUserName || !newUserPhone) return;
                    await addUser({
                      name: newUserName,
                      phone: newUserPhone,
                      role: newUserRole,
                      shift: 'A',
                      status: 'Active',
                    });
                    setNewUserName('');
                    setNewUserPhone('');
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, alignItems: 'flex-end' }}
                >
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>কর্মচারীর নাম</label>
                    <input
                      type="text"
                      required
                      placeholder="নাম লিখুন"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>মোবাইল নম্বর (লগইন আইডি)</label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>পদবি</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: QC সুপারভাইজার"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={newUserDesig}
                      onChange={(e) => setNewUserDesig(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>সিস্টেম পারমিশন রোল</label>
                    <select
                      className="select"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                    >
                      <option value="manager">প্রোডাকশন ম্যানেজার</option>
                      <option value="qc">QC ইনচার্জ</option>
                      <option value="operator">ফ্লোর অপারেটর</option>
                      <option value="accounts">হিসাবরক্ষক</option>
                    </select>
                  </div>

                  <button type="submit" className="btn pri sm" style={{ height: 35 }}>
                    + মেম্বার যোগ করুন
                  </button>
                </form>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px' }}>নাম</th>
                      <th style={{ padding: '8px 10px' }}>মোবাইল নম্বর</th>
                      <th style={{ padding: '8px 10px' }}>পদবি ও রোল</th>
                      <th style={{ padding: '8px 10px' }}>লাস্ট সিন</th>
                      <th style={{ padding: '8px 10px' }}>স্ট্যাটাস</th>
                      <th style={{ padding: '8px 10px' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px' }}><b>{u.name}</b></td>
                        <td style={{ padding: '8px 10px' }}>{u.phone}</td>
                        <td style={{ padding: '8px 10px' }}><span className="pill p-acc" style={{ fontSize: '0.72rem' }}>{u.role}</span></td>
                        <td style={{ padding: '8px 10px' }}>{u.lastSeen || 'আজ, ২:০০'}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span className="pill" style={{ background: u.status === 'Active' ? 'var(--ok-soft)' : 'var(--bad-soft)', color: u.status === 'Active' ? 'var(--ok)' : 'var(--bad)', fontSize: '0.72rem' }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <button
                            type="button"
                            className="btn sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            onClick={() => toggleUserStatus(u.id)}
                          >
                            {u.status === 'Active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 11. PARTNER AFFILIATE PROGRAM (pdash) ================= */}
          {factoryView === 'pdash' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🤝 নিটখাতা পার্টনার আর্নিং ও রেফারেল প্রোগ্রাম</h3>
                  <small style={{ color: 'var(--muted)' }}>অন্যান্য নিটিং ফ্যাক্টরি রেফার করে প্রতি সাবস্ক্রিপশনে ২০% লাইফটাইম কমিশন আয় করুন</small>
                </div>
                <div style={{ padding: '4px 12px', background: 'var(--yarn-soft)', color: 'var(--yarn)', borderRadius: 20, fontWeight: 600, fontSize: '0.82rem' }}>
                  রেফারেল কোড: {partner.partnerCode || 'KNIT-P27'}
                </div>
              </div>

              {/* Referral Link Box */}
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--line)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)' }}>আপনার নিজস্ব রেফারেল লিংক:</div>
                  <code style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>https://khitkhata.com/register?ref={partner.partnerCode || 'KNIT-P27'}</code>
                </div>
                <button
                  type="button"
                  className="btn pri sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://khitkhata.com/register?ref=${partner.partnerCode || 'KNIT-P27'}`);
                    addToast({ type: 'success', title: 'লিংক কপি হয়েছে', message: 'রেফারেল লিংক ক্লিপবোর্ডে কপি সম্পন্ন।' });
                  }}
                >
                  🔗 লিংক কপি করুন
                </button>
              </div>

              {/* Commission KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="kpi">
                  <div className="t">মোট রেফারেল ফ্যাক্টরি</div>
                  <div className="v">{partner.totalReferrals || 8} টি</div>
                  <div className="s">{partner.activeFactoriesCount || 6} টি পেইড অ্যাক্টিভ মিল</div>
                </div>
                <div className="kpi">
                  <div className="t">মোট অর্জিত কমিশন</div>
                  <div className="v">{fmtTk(partner.totalCommissionTk || 45000)}</div>
                  <div className="s">২০% মাসিক কমিশন রেট</div>
                </div>
                <div className="kpi">
                  <div className="t">উত্তোলনযোগ্য ব্যালেন্স</div>
                  <div className="v" style={{ color: 'var(--ok)' }}>{fmtTk(partner.balanceCommissionTk || 30000)}</div>
                  <div className="s">উত্তোলনকৃত: {fmtTk(partner.withdrawnCommissionTk || 15000)}</div>
                </div>
              </div>

              {/* Payout Request Form */}
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>💸 বিকাশ / নগদ / ব্যাংক একাউন্টে কমিশন উত্তোলন রিকোয়েস্ট</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await requestPartnerPayout(parseFloat(payoutAmt) || 5000, payoutMethod, payoutNumber);
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, alignItems: 'flex-end' }}
                >
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>উত্তোলনের পরিমাণ (৳)</label>
                    <input
                      type="number"
                      required
                      min={500}
                      max={partner.balanceCommissionTk || 30000}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={payoutAmt}
                      onChange={(e) => setPayoutAmt(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>মাধ্যম</label>
                    <select
                      className="select"
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                    >
                      <option value="bkash">বিকাশ (bKash Personal)</option>
                      <option value="nagad">নগদ (Nagad Personal)</option>
                      <option value="rocket">রকেট (Rocket)</option>
                      <option value="bank">ব্যাংক একাউন্ট ট্রান্সফার</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>একাউন্ট নম্বর / ব্যাংক ডিটেল</label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: '0.82rem', background: 'var(--surface)' }}
                      value={payoutNumber}
                      onChange={(e) => setPayoutNumber(e.target.value)}
                      placeholder="018XXXXXXXX"
                    />
                  </div>

                  <button type="submit" className="btn pri sm" style={{ height: 35 }}>
                    উত্তোলন পাঠান
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 1: QUICK PRODUCTION ENTRY ================= */}
          {isQuickEntryOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, maxWidth: 520, width: '92%', padding: 22, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>+ দ্রুত শিফট প্রোডাকশন এন্ট্রি</h3>
                  <button type="button" className="btn sm" onClick={() => setIsQuickEntryOpen(false)} style={{ padding: '4px 8px' }}>
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await quickProductionEntry({
                      machine_code: qeMachine,
                      shift: qeShift,
                      operator_name: qeOperator,
                      order_no: qeOrderNo,
                      net_kg: parseFloat(qeKg) || 160,
                      rolls_count: parseInt(qeRolls) || 7,
                      reject_kg: parseFloat(qeRejectKg) || 0,
                      rpm: parseFloat(qeRpm) || 28,
                      notes: qeNotes,
                    });
                    setIsQuickEntryOpen(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>মেশিন নির্বাচন</label>
                      <select
                        className="select"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeMachine}
                        onChange={(e) => setQeMachine(e.target.value)}
                      >
                        {Array.from({ length: 24 }).map((_, i) => {
                          const id = `M-${String(i + 1).padStart(2, '0')}`;
                          return <option key={id} value={id}>{id}</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>শিফট</label>
                      <select
                        className="select"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeShift}
                        onChange={(e) => setQeShift(e.target.value)}
                      >
                        <option value="A">শিফট A (সকাল ৬:০০ – দুপুর ২:০০)</option>
                        <option value="B">শিফট B (দুপুর ২:০০ – রাত ১০:০০)</option>
                        <option value="C">শিফট C (রাত ১০:০০ – সকাল ৬:০০)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>অপারেটর নাম</label>
                      <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeOperator}
                        onChange={(e) => setQeOperator(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ওয়ার্ক অর্ডার নং</label>
                      <select
                        className="select"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeOrderNo}
                        onChange={(e) => setQeOrderNo(e.target.value)}
                      >
                        {(dashboardData?.running_orders || orders).map((o: any) => (
                          <option key={o.id} value={o.id}>{o.id} ({o.party})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>নেট ওজন (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeKg}
                        onChange={(e) => setQeKg(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>রোল সংখ্যা</label>
                      <input
                        type="number"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeRolls}
                        onChange={(e) => setQeRolls(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>বাতিল / রিজেক্ট (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={qeRejectKg}
                        onChange={(e) => setQeRejectKg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                    <button type="button" className="btn" onClick={() => setIsQuickEntryOpen(false)}>বাতিল</button>
                    <button type="submit" className="btn pri">ডাটাবেজে সেভ করুন</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 2: MACHINE LIVE ACTION & STATUS CHANGER ================= */}
          {selectedMachineForAction && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, maxWidth: 480, width: '92%', padding: 22, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>মেশিন কন্ট্রোল: {selectedMachineForAction.code || selectedMachineForAction.id}</h3>
                    <small style={{ color: 'var(--muted)' }}>{selectedMachineForAction.spec_label || '30" × 24G'} · {selectedMachineForAction.brand}</small>
                  </div>
                  <button type="button" className="btn sm" onClick={() => setSelectedMachineForAction(null)} style={{ padding: '4px 8px' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <div><strong>বর্তমান অবস্থা:</strong> <span className="pill p-acc">{selectedMachineForAction.status}</span></div>
                    <div><strong>রানিং অর্ডার:</strong> {selectedMachineForAction.running_order || selectedMachineForAction.current_order_no || 'কোনো অর্ডার বরাদ্দ নেই'}</div>
                    <div><strong>দায়িত্বপ্রাপ্ত অপারেটর:</strong> {selectedMachineForAction.operator || 'মোঃ সোহেল রানা'}</div>
                    <div><strong>আজকের উৎপাদন:</strong> {selectedMachineForAction.today_kg ?? selectedMachineForAction.todayKg ?? 180} kg</div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>
                      ১-ক্লিকে মেশিনের অবস্থা পরিবর্তন করুন:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        type="button"
                        className="btn sm"
                        style={{ background: 'var(--ok-soft)', color: 'var(--ok)', borderColor: 'var(--ok)' }}
                        onClick={async () => {
                          await toggleMachineStatus(selectedMachineForAction.code || selectedMachineForAction.id, 'Running');
                          setSelectedMachineForAction(null);
                        }}
                      >
                        🟢 রানিং (Running)
                      </button>

                      <button
                        type="button"
                        className="btn sm"
                        style={{ background: 'var(--warn-soft)', color: 'var(--warn)', borderColor: 'var(--warn)' }}
                        onClick={async () => {
                          await toggleMachineStatus(selectedMachineForAction.code || selectedMachineForAction.id, 'Free');
                          setSelectedMachineForAction(null);
                        }}
                      >
                        📡 ফ্রি ব্রডকাস্ট (Free)
                      </button>

                      <button
                        type="button"
                        className="btn sm"
                        style={{ background: 'var(--surface2)', color: 'var(--ink)' }}
                        onClick={async () => {
                          await toggleMachineStatus(selectedMachineForAction.code || selectedMachineForAction.id, 'Idle');
                          setSelectedMachineForAction(null);
                        }}
                      >
                        ⚪ খালি (Idle)
                      </button>

                      <button
                        type="button"
                        className="btn sm"
                        style={{ background: 'var(--bad-soft)', color: 'var(--bad)', borderColor: 'var(--bad)' }}
                        onClick={async () => {
                          await toggleMachineStatus(selectedMachineForAction.code || selectedMachineForAction.id, 'Maint');
                          setSelectedMachineForAction(null);
                        }}
                      >
                        🔴 মেরামত (Breakdown)
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn sm" onClick={() => setSelectedMachineForAction(null)}>বন্ধ করুন</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODAL 3: FREE MACHINE BROADCAST ================= */}
          {isBroadcastModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, maxWidth: 540, width: '92%', padding: 22, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>📡 ফ্রি মেশিন ব্রডকাস্ট (মার্কেটপ্লেস বুকিং)</h3>
                    <small style={{ color: 'var(--muted)' }}>বায়ার ও গার্মেন্টসের কাছে খালি মেশিনের রিয়েলটাইম নোটিফিকেশন পাঠান</small>
                  </div>
                  <button type="button" className="btn sm" onClick={() => setIsBroadcastModalOpen(false)} style={{ padding: '4px 8px' }}>
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await broadcastFreeMachines(
                      selectedBroadcastMachines,
                      true,
                      broadcastDate,
                      parseFloat(broadcastCapacity) || 190,
                      broadcastNote
                    );
                    setIsBroadcastModalOpen(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
                      কোন কোন মেশিন ব্রডকাস্ট করতে চান? ({selectedBroadcastMachines.length}টি নির্বাচিত)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const id = `M-${String(i + 1).padStart(2, '0')}`;
                        const selected = selectedBroadcastMachines.includes(id);
                        return (
                          <button
                            type="button"
                            key={id}
                            className={`btn sm ${selected ? 'pri' : ''}`}
                            style={{ padding: '6px 4px', fontSize: '0.78rem', justifyContent: 'center' }}
                            onClick={() => {
                              if (selected) {
                                setSelectedBroadcastMachines((prev) => prev.filter((m) => m !== id));
                              } else {
                                setSelectedBroadcastMachines((prev) => [...prev, id]);
                              }
                            }}
                          >
                            {id}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>ফ্রি হওয়ার তারিখ</label>
                      <input
                        type="date"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={broadcastDate}
                        onChange={(e) => setBroadcastDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>দৈনিক সক্ষমতা (kg/মেশিন)</label>
                      <input
                        type="number"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={broadcastCapacity}
                        onChange={(e) => setBroadcastCapacity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>বায়ারদের জন্য নোট</label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={broadcastNote}
                      onChange={(e) => setBroadcastNote(e.target.value)}
                      placeholder="যেমন: সিঙ্গেল জার্সি ও লাইক্রা রিব এর জন্য দ্রুত বুকিং ওপেন"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                    <button type="button" className="btn" onClick={() => setIsBroadcastModalOpen(false)}>বাতিল</button>
                    <button type="submit" className="btn pri" disabled={selectedBroadcastMachines.length === 0}>
                      📡 বায়ারদের কাছে ব্রডকাস্ট পাঠান
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 4: SUBCONTRACT RFQ QUOTATION (shilposetu-old feature) ================= */}
          {isRfqModalOpen && selectedRfq && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, maxWidth: 500, width: '92%', padding: 22, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>কোটেশন জমা দিন (দরপত্র)</h3>
                    <small style={{ color: 'var(--muted)' }}>বায়ার: {selectedRfq.buyer} · ফেব্রিক: {selectedRfq.fabric}</small>
                  </div>
                  <button type="button" className="btn sm" onClick={() => setIsRfqModalOpen(false)} style={{ padding: '4px 8px' }}>
                    <X size={16} />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await submitQuotation({
                      subcontract_post_id: selectedRfq.id,
                      offered_rate_tk: parseFloat(rfqProposedRate) || 15.0,
                      estimated_days: 7,
                      allocated_machines: 2,
                      note: `${rfqCommitment ? 'মেশিন: ' + rfqCommitment + '. ' : ''}${rfqNote || ''}`,
                    });
                    setIsRfqModalOpen(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <div><strong>চাহিদা:</strong> {selectedRfq.title}</div>
                    <div><strong>মোট পরিমাণ:</strong> {selectedRfq.qty_kg > 0 ? bnNum(selectedRfq.qty_kg) : '৫,০০০'} kg</div>
                    <div><strong>বায়ারের টার্গেট রেট:</strong> {selectedRfq.target_rate}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>আপনার প্রস্তাবিত রেট (৳/kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={rfqProposedRate}
                        onChange={(e) => setRfqProposedRate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>মেশিন বরাদ্দ প্রতিশ্রুতি</label>
                      <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                        value={rfqCommitment}
                        onChange={(e) => setRfqCommitment(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>বায়ারের জন্য বার্তা / বিশেষ সুবিধা</label>
                    <textarea
                      rows={2}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                      value={rfqNote}
                      onChange={(e) => setRfqNote(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                    <button type="button" className="btn" onClick={() => setIsRfqModalOpen(false)}>বাতিল</button>
                    <button type="submit" className="btn pri">✉️ সরাসরি বায়ারকে কোটেশন পাঠান</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const FactoryPortalPage = FactoryPortal;

