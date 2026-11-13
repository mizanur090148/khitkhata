import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum, pct } from '@/utils/formatters';

export const FactoryOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, setSelectedOrderId, deleteOrder, clearAllOrders, fetchOrders } = useApp();

  useEffect(() => {
    fetchOrders?.();
  }, []);

  return (
    <>
      <div className="head">
        <div>
          <h2>অর্ডার</h2>
          <p>বিভিন্ন কম্পোজিট/ভেন্ডর থেকে আসা সব নিটিং কাজ এক জায়গায়</p>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          {orders.length > 0 && (
            <button
              className="btn sm"
              style={{ color: 'var(--err)', borderColor: 'var(--err)' }}
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে সব অর্ডার মুছে ফেলতে চান?')) {
                  clearAllOrders();
                }
              }}
            >
              সব অর্ডার মুছুন
            </button>
          )}
          <button className="btn" onClick={() => navigate('/dashboard/party')}>
            + নতুন পার্টি
          </button>
          <button className="btn pri" onClick={() => navigate('/dashboard/neworder')}>
            + New Order Entry
          </button>
        </div>
      </div>

      {/* Vendor summary KPIs matching KnitKhata.html */}
      <div className="kpis">
        {(() => {
          const vendorMap = new Map<string, { count: number; qty: number; done: number }>();
          orders.forEach((o) => {
            const vName = o.party || o.buyer || 'ABC Knit Composite';
            const lineQ = (o.lines || []).reduce((acc, l) => acc + (l.orderKg || (l as any).qty || 0), 0);
            const q = lineQ > 0 ? lineQ : Number(o.qty || 0);
            const lineD = (o.lines || []).reduce((acc, l) => acc + (l.knitKg || (l as any).done || 0), 0);
            const d = lineD > 0 ? lineD : Number(o.done || 0);
            const cur = vendorMap.get(vName) || { count: 0, qty: 0, done: 0 };
            vendorMap.set(vName, { count: cur.count + 1, qty: cur.qty + q, done: cur.done + d });
          });

          return Array.from(vendorMap.entries()).map(([vName, stats]) => (
            <div className="kpi" key={vName}>
              <span>{vName}</span>
              <b>
                {bnNum(stats.done.toLocaleString('en-IN'))} / {bnNum(stats.qty.toLocaleString('en-IN'))}
              </b>
              <i>kg · {bnNum(stats.count)}টি অর্ডার</i>
            </div>
          ));
        })()}
      </div>

      {/* Order List Table matching KnitKhata.html */}
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>অর্ডার নং</th>
              <th>ভেন্ডর</th>
              <th>ফেব্রিক</th>
              <th className="n">অর্ডার (kg)</th>
              <th className="n">হয়েছে (kg)</th>
              <th>অগ্রগতি</th>
              <th className="n">মেশিন</th>
              <th>সম্ভাব্য শেষ</th>
              <th>অবস্থা</th>
              <th style={{ width: 44, textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--muted)' }}>
                  কোনো অর্ডার নেই। নতুন অর্ডার যুক্ত করতে উপরের <b>+ New Order Entry</b> বাটনে ক্লিক করুন।
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const lineTotalKg = (o.lines || []).reduce((acc, l) => acc + (l.orderKg || (l as any).qty || 0), 0);
                const totalKg = lineTotalKg > 0 ? lineTotalKg : Number(o.qty || 0);
                const lineKnitKg = (o.lines || []).reduce((acc, l) => acc + (l.knitKg || (l as any).done || 0), 0);
                const knitKg = lineKnitKg > 0 ? lineKnitKg : Number(o.done || 0);
                const progressPct = pct(knitKg, totalKg);
                const machineList = Array.isArray(o.machines) && o.machines.length > 0
                  ? o.machines
                  : Array.from(new Set((o.lines || []).map((l) => l.machine).filter(Boolean)));
                const isDone = o.status === 'Completed' || (o.status as string) === 'done';
                const isWait = o.status === 'Pending' || (o.status as string) === 'wait';

                return (
                  <tr
                    key={o.id}
                    className="click"
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      navigate(`/dashboard/orders/${o.id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <td className="mono">{o.id}</td>
                    <td>{o.party || o.buyer || 'ABC Knit Composite'}</td>
                    <td>
                      {o.fabric || o.lines[0]?.fabric || o.style || 'Single Jersey'}
                      {o.gsm || o.lines[0]?.gsm ? ` ${o.gsm || o.lines[0]?.gsm} GSM` : ''}
                    </td>
                    <td className="n">{bnNum(totalKg.toLocaleString('en-IN'))}</td>
                    <td className="n">{bnNum(knitKg.toLocaleString('en-IN'))}</td>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'center', gap: 8 }}>
                        <div className="bar" style={{ width: 90 }}>
                          <i style={{ width: `${progressPct}%` }}></i>
                        </div>
                        <span className="mono small">{bnNum(progressPct)}%</span>
                      </div>
                    </td>
                    <td className="n">{machineList.length ? bnNum(machineList.length) : '—'}</td>
                    <td className="mono small">{isDone ? '—' : isWait ? 'সুতা এলে' : o.delivDate || '১৫ অক্টো'}</td>
                    <td>
                      {isDone ? (
                        <span className="pill p-ok">ডেলিভারি সম্পন্ন</span>
                      ) : isWait ? (
                        <span className="pill p-yarn">সুতার অপেক্ষায়</span>
                      ) : (
                        <span className="pill p-acc">চলছে</span>
                      )}
                    </td>
                    <td
                      style={{ textAlign: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`আপনি কি ${o.id} অর্ডারটি মুছে ফেলতে চান?`)) {
                          deleteOrder(o.id);
                        }
                      }}
                    >
                      <button
                        className="btn icon sm"
                        title="মুছুন"
                        style={{ color: 'var(--err)', padding: '2px 6px', fontSize: 13, minWidth: 26, height: 26, lineHeight: 1 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="small muted" style={{ marginTop: 8 }}>
        যেকোনো অর্ডারে ক্লিক করলে বিস্তারিত — সুতা, লট, মেশিন, দৈনিক প্রোডাকশন, QC — সব দেখা যাবে।
      </p>
    </>
  );
};

