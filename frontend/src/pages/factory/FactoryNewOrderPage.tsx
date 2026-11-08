import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { SubcontractOrderItem, OrderLineItem } from '@/types/domain.types';

interface OrderLineFormState {
  id: number;
  place: string;
  fabric: string;
  gsm: number;
  dia: string;
  stitch: string;
  color: string;
  yarnCount: string;
  brand: string;
  lot: string;
  qty: number;
  processLoss: number;
  machines: string[];
}

export const FactoryNewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, parties, machines, createOrder, receiveYarnInward, addToast, setSelectedOrderId } = useApp();

  // Basic Order Fields
  const nextOrderIndex = orders.length + 1;
  const [orderCode, setOrderCode] = useState<string>(`SC-2610-02${nextOrderIndex}`);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || 'p-01');
  const [buyer, setBuyer] = useState<string>('H&M Basic');
  const [style, setStyle] = useState<string>('Crew Neck Tee');
  const [season, setSeason] = useState<string>('Autumn 2026');
  const [mainColor, setMainColor] = useState<string>('Navy Blue');
  const [delivDate, setDelivDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [rateTk, setRateTk] = useState<string>('24.0');
  const [dailyTargetKg, setDailyTargetKg] = useState<string>('500');
  const [status, setStatus] = useState<'Running' | 'Pending' | 'Draft'>('Running');
  const [notes, setNotes] = useState<string>('নিয়মিত সাব-কন্ট্রাক্ট নিটিং অর্ডার');

  // Part-by-part Fabric Lines
  const [lines, setLines] = useState<OrderLineFormState[]>([
    {
      id: 1,
      place: 'Body',
      fabric: 'Single Jersey 100% Cotton',
      gsm: 160,
      dia: '30" × 24G',
      stitch: '2.65 mm',
      color: 'Navy Blue',
      yarnCount: '30/1 Combed Cotton',
      brand: 'Square Textiles',
      lot: 'SQ-90112',
      qty: 4500,
      processLoss: 2.0,
      machines: ['M-01', 'M-03'],
    },
    {
      id: 2,
      place: 'Neck Rib',
      fabric: '1×1 Lycra Rib (95/5)',
      gsm: 220,
      dia: '32" × 18G',
      stitch: '2.80 mm',
      color: 'Navy Blue Matching',
      yarnCount: '30/1 Combed + 20D Spandex',
      brand: 'Square Textiles',
      lot: 'SQ-90112',
      qty: 500,
      processLoss: 2.5,
      machines: ['M-08'],
    },
  ]);

  // Initial Yarn Inward (Optional)
  const [hasInitialYarn, setHasInitialYarn] = useState<boolean>(true);
  const [yarnChallanNo, setYarnChallanNo] = useState<string>(`CH-Y-902${nextOrderIndex}`);
  const [yarnBags, setYarnBags] = useState<string>('50');
  const [yarnKg, setYarnKg] = useState<string>('2500');
  const [yarnWarehouse, setYarnWarehouse] = useState<string>('গোডাউন-১ / র্যাক-বি');

  // Is Submitting
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Active Party Object
  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  // Quick preset adder
  const addPresetLine = (preset: 'body' | 'rib' | 'cuff' | 'collar' | 'tipping' | 'custom') => {
    const newId = lines.length ? Math.max(...lines.map((l) => l.id)) + 1 : 1;
    let newLine: OrderLineFormState;

    switch (preset) {
      case 'body':
        newLine = {
          id: newId,
          place: 'Body',
          fabric: 'Single Jersey 100% Cotton',
          gsm: 160,
          dia: '30" × 24G',
          stitch: '2.65 mm',
          color: mainColor || 'Navy Blue',
          yarnCount: '30/1 Combed',
          brand: 'Square Textiles',
          lot: 'SQ-90112',
          qty: 3000,
          processLoss: 2.0,
          machines: ['M-01'],
        };
        break;
      case 'rib':
        newLine = {
          id: newId,
          place: 'Neck Rib',
          fabric: '1×1 Lycra Rib (95/5)',
          gsm: 220,
          dia: '32" × 18G',
          stitch: '2.80 mm',
          color: mainColor ? `${mainColor} Matching` : 'Matching',
          yarnCount: '30/1 Combed + 20D',
          brand: 'Square Textiles',
          lot: 'SQ-90112',
          qty: 400,
          processLoss: 2.5,
          machines: ['M-08'],
        };
        break;
      case 'cuff':
        newLine = {
          id: newId,
          place: 'Cuff Rib',
          fabric: '1×1 Flat/Circular Rib',
          gsm: 220,
          dia: '30" × 18G',
          stitch: '2.75 mm',
          color: mainColor || 'Navy Blue',
          yarnCount: '30/1 Combed',
          brand: 'Square Textiles',
          lot: 'SQ-90112',
          qty: 350,
          processLoss: 2.0,
          machines: ['M-08'],
        };
        break;
      case 'collar':
        newLine = {
          id: newId,
          place: 'Collar (Polo/Tee)',
          fabric: 'Pique Collar Matched',
          gsm: 230,
          dia: 'Flat Knit',
          stitch: '2.70 mm',
          color: mainColor || 'Navy Blue',
          yarnCount: '26/1 Carded',
          brand: 'Beximco',
          lot: 'BX-4011',
          qty: 300,
          processLoss: 2.0,
          machines: ['M-02'],
        };
        break;
      case 'tipping':
        newLine = {
          id: newId,
          place: 'Tipping Rib',
          fabric: 'Tipping Rib Contrast',
          gsm: 240,
          dia: '30" × 18G',
          stitch: '2.70 mm',
          color: 'White Contrast Stripe',
          yarnCount: '30/1 Combed',
          brand: 'Square Textiles',
          lot: 'SQ-90112',
          qty: 150,
          processLoss: 3.0,
          machines: ['M-08'],
        };
        break;
      default:
        newLine = {
          id: newId,
          place: `Part ${newId}`,
          fabric: 'Cotton Knit Fabric',
          gsm: 180,
          dia: '30" × 24G',
          stitch: '2.65 mm',
          color: mainColor || 'Color',
          yarnCount: '30/1 Combed',
          brand: 'Spinner Mill',
          lot: 'LOT-01',
          qty: 500,
          processLoss: 2.0,
          machines: [],
        };
    }
    setLines([...lines, newLine]);
  };

  const removeLine = (id: number) => {
    if (lines.length <= 1) {
      addToast({ type: 'info', title: 'ন্যূনতম একটি অংশ আবশ্যক', message: 'একটি অর্ডারে কমপক্ষে একটি ফেব্রিক লাইন থাকতে হবে।' });
      return;
    }
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLineField = (id: number, field: keyof OrderLineFormState, value: any) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const toggleLineMachine = (lineId: number, machineId: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        const exists = l.machines.includes(machineId);
        const nextMachines = exists
          ? l.machines.filter((m) => m !== machineId)
          : [...l.machines, machineId];
        return { ...l, machines: nextMachines };
      })
    );
  };

  // Calculations
  const totalOrderKg = lines.reduce((acc, l) => acc + (Number(l.qty) || 0), 0);
  const totalYarnRequiredKg = lines.reduce(
    (acc, l) => acc + (Number(l.qty) || 0) * (1 + (Number(l.processLoss) || 2) / 100),
    0
  );
  const rateNum = parseFloat(rateTk) || 24;
  const estimatedBillTk = totalOrderKg * rateNum;
  const uniqueAllocatedMachines = Array.from(
    new Set(lines.flatMap((l) => l.machines))
  );

  // Quick Sample Fill
  const fillSampleData = () => {
    setOrderCode(`SC-2610-02${orders.length + 1}`);
    setBuyer('Zara Casuals (Inditex)');
    setStyle('Summer Terry Henley');
    setSeason('Spring/Summer 2026');
    setMainColor('Olive Green');
    setRateTk('26.5');
    setDailyTargetKg('600');
    setStatus('Running');
    setNotes('জরুরি রপ্তানি চালান — ডেলিভারি নিশ্চিত করতে হবে।');
    setLines([
      {
        id: 1,
        place: 'Body',
        fabric: 'Single Jersey 100% Organic Cotton',
        gsm: 175,
        dia: '32" × 24G',
        stitch: '2.70 mm',
        color: 'Olive Green',
        yarnCount: '26/1 Combed Organic',
        brand: 'Envoy Textiles',
        lot: 'EV-8820',
        qty: 6000,
        processLoss: 2.0,
        machines: ['M-01', 'M-03'],
      },
      {
        id: 2,
        place: 'Neck Rib',
        fabric: '1×1 Rib with Spandex (96/4)',
        gsm: 230,
        dia: '30" × 18G',
        stitch: '2.85 mm',
        color: 'Olive Matching',
        yarnCount: '30/1 Combed + 20D Spandex',
        brand: 'Envoy Textiles',
        lot: 'EV-8820',
        qty: 650,
        processLoss: 2.5,
        machines: ['M-08'],
      },
      {
        id: 3,
        place: 'Placket & Cuff',
        fabric: 'Single Jersey Interlock Finish',
        gsm: 180,
        dia: '30" × 24G',
        stitch: '2.65 mm',
        color: 'Olive Matching',
        yarnCount: '26/1 Combed',
        brand: 'Envoy Textiles',
        lot: 'EV-8820',
        qty: 350,
        processLoss: 2.0,
        machines: ['M-02'],
      },
    ]);
    setHasInitialYarn(true);
    setYarnChallanNo(`CH-EV-441${orders.length}`);
    setYarnBags('70');
    setYarnKg('3500');
    setYarnWarehouse('গোডাউন-১ / র্যাক-এ');
    addToast({ type: 'info', title: 'নমুনা ডেটা পূরণ হয়েছে', message: 'Zara Casuals-এর স্পেসিফিকেশন ও লাইন ডেটা যুক্ত হয়েছে।' });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalOrderKg <= 0) {
      addToast({ type: 'info', title: 'পরিমাণ সঠিক দিন', message: 'মোট অর্ডার পরিমাণ ০ এর বেশি হতে হবে।' });
      return;
    }

    setSubmitting(true);
    try {
      const orderDate = new Date().toISOString().split('T')[0];
      const primaryLine = lines[0];

      const mappedLines: OrderLineItem[] = lines.map((l, idx) => ({
        id: idx + 1,
        fabric: l.fabric,
        dia: l.dia,
        gsm: Number(l.gsm) || 160,
        yarn: l.yarnCount,
        brand: l.brand,
        lot: l.lot,
        stitch: l.stitch,
        orderKg: Number(l.qty) || 0,
        rate: rateNum,
        processLoss: Number(l.processLoss) || 2.0,
        yarnRcv: hasInitialYarn ? (idx === 0 ? parseFloat(yarnKg) || 0 : 0) : 0,
        knitKg: 0,
        qcPass: 0,
        rejectKg: 0,
        delivKg: 0,
        machine: l.machines.join(', ') || 'M-01',
        rolls: 0,
      }));

      const newOrderPayload: Omit<SubcontractOrderItem, 'id'> & { id?: string } = {
        id: orderCode.trim() || undefined,
        po: orderCode.trim() || `SC-2610-02${orders.length + 1}`,
        party: selectedParty?.name || 'ABC Knit Composite',
        partyPhone: selectedParty?.phone || '01711-000111',
        buyer: buyer.trim() || 'ABC Knit Composite',
        style: style.trim() || primaryLine.fabric,
        season: season.trim() || 'Autumn 2026',
        color: mainColor.trim() || primaryLine.color,
        orderDate,
        delivDate,
        status: status,
        payStatus: 'Due',
        paidAmt: 0,
        advanceAmt: 0,
        discountAmt: 0,
        deductAmt: 0,
        notes: notes.trim(),
        lines: mappedLines,
      };

      const createdId = await createOrder(newOrderPayload);

      // If initial yarn is checked and entered, receive initial yarn inward
      if (hasInitialYarn && parseFloat(yarnKg) > 0) {
        await receiveYarnInward({
          orderId: createdId,
          lineIdx: 0,
          date: orderDate,
          party: selectedParty?.name || 'ABC Knit Composite',
          lot: primaryLine.lot || 'SQ-90112',
          brand: primaryLine.brand || 'Square Textiles',
          count: primaryLine.yarnCount || '30/1 Combed',
          rcvKg: parseFloat(yarnKg) || 2500,
          bags: parseInt(yarnBags) || 50,
          usedKg: 0,
          retKg: 0,
          wastageKg: 0,
        });
      }

      addToast({
        type: 'success',
        title: 'অর্ডার সফলভাবে সেভ হয়েছে!',
        message: `ওয়ার্ক অর্ডার ${createdId} তৈরি হয়েছে। জব কার্ড এবং চালান এখন প্রস্তুত।`,
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
    <div style={{ maxWidth: 1120, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Header */}
      <div className="head" style={{ marginBottom: 20 }}>
        <div>
          <button
            type="button"
            className="btn sm"
            style={{ marginBottom: 8 }}
            onClick={() => navigate('/dashboard/orders')}
          >
            ← অর্ডার তালিকায় ফিরুন
          </button>
          <h2>+ নতুন সাব-কন্ট্রাক্ট অর্ডার এন্ট্রি</h2>
          <p>পার্টি ও বায়ারের ওয়ার্ক অর্ডার, অংশভিত্তিক স্পেসিফিকেশন ও মেশিন বরাদ্দ খাতা</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn sm"
            onClick={fillSampleData}
            title="দ্রুত পরীক্ষার জন্য নমুনা তথ্য পূরণ করুন"
          >
            ⚡ নমুনা ডেটা পূরণ
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={() => navigate('/dashboard/orders')}
          >
            বাতিল
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: PARTY & WORK ORDER BASIC INFO */}
        <div className="card" style={{ marginBottom: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div>
              <b style={{ fontSize: '1rem', color: 'var(--ink)' }}>১. পার্টি ও ওয়ার্ক অর্ডারের মূল তথ্য</b>
              <div className="small muted">বায়ার, ওয়ার্ক অর্ডার কোড, পার্টি রেট ও সময়সীমা</div>
            </div>
            <span className="pill p-acc">অর্ডার বেসিক</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {/* Party / Vendor */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                পার্টি / ভেন্ডর প্রতিষ্ঠান *
              </label>
              <select
                className="select"
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                value={selectedPartyId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setSelectedPartyId(pId);
                  const p = parties.find((party) => party.id === pId);
                  if (p && p.rate1J) {
                    setRateTk(String(p.rate1J));
                  }
                }}
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.contact || 'ভেন্ডর'} · {p.phone})
                  </option>
                ))}
              </select>
              {selectedParty && (
                <small style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                  ঠিকানা: {selectedParty.address || 'নারায়ণগঞ্জ'} · স্ট্যান্ডার্ড রেট: ৳{selectedParty.rate1J || 24}/kg
                </small>
              )}
            </div>

            {/* Buyer */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                বায়ার নাম / ব্র্যান্ড *
              </label>
              <input
                type="text"
                required
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                placeholder="যেমন: H&M / Zara / Lidl / Walmart"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
              />
            </div>

            {/* Order Code / PO */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                ওয়ার্ক অর্ডার নম্বর / কোড *
              </label>
              <input
                type="text"
                required
                className="input mono"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600 }}
                placeholder="যেমন: SC-2610-025"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                ডেলিভারির শেষ তারিখ (Deadline) *
              </label>
              <input
                type="date"
                required
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                value={delivDate}
                onChange={(e) => setDelivDate(e.target.value)}
              />
            </div>

            {/* Style & Season */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                গার্মেন্টস স্টাইল নাম
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                placeholder="যেমন: Basic Crew Neck Tee"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />
            </div>

            {/* Main Color */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                মূল বডি রং (Primary Color) *
              </label>
              <input
                type="text"
                required
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                placeholder="যেমন: Navy Blue / Heather Grey"
                value={mainColor}
                onChange={(e) => setMainColor(e.target.value)}
              />
            </div>

            {/* Knitting Rate Tk */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                নিটিং রেট (৳ / kg) *
              </label>
              <input
                type="number"
                step="0.25"
                required
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                value={rateTk}
                onChange={(e) => setRateTk(e.target.value)}
              />
            </div>

            {/* Daily Target Rate Kg */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                দৈনিক লক্ষ্য (kg / দিন / মেশিন)
              </label>
              <input
                type="number"
                className="input"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                value={dailyTargetKg}
                onChange={(e) => setDailyTargetKg(e.target.value)}
              />
            </div>

            {/* Initial Status */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                প্রাথমিক অবস্থা (Initial Status)
              </label>
              <select
                className="select"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Running">চলমান (এখনই মেশিনে উঠবে)</option>
                <option value="Pending">সুতার অপেক্ষায় (Pending)</option>
                <option value="Draft">খসড়া (Draft)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PART-BY-PART FABRIC & MACHINE ALLOCATION */}
        <div className="card" style={{ marginBottom: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <div>
              <b style={{ fontSize: '1rem', color: 'var(--ink)' }}>২. অংশ ধরে New Order Entry (ফেব্রিক ও স্পেসিফিকেশন)</b>
              <div className="small muted">Body, Neck Rib, Cuff, Collar, Tipping আলাদা লাইনে — সুতা, মেশিন ও কেজি বরাদ্দ</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('body')}
              >
                + Body
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('rib')}
              >
                + Neck Rib
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('cuff')}
              >
                + Cuff
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('collar')}
              >
                + Collar
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('tipping')}
              >
                + Tipping
              </button>
              <button
                type="button"
                className="btn pri sm"
                style={{ fontSize: '0.78rem' }}
                onClick={() => addPresetLine('custom')}
              >
                + কাস্টম অংশ
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lines.map((line, idx) => (
              <div
                key={line.id}
                style={{
                  background: 'var(--surface2)',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  padding: 16,
                  position: 'relative',
                }}
              >
                {/* Line Top Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      অংশ #{idx + 1}
                    </span>
                    <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>{line.place || 'ফেব্রিক লাইন'}</b>
                    <span className="mono small muted">({line.fabric})</span>
                  </div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="btn sm"
                      style={{
                        color: 'var(--bad)',
                        borderColor: 'var(--bad)',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                      }}
                      onClick={() => removeLine(line.id)}
                    >
                      ✕ লাইন মুছুন
                    </button>
                  )}
                </div>

                {/* Line Fields Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                    gap: 10,
                  }}
                >
                  {/* Placement */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      অংশ / প্লেসমেন্ট *
                    </label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.place}
                      onChange={(e) => updateLineField(line.id, 'place', e.target.value)}
                      placeholder="Body / Neck Rib / Cuff"
                    />
                  </div>

                  {/* Fabric Description */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      ফেব্রিক বিবরণ ও কম্পোজিশন *
                    </label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.fabric}
                      onChange={(e) => updateLineField(line.id, 'fabric', e.target.value)}
                      placeholder="যেমন: Single Jersey 100% Cotton"
                    />
                  </div>

                  {/* GSM */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      জিএসএম (GSM) *
                    </label>
                    <input
                      type="number"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.gsm}
                      onChange={(e) => updateLineField(line.id, 'gsm', e.target.value)}
                    />
                  </div>

                  {/* Dia × Gauge */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      ডায়া × গেজ *
                    </label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.dia}
                      onChange={(e) => updateLineField(line.id, 'dia', e.target.value)}
                      placeholder='30" × 24G'
                    />
                  </div>

                  {/* Stitch Length */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      স্টিচ লেন্থ (SL)
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.stitch}
                      onChange={(e) => updateLineField(line.id, 'stitch', e.target.value)}
                      placeholder="2.65 mm"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      রং (Color) *
                    </label>
                    <input
                      type="text"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.color}
                      onChange={(e) => updateLineField(line.id, 'color', e.target.value)}
                    />
                  </div>

                  {/* Yarn Count */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      সুতার কাউন্ট
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.yarnCount}
                      onChange={(e) => updateLineField(line.id, 'yarnCount', e.target.value)}
                      placeholder="30/1 Combed"
                    />
                  </div>

                  {/* Spinner Mill */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      স্পিনার মিল
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.brand}
                      onChange={(e) => updateLineField(line.id, 'brand', e.target.value)}
                      placeholder="Square Textiles"
                    />
                  </div>

                  {/* Yarn Lot */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      সুতার লট নম্বর
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.lot}
                      onChange={(e) => updateLineField(line.id, 'lot', e.target.value)}
                      placeholder="SQ-90112"
                    />
                  </div>

                  {/* Order Quantity Kg */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      অর্ডার পরিমাণ (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem', fontWeight: 700 }}
                      value={line.qty}
                      onChange={(e) => updateLineField(line.id, 'qty', e.target.value)}
                    />
                  </div>

                  {/* Process Loss % */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>
                      প্রসেস লস %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.82rem' }}
                      value={line.processLoss}
                      onChange={(e) => updateLineField(line.id, 'processLoss', e.target.value)}
                    />
                  </div>
                </div>

                {/* Machine Allocation for this part */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    মেশিন বরাদ্দ (ক্লিক করে নির্বাচন করুন):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {machines.map((m) => {
                      const isSelected = line.machines.includes(m.id);
                      const isFree = m.status === 'Free' || m.status === 'Idle';
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleLineMachine(line.id, m.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                            background: isSelected ? 'var(--accent)' : 'var(--surface)',
                            color: isSelected ? '#fff' : 'var(--ink)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <b>{m.id}</b>
                          <span style={{ fontSize: '0.68rem', opacity: isSelected ? 0.9 : 0.6 }}>
                            ({m.dia} × {m.gg})
                          </span>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isFree ? '#16A34A' : '#D97706',
                              display: 'inline-block',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: INITIAL YARN INTAKE (OPTIONAL - FROM SHILPOSETU-OLD) */}
        <div className="card" style={{ marginBottom: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <b style={{ fontSize: '1rem', color: 'var(--ink)' }}>৩. প্রথম সুতা গ্রহণ চালান (ঐচ্ছিক ইনওয়ার্ড এন্ট্রি)</b>
              <div className="small muted">অর্ডারের সাথে এখনই প্রথম চালান রিসিভ হলে সরাসরি এন্ট্রি দিন</div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={hasInitialYarn}
                onChange={(e) => setHasInitialYarn(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              সুতা গ্রহণ চালান যোগ করুন
            </label>
          </div>

          {hasInitialYarn && (
            <div
              style={{
                marginTop: 10,
                padding: 14,
                background: 'var(--surface2)',
                borderRadius: 8,
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    চালান নম্বর
                  </label>
                  <input
                    type="text"
                    className="input mono"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    value={yarnChallanNo}
                    onChange={(e) => setYarnChallanNo(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    মোট গ্রহণকৃত সুতা (kg) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.85rem', fontWeight: 700 }}
                    value={yarnKg}
                    onChange={(e) => setYarnKg(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    ব্যাগ সংখ্যা
                  </label>
                  <input
                    type="number"
                    className="input"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    value={yarnBags}
                    onChange={(e) => setYarnBags(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                    স্টোর / গোডাউন অবস্থান
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.85rem' }}
                    value={yarnWarehouse}
                    onChange={(e) => setYarnWarehouse(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: NOTES & SPECIAL INSTRUCTIONS */}
        <div className="card" style={{ marginBottom: 18, border: '1px solid var(--line)', background: 'var(--surface)' }}>
          <b style={{ fontSize: '0.95rem', color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
            ৪. বিশেষ নির্দেশনা বা নোট (Notes)
          </b>
          <textarea
            rows={2}
            className="input"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.85rem', resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ফ্লোর সুপারভাইজার, মাস্টার বা পার্টির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
          />
        </div>

        {/* SECTION 5: LIVE CALCULATION & SUMMARY BAR */}
        <div
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>অংশ সংখ্যা</span>
            <b style={{ fontSize: '1.2rem', color: 'var(--ink)' }}>{bnNum(lines.length)}টি অংশ</b>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>মোট অর্ডার পরিমাণ</span>
            <b style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{bnNum(totalOrderKg.toLocaleString('en-IN'))} kg</b>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>প্রয়োজনীয় সুতা (লস সহ)</span>
            <b style={{ fontSize: '1.1rem', color: '#D97706' }}>~{bnNum(Math.round(totalYarnRequiredKg).toLocaleString('en-IN'))} kg</b>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>বরাদ্দকৃত মোট মেশিন</span>
            <b style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>
              {uniqueAllocatedMachines.length ? `${bnNum(uniqueAllocatedMachines.length)}টি মেশিন` : 'মেশিন নির্বাচিত নেই'}
            </b>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>মোট আনুমানিক নিটিং বিল</span>
            <b style={{ fontSize: '1.25rem', color: '#16A34A' }}>৳ {bnNum(Math.round(estimatedBillTk).toLocaleString('en-IN'))}</b>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            className="btn"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            onClick={() => navigate('/dashboard/orders')}
          >
            বাতিল
          </button>
          <button
            type="submit"
            className="btn pri"
            disabled={submitting}
            style={{ padding: '10px 24px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : '💾 নতুন সাব-কন্ট্রাক্ট অর্ডার সংরক্ষণ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};
