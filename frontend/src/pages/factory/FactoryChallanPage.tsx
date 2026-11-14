import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { SearchableSelect } from '@/components/common/SearchableSelect';

export const FactoryChallanPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    role,
    orders,
    parties,
    rolls,
    deliveryChallans,
    fetchChallans,
    fetchRolls,
    fetchOrders,
    createDeliveryChallan,
    signChallan,
    addToast,
    openPrintModal,
  } = useApp();

  const isVendor = role === 'vendor' || (role as string) === 'ven';

  // State
  const [chOpen, setChOpen] = useState<string | null>(null);
  const [chNew, setChNew] = useState<boolean>(false);
  const [chV, setChV] = useState<string>('');
  const [chO, setChO] = useState<string>('');
  const [chVeh, setChVeh] = useState<string>('');
  const [chDrv, setChDrv] = useState<string>('');
  const [chScan, setChScan] = useState<string>('');
  const [chSel, setChSel] = useState<Set<string>>(new Set());
  const [vendorGotCount, setVendorGotCount] = useState<string>('');

  // Initial load
  useEffect(() => {
    fetchChallans();
    fetchRolls();
    fetchOrders();
  }, []);

  // Vendor party helper
  const vName = (code: string) => {
    const p = parties.find((x) => x.code === code || String(x.id) === String(code));
    if (p) return p.name;
    const ord = orders.find((o) => (o as any).party_code === code || (o as any).v === code);
    return ord?.party || code;
  };

  // Vendor codes
  const vendorCodes = useMemo(() => {
    const activeOrders = orders.filter((o) => (o.status as string) !== 'done' && o.status !== 'Completed');
    const codes = Array.from(
      new Set(
        activeOrders
          .map((o) => (o as any).party_code || (o as any).v || o.party)
          .filter(Boolean)
      )
    );
    return codes.length ? codes : ['abc', 'xyz', 'nobo'];
  }, [orders]);

  // Set default vendor and order
  useEffect(() => {
    if (!chV && vendorCodes.length) {
      setChV(vendorCodes[0]);
    }
  }, [vendorCodes, chV]);

  const vendorOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        ((o as any).party_code === chV || (o as any).v === chV || o.party === chV) &&
        rolls.some((r) => (r.orderId || (r as any).o) === o.id)
    );
  }, [orders, chV, rolls]);

  useEffect(() => {
    if (vendorOrders.length && (!chO || !vendorOrders.some((o) => o.id === chO))) {
      setChO(vendorOrders[0].id);
      setChSel(new Set());
    } else if (!vendorOrders.length) {
      setChO('');
      setChSel(new Set());
    }
  }, [vendorOrders, chO]);

  // Available rolls for selected order (not already in a challan)
  const availableRolls = useMemo(() => {
    if (!chO) return [];
    return rolls.filter((r) => {
      const orderNo = r.orderId || (r as any).o;
      const isChallan = (r as any).ch || (r as any).challan_no;
      return orderNo === chO && !isChallan;
    });
  }, [rolls, chO]);

  // Disputed rolls check
  const isDisputedRoll = (rollNo: string) => {
    return orders.some((o) => {
      const qcList = (o as any).qc || [];
      return qcList.some(
        (q: any) =>
          q.roll === rollNo &&
          q.fac?.v &&
          q.ven?.v &&
          q.fac.v !== q.ven.v
      );
    });
  };

  // Calculate sum weight of selected rolls
  const selectedKg = useMemo(() => {
    return availableRolls
      .filter((r) => chSel.has(r.rollId || (r as any).no))
      .reduce((sum, r) => sum + (Number(r.kg) || Number((r as any).weight_kg) || 0), 0);
  }, [availableRolls, chSel]);

  // Filter challans for vendor vs factory
  const listChallans = useMemo(() => {
    if (isVendor) {
      return deliveryChallans.filter(
        (c) => c.v === 'abc' || c.party_code === 'abc' || c.party === 'abc' || (c.party && c.party.includes('ABC'))
      );
    }
    return deliveryChallans;
  }, [deliveryChallans, isVendor]);

  // Status helper
  const chState = (c: any) => {
    if (!c.ven) {
      return { s: 'warn', t: 'পথে · ভেন্ডরের সাইন বাকি' };
    }
    const rollsCount = Array.isArray(c.rolls) ? c.rolls.length : 0;
    const got = c.ven.got !== undefined ? c.ven.got : rollsCount;
    if (got < rollsCount) {
      return { s: 'bad', t: `গরমিল · ${rollsCount - got}টা রোল কম` };
    }
    return { s: 'ok', t: 'ভেন্ডর বুঝে পেয়েছে' };
  };

  // Total kg of a challan
  const challanKg = (c: any) => {
    const rollNos = Array.isArray(c.rolls) ? c.rolls : [];
    const matched = rolls.filter((r) => rollNos.includes(r.rollId || (r as any).no));
    if (matched.length) {
      return matched.reduce((a, r) => a + (Number(r.kg) || Number((r as any).weight_kg) || 0), 0);
    }
    return rollNos.length * 23.5;
  };

  // Scan roll barcode handler
  const handleScanRoll = () => {
    let v = chScan.trim().toUpperCase();
    const mm = v.match(/^([MF])\s*-?\s*0*(\d{1,2})\s*[\/ -]?\s*0*(\d{1,3})$/);
    if (mm) {
      v = `${mm[1]}-${mm[2].padStart(2, '0')}/${mm[3].padStart(3, '0')}`;
    }
    const r = availableRolls.find((x) => (x.rollId || (x as any).no) === v);
    if (!r) {
      addToast({ type: 'error', message: `${v || 'রোল'} এই অর্ডারে পাঠানোর তালিকায় নেই` });
      return;
    }
    if (isDisputedRoll(v)) {
      addToast({ type: 'error', message: `${v}-এ QC দ্বিমত, পাঠানো যাবে না` });
      return;
    }
    setChSel((prev) => new Set([...prev, v]));
    setChScan('');
    addToast({ type: 'success', message: `${v} যোগ হয়েছে` });
  };

  // Submit new challan
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chSel.size) {
      addToast({ type: 'error', message: 'অন্তত একটা রোল বাছুন' });
      return;
    }
    if (!chVeh.trim()) {
      addToast({ type: 'error', message: 'গাড়ির নম্বর লিখুন' });
      return;
    }

    try {
      const res = await createDeliveryChallan({
        party_code: chV,
        order_no: chO,
        rolls: Array.from(chSel),
        vehicle_no: chVeh.trim(),
        driver_name: chDrv.trim() || '—',
        signed_by: 'শফিকুল ইসলাম',
      });
      setChNew(false);
      setChSel(new Set());
      setChVeh('');
      setChDrv('');
      if (res?.challan_no) {
        setChOpen(res.challan_no);
      }
    } catch {
      // Handled
    }
  };

  // Vendor sign challan receipt
  const handleVendorSign = async (challanNo: string, maxRolls: number) => {
    const got = parseInt(vendorGotCount.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))), 10);
    const validGot = isNaN(got) ? maxRolls : Math.min(maxRolls, got);

    try {
      await signChallan(challanNo, validGot, 'মো. কামরুল হাসান');
      setVendorGotCount('');
    } catch {
      // Handled
    }
  };

  // Currently open challan detail view
  const currentChallan = useMemo(() => {
    if (!chOpen) return null;
    return deliveryChallans.find((c) => c.no === chOpen || c.challan_no === chOpen);
  }, [chOpen, deliveryChallans]);

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {isVendor && (
        <div className="vbanner">
          ফ্যাক্টরি যে কাপড় পাঠায়, তার চালান এখানে আসে। মাল নামানোর সময় গুনে সাইন দিন।
        </div>
      )}

      {/* ================= VIEW 1: SINGLE CHALLAN DETAIL (A4 PAD STYLE) ================= */}
      {currentChallan ? (
        (() => {
          const c = currentChallan;
          const st = chState(c);
          const rollNos = Array.isArray(c.rolls) ? c.rolls : [];
          const matchedRolls = rolls.filter((r) => rollNos.includes(r.rollId || (r as any).no));
          const totalKg = matchedRolls.length
            ? matchedRolls.reduce((a, r) => a + (Number(r.kg) || Number((r as any).weight_kg) || 0), 0)
            : challanKg(c);
          const order = orders.find((o) => o.id === (c.o || c.order_no));

          return (
            <>
              <div className="head">
                <div>
                  <button className="btn sm" id="chBack" onClick={() => setChOpen(null)}>
                    ← সব চালান
                  </button>
                  <h2 style={{ marginTop: 8 }}>ডেলিভারি চালান {c.no || c.challan_no}</h2>
                  <p>
                    {vName(c.v || c.party_code)} · {c.o || c.order_no} · {c.d || '03 Oct'}
                  </p>
                </div>
                <div className="row">
                  <span className={`pill p-${st.s}`} style={{ fontSize: '.9rem' }}>
                    {st.t}
                  </span>
                  <button
                    className="btn no-pdf prn-btn"
                    type="button"
                    onClick={() =>
                      openPrintModal(
                        'challan',
                        `ডেলিভারি চালান ${c.no || c.challan_no}`,
                        { challan: c, rolls: matchedRolls, order }
                      )
                    }
                  >
                    প্রিন্ট
                  </button>
                  <button
                    className="btn no-pdf"
                    type="button"
                    onClick={() => {
                      addToast({ type: 'info', message: 'PDF প্রস্তুত করা হচ্ছে...' });
                      window.print();
                    }}
                  >
                    PDF সেভ
                  </button>
                </div>
              </div>

              {/* The Delivery Challan Pad */}
              <div className="dc">
                <div className="dc-h">
                  <div>
                    <b>রহমান নিটিং ইন্ডাস্ট্রিজ</b>
                    <span>কোনাবাড়ি, গাজীপুর</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <em>ডেলিভারি চালান</em>
                    <b className="mono">{c.no || c.challan_no}</b>
                    <span>{c.d || '03 Oct'} 2026</span>
                  </div>
                </div>

                <div className="jc-g">
                  <div>
                    <span>প্রাপক</span>
                    <b>{vName(c.v || c.party_code)}</b>
                  </div>
                  <div>
                    <span>অর্ডার / বায়ার</span>
                    <b>
                      {c.o || c.order_no} · {order?.buyer || '—'}
                    </b>
                  </div>
                  <div>
                    <span>গাড়ি</span>
                    <b>{c.veh || c.vehicle_no}</b>
                  </div>
                  <div>
                    <span>ড্রাইভার</span>
                    <b>
                      {c.drv || c.driver_name} · {c.ph || c.driver_phone || '—'}
                    </b>
                  </div>
                </div>

                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>রোল</th>
                        <th>অংশ</th>
                        <th>মেশিন</th>
                        <th>সুতা লট</th>
                        <th className="n">ফল্ট</th>
                        <th className="n">kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedRolls.length ? (
                        matchedRolls.map((r, i) => {
                          const rNo = r.rollId || (r as any).no;
                          const rM = r.machine || (r as any).m || 'M-01';
                          const rLot = r.lot || (r as any).yarn_lot || '—';
                          const rKg = Number(r.kg) || Number((r as any).weight_kg) || 23.5;
                          const faults = (r as any).f || (r as any).faults_json || {};
                          const faultCount = Object.values(faults).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                          const lines = (order as any)?.lines || [];
                          const line = lines[r.lineIdx || (r as any).pl || 0];

                          return (
                            <tr key={rNo}>
                              <td>{i + 1}</td>
                              <td className="mono">{rNo}</td>
                              <td>{line?.place || line?.placement || 'Body'}</td>
                              <td className="mono">{rM}</td>
                              <td className="mono small">{rLot}</td>
                              <td className="n">{faultCount ? String(faultCount) : '—'}</td>
                              <td className="n">{rKg.toFixed(1)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        rollNos.map((rNo: string, i: number) => (
                          <tr key={rNo}>
                            <td>{i + 1}</td>
                            <td className="mono">{rNo}</td>
                            <td>Body</td>
                            <td className="mono">M-03</td>
                            <td className="mono small">SQ-88419</td>
                            <td className="n">—</td>
                            <td className="n">23.5</td>
                          </tr>
                        ))
                      )}
                      <tr>
                        <td colSpan={6}>
                          <b>মোট {rollNos.length} রোল</b>
                        </td>
                        <td className="n">
                          <b>{totalKg.toFixed(1)}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="dc-sig">
                  <div className="dc-s ok">
                    <span>পাঠিয়েছে · ফ্যাক্টরি</span>
                    <b>✍ {c.fac?.by || 'শফিকুল ইসলাম'}</b>
                    <small>{c.fac?.at || '03 Oct, 10:10'}</small>
                  </div>
                  <div
                    className={`dc-s ${
                      c.ven ? (c.ven.got < rollNos.length ? 'bad' : 'ok') : ''
                    }`}
                  >
                    <span>বুঝে নিয়েছে · ভেন্ডর</span>
                    {c.ven ? (
                      <>
                        <b>✍ {c.ven.by}</b>
                        <small>
                          {c.ven.at} · পেয়েছে {c.ven.got} / {rollNos.length} রোল
                        </small>
                      </>
                    ) : isVendor ? (
                      <>
                        <label className="no-f" style={{ marginTop: 4 }}>
                          <span style={{ fontSize: '.78rem' }}>কয়টা রোল পেলেন</span>
                          <input
                            id="chGot"
                            inputMode="numeric"
                            value={vendorGotCount || String(rollNos.length)}
                            onChange={(e) => setVendorGotCount(e.target.value)}
                            style={{ padding: '4px 8px', width: 90 }}
                          />
                        </label>
                        <button
                          className="btn pri sm"
                          id="chRecv"
                          style={{ marginTop: 6 }}
                          onClick={() => handleVendorSign(c.no || c.challan_no, rollNos.length)}
                        >
                          গুনে বুঝে পেয়েছি, সাইন দিন
                        </button>
                      </>
                    ) : (
                      <>
                        <b className="muted">এখনো সাইন দেয়নি</b>
                        <small>মাল নামানোর সময় ভেন্ডর অ্যাপ থেকে সাইন দেবে</small>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })()
      ) : (
        /* ================= VIEW 2: CHALLAN LIST & NEW CHALLAN FORM ================= */
        <>
          <div className="head">
            <div>
              <h2>ডেলিভারি চালান</h2>
              <p>
                {isVendor
                  ? 'ফ্যাক্টরি যে কাপড় পাঠায়, তার চালান এখানে আসে। মাল নামানোর সময় গুনে সাইন দিন।'
                  : 'রোল বেছে বা স্ক্যান করে চালান বানান। ভেন্ডর মাল বুঝে পেয়ে সাইন দিলে চালান বন্ধ হয়।'}
              </p>
            </div>
            {!isVendor && (
              <button
                className="btn pri"
                id="chNewB"
                onClick={() => {
                  setChNew(!chNew);
                  setChSel(new Set());
                }}
              >
                {chNew ? '✕ বন্ধ করুন' : '+ নতুন চালান'}
              </button>
            )}
          </div>

          {/* New Challan Creation Form */}
          {chNew && !isVendor && (
            <form className="card" id="chf" onSubmit={handleCreateChallan} noValidate>
              <h3>নতুন চালান</h3>
              <div className="no-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                <label className="no-f">
                  <span>ভেন্ডর</span>
                  <SearchableSelect
                    id="chV"
                    value={chV}
                    onChange={(val) => {
                      setChV(val);
                      setChSel(new Set());
                    }}
                    options={vendorCodes.map((k) => ({
                      value: k,
                      label: vName(k),
                    }))}
                    searchPlaceholder="ভেন্ডর খুঁজুন..."
                  />
                </label>

                <label className="no-f">
                  <span>অর্ডার</span>
                  <SearchableSelect
                    id="chO"
                    value={chO}
                    onChange={(val) => {
                      setChO(val);
                      setChSel(new Set());
                    }}
                    options={
                      vendorOrders.length
                        ? vendorOrders.map((o) => ({
                            value: o.id,
                            label: o.id,
                          }))
                        : [{ value: '', label: 'রোল নেই' }]
                    }
                    searchPlaceholder="অর্ডার খুঁজুন..."
                  />
                </label>

                <label className="no-f">
                  <span>গাড়ির নম্বর</span>
                  <input
                    id="chVeh"
                    placeholder="যেমন: ঢাকা মেট্রো ন ১৪-২২৫৬"
                    value={chVeh}
                    onChange={(e) => setChVeh(e.target.value)}
                  />
                </label>

                <label className="no-f">
                  <span>ড্রাইভার</span>
                  <input
                    id="chDrv"
                    placeholder="নাম"
                    value={chDrv}
                    onChange={(e) => setChDrv(e.target.value)}
                  />
                </label>
              </div>

              {/* Barcode scanner / roll manual entry input */}
              <div className="row" style={{ margin: '14px 0', gap: 8 }}>
                <label className="no-f" style={{ flex: 1, minWidth: 200 }}>
                  <span>রোল স্ক্যান করুন বা নম্বর লিখুন</span>
                  <input
                    id="chScan"
                    placeholder="যেমন: M-03/007"
                    autoComplete="off"
                    value={chScan}
                    onChange={(e) => setChScan(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScanRoll();
                      }
                    }}
                  />
                </label>
                <button
                  className="btn"
                  type="button"
                  id="chScanB"
                  style={{ alignSelf: 'end' }}
                  onClick={handleScanRoll}
                >
                  যোগ করুন
                </button>
              </div>

              {/* Checkbox list of available rolls */}
              <div className="ch-rolls">
                {availableRolls.length ? (
                  availableRolls.map((r) => {
                    const rNo = r.rollId || (r as any).no;
                    const rKg = Number(r.kg) || Number((r as any).weight_kg) || 23.5;
                    const rM = r.machine || (r as any).m || 'M-01';
                    const faults = (r as any).f || (r as any).faults_json || {};
                    const faultCount = Object.values(faults).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
                    const dis = isDisputedRoll(rNo);

                    return (
                      <label key={rNo} className={`ch-r ${dis ? 'dis' : ''}`}>
                        <input
                          type="checkbox"
                          value={rNo}
                          checked={chSel.has(rNo)}
                          disabled={dis}
                          onChange={(e) => {
                            const next = new Set(chSel);
                            if (e.target.checked) next.add(rNo);
                            else next.delete(rNo);
                            setChSel(next);
                          }}
                        />
                        <span className="mono">{rNo}</span>
                        <small>
                          {rM} · {rKg} kg
                          {faultCount ? ` · ফল্ট ${faultCount}` : ''}
                          {dis ? ' · QC দ্বিমত, পাঠানো যাবে না' : ''}
                        </small>
                      </label>
                    );
                  })
                ) : (
                  <p className="small muted">এই অর্ডারে পাঠানোর মতো কোনো রোল রেডি নেই।</p>
                )}
              </div>

              <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
                <span className="small" id="chSum" style={{ fontWeight: 600 }}>
                  {chSel.size} রোল · {selectedKg.toFixed(1)} kg
                </span>
                <button className="btn pri" type="submit">
                  চালান তৈরি করে সাইন দিন
                </button>
              </div>
            </form>
          )}

          {/* Challans Table */}
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>চালান</th>
                  <th>তারিখ</th>
                  {!isVendor && <th>ভেন্ডর</th>}
                  <th>অর্ডার</th>
                  <th className="n">রোল</th>
                  <th className="n">kg</th>
                  <th>গাড়ি</th>
                  <th>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {listChallans.length ? (
                  listChallans.map((c) => {
                    const no = c.no || c.challan_no;
                    const st = chState(c);
                    const rollsCount = Array.isArray(c.rolls) ? c.rolls.length : 0;
                    const kg = challanKg(c);

                    return (
                      <tr
                        key={no}
                        className="click"
                        data-ch={no}
                        onClick={() => {
                          setChOpen(no);
                          window.scrollTo(0, 0);
                        }}
                      >
                        <td className="mono">
                          <b>{no}</b>
                        </td>
                        <td>{c.d || '03 Oct'}</td>
                        {!isVendor && <td>{vName(c.v || c.party_code)}</td>}
                        <td className="mono">{c.o || c.order_no}</td>
                        <td className="n">{rollsCount}</td>
                        <td className="n">{kg.toFixed(1)}</td>
                        <td className="small">{c.veh || c.vehicle_no}</td>
                        <td>
                          <span className={`pill p-${st.s}`}>{st.t}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isVendor ? 7 : 8} className="muted">
                      এখনো কোনো চালান তৈরি হয়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default FactoryChallanPage;

