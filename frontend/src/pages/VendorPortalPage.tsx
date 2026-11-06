import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KnittedKCanvas } from '@/components/common/KnittedKCanvas';
import {
  ShoppingBag,
  LayoutDashboard,
  ClipboardList,
  Activity,
  PackageCheck,
  MessageSquare,
  Radio,
  Truck,
  Layers,
  Receipt,
  CheckSquare,
  Building2,
  LogOut,
  ArrowLeft,
  Phone,
  Send,
  ShieldCheck,
  Printer,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { bnNum, fmtKg, fmtTk, pct } from '@/utils/formatters';

export const VendorPortal: React.FC = () => {
  const {
    vendorView,
    setVendorView,
    setScreen,
    logout,
    orders,
    machines,
    yarns,
    challans,
    bills,
    qcLogs,
    vendorFactories,
    rolls,
    prodLogs,
    freeOffers,
    threads,
    selectedThreadId,
    setSelectedThreadId,
    selectedOrderId,
    setSelectedOrderId,
    openCallModal,
    openPrintModal,
    sendChatMessage,
    addToast,
  } = useApp();

  const [chatText, setChatText] = useState('');
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Vendor Menu Tabs
  const menuItems = [
    { id: 'dash', label: 'বায়ার ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'orders', label: 'আমার অর্ডারসমূহ', icon: ClipboardList, badge: orders.length },
    { id: 'prod', label: 'লাইভ নিটিং অগ্রগতি', icon: Activity },
    { id: 'ready', label: 'রেডি গুডস রিলিজ', icon: PackageCheck },
    { id: 'msg', label: 'ফ্যাক্টরি সরাসরি চ্যাট', icon: MessageSquare, badge: '২' },
    { id: 'free', label: 'ফ্রি মেশিন অনুসন্ধান', icon: Radio, badge: 'লাইভ' },
    { id: 'vch', label: 'ডেলিভারি চালান ও গেট পাস', icon: Truck },
    { id: 'vyarn', label: 'সুতার ব্যালেন্স মিল অনুযায়ী', icon: Layers },
    { id: 'bills', label: 'নিটিং বিল ও বকেয়া', icon: Receipt },
    { id: 'qc', label: '৪-পয়েন্ট QC সার্টিফিকেট', icon: CheckSquare },
    { id: 'facs', label: 'ভেরিফায়েড নিটিং মিলস', icon: Building2 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 270,
          background: '#1c1917',
          color: '#e7e5e4',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #292524',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #292524', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} color="#c85a14" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>সানরাইজ অ্যাপারেলস</div>
            <div style={{ fontSize: 11, color: '#fb923c', fontWeight: 600 }}>বায়ার / ভেন্ডর পোর্টাল</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((it) => {
            const Icon = it.icon;
            const active = vendorView === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setVendorView(it.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: active ? '#c85a14' : 'transparent',
                  color: active ? '#ffffff' : '#a8a29e',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
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
                      background: active ? '#ffffff' : '#44403c',
                      color: active ? '#c85a14' : '#ffffff',
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

        <div style={{ padding: 14, borderTop: '1px solid #292524', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              color: '#a8a29e',
              fontSize: 12,
              cursor: 'pointer',
              padding: '6px 8px',
            }}
          >
            <ArrowLeft size={16} />
            <span>মূল সাইটে ফিরুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
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
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {menuItems.find((i) => i.id === vendorView)?.label || 'বায়ার ড্যাশবোর্ড'}
            </h2>
            <div style={{ fontSize: 12, color: '#64748b' }}>সানরাইজ অ্যাপারেলস লিঃ · বায়ার পোর্টাল</div>
          </div>
          <button
            onClick={() => setScreen('factory')}
            className="btn btn-primary btn-sm"
          >
            ফ্যাক্টরি ড্যাশবোর্ডে যান
          </button>
        </header>

        <main style={{ padding: 24, flex: 1 }}>
          {/* ================= 1. VENDOR DASHBOARD ================= */}
          {vendorView === 'dash' && (
            <div>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #c85a14' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>চলমান মোট ওয়ার্ক অর্ডার</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                    ৩ <span style={{ fontSize: 14 }}>টি ফ্যাক্টরিতে</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#c85a14', marginTop: 4 }}>মোট: ৭,৩০০ kg কাপড়</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>রেডি গুডস (ডেলিভারি উপযোগী)</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0d6e4f', marginTop: 6 }}>
                    ২,৫৮০ <span style={{ fontSize: 14 }}>kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#0d6e4f', marginTop: 4 }}>৪-পয়েন্ট QC পাস</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #2364aa' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>ডেলিভারি নেওয়া হয়েছে</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#2364aa', marginTop: 6 }}>
                    ৩,৮২০ <span style={{ fontSize: 14 }}>kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#2364aa', marginTop: 4 }}>মোট চালানের সংখ্যা: ৪টি</div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #b8860b' }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>মিলে থাকা সুতার স্টক</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#b8860b', marginTop: 6 }}>
                    ১,৭৭০ <span style={{ fontSize: 14 }}>kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#b8860b', marginTop: 4 }}>Square, Matin, Badsha</div>
                </div>
              </div>

              {/* Multi-Factory Progress */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>ফ্যাক্টরিভিত্তিক লাইভ অগ্রগতি</h3>
                    <p style={{ fontSize: 12, color: '#64748b' }}>কোন মিল কতটুকু বোনা সম্পন্ন করেছে</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map((o) => {
                    const totalKg = o.lines.reduce((a, b) => a + b.orderKg, 0);
                    const knitKg = o.lines.reduce((a, b) => a + b.knitKg, 0);
                    const delivKg = o.lines.reduce((a, b) => a + b.delivKg, 0);
                    const prog = pct(knitKg, totalKg);

                    return (
                      <div key={o.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fcfdfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{o.id} ({o.po})</span>
                            <span style={{ fontSize: 13, color: '#0d6e4f', fontWeight: 700, marginLeft: 10 }}>
                              {o.factoryName}
                            </span>
                          </div>
                          <span className="badge badge-green">{o.status}</span>
                        </div>

                        <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                          স্টাইল: <strong>{o.style}</strong> ({o.buyer}) · কালার: {o.color} · ডেলিভারি ডেট: {o.delivDate}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                          <div>অর্ডার: <strong>{fmtKg(totalKg)}</strong></div>
                          <div>বোনা শেষ: <strong style={{ color: '#0d6e4f' }}>{fmtKg(knitKg)}</strong></div>
                          <div>ডেলিভারি চালান: <strong>{fmtKg(delivKg)}</strong></div>
                          <div>বাকি: <strong>{fmtKg(totalKg - delivKg)}</strong></div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#0d6e4f', marginBottom: 4 }}>
                            <span>উৎপাদন অগ্রগতি</span>
                            <span>{prog}%</span>
                          </div>
                          <div style={{ width: '100%', background: '#e2e8f0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                            <div style={{ width: `${prog}%`, background: '#0d6e4f', height: '100%' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. VERIFIED FACTORIES DIRECTORY ================= */}
          {vendorView === 'facs' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>যাচাইকৃত নিটিং মিলস ডিরেক্টরি</h3>
                  <p style={{ fontSize: 13, color: '#64748b' }}>নারায়ণগঞ্জ, গাজীপুর ও সাভারের শীর্ষ সার্কুলার মিলসমূহ</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {vendorFactories.map((fac) => (
                  <div key={fac.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{fac.name}</h4>
                          {fac.verified && <ShieldCheck size={16} color="#0d6e4f" />}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{fac.loc}</div>
                      </div>
                      <span className="badge badge-amber">★ {fac.rating}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
                      <div>মোট মেশিন: <strong>{fac.machinesTotal} টি</strong></div>
                      <div>ফ্রি মেশিন: <strong style={{ color: '#c85a14' }}>{fac.freeM} টি</strong></div>
                      <div>অন-টাইম রেট: <strong>{fac.onTimePct}%</strong></div>
                      <div>ডিফেক্ট রেট: <strong>{fac.defectPct}%</strong></div>
                    </div>

                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>
                      <strong>স্পেশালিটি:</strong> {fac.specialties.join(', ')}
                    </div>

                    <button
                      onClick={() => openCallModal({ title: fac.name, subtitle: fac.owner, phone: fac?.phone || '01712-345678' })}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <Phone size={14} /> যোগাযোগ করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for other vendor tabs */}
          {/* ================= 2. ORDERS VIEW ================= */}
          {vendorView === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>আমার সাব-কন্ট্রাক্ট অর্ডারসমূহ</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>বায়ার পিও, ফেব্রিক স্পেসিফিকেশন ও ডেলিভারি অগ্রগতি</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => addToast({ type: 'info', message: 'নতুন ওয়ার্ক অর্ডার তৈরি করতে ফ্যাক্টরিকে কল বা মেসেজ দিন।' })}
                    className="btn btn-primary btn-sm"
                  >
                    + নতুন অর্ডার পাঠান
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((o) => {
                  const totalKg = o.lines.reduce((a, b) => a + b.orderKg, 0);
                  const knitKg = o.lines.reduce((a, b) => a + b.knitKg, 0);
                  const delivKg = o.lines.reduce((a, b) => a + b.delivKg, 0);
                  const prog = pct(knitKg, totalKg);

                  return (
                    <div key={o.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{o.id} ({o.po})</span>
                            <span className="badge badge-green">{o.status}</span>
                            <span style={{ fontSize: 13, color: '#c85a14', fontWeight: 700 }}>
                              {o.factoryName}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                            স্টাইল: <strong>{o.style}</strong> · কালার: {o.color} · ডেলিভারি শেষ তারিখ: <span style={{ color: '#b91c1c', fontWeight: 700 }}>{o.delivDate}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openPrintModal('jobcard', `জব কার্ড - ${o.id}`, o)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Printer size={14} /> জব কার্ড
                          </button>
                          <button
                            onClick={() => {
                              const fac = vendorFactories.find(f => f.name === o.factoryName) || vendorFactories[0];
                              openCallModal({ title: o.factoryName || 'ফ্যাক্টরি', subtitle: `PO: ${o.po}`, phone: fac?.phone || '01712-345678' });
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Phone size={14} /> ফ্যাক্টরি কল
                          </button>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                        <table className="table" style={{ fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              <th>ফেব্রিক টাইপ / জিএসএম</th>
                              <th>ডায়া × গেজ</th>
                              <th>সুতার কাউন্ট ও লট</th>
                              <th>অর্ডার (কেজি)</th>
                              <th>বোনা (কেজি)</th>
                              <th>ডেলিভারি (কেজি)</th>
                              <th>বাকি (কেজি)</th>
                              <th>নিটিং রেট</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.lines.map((l, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 700 }}>{l.fabric}</td>
                                <td>{l.dia}</td>
                                <td>{l.yarn}</td>
                                <td style={{ fontWeight: 700 }}>{fmtKg(l.orderKg)}</td>
                                <td style={{ color: '#0d6e4f', fontWeight: 700 }}>{fmtKg(l.knitKg)}</td>
                                <td>{fmtKg(l.delivKg)}</td>
                                <td style={{ color: '#b91c1c', fontWeight: 700 }}>{fmtKg(l.orderKg - l.delivKg)}</td>
                                <td style={{ fontWeight: 700 }}>৳{bnNum(l.rate)}/kg</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#0d6e4f', marginBottom: 6 }}>
                          <span>উৎপাদন অগ্রগতি: {fmtKg(knitKg)} / {fmtKg(totalKg)}</span>
                          <span>{prog}% সম্পন্ন</span>
                        </div>
                        <div style={{ width: '100%', background: '#e2e8f0', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${prog}%`, background: '#0d6e4f', height: '100%' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 3. LIVE PRODUCTION VIEW ================= */}
          {vendorView === 'prod' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>লাইভ নিটিং প্রোডাকশন মনিটর</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>ফ্যাক্টরি ফ্লোরে চলমান সার্কুলার মেশিন ও দৈনিক রোলের লাইভ হিসাব</p>
              </div>

              {/* Running machines working on buyer orders */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {machines.map((m) => {
                  const isRun = m.status === 'Running';
                  return (
                    <div
                      key={m.id}
                      className="card"
                      style={{
                        borderLeft: isRun ? '4px solid #0d6e4f' : '4px solid #94a3b8',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>মেশিন {m.id}</span>
                          <span className={`badge ${isRun ? 'badge-green' : 'badge-amber'}`}>
                            {m.status}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{m.brand} ({m.dia} × {m.gg})</span>
                      </div>

                      <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                        <strong>ফেব্রিক:</strong> {m.fabric || 'Single Jersey 160 GSM'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                        অপারেটর: <strong>{m.operator}</strong> · রানিং অর্ডার: <strong style={{ color: '#0d6e4f' }}>{m.orderId || 'PO-2026-901'}</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 11 }}>
                        <div>আজকের উৎপাদন: <strong style={{ color: '#0d6e4f' }}>{fmtKg(m.todayKg)}</strong></div>
                        <div>দৈনিক টার্গেট: <strong>{fmtKg(m.targetKg)}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shift Production Logs */}
              <div className="card">
                <div className="card-header">
                  <h4 style={{ fontSize: 15, fontWeight: 800 }}>আজকের শিফটভিত্তিক প্রোডাকশন লগ</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>লগ আইডি</th>
                        <th>মেশিন নং</th>
                        <th>শিফট</th>
                        <th>অপারেটর</th>
                        <th>রোল সংখ্যা</th>
                        <th>মোট ওজন (কেজি)</th>
                        <th>রিজেক্ট (কেজি)</th>
                        <th>আরপিএম</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prodLogs.slice(0, 8).map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.id}</td>
                          <td><strong>{p.machine}</strong></td>
                          <td><span className="badge badge-blue">{p.shift}</span></td>
                          <td>{p.operator}</td>
                          <td>{bnNum(p.rolls)} টি</td>
                          <td style={{ fontWeight: 700, color: '#0d6e4f' }}>{fmtKg(p.kg)}</td>
                          <td style={{ color: p.rejectKg > 0 ? '#b91c1c' : '#64748b' }}>{fmtKg(p.rejectKg)}</td>
                          <td>{bnNum(p.rpm)} RPM</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. READY STOCK VIEW ================= */}
          {vendorView === 'ready' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>ওয়্যারহাউজে রেডি স্টক ও রিলিজ</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>যেসব রোল বোনা ও কিউসি শেষ হয়ে ডেলিভারির জন্য প্রস্তুত রয়েছে</p>
                </div>
                <button
                  onClick={() => addToast({ type: 'success', message: 'ডেলিভারি পিকআপ রিকোয়েস্ট ফ্যাক্টরিতে পাঠানো হয়েছে।' })}
                  className="btn btn-primary btn-sm"
                >
                  <Truck size={14} /> ডেলিভারি রিকোয়েস্ট পাঠান
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট প্রস্তুত রোল</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0d6e4f', marginTop: 4 }}>
                    {bnNum(rolls.length)} টি রোল
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>৪-পয়েন্ট QC পরীক্ষিত</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #2364aa' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট প্রস্তুত ওজন</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2364aa', marginTop: 4 }}>
                    {fmtKg(rolls.reduce((a, b) => a + b.kg, 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>তাৎক্ষণিক ডেলিভারি যোগ্য</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #c85a14' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>ফ্যাক্টরি ওয়্যারহাউজ</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#c85a14', marginTop: 4 }}>
                    আমান নিটওয়্যার
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>গোদনাইল, নারায়ণগঞ্জ</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h4 style={{ fontSize: 15, fontWeight: 800 }}>প্রস্তুত রোল বিস্তারিত তালিকা</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>রোল স্টিকার নং</th>
                        <th>অর্ডার নং</th>
                        <th>ফেব্রিক টাইপ</th>
                        <th>মেশিন</th>
                        <th>ওজন (কেজি)</th>
                        <th>কোয়ালিটি গ্রেড</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolls.map((r) => (
                        <tr key={r.rollId}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{r.rollId}</td>
                          <td><strong>{r.orderId}</strong></td>
                          <td>{r.fabric}</td>
                          <td>{r.machine}</td>
                          <td style={{ fontWeight: 700, color: '#0d6e4f' }}>{fmtKg(r.kg)}</td>
                          <td>
                            <span className={`badge ${r.status === 'QC Pass' ? 'badge-green' : 'badge-amber'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td><span className="badge badge-green">Ready to Deliver</span></td>
                          <td>
                            <button
                              onClick={() => openPrintModal('rolltag', `রোল ট্যাগ - ${r.rollId}`, r)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Printer size={12} /> ট্যাগ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. LIVE CHAT VIEW ================= */}
          {vendorView === 'msg' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>ফ্যাক্টরি সরাসরি মেসেজ ও যোগাযোগ</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>সরাসরি মিল মালিক ও প্রোডাকশন ম্যানেজারের সাথে দ্রুত যোগাযোগ</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 600 }}>
                {/* Thread List */}
                <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, padding: '8px 8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    মেসেজ থ্রেডসমূহ
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {threads.map((t) => {
                      const active = t.id === selectedThreadId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedThreadId(t.id)}
                          style={{
                            padding: 10,
                            borderRadius: 8,
                            background: active ? '#fff3ec' : '#f8fafc',
                            border: active ? '1px solid #fdba74' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#c85a14' : '#0f172a' }}>
                              {t.party}
                            </span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>{(t.messages[t.messages.length - 1]?.time || 'সদ্য')}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {(t.messages[t.messages.length - 1]?.text || 'কোনো নতুন বার্তা নেই')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conversation Box */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{activeThread?.party}</h4>
                      <div style={{ fontSize: 11, color: '#0d6e4f' }}>● লাইভ যুক্ত আছেন</div>
                    </div>
                    <button
                      onClick={() => openCallModal({ title: activeThread?.party || 'ফ্যাক্টরি', subtitle: 'সরাসরি কল', phone: '01712-345678' })}
                      className="btn btn-secondary btn-sm"
                    >
                      <Phone size={14} /> কল করুন
                    </button>
                  </div>

                  <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                    {activeThread?.messages.map((m, idx) => {
                      const isMe = m.sender === 'vendor' || m.sender === 'user';
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            background: isMe ? '#c85a14' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            padding: '10px 14px',
                            borderRadius: 12,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                            border: isMe ? 'none' : '1px solid #e2e8f0',
                          }}
                        >
                          <div style={{ fontSize: 13, lineHeight: 1.4 }}>{m.text}</div>
                          <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                            {m.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ padding: 14, borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="মেসেজ লিখুন..."
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatText.trim()) {
                          sendChatMessage(activeThread.id, chatText.trim(), 'vendor');
                          setChatText('');
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        if (chatText.trim()) {
                          sendChatMessage(activeThread.id, chatText.trim(), 'vendor');
                          setChatText('');
                        }
                      }}
                      className="btn btn-primary"
                    >
                      <Send size={15} /> পাঠান
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. FREE MACHINES SEARCH VIEW ================= */}
          {vendorView === 'free' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>ফ্রি মেশিন ব্রডকাস্ট ও স্লট বুকিং</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>জরুরি সাব-কন্ট্রাক্টের জন্য বিভিন্ন নিটিং মিলের খালি মেশিনের লাইভ তালিকা</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {freeOffers.map((fo) => (
                  <div key={fo.id} className="card" style={{ borderTop: '4px solid #c85a14' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{fo.party}</h4>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{'নারায়ণগঞ্জ ও সাভার'}</div>
                      </div>
                      <span className="badge badge-amber">{fo.status}</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      <div>মেশিন টাইপ: <strong>{fo.type}</strong></div>
                      <div>ডায়া ও গেজ: <strong>{fo.diaGg}</strong></div>
                      <div>খালি মেশিনের সংখ্যা: <strong style={{ color: '#c85a14' }}>{bnNum(1)} টি</strong></div>
                      <div>দৈনিক ক্ষমতা: <strong>{fmtKg(fo.reqKg)}</strong></div>
                      <div>উপলব্ধ তারিখ: <strong>{fo.startDate}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => openCallModal({ title: fo.party, subtitle: fo.diaGg, phone: fo.phone })}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Phone size={13} /> কল দিন
                      </button>
                      <button
                        onClick={() => addToast({ type: 'success', message: `${fo.party} এ বুকিং আবেদন পাঠানো হয়েছে।` })}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        বুকিং পাঠান
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 7. CHALLANS & GATE PASS VIEW ================= */}
          {vendorView === 'vch' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>ডেলিভারি চালান ও গেট পাস বিবরণী</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>ফ্যাক্টরি থেকে পাঠানো কাপড় ডেলিভারি চালান ও ডিজিটাল রিসিভিং স্লিপ</p>
                </div>
              </div>

              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>চালান নং</th>
                        <th>তারিখ</th>
                        <th>ফ্যাক্টরি নাম</th>
                        <th>ওয়ার্ক অর্ডার / PO</th>
                        <th>রোল সংখ্যা</th>
                        <th>মোট ওজন (কেজি)</th>
                        <th>গাড়ি ও ড্রাইভার</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challans.map((ch) => (
                        <tr key={ch.no}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{ch.no}</td>
                          <td>{ch.date}</td>
                          <td style={{ fontWeight: 700 }}>{ch.party || 'আমান নিটওয়্যার'}</td>
                          <td><strong>{ch.orderId}</strong></td>
                          <td style={{ fontWeight: 700 }}>{bnNum(ch.rolls)} টি</td>
                          <td style={{ fontWeight: 800, color: '#0d6e4f' }}>{fmtKg(ch.netKg)}</td>
                          <td>{ch.vehicle} ({ch.driver})</td>
                          <td>
                            <span className="badge badge-green">
                              {ch.status === 'Delivered' ? 'রিসিভ সম্পন্ন' : 'ট্রানজিটে আছে'}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => openPrintModal('challan', `চালান - ${ch.no}`, ch)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Printer size={12} /> চালান
                            </button>
                            <button
                              onClick={() => addToast({ type: 'success', message: `চালান ${ch.no} রিসিভিং সফলভাবে স্বাক্ষরিত হয়েছে।` })}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle size={12} /> রিসিভ সাইন
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 8. YARN BALANCE VIEW ================= */}
          {vendorView === 'vyarn' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>সুতার ব্যালেন্স ও মিল ট্র্যাকার</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>বিভিন্ন নিটিং মিলে সরবরাহকৃত সুতা, ব্যবহার এবং বর্তমান ব্যালেন্স</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #b8860b' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট সুতা সরবরাহ</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#b8860b', marginTop: 4 }}>
                    {fmtKg(yarns.reduce((a, b) => a + (b.rcvKg || 0), 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>বায়ার প্রদত্ত কাঁচামাল</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>ব্যবহৃত সুতা (বোনা সম্পন্ন)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0d6e4f', marginTop: 4 }}>
                    {fmtKg(yarns.reduce((a, b) => a + (b.usedKg || 0), 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>গড় অপচয়: ১.৮%</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #2364aa' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মিলে অবশিষ্ট সুতার ব্যালেন্স</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2364aa', marginTop: 4 }}>
                    {fmtKg(yarns.reduce((a, b) => a + (b.rcvKg - b.usedKg - b.retKg), 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>বর্তমানে মজুত</div>
                </div>
              </div>

              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>আইটেম কোড</th>
                        <th>সুতার কাউন্ট ও টাইপ</th>
                        <th>ব্র্যান্ড / স্পিনিং মিল</th>
                        <th>লট নম্বর</th>
                        <th>ইনওয়ার্ড মোট (কেজি)</th>
                        <th>ব্যবহৃত (কেজি)</th>
                        <th>বর্তমান ব্যালেন্স (কেজি)</th>
                        <th>অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yarns.map((y) => (
                        <tr key={y.id}>
                          <td style={{ fontWeight: 700 }}>{y.id}</td>
                          <td style={{ fontWeight: 700 }}>{y.count} {y.brand}</td>
                          <td>{y.brand}</td>
                          <td><strong>{y.lot}</strong></td>
                          <td>{fmtKg(y.rcvKg || 0)}</td>
                          <td>{fmtKg(y.usedKg || 0)}</td>
                          <td style={{ fontWeight: 800, color: (y.rcvKg - y.usedKg - y.retKg) < 200 ? '#b91c1c' : '#0d6e4f' }}>
                            {fmtKg((y.rcvKg - y.usedKg - y.retKg))}
                          </td>
                          <td>
                            <span className={`badge ${(y.rcvKg - y.usedKg - y.retKg) < 200 ? 'badge-amber' : 'badge-green'}`}>
                              {(y.rcvKg - y.usedKg - y.retKg) < 200 ? 'স্টক কম' : 'পর্যাপ্ত'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. BILLS & INVOICES VIEW ================= */}
          {vendorView === 'bills' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>নিটিং বিল ও বকেয়া হিসাব</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>ফ্যাক্টরি থেকে ইস্যুকৃত চালান বিল, পরিশোধিত টাকা ও অবশিষ্ট বকেয়া</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #0f172a' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট ইনভয়েস মূল্য</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    {fmtTk(bills.reduce((a, b) => a + b.grossAmt, 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{bnNum(bills.length)} টি বিল</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>পরিশোধিত অর্থ</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0d6e4f', marginTop: 4 }}>
                    {fmtTk(bills.reduce((a, b) => a + b.paidAmt, 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>ব্যাংক ও চেকের মাধ্যমে পরিশোধ</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #b91c1c' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট বকেয়া বিল</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>
                    {fmtTk(bills.reduce((a, b) => a + (b.grossAmt - b.paidAmt - b.deduct - b.discount), 0))}
                  </div>
                  <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>চলতি দেনা</div>
                </div>
              </div>

              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>বিল নং</th>
                        <th>তারিখ</th>
                        <th>ওয়ার্ক অর্ডার / PO</th>
                        <th>চালান নং</th>
                        <th>কাজের পরিমাণ (কেজি)</th>
                        <th>রেট (টাকা)</th>
                        <th>মোট বিল</th>
                        <th>পরিশোধ</th>
                        <th>বকেয়া</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((b) => (
                        <tr key={b.no}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{b.no}</td>
                          <td>{b.date}</td>
                          <td><strong>{b.orderId}</strong></td>
                          <td>{'CH-2610'}</td>
                          <td style={{ fontWeight: 700 }}>{fmtKg(Math.round(b.grossAmt / 15))}</td>
                          <td>৳{bnNum(15)}</td>
                          <td style={{ fontWeight: 700 }}>{fmtTk(b.grossAmt)}</td>
                          <td style={{ color: '#0d6e4f' }}>{fmtTk(b.paidAmt)}</td>
                          <td style={{ fontWeight: 800, color: (b.grossAmt - b.paidAmt - b.deduct - b.discount) > 0 ? '#b91c1c' : '#0d6e4f' }}>
                            {fmtTk((b.grossAmt - b.paidAmt - b.deduct - b.discount))}
                          </td>
                          <td>
                            <span className={`badge ${b.status === 'Paid' ? 'badge-green' : b.status === 'Part' ? 'badge-amber' : 'badge-red'}`}>
                              {b.status === 'Paid' ? 'পরিশোধিত' : b.status === 'Part' ? 'আংশিক বাকি' : 'বকেয়া'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => openPrintModal('bill', `বিল - ${b.no}`, b)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Printer size={12} /> ইনভয়েস
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. QC REPORTS VIEW ================= */}
          {vendorView === 'qc' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>৪-পয়েন্ট QC পরিদর্শন ও সার্টিফিকেট</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>আমেরিকান ৪-পয়েন্ট সিস্টেম মান অনুযায়ী রোল ইন্সপেকশন লগ ও ফল্ট এনালাইসিস</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid #0d6e4f' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>গড় ডিফেক্ট পয়েন্ট</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0d6e4f', marginTop: 4 }}>
                    ২.৪ <span style={{ fontSize: 14 }}>/ ১০০ বর্গ গজ</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#0d6e4f', marginTop: 2 }}>অনুমোদিত সীমা: ৪.০ এর নিচে</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #2364aa' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>মোট ইন্সপেকশন করা রোল</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2364aa', marginTop: 4 }}>
                    {bnNum(qcLogs.length)} টি রোল
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>১০০% লাইটবক্স চেক</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #c85a14' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>কোয়ালিটি পাস রেট</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#c85a14', marginTop: 4 }}>
                    ৯৮.৫%
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>আন্তর্জাতিক বায়ার স্ট্যান্ডার্ড</div>
                </div>
              </div>

              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th>ইন্সপেকশন আইডি</th>
                        <th>রোল নম্বর</th>
                        <th>তারিখ</th>
                        <th>ইন্সপেক্টর</th>
                        <th>ডিফেক্ট পয়েন্ট (/১০০ sq yd)</th>
                        <th>গ্রেড ও ফলাফল</th>
                        <th>চিহ্নিত ত্রুটি / ডিফেক্ট</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qcLogs.map((q) => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 700 }}>{q.id}</td>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{q.rollId}</td>
                          <td>{q.date}</td>
                          <td>{q.inspector}</td>
                          <td style={{ fontWeight: 700 }}>{bnNum(q.ptsPer100)} পয়েন্ট</td>
                          <td>
                            <span className={`badge ${q.grade === 'A (Pass)' ? 'badge-green' : 'badge-amber'}`}>
                              Grade {q.grade} ({q.status === 'Pass' ? 'পাস' : 'রিভিউ'})
                            </span>
                          </td>
                          <td style={{ color: '#475569' }}>{(q.defects.map(d => d.name).join(', ') || 'Minor needle line') || 'Minor needle line'}</td>
                          <td>
                            <button
                              onClick={() => openPrintModal('qcreport', `QC সার্টিফিকেট - ${q.rollId}`, q)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Printer size={12} /> সার্টিফিকেট
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const VendorPortalPage = VendorPortal;


