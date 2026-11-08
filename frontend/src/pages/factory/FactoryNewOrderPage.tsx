import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { SubcontractOrderItem, OrderLineItem } from '@/types/domain.types';

// Exact constants from KnitKhata.html
const PLACES = [
  'Body',
  'Sleeve',
  'Neck Rib',
  'Collar',
  'Cuff',
  'Bottom Rib / Waistband',
  'Placket',
  'BNT (Back Neck Tape)',
  'Piping / Binding',
  'Tipping',
  'Hood',
  'Hood Lining',
  'Pocket',
  'Pocket Lining',
  'Yoke',
  'Side Panel',
  'Contrast Panel',
  'Gusset',
  'Lining',
  'Others',
];

const PQUICK = [
  'Body',
  'Sleeve',
  'Neck Rib',
  'Collar',
  'Cuff',
  'Bottom Rib / Waistband',
  'BNT (Back Neck Tape)',
  'Piping / Binding',
  'Tipping',
  'Hood',
];

const FABS = [
  'Flat Knit Collar',
  'Flat Knit Cuff',
  'Tipping Collar',
  'Flat Knit Placket',
  'Single Jersey',
  'Single Jersey Lycra',
  '1×1 Rib',
  '1×1 Rib Lycra',
  '1×1 Rib Lycra (Half Feeder)',
  '1×1 Rib (Double Ply)',
  'Irregular Rib',
  '2×1 Rib',
  '2×2 Rib',
  'Fleece (2-Thread)',
  'Fleece (3-Thread)',
  'Pique',
  'Pique Lycra',
  'Lacoste',
  'Lacoste Lycra',
  'Interlock',
  'Terry',
  'French Terry',
  'Waffle',
];

const YROLES = [
  'বডি সুতা',
  'লাইক্রা (Spandex)',
  'Face',
  'Binder / Tie',
  'Loop (Back)',
  'Ply ১',
  'Ply ২',
];

const COLORS = [
  'Grey (RFD)',
  'White',
  'Black',
  'Navy Blue',
  'Heather Grey',
  'Red',
  'Royal Blue',
  'Olive',
];

function fabHint(p: string): string {
  p = (p || '').toLowerCase();
  if (/rib|collar|cuff|waist|placket/.test(p)) return '1×1 Rib Lycra';
  if (/bnt|tape|piping|binding|tipping/.test(p)) return 'Single Jersey';
  if (/hood/.test(p)) return 'Fleece (3-Thread)';
  return 'Single Jersey';
}

function isLy(c: string): boolean {
  return /spandex|lycra|elastane|\b\d+\s*d\b/i.test(String(c || ''));
}

const ROLE_PCT: Record<string, number> = {
  Face: 45,
  'Binder / Tie': 10,
  'Loop (Back)': 45,
  'Ply ১': 50,
  'Ply ২': 50,
  'লাইক্রা (Spandex)': 5,
};

interface YarnItemState {
  role: string;
  count: string;
  brand: string;
  lot: string;
  col: string;
  pct: string;
}

interface OrderLineState {
  uid: number;
  kt: 'c' | 'f';
  yd: boolean;
  fsize: string;
  pcw: string;
  fdes: string;
  place: string;
  fab: string;
  color: string;
  qty: string;
  yarns: YarnItemState[];
  ggsm: string;
  fgsm: string;
  sl: string;
  gdia: string;
  mdia: string;
  mg: string;
  machines: string[];
}

function yPct(y: YarnItemState, ys: YarnItemState[]): number {
  if (y.pct !== '' && y.pct != null && !isNaN(Number(y.pct))) return Number(y.pct);
  if (ROLE_PCT[y.role] != null && ys.length > 1 && !(y.role === 'Face' && ys.length === 2)) {
    return ROLE_PCT[y.role];
  }
  if (isLy(y.count) || y.role === 'লাইক্রা (Spandex)') return 5;
  const typed = ys
    .filter((x) => x !== y && x.pct !== '' && x.pct != null && !isNaN(Number(x.pct)))
    .reduce((a, x) => a + Number(x.pct), 0);
  const ly =
    ys.filter(
      (x) =>
        x !== y &&
        (x.pct === '' || x.pct == null) &&
        (isLy(x.count) || x.role === 'লাইক্রা (Spandex)')
    ).length * 5;
  const rest =
    ys.filter(
      (x) =>
        (x.pct === '' || x.pct == null) &&
        !(isLy(x.count) || x.role === 'লাইক্রা (Spandex)')
    ).length || 1;
  return Math.max(0, Math.round(((100 - typed - ly) / rest) * 10) / 10);
}

function yarnTemplate(fab: string): string[] {
  const f = (fab || '').toLowerCase();
  if (f.includes('3-thread')) return ['Face', 'Binder / Tie', 'Loop (Back)'];
  if (f.includes('2-thread') || f.includes('terry')) return ['Face', 'Loop (Back)'];
  if (f.includes('double ply')) return ['Ply ১', 'Ply ২'];
  if (f.includes('lycra') || f.includes('spandex')) return ['বডি সুতা', 'লাইক্রা (Spandex)'];
  return ['বডি সুতা'];
}

const newYarn = (role = ''): YarnItemState => ({
  role,
  count: '',
  brand: '',
  lot: '',
  col: '',
  pct: '',
});

let noSeqCounter = 100;

export const FactoryNewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, parties, machines, createOrder, addToast, setSelectedOrderId } = useApp();

  // Basic Form States matching KnitKhata.html
  const [pubDate, setPubDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [yrecDate, setYrecDate] = useState<string>('');
  const [delDate, setDelDate] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('ABC Knit Composite');
  const [orderNo, setOrderNo] = useState<string>(`SC-2610-02${orders.length + 1}`);
  const [buyerName, setBuyerName] = useState<string>('H&M');
  const [totalQty, setTotalQty] = useState<string>('5000');

  // Lines State
  const [noLines, setNoLines] = useState<OrderLineState[]>([
    {
      uid: 1,
      kt: 'c',
      yd: false,
      fsize: '',
      pcw: '',
      fdes: '',
      place: 'Body',
      fab: 'Single Jersey',
      color: 'Navy Blue',
      qty: '4500',
      yarns: [newYarn('বডি সুতা')],
      ggsm: '150',
      fgsm: '160',
      sl: '2.65 mm',
      gdia: '68',
      mdia: '30',
      mg: '24',
      machines: ['M-01', 'M-03'],
    },
    {
      uid: 2,
      kt: 'c',
      yd: false,
      fsize: '',
      pcw: '',
      fdes: '',
      place: 'Neck Rib',
      fab: '1×1 Rib Lycra',
      color: 'Navy Blue Matching',
      qty: '500',
      yarns: [newYarn('বডি সুতা'), newYarn('লাইক্রা (Spandex)')],
      ggsm: '',
      fgsm: '220',
      sl: '2.80 mm',
      gdia: '',
      mdia: '32',
      mg: '18',
      machines: ['M-08'],
    },
  ]);

  const [noActive, setNoActive] = useState<number>(1);
  const [formMsg, setFormMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Line Name helper
  const lname = (l: OrderLineState, i: number) =>
    [l.place, l.fab].filter(Boolean).join(' · ') || `লাইন ${i + 1}`;
  const unitOf = (l: OrderLineState) => (l && (l.kt === 'f' || (l as any).unit === 'pcs') ? 'পিস' : 'kg');

  // Totals Calculation matching noTotals() in KnitKhata.html
  const totalNum = parseFloat(totalQty) || 0;
  const sumNum = noLines.filter((l) => l.kt !== 'f').reduce((a, l) => a + (parseFloat(l.qty) || 0), 0);
  const restNum = totalNum - sumNum;

  // Allocation status class
  let allocSt = '';
  let allocCls = '';
  if (!totalNum) {
    allocSt = 'মোট অর্ডার কোয়ান্টিটি লিখুন, তারপর ফেব্রিক অনুযায়ী ভাগ করুন।';
    allocCls = 'idle';
  } else if (restNum < 0) {
    allocSt = `মোট অর্ডারের চেয়ে ${bnNum(-restNum)} kg বেশি দেওয়া হয়েছে। কোনো লাইনের কোয়ান্টিটি কমান।`;
    allocCls = 'over';
  } else if (restNum > 0) {
    allocSt = `আরও ${bnNum(restNum)} kg ভাগ করা বাকি।`;
    allocCls = 'left';
  } else {
    allocSt = 'পুরো অর্ডার ভাগ করা হয়েছে।';
    allocCls = 'ok';
  }

  // Active line object
  const activeLineObj = noLines.find((l) => l.uid === noActive) || noLines[0];

  // Allocation bar segments
  const allocSegs = noLines.map((l, i) => {
    const q = l.kt === 'f' ? 0 : parseFloat(l.qty) || 0;
    const w = totalNum ? Math.min(100, (q / Math.max(totalNum, sumNum)) * 100) : 0;
    return {
      w,
      color: `var(--l${(i % 5) + 1})`,
      title: `${lname(l, i)}: ${bnNum(q)} kg`,
    };
  });

  // Machine ownership map
  const mcOwner: Record<string, number> = {};
  noLines.forEach((l, i) => {
    l.machines.forEach((m) => {
      mcOwner[m] = i;
    });
  });

  // Unique Buyers list for datalist
  const buyerList = Array.from(new Set(orders.map((o) => o.buyer).filter(Boolean)));

  // Ysum text helper
  const ysumText = (l: OrderLineState) => {
    const t = Math.round(l.yarns.reduce((a, y) => a + yPct(y, l.yarns), 0) * 10) / 10;
    return t === 100 ? (
      <>
        সুতার মোট ভাগ: ১০০% ✓{' '}
        <span className="muted">(লাইক্রা সাধারণত ৫%, খালি রাখলে এটাই ধরা হয়)</span>
      </>
    ) : (
      <span style={{ color: 'var(--bad)' }}>সুতার মোট ভাগ {t}% · ১০০% হওয়া দরকার</span>
    );
  };

  // Add Line Handler matching addln
  const handleAddLine = () => {
    noSeqCounter += 1;
    const nextUid = noSeqCounter;
    const newL: OrderLineState = {
      uid: nextUid,
      kt: 'c',
      yd: false,
      fsize: '',
      pcw: '',
      fdes: '',
      place: '',
      fab: '',
      color: '',
      qty: restNum > 0 ? String(restNum) : '',
      yarns: [newYarn('বডি সুতা')],
      ggsm: '',
      fgsm: '',
      sl: '',
      gdia: '',
      mdia: '',
      mg: '',
      machines: [],
    };
    setNoLines([...noLines, newL]);
    setNoActive(nextUid);
  };

  // Delete line
  const handleDeleteLine = (uid: number) => {
    if (noLines.length <= 1) return;
    const next = noLines.filter((l) => l.uid !== uid);
    setNoLines(next);
    if (noActive === uid) setNoActive(next[0].uid);
  };

  // Toggle machine for active line
  const handleToggleMachine = (mId: string) => {
    if (!activeLineObj) return;
    setNoLines((prev) =>
      prev.map((l) => {
        if (l.uid === activeLineObj.uid) {
          const has = l.machines.includes(mId);
          return {
            ...l,
            machines: has ? l.machines.filter((x) => x !== mId) : [...l.machines, mId],
          };
        } else {
          // Remove from other line if assigned
          return {
            ...l,
            machines: l.machines.filter((x) => x !== mId),
          };
        }
      })
    );
  };

  // Submit Handler exact validation logic from KnitKhata.html
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    // Validation
    const anyC = noLines.some((l) => l.kt !== 'f');
    const need: string[] = [];

    if (!vendorName.trim()) need.push('Vendor Name');
    if (!orderNo.trim()) need.push('Order No');
    if (!buyerName.trim()) need.push('Buyer Name');
    if (anyC && !(parseFloat(totalQty) > 0)) need.push('Total Order Qty');

    noLines.forEach((l, i) => {
      if (!l.place.trim()) need.push(`লাইন ${i + 1}-এর Placement`);
      if (!l.fab.trim()) need.push(`লাইন ${i + 1}-এর Fabrication`);
      if (!(parseFloat(l.qty) > 0)) need.push(`লাইন ${i + 1}-এর Qty`);
      if (l.kt !== 'f' && !l.mdia.trim()) need.push(`লাইন ${i + 1}-এর Machine Dia`);
      if (!l.mg.trim()) need.push(`লাইন ${i + 1}-এর Machine Gauge`);
    });

    if (need.length > 0) {
      setFormMsg(`${need.join(', ')} লিখুন।`);
      return;
    }

    if (anyC && !(totalNum > 0)) {
      setFormMsg('Total Order Qty তে সঠিক সংখ্যা লিখুন (kg)।');
      return;
    }

    if (restNum < 0) {
      setFormMsg(
        `মোট অর্ডার ${bnNum(totalNum)} kg, কিন্তু ফেব্রিকগুলোতে ${bnNum(sumNum)} kg দেওয়া হয়েছে — ${bnNum(-restNum)} kg বেশি। ঠিক করে আবার সেভ করুন।`
      );
      return;
    }

    setSubmitting(true);
    try {
      const primaryLine = noLines[0];
      const mappedLines: OrderLineItem[] = noLines.map((l, idx) => ({
        id: idx + 1,
        fabric: l.fab,
        dia: l.kt === 'f' ? l.fsize || 'Flat' : `${l.mdia}" × ${l.mg}G`,
        gsm: parseInt(l.fgsm || l.ggsm) || 160,
        yarn: l.yarns.map((y) => y.count).filter(Boolean).join(' + ') || '30/1 Combed',
        brand: l.yarns[0]?.brand || 'Square Textiles',
        lot: l.yarns[0]?.lot || 'SQ-88410',
        stitch: l.sl || '2.65 mm',
        orderKg: parseFloat(l.qty) || 0,
        rate: 24.0,
        processLoss: 2.0,
        yarnRcv: 0,
        knitKg: 0,
        qcPass: 0,
        rejectKg: 0,
        delivKg: 0,
        machine: l.machines.join(', ') || 'M-01',
        rolls: 0,
      }));

      const newOrderPayload: Omit<SubcontractOrderItem, 'id'> & { id?: string } = {
        id: orderNo.trim() || undefined,
        po: orderNo.trim() || `SC-2610-02${orders.length + 1}`,
        party: vendorName.trim(),
        partyPhone: '01711-000111',
        buyer: buyerName.trim(),
        style: primaryLine.fab || 'Single Jersey',
        season: 'Autumn 2026',
        color: primaryLine.color || 'Navy Blue',
        orderDate: pubDate || new Date().toISOString().split('T')[0],
        delivDate: delDate || '2026-11-15',
        status: 'Running',
        payStatus: 'Due',
        paidAmt: 0,
        advanceAmt: 0,
        discountAmt: 0,
        deductAmt: 0,
        notes: `Published: ${pubDate}, Yarn Rec: ${yrecDate}`,
        lines: mappedLines,
      };

      const createdId = await createOrder(newOrderPayload);

      addToast({
        type: 'success',
        title: 'অর্ডার সেভ হয়েছে!',
        message: `${createdId} সেভ হয়েছে · ড্যাশবোর্ডে যোগ হলো`,
      });

      setSelectedOrderId(createdId);
      navigate(`/dashboard/orders/${createdId}`);
      window.scrollTo(0, 0);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'ত্রুটি ঘটেছে',
        message: 'অর্ডার সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Header exact from KnitKhata.html */}
      <div className="head">
        <div>
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              navigate('/dashboard/orders');
              window.scrollTo(0, 0);
            }}
          >
            ← অর্ডার
          </button>
          <h2 style={{ marginTop: 8 }}>New Order Entry</h2>
          <p>
            একটা অর্ডারে বডি, রিব, কলার, টিপিং-এর মতো একাধিক অংশ থাকলে প্রতিটা আলাদা লাইনে লিখুন।
            আগে Placement, তারপর ফেব্রিক আর সুতা। লাল তারকা দেওয়া ঘরগুলো লাগবেই।
          </p>
        </div>
      </div>

      {/* Datalists from KnitKhata.html */}
      <datalist id="dl-place">
        {PLACES.map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>
      <datalist id="dl-fab">
        {FABS.map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>
      <datalist id="dl-yrole">
        {YROLES.map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>
      <datalist id="dl-col">
        {COLORS.map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>
      <datalist id="no-vlist">
        {parties.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
      <datalist id="no-blist">
        {buyerList.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      {/* Main Form full width matching orders page */}
      <form id="nof" className="no-wrap" style={{ maxWidth: '100%', width: '100%' }} onSubmit={handleSubmit} noValidate>
        {/* CARD 1: DATES */}
        <div className="card">
          <h3>
            <span className="stp">১</span>তারিখ
          </h3>
          <div className="no-dates">
            <label className="no-f" htmlFor="no-pub">
              <span>Order Published Date</span>
              <input
                id="no-pub"
                type="date"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
              />
            </label>
            <label className="no-f" htmlFor="no-yrec">
              <span>Yarn Received Date</span>
              <input
                id="no-yrec"
                type="date"
                value={yrecDate}
                onChange={(e) => setYrecDate(e.target.value)}
              />
            </label>
            <label className="no-f" htmlFor="no-del">
              <span>Fabrics Delivery Date</span>
              <input
                id="no-del"
                type="date"
                value={delDate}
                onChange={(e) => setDelDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* CARD 2: ORDER INFORMATION */}
        <div className="card">
          <h3>
            <span className="stp">২</span>অর্ডারের তথ্য
          </h3>
          <div className="no-grid">
            <label className="no-f" htmlFor="no-vendor">
              <span>
                Vendor Name <b className="req">*</b>
              </span>
              <input
                id="no-vendor"
                type="text"
                placeholder="যেমন: ABC Knit Composite"
                list="no-vlist"
                autoComplete="off"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </label>

            <label className="no-f" htmlFor="no-id">
              <span>
                Order No <b className="req">*</b>
              </span>
              <input
                id="no-id"
                type="text"
                placeholder="যেমন: SC-2610-020"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
              />
            </label>

            <label className="no-f" htmlFor="no-buyer">
              <span>
                Buyer Name <b className="req">*</b>
              </span>
              <input
                id="no-buyer"
                type="text"
                placeholder="যেমন: বায়ারের নাম"
                list="no-blist"
                autoComplete="off"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </label>

            <label className="no-f" htmlFor="no-qty">
              <span>
                Total Order Qty (kg) <b className="req">*</b>
              </span>
              <input
                id="no-qty"
                type="text"
                inputMode="decimal"
                placeholder="যেমন: 5000"
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* CARD 3: ALLOCATION BAR (PART BY PART KG SPLIT) */}
        <div className={`card alloc ${allocCls}`} id="alloc">
          <div className="al-top">
            <b>
              <span className="stp">৩</span>অংশ অনুযায়ী ভাগ
            </b>
            <span className="mono">
              {bnNum(sumNum)} / {totalNum ? bnNum(totalNum) : '—'} kg
            </span>
          </div>

          <div className="al-bar">
            {allocSegs.map((seg, idx) => (
              <i
                key={idx}
                style={{ width: `${seg.w}%`, background: seg.color }}
                title={seg.title}
              />
            ))}
          </div>

          <div className="al-legend">
            {noLines.map((l, i) => (
              <span key={l.uid} style={{ ['--c' as any]: `var(--l${(i % 5) + 1})` }}>
                {lname(l, i)}:{' '}
                <b className="mono">
                  {bnNum(parseFloat(l.qty) || 0)} {unitOf(l)}
                </b>
                {l.kt === 'f' && (
                  <small className="muted"> (ফ্ল্যাট, kg-র হিসাবে নেই)</small>
                )}
              </span>
            ))}
          </div>

          <div className="al-st" role="status">
            {allocSt}
          </div>
        </div>

        {/* LINES LIST */}
        <div id="lines" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {noLines.map((l, i) => {
            const lc = `var(--l${(i % 5) + 1})`;
            const tmpl = yarnTemplate(l.fab);

            return (
              <div
                key={l.uid}
                className="ln"
                style={{ ['--lc' as any]: lc }}
                data-line={l.uid}
                onClick={() => setNoActive(l.uid)}
              >
                {/* Line Top Header */}
                <div className="ln-h">
                  <span className="ln-no">{i + 1}</span>
                  <b className="ln-t" id={`lt${l.uid}`}>
                    {[l.place, l.fab, l.color].filter(Boolean).join(' · ') || 'নতুন অংশ'}
                  </b>
                  <span className="ln-q" id={`lq${l.uid}`}>
                    {l.qty ? `${bnNum(parseFloat(l.qty) || 0)} ${unitOf(l)}` : ''}
                  </span>
                  {noLines.length > 1 && (
                    <button
                      type="button"
                      className="ln-x"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLine(l.uid);
                      }}
                      aria-label="এই অংশ বাদ দিন"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Knitting Type & Fabric Type Segments */}
                <div className="ktr">
                  <div className="seg" role="group" aria-label="নিটিংয়ের ধরন">
                    <span>নিটিং</span>
                    <button
                      type="button"
                      className={l.kt !== 'f' ? 'on' : ''}
                      onClick={() => {
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, kt: 'c' } : item
                          )
                        );
                      }}
                    >
                      সার্কুলার
                    </button>
                    <button
                      type="button"
                      className={l.kt === 'f' ? 'on' : ''}
                      onClick={() => {
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid
                              ? { ...item, kt: 'f', place: item.place || 'Collar' }
                              : item
                          )
                        );
                      }}
                    >
                      ফ্ল্যাট (কলার-কাফ)
                    </button>
                  </div>

                  <div className="seg" role="group" aria-label="কাপড়ের ধরন">
                    <span>কাপড়</span>
                    <button
                      type="button"
                      className={!l.yd ? 'on' : ''}
                      onClick={() => {
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, yd: false } : item
                          )
                        );
                      }}
                    >
                      গ্রে
                    </button>
                    <button
                      type="button"
                      className={l.yd ? 'on' : ''}
                      onClick={() => {
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, yd: true } : item
                          )
                        );
                      }}
                    >
                      ইয়ার্ন ডাইড (Y/D)
                    </button>
                  </div>
                </div>

                {/* Placement with Quick Chips */}
                <div className="plc">
                  <label className="no-f" htmlFor={`l${l.uid}-place`}>
                    <span>
                      Placement (কোন অংশ) <b className="req">*</b>
                    </span>
                    <input
                      id={`l${l.uid}-place`}
                      type="text"
                      placeholder="যেমন: Body, Neck Rib, Cuff"
                      list="dl-place"
                      autoComplete="off"
                      value={l.place}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, place: val } : item
                          )
                        );
                      }}
                    />
                  </label>

                  <div className="pq" role="group" aria-label="সাধারণ অংশ">
                    {PQUICK.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`pqb ${l.place === p ? 'on' : ''}`}
                        onClick={() => {
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, place: p } : item
                            )
                          );
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fabrication, Color, Qty Grid */}
                <div className="no-grid g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px' }}>
                  <label className="no-f" htmlFor={`l${l.uid}-fab`}>
                    <span>
                      Fabrication <b className="req">*</b>
                    </span>
                    <input
                      id={`l${l.uid}-fab`}
                      type="text"
                      list="dl-fab"
                      autoComplete="off"
                      placeholder={`যেমন: ${
                        l.kt === 'f'
                          ? /cuff|কাফ/i.test(l.place)
                            ? 'Flat Knit Cuff'
                            : 'Flat Knit Collar'
                          : fabHint(l.place)
                      }`}
                      value={l.fab}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoLines((prev) =>
                          prev.map((item) => {
                            if (item.uid !== l.uid) return item;
                            const empty = item.yarns.every((y) => !y.count && !y.brand && !y.lot);
                            const t = yarnTemplate(val);
                            return {
                              ...item,
                              fab: val,
                              yarns: empty ? t.map((r) => newYarn(r)) : item.yarns,
                            };
                          })
                        );
                      }}
                    />
                  </label>

                  <label className="no-f" htmlFor={`l${l.uid}-color`}>
                    <span>{l.yd ? 'Color / Stripe' : 'Color'}</span>
                    <input
                      id={`l${l.uid}-color`}
                      type="text"
                      list="dl-col"
                      autoComplete="off"
                      placeholder={l.yd ? 'যেমন: Navy + White স্ট্রাইপ' : 'যেমন: Navy Blue'}
                      value={l.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, color: val } : item
                          )
                        );
                      }}
                    />
                  </label>

                  <label className="no-f" htmlFor={`l${l.uid}-qty`}>
                    <span>
                      {l.kt === 'f' ? 'Qty (পিস)' : 'Qty (kg)'} <b className="req">*</b>
                    </span>
                    <input
                      id={`l${l.uid}-qty`}
                      type="text"
                      inputMode="decimal"
                      placeholder={l.kt === 'f' ? 'যেমন: 12000' : 'যেমন: 2000'}
                      value={l.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoLines((prev) =>
                          prev.map((item) =>
                            item.uid === l.uid ? { ...item, qty: val } : item
                          )
                        );
                      }}
                    />
                  </label>
                </div>

                {/* Yarns Section */}
                <div className="ln-sub">
                  সুতা <span className="ycnt">{l.yarns.length}টি</span>
                </div>

                {l.fab && l.yarns.length < tmpl.length && (
                  <div className="yhint" style={{ fontSize: '0.84rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '6px 10px', borderRadius: 6, margin: '4px 0' }}>
                    {l.fab}-এ সাধারণত {tmpl.length}টা সুতা লাগে।{' '}
                    <button
                      type="button"
                      className="linkb"
                      style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      onClick={() => {
                        setNoLines((prev) =>
                          prev.map((item) => {
                            if (item.uid !== l.uid) return item;
                            const nextY = [...item.yarns];
                            tmpl.forEach((r, j) => {
                              if (!nextY[j]) nextY.push(newYarn(r));
                              else if (!nextY[j].role) nextY[j].role = r;
                            });
                            return { ...item, yarns: nextY };
                          })
                        );
                      }}
                    >
                      সুতার ঘরগুলো যোগ করুন
                    </button>
                  </div>
                )}

                <div className="yarns">
                  {l.yarns.map((y, j) => (
                    <div key={j} className={`yrow ${l.yd ? 'ydr' : ''}`}>
                      <span className="yno">{j + 1}</span>

                      <label className="no-f" htmlFor={`y${l.uid}-${j}-count`}>
                        <span>Yarn Count</span>
                        <input
                          id={`y${l.uid}-${j}-count`}
                          type="text"
                          placeholder={
                            /lycra|spandex/i.test(y.role)
                              ? 'যেমন: 20D Spandex'
                              : 'যেমন: 30/1 Combed Cotton'
                          }
                          value={y.count}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNoLines((prev) =>
                              prev.map((item) => {
                                if (item.uid !== l.uid) return item;
                                const nextY = [...item.yarns];
                                nextY[j] = { ...nextY[j], count: val };
                                return { ...item, yarns: nextY };
                              })
                            );
                          }}
                        />
                      </label>

                      <label className="no-f" htmlFor={`y${l.uid}-${j}-brand`}>
                        <span>Yarn Brand</span>
                        <input
                          id={`y${l.uid}-${j}-brand`}
                          type="text"
                          placeholder="যেমন: মিলের নাম"
                          value={y.brand}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNoLines((prev) =>
                              prev.map((item) => {
                                if (item.uid !== l.uid) return item;
                                const nextY = [...item.yarns];
                                nextY[j] = { ...nextY[j], brand: val };
                                return { ...item, yarns: nextY };
                              })
                            );
                          }}
                        />
                      </label>

                      <label className="no-f" htmlFor={`y${l.uid}-${j}-lot`}>
                        <span>Yarn Lot</span>
                        <input
                          id={`y${l.uid}-${j}-lot`}
                          type="text"
                          placeholder="যেমন: SQ-88415"
                          value={y.lot}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNoLines((prev) =>
                              prev.map((item) => {
                                if (item.uid !== l.uid) return item;
                                const nextY = [...item.yarns];
                                nextY[j] = { ...nextY[j], lot: val };
                                return { ...item, yarns: nextY };
                              })
                            );
                          }}
                        />
                      </label>

                      {l.yd && (
                        <label className="no-f" htmlFor={`y${l.uid}-${j}-col`}>
                          <span>সুতার রং</span>
                          <input
                            id={`y${l.uid}-${j}-col`}
                            type="text"
                            placeholder="যেমন: Navy"
                            value={y.col}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNoLines((prev) =>
                                prev.map((item) => {
                                  if (item.uid !== l.uid) return item;
                                  const nextY = [...item.yarns];
                                  nextY[j] = { ...nextY[j], col: val };
                                  return { ...item, yarns: nextY };
                                })
                              );
                            }}
                          />
                        </label>
                      )}

                      <label className="no-f ypct" htmlFor={`y${l.uid}-${j}-pct`}>
                        <span>কাপড়ে %</span>
                        <input
                          id={`y${l.uid}-${j}-pct`}
                          type="text"
                          inputMode="decimal"
                          placeholder={String(
                            yPct(
                              { ...y, pct: '' },
                              l.yarns.map((x) => (x === y ? { ...x, pct: '' } : x))
                            )
                          )}
                          value={y.pct}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNoLines((prev) =>
                              prev.map((item) => {
                                if (item.uid !== l.uid) return item;
                                const nextY = [...item.yarns];
                                nextY[j] = { ...nextY[j], pct: val };
                                return { ...item, yarns: nextY };
                              })
                            );
                          }}
                        />
                      </label>

                      {l.yarns.length > 1 ? (
                        <button
                          type="button"
                          className="ln-x yx"
                          onClick={() => {
                            setNoLines((prev) =>
                              prev.map((item) => {
                                if (item.uid !== l.uid) return item;
                                return {
                                  ...item,
                                  yarns: item.yarns.filter((_, idx) => idx !== j),
                                };
                              })
                            );
                          }}
                          aria-label="এই সুতা বাদ দিন"
                        >
                          ✕
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="ysum" id={`ys${l.uid}`}>
                  {ysumText(l)}
                </div>

                <button
                  type="button"
                  className="addy"
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: '1px dashed var(--line)',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    marginTop: 6,
                  }}
                  onClick={() => {
                    const t = yarnTemplate(l.fab);
                    setNoLines((prev) =>
                      prev.map((item) => {
                        if (item.uid !== l.uid) return item;
                        return {
                          ...item,
                          yarns: [...item.yarns, newYarn(t[item.yarns.length] || '')],
                        };
                      })
                    );
                  }}
                >
                  + আরেকটা সুতা যোগ করুন
                </button>

                {/* Technical Specifications */}
                <div className="ln-sub">স্পেসিফিকেশন</div>

                {l.kt === 'f' ? (
                  <div className="no-grid g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px' }}>
                    <label className="no-f" htmlFor={`l${l.uid}-fsize`}>
                      <span>সাইজ (সেমি)</span>
                      <input
                        id={`l${l.uid}-fsize`}
                        type="text"
                        placeholder="যেমন: 38 × 8 cm"
                        value={l.fsize}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, fsize: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-pcw`}>
                      <span>প্রতি পিসের ওজন (গ্রাম)</span>
                      <input
                        id={`l${l.uid}-pcw`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 18"
                        value={l.pcw}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, pcw: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-mg`}>
                      <span>
                        Machine Gauge <b className="req">*</b>
                      </span>
                      <input
                        id={`l${l.uid}-mg`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 14"
                        value={l.mg}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, mg: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-fdes`} style={{ gridColumn: 'span 3' }}>
                      <span>ডিজাইন / টিপিং</span>
                      <input
                        id={`l${l.uid}-fdes`}
                        type="text"
                        placeholder="যেমন: ২টা সাদা স্ট্রাইপ, ৩ মিমি"
                        value={l.fdes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, fdes: val } : item
                            )
                          );
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="no-grid g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px' }}>
                    <label className="no-f" htmlFor={`l${l.uid}-ggsm`}>
                      <span>Grey GSM</span>
                      <input
                        id={`l${l.uid}-ggsm`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 150"
                        value={l.ggsm}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, ggsm: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-fgsm`}>
                      <span>Finish GSM</span>
                      <input
                        id={`l${l.uid}-fgsm`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 160"
                        value={l.fgsm}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, fgsm: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-sl`}>
                      <span>Stitch Length</span>
                      <input
                        id={`l${l.uid}-sl`}
                        type="text"
                        placeholder="যেমন: 2.85 mm"
                        value={l.sl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, sl: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-gdia`}>
                      <span>Grey Dia</span>
                      <input
                        id={`l${l.uid}-gdia`}
                        type="text"
                        placeholder="যেমন: 68"
                        value={l.gdia}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, gdia: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-mdia`}>
                      <span>
                        Machine Dia <b className="req">*</b>
                      </span>
                      <input
                        id={`l${l.uid}-mdia`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 30"
                        value={l.mdia}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, mdia: val } : item
                            )
                          );
                        }}
                      />
                    </label>

                    <label className="no-f" htmlFor={`l${l.uid}-mg`}>
                      <span>
                        Machine Gauge <b className="req">*</b>
                      </span>
                      <input
                        id={`l${l.uid}-mg`}
                        type="text"
                        inputMode="decimal"
                        placeholder="যেমন: 24"
                        value={l.mg}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNoLines((prev) =>
                            prev.map((item) =>
                              item.uid === l.uid ? { ...item, mg: val } : item
                            )
                          );
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CARD 4: ASSIGN TO M/C NO (EXACT MATCHING KNITKHATA.HTML) */}
        <div className="card">
          <h3>
            <span className="stp">৪</span>Assign to M/C No
          </h3>
          <p className="small muted" style={{ margin: '-4px 0 8px' }}>
            যে অংশটা বাছা আছে, মেশিনে চাপ দিলে সেটা ওই অংশে যাবে। অংশ বদলাতে নিচের রঙিন বাটনে চাপুন।
          </p>

          <div className="lnpick" id="lnpick">
            {noLines.map((l, i) => (
              <button
                key={l.uid}
                type="button"
                className={`lp ${l.uid === noActive ? 'on' : ''}`}
                style={{ ['--c' as any]: `var(--l${(i % 5) + 1})` }}
                onClick={() => setNoActive(l.uid)}
              >
                <span>{i + 1}</span>
                {lname(l, i)}
              </button>
            ))}
          </div>

          <div className="mcpick" id="mcpick">
            {machines.map((m) => {
              const o = mcOwner[m.id];
              const isBusy = m.status === 'Running' && o === undefined;
              const isDown = m.status === 'Maint';

              return (
                <button
                  key={m.id}
                  type="button"
                  className={`mcb ${isBusy ? 'busy' : ''} ${isDown ? 'down' : ''} ${
                    o !== undefined ? 'own' : ''
                  }`}
                  style={o !== undefined ? ({ ['--c' as any]: `var(--l${(o % 5) + 1})` } as any) : undefined}
                  disabled={isBusy || isDown}
                  title={
                    isBusy
                      ? 'অন্য অর্ডারে চলছে'
                      : isDown
                      ? 'ব্রেকডাউন'
                      : o !== undefined
                      ? noLines[o].fab || `লাইন ${o + 1}`
                      : 'খালি'
                  }
                  onClick={() => handleToggleMachine(m.id)}
                >
                  {m.id}
                  {o !== undefined && <sup>{o + 1}</sup>}
                </button>
              );
            })}
          </div>

          <div className="small muted" id="mcsum" style={{ marginTop: 10 }}>
            {noLines.filter((l) => l.machines.length > 0).length > 0 ? (
              noLines
                .filter((l) => l.machines.length > 0)
                .map((l, i) => (
                  <div key={l.uid}>
                    <b>{lname(l, i)}:</b> {l.machines.join(', ')}
                  </div>
                ))
            ) : (
              'কোনো মেশিন বাছাই হয়নি'
            )}
          </div>
        </div>

        {/* Add Another Line Button */}
        <button
          type="button"
          className="btn addln"
          id="addln"
          onClick={handleAddLine}
        >
          + আরেকটা অংশ যোগ করুন
        </button>

        {/* Validation Message */}
        {formMsg && (
          <div className="no-msg" id="no-msg">
            {formMsg}
          </div>
        )}

        {/* Submit Button */}
        <button
          className="btn pri no-save"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'সংরক্ষণ হচ্ছে...' : 'অর্ডার সেভ করুন'}
        </button>
      </form>
    </>
  );
};
