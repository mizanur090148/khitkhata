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
  const { addToast } = useApp();
  const [machines, setMachines] = useState<FreeMachineRow[]>(INITIAL_IDLE_MACHINES);

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
            <div
              style={{
                padding: 14,
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: 'var(--surface2)',
              }}
            >
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>ABC Knit Composite</b>
                <span className="pill p-ok">নতুন চাহিদা</span>
              </div>
              <div className="small muted" style={{ marginTop: 4 }}>
                যোগাযোগ: মো. কামরুল হাসান (সিনিয়র মার্চেন্ডাইজার)
              </div>
              <p style={{ margin: '8px 0', fontSize: '.9rem' }}>
                ফেব্রিক: <b>Single Jersey 160 GSM</b> · পরিমাণ: <b>৪,৫০০ kg</b>
                <br />
                প্রয়োজন: <b>৩টি মেশিন ৩০&quot; × ২৪G</b> · শুরুর তারিখ: <b>০৫ অক্টোবর</b>
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
                      message: 'ABC Knit Composite কে প্রতি কেজি ৩০ টাকা রেটে অফার পাঠানো হয়েছে।',
                    })
                  }
                >
                  কোটেশন পাঠান
                </button>
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: 'var(--surface2)',
              }}
            >
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>XYZ Fashion Ltd</b>
                <span className="pill p-acc">বিবেচনাধীন</span>
              </div>
              <div className="small muted" style={{ marginTop: 4 }}>
                যোগাযোগ: শারমিন আক্তার
              </div>
              <p style={{ margin: '8px 0', fontSize: '.9rem' }}>
                ফেব্রিক: <b>1x1 Rib 220 GSM</b> · পরিমাণ: <b>৩,০০০ kg</b>
                <br />
                প্রয়োজন: <b>২টি মেশিন ৩২&quot; × ১৮G</b> · শুরুর তারিখ: <b>০৮ অক্টোবর</b>
              </p>
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn pri sm"
                  onClick={() => navigate('/dashboard/fmsg')}
                >
                  মেসেজে কথা বলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

