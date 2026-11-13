import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum, pct } from '@/utils/formatters';

export const FactoryOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { orders, yarns, qcLogs, prodLogs, selectedOrderId, deleteOrder, role } = useApp();
  const isVendor = role === 'vendor' || (role as string) === 'ven';

  const activeOrder =
    orders.find((o) => o.id === id) ||
    orders.find((o) => o.id === selectedOrderId) ||
    orders[0];

  if (!activeOrder) {
    return (
      <div className="card">
        <p>কোনো অর্ডার পাওয়া যায়নি।</p>
        <button className="btn sm" onClick={() => navigate('/dashboard/orders')}>
          ← অর্ডারের তালিকায় ফিরুন
        </button>
      </div>
    );
  }

  const o = activeOrder;
  const lineSumKg = (o.lines || []).reduce((acc, l) => acc + (l.orderKg || (l as any).qty || 0), 0);
  const totalKg = lineSumKg > 0 ? lineSumKg : Number(o.qty || 12000);
  const lineKnitKg = (o.lines || []).reduce((acc, l) => acc + (l.knitKg || (l as any).done || 0), 0);
  const knitKg = lineKnitKg > 0 ? lineKnitKg : Number(o.done || 7420);
  const progressPct = pct(knitKg, totalKg);
  const isDone = o.status === 'Completed' || (o.status as string) === 'done';
  const isWait = o.status === 'Pending' || (o.status as string) === 'wait';
  const isRun = !isDone && !isWait;
  const primaryLine = o.lines[0] || ({} as any);
  const assignedMachines = Array.isArray(o.machines) && o.machines.length > 0
    ? o.machines
    : Array.from(new Set((o.lines || []).map((l) => l.machine).filter(Boolean)));
  const ratePerKg = primaryLine.rate || o.rateTk || 14;
  const orderYarns = yarns.filter((y) => y.orderId === o.id);
  const orderQc = qcLogs.filter((q) => q.orderId === o.id);
  const orderLogs = prodLogs.filter((p) => p.orderId === o.id);
  const dynamicYarnIn = (o.yarnIn || []).reduce((acc: number, y: any) => acc + (y.kg || 0), 0);
  const totalYarnRcv =
    dynamicYarnIn > 0
      ? dynamicYarnIn
      : (o.lines || []).reduce((acc, l) => acc + (l.yarnRcv || 0), 0) ||
        orderYarns.reduce((acc, y) => acc + y.rcvKg, 0) ||
        12247;
  const lossPct = 2;
  const allowedKg = Math.round(totalYarnRcv * (1 - lossPct / 100));
  const yarnBalance = Math.max(0, totalYarnRcv - Math.round(knitKg / (1 - lossPct / 100)));

  return (
    <>
      <div className="head">
        <div>
          <button
            className="btn sm"
            onClick={() => {
              navigate(isVendor ? '/dashboard/vorders' : '/dashboard/orders');
              window.scrollTo(0, 0);
            }}
          >
            ← সব অর্ডার
          </button>
          <h2 style={{ marginTop: 8 }}>
            {o.id} · {primaryLine.fabric || o.style || 'Single Jersey'}
            {primaryLine.gsm ? ` ${primaryLine.gsm} GSM` : ''}
          </h2>
          <p>
            {o.party || o.buyer || 'ABC Knit Composite'} · শুরু {o.orderDate || '০১ মে ২০২৬'}
          </p>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button
            className="btn sm"
            onClick={() => {
              navigate('/dashboard/jobcard');
              window.scrollTo(0, 0);
            }}
          >
            জব কার্ড
          </button>
          <button
            className="btn sm"
            style={{ color: 'var(--err)', borderColor: 'var(--err)' }}
            onClick={() => {
              if (window.confirm(`আপনি কি এই অর্ডারটি (${o.id}) মুছে ফেলতে চান?`)) {
                deleteOrder(o.id);
                navigate('/dashboard/orders');
              }
            }}
          >
            অর্ডার মুছুন
          </button>
          {isDone ? (
            <span className="pill p-ok">ডেলিভারি সম্পন্ন</span>
          ) : isWait ? (
            <span className="pill p-yarn">সুতার অপেক্ষায়</span>
          ) : (
            <span className="pill p-acc">চলছে</span>
          )}
        </div>
      </div>

      {/* Facts card matching KnitKhata.html */}
      <div className="card">
        <div className="facts">
          <div>
            <span>ফেব্রিক</span>
            <b>{primaryLine.fabric || o.style || 'Single Jersey'}</b>
          </div>
          {o.buyer && (
            <div>
              <span>বায়ার</span>
              <b>{o.buyer}</b>
            </div>
          )}
          <div>
            <span>GSM</span>
            <b className="mono">{primaryLine.gsm || '160'}</b>
          </div>
          <div>
            <span>Stitch Length</span>
            <b className="mono">{primaryLine.stitch || '2.65 mm'}</b>
          </div>
          <div>
            <span>Dia × Gauge</span>
            <b className="mono">{primaryLine.dia || '30" × 24G'}</b>
          </div>
          <div>
            <span>রং</span>
            <b>{o.color || 'Grey (RFD)'}</b>
          </div>
          <div>
            <span>সুতা</span>
            <b>{primaryLine.yarn || '30/1 Combed Cotton'}</b>
          </div>
          <div>
            <span>নিটিং চার্জ</span>
            <b className="mono">৳{ratePerKg}/kg</b>
          </div>
          <div>
            <span>অর্ডারের তারিখ</span>
            <b className="mono">{o.orderDate || '০১ মে ২০২৬'}</b>
          </div>
          <div>
            <span>ডেলিভারির তারিখ</span>
            <b className="mono">{o.delivDate || '১৮ মে ২০২৬'}</b>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <b>অগ্রগতি</b>
            <span className="mono">
              {bnNum(knitKg.toLocaleString('en-IN'))} / {bnNum(totalKg.toLocaleString('en-IN'))} kg ·{' '}
              {bnNum(progressPct)}%
            </span>
          </div>
          <div className="bar big" style={{ marginTop: 6 }}>
            <i style={{ width: `${progressPct}%` }}></i>
          </div>
        </div>
      </div>

      {/* ETA Calculation card matching KnitKhata.html */}
      {isRun && (
        <div className="card">
          <h3>কবে শেষ হবে? (হিসাব)</h3>
          <div className="eta">
            <label className="f">
              মেশিন সংখ্যা
              <input type="number" min="1" defaultValue={assignedMachines.length || 4} />
            </label>
            <label className="f">
              প্রতি মেশিন/দিন (kg)
              <input type="number" min="1" defaultValue={350} />
            </label>
            <div className="out">
              <span className="small muted">বাকি</span>
              <b>{bnNum(Math.max(0, totalKg - knitKg).toLocaleString('en-IN'))} kg</b>
            </div>
            <div className="out">
              <span className="small muted">দৈনিক মোট</span>
              <b>{bnNum(((assignedMachines.length || 4) * 350).toLocaleString('en-IN'))} kg</b>
            </div>
            <div className="out">
              <span className="small muted">সম্ভাব্য শেষ</span>
              <b>{o.delivDate || '১৮ মে ২০২৬'}</b>
            </div>
          </div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            চলমান মেশিন:{' '}
            {assignedMachines.length ? (
              assignedMachines.map((m) => (
                <span key={m} className="pill p-acc" style={{ marginRight: 4 }}>
                  {m}
                </span>
              ))
            ) : (
              <span className="pill p-acc">M-01</span>
            )}{' '}
            — মেশিন বাড়ালে/কমালে তারিখ নিজে থেকেই বদলাবে।
          </p>
        </div>
      )}

      {/* Fabric item lines matching KnitKhata.html */}
      {o.lines && o.lines.length > 0 && (
        <div className="card">
          <h3>অংশ ও ফেব্রিক অনুযায়ী ভাগ</h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Placement</th>
                  <th>Fabrication</th>
                  <th>Color</th>
                  <th className="n">Qty (kg)</th>
                  <th>সুতা (Count · Brand · Lot)</th>
                  <th>GSM</th>
                  <th>M/C Dia × Gauge</th>
                  <th>মেশিন</th>
                </tr>
              </thead>
              <tbody>
                {o.lines.map((l, i) => (
                  <tr key={l.id || i}>
                    <td>
                      <span className="ln-no" style={{ width: 22, height: 22, fontSize: '0.75rem' }}>
                        {bnNum(i + 1)}
                      </span>
                    </td>
                    <td>
                      <b>{i === 0 ? 'Body' : i === 1 ? 'Collar' : 'Cuff'}</b>
                    </td>
                    <td>{l.fabric}</td>
                    <td>{o.color || 'Grey'}</td>
                    <td className="n">{bnNum((l.orderKg || 0).toLocaleString('en-IN'))}</td>
                    <td className="ycell">
                      {l.yarn || '30/1 Combed'} · {l.brand || 'Square'} ·{' '}
                      <span className="mono">{l.lot || 'LOT-SQ-412'}</span>
                    </td>
                    <td className="mono">{l.gsm || '—'}</td>
                    <td className="mono">{l.dia}</td>
                    <td className="mono small">{l.machine || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2-column Grid: Yarn Inward & QC */}
      <div className="grid g2">
        <div className="card">
          <h3>সুতা গ্রহণ (Yarn Receive)</h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>কাউন্ট</th>
                  <th>স্পিনার</th>
                  <th>লট</th>
                  <th className="n">ব্যাগ</th>
                  <th className="n">kg</th>
                </tr>
              </thead>
              <tbody>
                {(orderYarns.length > 0
                  ? orderYarns
                  : [
                      {
                        count: primaryLine.yarn || '30/1 Combed',
                        spinner: primaryLine.brand || 'Square Yarns',
                        lot: primaryLine.lot || 'SQ-88412',
                        bags: 120,
                        kg: 5443,
                      },
                      {
                        count: primaryLine.yarn || '30/1 Combed',
                        spinner: primaryLine.brand || 'Square Yarns',
                        lot: 'SQ-88419',
                        bags: 150,
                        kg: 6804,
                      },
                    ]
                ).map((y: any, i: number) => (
                  <tr key={i}>
                    <td>{y.count}</td>
                    <td>{y.spinner || y.brand || 'Square'}</td>
                    <td className="mono">{y.lot}</td>
                    <td className="n">{bnNum(y.bags || 120)}</td>
                    <td className="n">{bnNum((y.kg || y.rcvKg || 5443).toLocaleString('en-IN'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="facts" style={{ marginTop: 12 }}>
            <div>
              <span>মোট সুতা পাওয়া</span>
              <b className="mono">{bnNum(totalYarnRcv.toLocaleString('en-IN'))} kg</b>
            </div>
            <div>
              <span>প্রসেস লস ধরে ({lossPct}%)</span>
              <b className="mono">{bnNum(allowedKg.toLocaleString('en-IN'))} kg</b>
            </div>
            <div>
              <span>সুতা ব্যালেন্স</span>
              <b className="mono">{bnNum(yarnBalance.toLocaleString('en-IN'))} kg</b>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>QC ও কাপড়ের সমস্যা</h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>রোল</th>
                  <th>মেশিন</th>
                  <th>সমস্যা</th>
                  <th className="n">kg</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {(orderQc.length > 0
                  ? orderQc
                  : [
                      {
                        date: '০২ অক্টো',
                        roll: 'M-07/003',
                        machine: 'M-07',
                        defect: 'Lycra/hole — needle mark',
                        kg: 22,
                        status: 'bad',
                        res: 'বাতিল, রিনিট হবে',
                      },
                      {
                        date: '০১ অক্টো',
                        roll: 'M-04/005',
                        machine: 'M-04',
                        defect: 'Barre (লট মিক্স সন্দেহ)',
                        kg: 24,
                        status: 'warn',
                        res: 'ভেন্ডরকে জানানো হয়েছে',
                      },
                      {
                        date: '৩০ সেপ্টে',
                        roll: 'M-01/001 – 031',
                        machine: 'M-01',
                        defect: '—',
                        kg: 640,
                        status: 'ok',
                        res: 'QC পাস',
                      },
                    ]
                ).map((q: any, i: number) => (
                  <tr key={i}>
                    <td>{q.date || q.d}</td>
                    <td className="mono">{q.roll}</td>
                    <td className="mono">{q.machine || q.m}</td>
                    <td>{q.defect || q.issue || q.res}</td>
                    <td className="n">{bnNum(q.kg)}</td>
                    <td>
                      <span
                        className={`pill ${
                          q.status === 'bad' || q.s === 'bad'
                            ? 'p-warn'
                            : q.status === 'ok' || q.s === 'ok'
                            ? 'p-ok'
                            : 'p-yarn'
                        }`}
                      >
                        {q.status === 'ok' || q.s === 'ok'
                          ? 'পাস'
                          : q.status === 'bad' || q.s === 'bad'
                          ? 'বাতিল'
                          : 'তদন্তাধীন'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Production Log */}
      <div className="card">
        <h3>দৈনিক প্রোডাকশন লগ</h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>শিফট</th>
                <th>মেশিন</th>
                <th className="n">kg</th>
                <th className="n">রোল</th>
                <th>অপারেটর</th>
              </tr>
            </thead>
            <tbody>
              {(orderLogs.length > 0
                ? orderLogs
                : [
                    { date: '০৩ অক্টো', shift: 'A', machine: 'M-03', kg: 380, rolls: 16, operator: 'মোঃ রফিক' },
                    { date: '০৩ অক্টো', shift: 'A', machine: 'M-07', kg: 410, rolls: 18, operator: 'মোঃ করিম' },
                    { date: '০২ অক্টো', shift: 'B', machine: 'M-03', kg: 360, rolls: 15, operator: 'মোঃ আলম' },
                  ]
              ).map((p: any, i: number) => (
                <tr key={i}>
                  <td>{p.date || p.d}</td>
                  <td>{p.shift || p.sh}</td>
                  <td className="mono">{p.machine || p.m}</td>
                  <td className="n">{bnNum((p.kg || p.knitKg || 380).toLocaleString('en-IN'))}</td>
                  <td className="n">{bnNum(p.rolls || 16)}</td>
                  <td>{p.operator || p.op || 'মোঃ সোহেল'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor access */}
      <div className="card">
        <h3>ভেন্ডর অ্যাক্সেস</h3>
        <p className="small muted" style={{ marginTop: -4 }}>
          {o.party || 'ABC Knit Composite'}-এর যারা এই অর্ডার দেখতে পারেন
        </p>
        <div
          className="row"
          style={{ justifyContent: 'space-between', padding: '6px 0', alignItems: 'center' }}
        >
          <div>
            <b>মো. কামরুল হাসান</b> <span className="small muted">· Knitting Merchandiser</span>
          </div>
          <span className="pill p-ok">সক্রিয়</span>
        </div>
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          <button className="btn sm" onClick={() => navigate('/dashboard/users')}>
            পারমিশন বদলান
          </button>
          <button className="btn sm" onClick={() => navigate('/dashboard/wa')}>
            WhatsApp রিপোর্ট সেটিং
          </button>
        </div>
      </div>
    </>
  );
};

