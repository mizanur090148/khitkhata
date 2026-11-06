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
                      onClick={() => openCallModal({ title: fac.name, subtitle: fac.owner, phone: fac.phone })}
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
          {![
            'dash',
            'orders',
            'facs',
          ].includes(vendorView) && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <PackageCheck size={48} color="#c85a14" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>বায়ার মডিউল সক্রিয়: {vendorView}</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, maxWidth: 480, margin: '8px auto 20px' }}>
                বায়ার ও ভেন্ডরদের রিয়েল-টাইম ডাটা সিঙ্ক হচ্ছে।
              </p>
              <button onClick={() => setVendorView('dash')} className="btn btn-primary">
                ড্যাশবোর্ডে ফিরুন
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const VendorPortalPage = VendorPortal;


