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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 270,
          background: '#0f172a',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #1e293b',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KnittedKCanvas size={22} fgColor="#0d6e4f" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
              {currentUser?.organization_name || 'রহমান নিটিং ইন্ডাস্ট্রিজ'}
            </div>
            <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>২৪টি সার্কুলার মেশিন ফ্লোর</div>
          </div>
        </div>

        {/* Current User Role Pill */}
        <div style={{ padding: '12px 18px', background: '#1e293b', margin: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
              {currentUser?.name || 'আরিফ হোসেন'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {currentUser?.designation || ROLES_MAP[role].bn}
            </div>
          </div>
          <span className="badge badge-green">সক্রিয়</span>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {menuGroups.map((grp, gIdx) => (
            <div key={gIdx}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 10px 8px' }}>
                {grp.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {grp.items.map((it) => {
                  const Icon = it.icon;
                  const active = factoryView === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setFactoryView(it.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: active ? '#0d6e4f' : 'transparent',
                        color: active ? '#ffffff' : '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={16} />
                        <span>{it.label}</span>
                      </div>
                      {it.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 99,
                            background: active ? '#ffffff' : '#334155',
                            color: active ? '#0d6e4f' : '#ffffff',
                            fontWeight: 700,
                          }}
                        >
                          {it.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: 14, borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 6,
              color: '#f87171',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 10px',
              transition: 'background 0.15s',
            }}
          >
            <LogOut size={16} />
            <span>লগআউট করুন</span>
          </button>
          <button
            onClick={() => setScreen('site')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: 12,
              cursor: 'pointer',
              padding: '6px 8px',
            }}
          >
            <ArrowLeft size={16} />
            <span>মূল ওয়েবসাইটে ফিরুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Navbar */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {menuGroups.flatMap((g) => g.items).find((i) => i.id === factoryView)?.label || 'ড্যাশবোর্ড'}
            </h2>
            <span className="badge badge-green">লাইভ সিঙ্ক: MySQL</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick Switcher for Demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span>সুইচ রোল:</span>
              <select
                className="select"
                style={{ width: 140, padding: '4px 8px', fontSize: 12 }}
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
              onClick={() => {
                setRole('vendor');
                setScreen('vendor');
              }}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#c85a14', color: '#c85a14' }}
            >
              বায়ার ভিউ দেখুন
            </button>

            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: 4 }}
              title="লগআউট"
            >
              <LogOut size={14} />
              <span>লগআউট</span>
            </button>
          </div>
        </header>

        {/* View Router */}
        <main style={{ padding: 24, flex: 1 }}>
          {/* ================= 1. DASHBOARD VIEW ================= */}
          {factoryView === 'dash' && (
            <div>
              {/* Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>আজকের মোট উৎপাদন</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                    ১,৪২৫ <span style={{ fontSize: 14 }}>kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#0d6e4f', marginTop: 4 }}>৮টি মেশিনের শিফট এন্ট্রি</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #2364aa' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>সক্রিয় রানিং অর্ডার</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                    {orders.filter((o) => o.status === 'Running').length} <span style={{ fontSize: 14 }}>টি PO</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#2364aa', marginTop: 4 }}>মোট অর্ডার: {bnNum(orders.reduce((acc, o) => acc + o.lines.reduce((lacc, l) => lacc + l.orderKg, 0), 0))} kg</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #c85a14' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>ফ্রি মেশিন (বুকিং ওপেন)</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#c85a14', marginTop: 6 }}>
                    {machines.filter((m) => m.status === 'Free' || m.status === 'Idle').length} <span style={{ fontSize: 14 }}>টি</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#c85a14', marginTop: 4 }}>M-06, M-08 প্রস্তুত</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #b8860b' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>বকেয়া বিল আদায়যোগ্য</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#b8860b', marginTop: 6 }}>
                    ৳ ২,০৩,৪০০
                  </div>
                  <div style={{ fontSize: 11, color: '#b8860b', marginTop: 4 }}>৩টি পার্টির চালান বিল বাকি</div>
                </div>
              </div>

              {/* Floor Machine Status Grid */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>ফ্লোর মেশিন লাইভ মনিটর (৮টি মেশিন)</h3>
                    <p style={{ fontSize: 12, color: '#64748b' }}>প্রতি মেশিনের আরপিএম, বর্তমান অর্ডার ও অপারেটর</p>
                  </div>
                  <button onClick={() => setFactoryView('freem')} className="btn btn-outline-green btn-sm">
                    ফ্রি মেশিন ব্রডকাস্ট দেখুন
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {machines.map((m) => {
                    const isRun = m.status === 'Running';
                    const isFree = m.status === 'Free';
                    const isIdle = m.status === 'Idle';

                    return (
                      <div
                        key={m.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: 14,
                          background: isRun ? '#ffffff' : isFree ? '#fff3ec' : '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{m.id}</span>
                          <span className={`badge ${isRun ? 'badge-green' : isFree ? 'badge-orange' : 'badge-amber'}`}>
                            {m.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                          {m.type} ({m.dia} × {m.gg})
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{m.brand}</div>

                        <div style={{ margin: '10px 0', padding: '6px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 11 }}>
                          <div><strong>ফ্যাব্রিক:</strong> {m.fabric}</div>
                          <div><strong>অপারেটর:</strong> {m.operator}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
                          <span>আজকের: <strong>{m.todayKg} kg</strong></span>
                          <span>টার্গেট: {m.targetKg} kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Orders List Quick Table */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>রানিং সাব-কন্ট্রাক্ট অর্ডারসমূহ</h3>
                    <p style={{ fontSize: 12, color: '#64748b' }}>উৎপাদন ও ডেলিভারি অগ্রগতি</p>
                  </div>
                  <button onClick={() => setFactoryView('neworder')} className="btn btn-primary btn-sm">
                    <Plus size={14} /> নতুন অর্ডার যোগ করুন
                  </button>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>অর্ডার নং</th>
                        <th>পার্টি / বায়ার</th>
                        <th>স্টাইল ও কালার</th>
                        <th>অর্ডার পরিমাণ</th>
                        <th>বোনা হয়েছে</th>
                        <th>ডেলিভারি</th>
                        <th>অগ্রগতি</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const totalKg = o.lines.reduce((a, b) => a + b.orderKg, 0);
                        const knitKg = o.lines.reduce((a, b) => a + b.knitKg, 0);
                        const delivKg = o.lines.reduce((a, b) => a + b.delivKg, 0);
                        const prog = pct(knitKg, totalKg);

                        return (
                          <tr key={o.id}>
                            <td><strong>{o.id}</strong><div style={{ fontSize: 11, color: '#64748b' }}>{o.po}</div></td>
                            <td><strong>{o.party}</strong><div style={{ fontSize: 11, color: '#64748b' }}>{o.buyer}</div></td>
                            <td>{o.style}<div style={{ fontSize: 11, color: '#64748b' }}>{o.color}</div></td>
                            <td><strong>{fmtKg(totalKg)}</strong></td>
                            <td style={{ color: '#0d6e4f', fontWeight: 700 }}>{fmtKg(knitKg)}</td>
                            <td>{fmtKg(delivKg)}</td>
                            <td>
                              <div style={{ width: 90, background: '#e2e8f0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                                <div style={{ width: `${prog}%`, background: '#0d6e4f', height: '100%' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#0d6e4f' }}>{prog}%</span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedOrderId(o.id);
                                  setFactoryView('detail');
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                বিস্তারিত <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. ORDER LIST & DETAIL ================= */}
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
          {![
            'dash',
            'orders',
            'detail',
            'entry',
            'qc',
            'challan',
            'yarn',
            'bill',
            'fmsg',
            'subcontract',
            'party',
            'store',
          ].includes(factoryView) && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <Building size={48} color="#0d6e4f" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>মডিউল সক্রিয়: {factoryView}</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, maxWidth: 480, margin: '8px auto 20px' }}>
                এই মডিউলটির পূর্ণাঙ্গ ডাটাবেজ টেবিল এবং এপিআই এন্ডপয়েন্ট Laravel 13 ও MySQL এ লাইভ আছে।
              </p>
              <button onClick={() => setFactoryView('dash')} className="btn btn-primary">
                ড্যাশবোর্ডে ফিরুন
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const FactoryPortalPage = FactoryPortal;

