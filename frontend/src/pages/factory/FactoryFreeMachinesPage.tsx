import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';

interface FreeMachineRow {
  code: string;
  brand: string;
  diaGg: string;
  broadcast: boolean;
  freeFrom: string;
  capacityKg: number;
}

const INITIAL_IDLE_MACHINES: FreeMachineRow[] = [
  { code: 'M-10', brand: 'Mayer & Cie (জার্মানি)', diaGg: '30" × 24G', broadcast: true, freeFrom: '2026-10-05', capacityKg: 450 },
  { code: 'M-18', brand: 'Terrot (জার্মানি)', diaGg: '32" × 24G', broadcast: true, freeFrom: '2026-10-04', capacityKg: 480 },
  { code: 'M-19', brand: 'Terrot (জার্মানি)', diaGg: '34" × 28G', broadcast: false, freeFrom: '2026-10-06', capacityKg: 420 },
  { code: 'M-20', brand: 'Fukuhara (জাপান)', diaGg: '30" × 20G', broadcast: false, freeFrom: '2026-10-08', capacityKg: 400 },
  { code: 'M-21', brand: 'Pailung (তাইওয়ান)', diaGg: '36" × 24G', broadcast: true, freeFrom: '2026-10-05', capacityKg: 520 },
];

export const FactoryFreeMachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast, machines: allMachines, freeOffers } = useApp();
  const [machines, setMachines] = useState<FreeMachineRow[]>(() => {
    if (allMachines && allMachines.length > 0) {
      const freeList = allMachines.filter(
        (m: any) => m.status === 'Free' || m.status === 'Idle' || m.broadcast_free
      );
      if (freeList.length > 0) {
        return freeList.map((m: any) => ({
          code: m.code || m.id,
          brand: m.brand || 'Pailung (Taiwan)',
          diaGg: m.spec_label || `${m.dia || '30"' } × ${m.gg || '24G'}`,
          broadcast: Boolean(m.broadcast_free || m.status === 'Free'),
          freeFrom: m.availFrom || '2026-10-05',
          capacityKg: Number(m.targetKg || m.target_kg || 450),
        }));
      }
    }
    return INITIAL_IDLE_MACHINES;
  });

  React.useEffect(() => {
    if (allMachines && allMachines.length > 0) {
      const freeList = allMachines.filter(
        (m: any) => m.status === 'Free' || m.status === 'Idle' || m.broadcast_free
      );
      if (freeList.length > 0) {
        setMachines(
          freeList.map((m: any) => ({
            code: m.code || m.id,
            brand: m.brand || 'Pailung (Taiwan)',
            diaGg: m.spec_label || `${m.dia || '30"' } × ${m.gg || '24G'}`,
            broadcast: Boolean(m.broadcast_free || m.status === 'Free'),
            freeFrom: m.availFrom || '2026-10-05',
            capacityKg: Number(m.targetKg || m.target_kg || 450),
          }))
        );
      }
    }
  }, [allMachines]);

  const toggleBroadcast = (code: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.code !== code) return m;
        const next = !m.broadcast;
        addToast({
          type: 'info',
          title: next ? 'মার্কেটপ্লেসে যুক্ত হয়েছে' : 'মার্কেটপ্লেস থেকে সরানো হয়েছে',
          message: `${code} মেশিনটি ভেন্ডরদের খালি মেশিন তালিকায় ${next ? 'দেখাচ্ছে' : 'লুকানো হয়েছে'}।`,
        });
        return { ...m, broadcast: next };
      })
    );
  };

  const broadcastCount = machines.filter((m) => m.broadcast).length;

  return (
    <div style={{ maxWidth: '100%', width: '100%' }}>
      {/* Header */}
      <div className="head">
        <div>
          <h2>খালি মেশিন ও সাবকন্ট্রাক্ট</h2>
          <p>
            যে মেশিনগুলো এখন বসে আছে, সেগুলোতে কাজ নেওয়ার জন্য মার্কেটপ্লেসে
            খালি হিসেবে দেখাতে পারেন। ভেন্ডর ও বায়িং হাউস এটা দেখে সরাসরি
            রিকোয়েস্ট পাঠাবে।
          </p>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="kpis">
        <div className="kpi">
          <span>মোট মেশিন</span>
          <b>২৪টি সার্কুলার + ৬টি ফ্ল্যাট</b>
          <i>ফ্যাক্টরির পূর্ণ ক্যাপাসিটি</i>
        </div>
        <div className="kpi">
          <span>এখন খালি / অলস</span>
          <b>{bnNum(machines.length)}টি মেশিন</b>
          <i>কাজ বরাদ্দ নেই</i>
        </div>
        <div className="kpi">
          <span>মার্কেটপ্লেসে দেখাচ্ছে</span>
          <b style={{ color: 'var(--ok)' }}>{bnNum(broadcastCount)}টি মেশিন</b>
          <i>ভেন্ডরদের চোখে উন্মুক্ত</i>
        </div>
      </div>

      <div className="grid g2" style={{ marginBottom: 20 }}>
        {/* Idle Machines Management */}
        <div className="card">
          <h3>খালি মেশিন সম্প্রচার তালিকা</h3>
          <div className="tw" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>মেশিন নং</th>
                  <th>ব্র্যান্ড ও স্পেক</th>
                  <th>কবে থেকে খালি</th>
                  <th className="n">দৈনিক ক্ষমতা</th>
                  <th style={{ textAlign: 'center' }}>মার্কেটপ্লেসে দেখান</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m.code}>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {m.code}
                    </td>
                    <td>
                      <div>{m.brand}</div>
                      <span className="mono small muted">{m.diaGg}</span>
                    </td>
                    <td className="mono small">{m.freeFrom}</td>
                    <td className="n">{bnNum(m.capacityKg)} kg</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={m.broadcast}
                        onChange={() => toggleBroadcast(m.code)}
                        aria-label={`${m.code} ব্রডকাস্ট`}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            টিক দেওয়া মেশিনগুলো ভেন্ডর ও বায়িং হাউসের নিটখাতা সার্চে দেখা যাবে।
          </p>
        </div>

        {/* Incoming Capacity Requests from Vendors */}
        <div className="card">
          <h3>ভেন্ডরদের সাবকন্ট্রাক্ট রিকোয়েস্ট</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {freeOffers && freeOffers.length > 0 ? (
              freeOffers.map((req: any, idx: number) => (
                <div
                  key={req.id || idx}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    background: 'var(--surface2)',
                  }}
                >
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <b>{req.party === 'abc' ? 'ABC Knit Composite' : (req.party === 'xyz' ? 'XYZ Fashion Ltd' : req.party || 'ভেন্ডর')}</b>
                    <span className={`pill ${req.status === 'New' ? 'p-ok' : 'p-acc'}`}>
                      {req.status === 'New' ? 'নতুন চাহিদা' : 'বিবেচনাধীন'}
                    </span>
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    যোগাযোগ: {req.contact || 'দায়িত্বপ্রাপ্ত মার্চেন্ডাইজার'} ({req.phone || '01711000000'})
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '.9rem' }}>
                    ফেব্রিক: <b>{req.yarnSpec || req.fab || 'Single Jersey'}</b> · পরিমাণ: <b>{bnNum((req.reqKg || req.q || 3000).toLocaleString('en-IN'))} kg</b>
                    <br />
                    প্রয়োজন: <b>{bnNum(req.n || 2)}টি মেশিন ({req.diaGg || req.spec || '30" × 24G'})</b> · শুরুর তারিখ: <b>{req.startDate || req.from || 'আসন্ন'}</b>
                  </p>
                  <div className="row" style={{ gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      className="btn pri sm"
                      onClick={() => navigate('/dashboard/fmsg')}
                    >
                      মেসেজে কথা বলুন
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() =>
                        addToast({
                          type: 'success',
                          title: 'কোটেশন জমা হয়েছে',
                          message: `${req.party || 'ভেন্ডর'}-কে অফার পাঠানো হয়েছে।`,
                        })
                      }
                    >
                      কোটেশন পাঠান
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="small muted" style={{ textAlign: 'center', padding: '16px' }}>বর্তমানে কোনো ভেন্ডর রিকোয়েস্ট অপেক্ষমাণ নেই।</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

