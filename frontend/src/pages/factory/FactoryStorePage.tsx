import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { SearchableSelect } from '@/components/common/SearchableSelect';

interface StoreItemModel {
  id: string;
  name: string;
  cat: string;
  unit: string;
  stock: number;
  min: number;
  price: number;
  rfq?: boolean;
}

interface IssueLogModel {
  d: string;
  id: string;
  m: string;
  q: number;
  by: string;
}

export const FactoryStorePage: React.FC = () => {
  const {
    storeInventory,
    storeLogs,
    fetchStoreData,
    recordStoreMovement,
    machines,
    addToast,
  } = useApp();

  // State
  const [stCat, setStCat] = useState<string>('all');
  const [stForm, setStForm] = useState<{ t: 'in' | 'out'; id: string } | null>(null);
  const [stQ, setStQ] = useState<string>('');
  const [stP, setStP] = useState<string>('');
  const [stS, setStS] = useState<string>('');
  const [stM, setStM] = useState<string>('M-01');
  const [stB, setStB] = useState<string>('শফিকুল');
  const [rfqSet, setRfqSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Normalize store items from API/context or initial sample
  const items: StoreItemModel[] = useMemo(() => {
    if (storeInventory && storeInventory.length) {
      return storeInventory.map((x: any) => ({
        id: x.id || x.item_code,
        name: x.name,
        cat: x.cat || x.category || 'নিডল ও সিংকার',
        unit: x.unit || 'পিস',
        stock: Number(x.stock !== undefined ? x.stock : x.stock_qty || 0),
        min: Number(x.min !== undefined ? x.min : x.min_qty || 0),
        price: Number(x.price !== undefined ? x.price : x.unit_price || 0),
        rfq: Boolean(x.rfq || x.rfq_sent || rfqSet.has(x.id || x.item_code)),
      }));
    }
    return [
      { id: 'n1', name: 'নিডল Groz-Beckert VO 74.41 G02', cat: 'নিডল ও সিংকার', unit: 'পিস', stock: 340, min: 500, price: 42 },
      { id: 'n2', name: 'নিডল Groz-Beckert VO 71.52 G01 (রিব)', cat: 'নিডল ও সিংকার', unit: 'পিস', stock: 820, min: 400, price: 45 },
      { id: 's1', name: 'সিংকার (Pailung 24G)', cat: 'নিডল ও সিংকার', unit: 'পিস', stock: 150, min: 200, price: 18 },
      { id: 'o1', name: 'নিটিং অয়েল (২০ লিটার)', cat: 'নিটিং অয়েল', unit: 'ক্যান', stock: 6, min: 4, price: 3600 },
      { id: 'p1', name: 'ইয়ার্ন ফিডার', cat: 'স্পেয়ার পার্টস', unit: 'পিস', stock: 12, min: 10, price: 950 },
      { id: 'p2', name: 'পজিটিভ ফিড বেল্ট', cat: 'স্পেয়ার পার্টস', unit: 'পিস', stock: 3, min: 5, price: 1400 },
      { id: 'p3', name: 'ক্যাম বক্স স্প্রিং', cat: 'স্পেয়ার পার্টস', unit: 'সেট', stock: 9, min: 4, price: 600 },
      { id: 'e1', name: 'ইনভার্টার রিলে', cat: 'ইলেকট্রিক গুডস', unit: 'পিস', stock: 2, min: 2, price: 2200 },
    ];
  }, [storeInventory, rfqSet]);

  // Normalize issue logs
  const logs: IssueLogModel[] = useMemo(() => {
    if (storeLogs && storeLogs.length) {
      return storeLogs.map((l: any) => ({
        d: l.d || l.date_label || '03 Oct',
        id: l.id || l.item_code || 'n1',
        m: l.m || l.machine_code || 'M-07',
        q: Number(l.q || l.qty || 1),
        by: l.by || l.issued_by || 'শফিকুল',
      }));
    }
    return [
      { d: '03 Oct', id: 'n1', m: 'M-07', q: 60, by: 'শফিকুল' },
      { d: '02 Oct', id: 'n1', m: 'M-03', q: 40, by: 'শফিকুল' },
      { d: '02 Oct', id: 'o1', m: 'সব মেশিন', q: 1, by: 'মো. হানিফ' },
      { d: '01 Oct', id: 'n2', m: 'M-12', q: 30, by: 'শফিকুল' },
      { d: '30 Sep', id: 'p2', m: 'M-10', q: 1, by: 'মো. হানিফ' },
    ];
  }, [storeLogs]);

  // Categories
  const categories = useMemo(() => {
    return Array.from(new Set(items.map((x) => x.cat)));
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (stCat === 'all') return items;
    return items.filter((x) => x.cat === stCat);
  }, [items, stCat]);

  // KPIs
  const lowStockItems = useMemo(() => items.filter((x) => x.stock < x.min), [items]);
  const totalStockVal = useMemo(() => items.reduce((a, x) => a + x.stock * x.price, 0), [items]);

  // Needles issued per machine
  const needlesPerMachine = useMemo(() => {
    const map: Record<string, number> = {};
    logs
      .filter((l) => {
        const item = items.find((x) => x.id === l.id);
        return item && item.cat === 'নিডল ও সিংকার';
      })
      .forEach((l) => {
        map[l.m] = (map[l.m] || 0) + l.q;
      });
    return map;
  }, [logs, items]);

  const totalNeedlesWeek = useMemo(() => {
    return Object.values(needlesPerMachine).reduce((a, b) => a + b, 0);
  }, [needlesPerMachine]);

  const maxNeedlesPerMachine = useMemo(() => {
    const vals = Object.values(needlesPerMachine);
    return vals.length ? Math.max(...vals) : 1;
  }, [needlesPerMachine]);

  // Machine list options
  const machineList = useMemo(() => {
    if (machines && machines.length) {
      return machines.map((m) => m.id);
    }
    return Array.from({ length: 24 }, (_, i) => `M-${String(i + 1).padStart(2, '0')}`);
  }, [machines]);

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stForm) return;

    const q = parseInt(stQ.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))), 10);
    if (isNaN(q) || q <= 0) {
      addToast({ type: 'error', message: 'সঠিক পরিমাণ লিখুন' });
      return;
    }

    const item = items.find((x) => x.id === stForm.id);
    if (!item) return;

    if (stForm.t === 'out') {
      if (q > item.stock) {
        addToast({ type: 'error', message: `স্টকে আছে মাত্র ${item.stock} ${item.unit}` });
        return;
      }
      try {
        await recordStoreMovement({
          item_code: item.id,
          type: 'out',
          qty: q,
          machine_code: stM,
          issued_by: stB.trim() || 'শফিকুল',
        });
        setStForm(null);
        setStQ('');
      } catch {
        // Handled
      }
    } else {
      const p = parseFloat(stP);
      try {
        await recordStoreMovement({
          item_code: item.id,
          type: 'in',
          qty: q,
          price: isNaN(p) ? undefined : p,
        });
        setStForm(null);
        setStQ('');
        setStP('');
        setStS('');
      } catch {
        // Handled
      }
    }
  };

  // RFQ Request
  const handleRfq = async (id: string) => {
    setRfqSet((prev) => new Set([...prev, id]));
    try {
      await recordStoreMovement({
        item_code: id,
        type: 'rfq',
      });
      addToast({
        type: 'success',
        message: 'কোটেশন অনুরোধ ৩ জন অনুমোদিত সাপ্লায়ারের কাছে গেছে · উত্তর মেসেজে আসবে',
      });
    } catch {
      // Handled
    }
  };

  const activeFormItem = stForm ? items.find((x) => x.id === stForm.id) : null;

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <div className="head">
        <div>
          <h2>স্টোর ও স্পেয়ার পার্টস</h2>
          <p>
            নিডল, সিংকার, অয়েল আর পার্টসের স্টক। কোন মেশিনে কী গেল তার হিসাব। স্টক কমলে এক চাপে সাপ্লায়ারদের কাছে
            কোটেশন চান।
          </p>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpis">
        <div className="kpi">
          <span>মোট আইটেম</span>
          <b>{items.length}</b>
        </div>
        <div className="kpi" style={{ borderColor: lowStockItems.length ? 'var(--bad)' : 'inherit' }}>
          <span>স্টক কম</span>
          <b style={{ color: lowStockItems.length ? 'var(--bad)' : 'inherit' }}>{lowStockItems.length}</b>
        </div>
        <div className="kpi">
          <span>স্টকের দাম</span>
          <b>৳ {bnNum(totalStockVal)}</b>
        </div>
        <div className="kpi">
          <span>এ সপ্তাহে নিডল গেছে</span>
          <b>{bnNum(totalNeedlesWeek)} পিস</b>
        </div>
      </div>

      {/* Issue / Restock Inline Form */}
      {stForm && activeFormItem && (
        <form className="card" id="stf" onSubmit={handleFormSubmit} noValidate style={{ margin: '14px 0' }}>
          <h3>
            {stForm.t === 'in' ? 'স্টকে যোগ' : 'মেশিনে দিন'} · {activeFormItem.name}
          </h3>
          <div className="no-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <label className="no-f">
              <span>পরিমাণ ({activeFormItem.unit})</span>
              <input
                id="stQ"
                inputMode="numeric"
                value={stQ}
                onChange={(e) => setStQ(e.target.value)}
                placeholder={`যেমন: ${stForm.t === 'out' ? '20' : '100'}`}
              />
            </label>

            {stForm.t === 'in' ? (
              <>
                <label className="no-f">
                  <span>দাম (প্রতি একক, ৳)</span>
                  <input
                    id="stP"
                    inputMode="decimal"
                    value={stP}
                    onChange={(e) => setStP(e.target.value)}
                    placeholder={String(activeFormItem.price)}
                  />
                </label>
                <label className="no-f">
                  <span>সাপ্লায়ার</span>
                  <input
                    id="stS"
                    placeholder="যেমন: নিডল ও স্পেয়ার সাপ্লায়ার"
                    value={stS}
                    onChange={(e) => setStS(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="no-f">
                  <span>মেশিন</span>
                  <SearchableSelect
                    value={stM}
                    onChange={(val) => setStM(val)}
                    options={[
                      ...machineList.map((m) => ({ value: m, label: m })),
                      { value: 'সব মেশিন', label: 'সব মেশিন' },
                    ]}
                    searchPlaceholder="মেশিন খুঁজুন..."
                  />
                </label>
                <label className="no-f">
                  <span>কে নিল</span>
                  <input value={stB} onChange={(e) => setStB(e.target.value)} />
                </label>
              </>
            )}
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn pri" type="submit">
              সেভ করুন
            </button>
            <button className="btn" type="button" onClick={() => setStForm(null)}>
              বাতিল
            </button>
          </div>
        </form>
      )}

      {/* Category Chips */}
      <div className="chips" style={{ margin: '14px 0 10px' }}>
        <button
          className={stCat === 'all' ? 'on' : ''}
          onClick={() => setStCat('all')}
        >
          সব
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={stCat === c ? 'on' : ''}
            onClick={() => setStCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>আইটেম</th>
              <th>ধরন</th>
              <th className="n">স্টক</th>
              <th className="n">ন্যূনতম</th>
              <th className="n">দাম</th>
              <th>অবস্থা</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((x) => {
              const isLow = x.stock < x.min;
              const hasRfq = x.rfq || rfqSet.has(x.id);

              return (
                <tr key={x.id}>
                  <td>
                    <b>{x.name}</b>
                  </td>
                  <td className="small">{x.cat}</td>
                  <td className="n" style={{ color: isLow ? 'var(--bad)' : 'inherit' }}>
                    <b>{bnNum(x.stock)}</b> {x.unit}
                  </td>
                  <td className="n">{bnNum(x.min)}</td>
                  <td className="n">৳{bnNum(x.price)}</td>
                  <td>
                    {isLow ? (
                      <span className="pill p-bad">কম</span>
                    ) : (
                      <span className="pill p-ok">ঠিক আছে</span>
                    )}
                  </td>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap', gap: 6 }}>
                      <button
                        className="btn sm"
                        onClick={() => {
                          setStForm({ t: 'out', id: x.id });
                          setStQ('');
                        }}
                      >
                        মেশিনে দিন
                      </button>
                      <button
                        className="btn sm"
                        onClick={() => {
                          setStForm({ t: 'in', id: x.id });
                          setStQ('');
                          setStP(String(x.price));
                        }}
                      >
                        স্টকে যোগ
                      </button>
                      {isLow &&
                        (hasRfq ? (
                          <span className="pill p-acc">কোটেশন চাওয়া হয়েছে</span>
                        ) : (
                          <button
                            className="btn sm pri"
                            onClick={() => handleRfq(x.id)}
                          >
                            কোটেশন চান
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid: Recent Issue Logs & Needles per Machine */}
      <div className="grid g2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>সাম্প্রতিক খরচ</h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>আইটেম</th>
                  <th>মেশিন</th>
                  <th className="n">পরিমাণ</th>
                  <th>নিয়েছে</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 8).map((l, idx) => {
                  const item = items.find((s) => s.id === l.id);
                  return (
                    <tr key={`${l.id}-${l.m}-${idx}`}>
                      <td>{l.d}</td>
                      <td className="small">{item?.name || l.id}</td>
                      <td className="mono">{l.m}</td>
                      <td className="n">
                        {l.q} {item?.unit || 'পিস'}
                      </td>
                      <td>{l.by}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>মেশিন অনুযায়ী নিডল খরচ</h3>
          {Object.entries(needlesPerMachine)
            .sort((a, b) => b[1] - a[1])
            .map(([m, q]) => (
              <div
                key={m}
                className="row"
                style={{ flexWrap: 'nowrap', margin: '6px 0', alignItems: 'center' }}
              >
                <span className="mono" style={{ width: 56 }}>
                  {m}
                </span>
                <div className="bar" style={{ flex: 1, minWidth: 80 }}>
                  <i style={{ width: `${(q / maxNeedlesPerMachine) * 100}%` }} />
                </div>
                <span className="mono small" style={{ width: 70, textAlign: 'right' }}>
                  {q} পিস
                </span>
              </div>
            ))}
          <p className="small muted" style={{ marginTop: 12 }}>
            কোনো মেশিনে বেশি নিডল ভাঙলে মেশিনটা মেকানিক দিয়ে দেখানো ভালো।
          </p>
        </div>
      </div>
    </div>
  );
};

export default FactoryStorePage;

