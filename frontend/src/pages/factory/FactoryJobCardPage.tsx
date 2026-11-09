import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { QrCodeSvg } from '@/components/common/QrCodeSvg';

const FAULTS = [
  'Hole',
  'Needle Mark',
  'Needle Broken',
  'Oil Spot',
  'Ink Spot',
  'Star Mark',
  'Lycra Out',
  'Patta (Barre)',
  'Missing Yarn',
  'Shade Up',
  'Yarn Fault',
  'Sinker Mark',
];

interface GridState {
  cols: number;
  roll: string[];
  wt: (number | string)[];
  op: string[];
  f: Record<string, (number | string)[]>;
  rem: string;
}

export const FactoryJobCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, machines: allMachines, currentUser, openPrintModal } = useApp();

  // Active Orders with assigned machines
  const activeOrders = orders.filter((o) => o.status !== 'Completed');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    activeOrders[0]?.id || orders[0]?.id || ''
  );

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || activeOrders[0] || orders[0];

  if (!activeOrder) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>কোনো সক্রিয় অর্ডার পাওয়া যায়নি।</p>
        <button className="btn pri" onClick={() => navigate('/dashboard/neworder')}>
          + New Order Entry
        </button>
      </div>
    );
  }

  // Extract machines and assigned parts from activeOrder lines
  const machineList: { m: string; lineIdx: number; place: string; fab: string; dia: string; lot: string; qty: number }[] = [];
  activeOrder?.lines.forEach((l, idx) => {
    const rawMachines = (l.machine || 'M-01').split(',').map((m) => m.trim()).filter(Boolean);
    rawMachines.forEach((m) => {
      machineList.push({
        m,
        lineIdx: idx,
        place: (l as any).place || (idx === 0 ? 'Body' : idx === 1 ? 'Neck Rib' : 'Cuff'),
        fab: l.fabric || 'Single Jersey',
        dia: l.dia || '30" × 24G',
        lot: l.lot || 'SQ-88419',
        qty: l.orderKg || 4500,
      });
    });
  });

  const [activeMachineId, setActiveMachineId] = useState<string>(
    machineList[0]?.m || 'M-01'
  );

  const activeMachineItem =
    machineList.find((x) => x.m === activeMachineId) || machineList[0] || {
      m: 'M-01',
      lineIdx: 0,
      place: 'Body',
      fab: 'Single Jersey',
      dia: '30" × 24G',
      lot: 'SQ-88419',
      qty: 4500,
    };

  // Sticker switch toggle
  const [stickerOn, setStickerOn] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Grid Data Map
  const gridKey = `${activeOrder?.id}|${activeMachineItem.m}`;
  const [grids, setGrids] = useState<Record<string, GridState>>({
    [`${activeOrder?.id}|${activeMachineItem.m}`]: {
      cols: 8,
      roll: ['001', '002', '003', '004', '005', '006', '007', '008'],
      wt: [24.5, 25.1, 24.8, 25.4, 25.0, 24.9, 25.2, 25.0],
      op: ['জসিম', 'জসিম', 'জসিম', 'জসিম', 'সোহেল', 'সোহেল', 'সোহেল', 'সোহেল'],
      f: {
        Hole: [0, 2, 0, 0, 0, 0, 0, 0],
        'Needle Mark': [0, 0, 1, 0, 0, 0, 0, 0],
        'Oil Spot': [0, 0, 0, 0, 1, 0, 0, 0],
      },
      rem: 'রোল ২-এ হোল পাওয়া গিয়েছিল, সুতা চেক করে ঠিক করা হয়েছে।',
    },
  });

  const curGrid: GridState = grids[gridKey] || {
    cols: 8,
    roll: ['001', '002', '003', '004', '005', '006', '007', '008'],
    wt: [24.5, 25.0, 24.8, 25.2, 25.1, 24.9, 25.3, 25.0],
    op: ['জসিম', 'জসিম', 'জসিম', 'জসিম', 'সোহেল', 'সোহেল', 'সোহেল', 'সোহেল'],
    f: {},
    rem: '',
  };

  const updateGridField = (field: 'roll' | 'wt' | 'op', idx: number, val: string | number) => {
    setGrids((prev) => {
      const g = prev[gridKey] || { ...curGrid };
      const arr = [...(g[field] || [])];
      arr[idx] = val;
      return { ...prev, [gridKey]: { ...g, [field]: arr } };
    });
  };

  const updateFaultCount = (fault: string, idx: number, count: number | string) => {
    setGrids((prev) => {
      const g = prev[gridKey] || { ...curGrid };
      const fObj = { ...(g.f || {}) };
      const fArr = [...(fObj[fault] || Array(g.cols).fill(0))];
      fArr[idx] = count;
      fObj[fault] = fArr;
      return { ...prev, [gridKey]: { ...g, f: fObj } };
    });
  };

  const updateRemarks = (rem: string) => {
    setGrids((prev) => {
      const g = prev[gridKey] || { ...curGrid };
      return { ...prev, [gridKey]: { ...g, rem } };
    });
  };

  const addMoreRolls = () => {
    setGrids((prev) => {
      const g = prev[gridKey] || { ...curGrid };
      const newCols = g.cols + 4;
      const nextRoll = [...g.roll];
      for (let i = g.cols; i < newCols; i++) {
        nextRoll.push(String(i + 1).padStart(3, '0'));
      }
      return {
        ...prev,
        [gridKey]: { ...g, cols: newCols, roll: nextRoll },
      };
    });
  };

  // Calculations
  const inQty = Math.round(activeMachineItem.qty / Math.max(1, machineList.filter((m) => m.place === activeMachineItem.place).length));
  const outQty = curGrid.wt.reduce<number>((acc, w) => acc + (parseFloat(String(w)) || 0), 0);
  const totalRollsCount = curGrid.roll.filter((r, i) => r || curGrid.wt[i]).length;
  const wipQty = Math.max(0, inQty - Math.round(outQty));

  const totalFaultsForRoll = (idx: number) => {
    return FAULTS.reduce((acc, fName) => {
      const val = parseFloat(String(curGrid.f?.[fName]?.[idx] || 0)) || 0;
      return acc + val;
    }, 0);
  };

  const notOkRollsCount = Array.from({ length: curGrid.cols }, (_, i) => i).filter(
    (i) => totalFaultsForRoll(i) > 0
  ).length;

  const currentMachineIndex = machineList.findIndex((m) => m.m === activeMachineId) + 1;

  // Print Job Card
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. Head matching KnitKhata.html */}
      <div className="head">
        <div>
          <h2>জব কার্ড</h2>
          <p>
            মেশিন অ্যাসাইন হলেই প্রতিটা মেশিনের জব কার্ড তৈরি হয়। রোল নামলে নিচের QC ঘরে উঠে যায়,
            আর ভেন্ডরও সাথে সাথে দেখে কোন রোলে কী সমস্যা।
          </p>
        </div>

        <div className="st-sw">
          QR রোল স্টিকার (ঐচ্ছিক)
          <button
            type="button"
            className={`switch ${stickerOn ? 'on' : ''}`}
            onClick={() => setStickerOn(!stickerOn)}
            aria-pressed={stickerOn}
            aria-label="QR রোল স্টিকার চালু বা বন্ধ"
          />
          <span className="small muted">
            {stickerOn ? 'চালু' : 'বন্ধ, হাতে লিখে চলবে'}
          </span>
        </div>
      </div>

      {/* 2. Order Selector */}
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <label className="f" style={{ minWidth: 260 }}>
          <span>অর্ডার নির্বাচন</span>
          <select
            id="jcO"
            value={selectedOrderId}
            onChange={(e) => {
              setSelectedOrderId(e.target.value);
              setEditMode(false);
            }}
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {o.party || o.buyer || 'ABC Knit'} ({o.lines[0]?.fabric || 'Single Jersey'})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 3. Machine Chips */}
      <div className="chips" id="jcM">
        {machineList.map((m, idx) => {
          const isSelected = m.m === activeMachineId;
          const colorVar = `var(--l${(m.lineIdx % 5) + 1})`;

          return (
            <button
              key={`${m.m}-${idx}`}
              type="button"
              className={isSelected ? 'on' : ''}
              style={{ ['--c' as any]: colorVar }}
              onClick={() => {
                setActiveMachineId(m.m);
                setEditMode(false);
              }}
            >
              {m.m} · {m.place}
            </button>
          );
        })}
      </div>

      {/* 4. Digital Job Card Paper Box matching KnitKhata.html .jc */}
      <div className="jc">
        {/* Job Card Header */}
        <div className="jc-h">
          <div>
            <b>{currentUser?.organization_name || 'রহমান নিটিং ইন্ডাস্ট্রিজ'}</b>
            <span>কোনাবাড়ি, গাজীপুর</span>
            <em>জব কার্ড</em>
          </div>

          <div className="jc-r">
            <div className="row no-pdf jc-tools">
              <button
                type="button"
                className="btn sm"
                onClick={handlePrint}
              >
                🖨️ প্রিন্ট / PDF
              </button>
            </div>
            <div className="qr">
              <QrCodeSvg value={`${activeOrder?.id}-${activeMachineItem.m}`} size={78} />
            </div>
          </div>
        </div>

        {/* Technical Specification Grid .jc-g */}
        <div className="jc-g">
          <div>
            <span>SL / লট নং</span>
            <b className="mono">
              {bnNum(currentMachineIndex)} / ({bnNum(machineList.length)})
            </b>
          </div>
          <div>
            <span>ভেন্ডর</span>
            <b>{activeOrder?.party || activeOrder?.buyer || 'ABC Knit Composite'}</b>
          </div>

          <div>
            <span>অর্ডার নং</span>
            <b className="mono">{activeOrder?.id}</b>
          </div>
          <div>
            <span>অংশ</span>
            <b>
              {activeMachineItem.place} · {activeMachineItem.fab}
            </b>
          </div>

          <div>
            <span>বায়ার</span>
            <b>{activeOrder?.buyer || '—'}</b>
          </div>
          <div>
            <span>মেশিন</span>
            <b className="mono">
              {activeMachineItem.m} · {activeMachineItem.dia}
            </b>
          </div>

          <div>
            <span>তারিখ</span>
            <b className="mono">{activeOrder?.orderDate || '04 Oct 2026'}</b>
          </div>
          <div>
            <span>শিফট</span>
            <b>A</b>
          </div>

          <div>
            <span>অপারেটর</span>
            <b>{curGrid.op[0] || 'মো. জসিম'}</b>
          </div>
          <div>
            <span>সুতা লট</span>
            <b className="mono">{activeMachineItem.lot || 'SQ-88419'}</b>
          </div>

          <div>
            <span>ইন কোয়ান্টিটি</span>
            <b className="mono">{bnNum(inQty.toLocaleString('en-IN'))} kg</b>
          </div>
          <div>
            <span>আউট কোয়ান্টিটি</span>
            <b className="mono">
              {bnNum(Math.round(outQty).toLocaleString('en-IN'))} kg · {bnNum(totalRollsCount)} রোল
            </b>
          </div>

          <div>
            <span>সমস্যাযুক্ত রোল (Not OK)</span>
            <b className="mono" style={{ color: notOkRollsCount ? 'var(--bad)' : 'inherit' }}>
              {bnNum(notOkRollsCount)}
            </b>
          </div>
          <div>
            <span>বাকি (WIP)</span>
            <b className="mono">{bnNum(wipQty.toLocaleString('en-IN'))} kg</b>
          </div>
        </div>

        {/* Live QC Grid Header */}
        <div className="jc-qh">
          <b>রোল অনুযায়ী QC</b>
          <span className="row no-pdf">
            <button
              type="button"
              className="btn sm"
              id="jcEdit"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '💾 সেভ করুন' : '✏️ ফল্ট লিখুন'}
            </button>
          </span>
        </div>

        {/* Live QC Grid Table .tw */}
        <div className="tw">
          <table className="jc-t">
            <tbody>
              {/* Roll Numbers Row */}
              <tr className="jc-roll">
                <td>রোল নং</td>
                {Array.from({ length: curGrid.cols }, (_, i) => (
                  <td key={i} className="n mono">
                    {editMode ? (
                      <input
                        className="jc-in"
                        value={curGrid.roll[i] || ''}
                        onChange={(e) => updateGridField('roll', i, e.target.value)}
                      />
                    ) : (
                      curGrid.roll[i] || bnNum(String(i + 1).padStart(3, '0'))
                    )}
                  </td>
                ))}
              </tr>

              {/* Weights Row */}
              <tr>
                <td>ওজন (kg)</td>
                {Array.from({ length: curGrid.cols }, (_, i) => (
                  <td key={i} className="n mono">
                    {editMode ? (
                      <input
                        className="jc-in"
                        value={curGrid.wt[i] || ''}
                        onChange={(e) => updateGridField('wt', i, e.target.value)}
                      />
                    ) : (
                      curGrid.wt[i] ? bnNum(curGrid.wt[i]) : ''
                    )}
                  </td>
                ))}
              </tr>

              {/* Fault Rows */}
              {FAULTS.map((faultName) => {
                const hasAny = Array.from({ length: curGrid.cols }, (_, i) =>
                  parseFloat(String(curGrid.f?.[faultName]?.[i] || 0))
                ).some((v) => v > 0);

                if (!editMode && !hasAny) return null;

                return (
                  <tr key={faultName}>
                    <td>{faultName}</td>
                    {Array.from({ length: curGrid.cols }, (_, i) => {
                      const val = parseFloat(String(curGrid.f?.[faultName]?.[i] || 0)) || 0;

                      return (
                        <td
                          key={i}
                          className={`n ${val > 0 ? 'jc-bad' : ''}`}
                        >
                          {editMode ? (
                            <input
                              className="jc-in"
                              type="number"
                              min="0"
                              value={curGrid.f?.[faultName]?.[i] ?? ''}
                              onChange={(e) => updateFaultCount(faultName, i, e.target.value)}
                            />
                          ) : (
                            val > 0 ? bnNum(val) : ''
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Total Faults Row */}
              <tr className="jc-tot">
                <td>মোট ফল্ট</td>
                {Array.from({ length: curGrid.cols }, (_, i) => {
                  const t = totalFaultsForRoll(i);
                  const has = curGrid.roll[i] || curGrid.wt[i];

                  return (
                    <td key={i} className={`n ${t > 0 ? 'jc-bad' : ''}`}>
                      {has ? bnNum(t) : ''}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks Section */}
        <div className="jc-remb">
          <b>মন্তব্য</b>
          {editMode ? (
            <textarea
              className="jc-ta"
              value={curGrid.rem || ''}
              onChange={(e) => updateRemarks(e.target.value)}
              placeholder="যেমন: রোল ৭-এ নিডল লাইন ছিল, নিডল পরিবর্তন করা হয়েছে..."
            />
          ) : (
            <div className="jc-remt">
              {curGrid.rem || 'কোনো বিশেষ ত্রুটি বা নোট নেই।'}
            </div>
          )}
        </div>

        {/* Bottom Toolbar Row */}
        <div className="row no-pdf" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="small muted">
            প্রোডাকশন এন্ট্রিতে রোল লিখলে এখানে নিজে থেকে উঠে যায়। চাইলে কাগজের ব্যাচ কার্ডের মতো হাতেও লেখা যায়।
            "ফল্ট লিখুন" চাপলে ঘরগুলো এডিট করা যায়।
          </span>
          <button
            type="button"
            className="btn sm"
            id="jcMore"
            onClick={addMoreRolls}
          >
            + আরও ৪টি রোল যোগ করুন
          </button>
        </div>
      </div>

      {/* 5. Roll Stickers Grid Card (shown when stickerOn is true) */}
      {stickerOn && (
        <div className="card" id="jcStk" style={{ marginTop: 18 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h3 style={{ margin: 0 }}>এই মেশিনের রোল স্টিকার (Roll Tag Stickers)</h3>
              <p className="small muted" style={{ margin: '2px 0 0' }}>
                স্টিকার ব্যবহার ঐচ্ছিক। ফ্লোরের রোলে লাগানোর জন্য প্রিন্ট-রেডি ফরম্যাট।
              </p>
            </div>
            <button
              type="button"
              className="btn sm no-pdf"
              onClick={handlePrint}
            >
              🏷️ স্টিকার প্রিন্ট
            </button>
          </div>

          <div className="stk-grid">
            {curGrid.roll.slice(0, 4).map((rNo, i) => (
              <div key={i} className="stk">
                <div className="qr">
                  <QrCodeSvg value={`${activeOrder?.id}-${activeMachineItem.m}-${rNo}`} size={64} />
                </div>
                <div className="stk-t">
                  <b className="mono">R-{activeMachineItem.m.replace('M-', '')}-{rNo}</b>
                  <span>
                    {activeOrder?.id} · {activeOrder?.party || activeOrder?.buyer || 'ABC Knit'}
                  </span>
                  <span>
                    {activeMachineItem.place} · {activeMachineItem.fab}
                  </span>
                  <span>
                    {activeMachineItem.dia} · {activeMachineItem.m} · শিফট A
                  </span>
                  <span>
                    অপারেটর {curGrid.op[i] || 'জসিম'} · লট {activeMachineItem.lot}
                  </span>
                  <span className="stk-kg">
                    <b>{curGrid.wt[i] || 25.0} kg</b> · {activeOrder?.orderDate || '04 Oct'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
